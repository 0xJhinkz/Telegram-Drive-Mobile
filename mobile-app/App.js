// App.js — Main shell for Telegram Drive Mobile
// Manages auth state, active folder, folder list, and bottom nav.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FilesScreen    from './screens/FilesScreen';
import SearchScreen   from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import UploadScreen   from './screens/UploadScreen';
import AuthScreen     from './screens/AuthScreen';
import FolderDrawer   from './components/FolderDrawer';

import {
  restoreSession, getFolders, createFolder,
} from './services/telegramService';

const TABS = [
  { key: 'Files',    icon: 'folder',       iconActive: 'folder',       label: 'Files' },
  { key: 'Upload',   icon: 'cloud-upload-outline', iconActive: 'cloud-upload', label: 'Upload' },
  { key: 'Search',   icon: 'search-outline',       iconActive: 'search',       label: 'Search' },
  { key: 'Settings', icon: 'settings-outline',     iconActive: 'settings',     label: 'Settings' },
];

export default function App() {
  const [tab,             setTab]             = useState('Files');
  const [isAuthed,        setIsAuthed]        = useState(false);
  const [bootstrapping,   setBootstrapping]   = useState(true);
  const [user,            setUser]            = useState(null);
  const [folders,         setFolders]         = useState([]);
  const [activeFolderId,  setActiveFolderId]  = useState(null);
  const [showFolderDrawer,setShowFolderDrawer]= useState(false);
  const [foldersLoading,  setFoldersLoading]  = useState(false);

  // ── Restore session on launch ──────────────────────────────────────────
  useEffect(() => {
    restoreSession()
      .then(u => {
        if (u) {
          setUser(u);
          setIsAuthed(true);
          loadFolders();
        }
      })
      .catch(() => {})
      .finally(() => setBootstrapping(false));
  }, []);

  const loadFolders = async () => {
    setFoldersLoading(true);
    try {
      const data = await getFolders();
      setFolders(data);
    } catch {}
    finally { setFoldersLoading(false); }
  };

  const handleAuthenticated = async () => {
    try {
      const { getMe } = await import('./services/telegramService');
      const u = await getMe();
      setUser(u);
    } catch {}
    setIsAuthed(true);
    loadFolders();
  };

  const handleLogout = () => {
    setIsAuthed(false);
    setUser(null);
    setFolders([]);
    setActiveFolderId(null);
    setTab('Files');
  };

  const handleFolderSelect = (id) => {
    setActiveFolderId(id);
    setTab('Files');
  };

  const handleCreateFolder = async (name) => {
    const folder = await createFolder(name);
    setFolders(prev => [...prev, folder]);
    setActiveFolderId(folder.id);
  };

  const folderName = activeFolderId
    ? (folders.find(f => f.id === activeFolderId)?.name || 'Folder')
    : 'Saved Messages';

  // ── Loading splash ────────────────────────────────────────────────────
  if (bootstrapping) {
    return (
      <View style={styles.splash}>
        <Ionicons name="cloud-done" size={72} color="#4A90E2" />
        <Text style={styles.splashTitle}>Telegram Drive</Text>
        <ActivityIndicator color="#4A90E2" style={{ marginTop: 24 }} />
      </View>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────────────
  if (!isAuthed) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // ── Render active tab content ──────────────────────────────────────────
  const renderScreen = () => {
    switch (tab) {
      case 'Files':
        return (
          <FilesScreen
            activeFolderId={activeFolderId}
            folderName={folderName}
            folders={folders}
            onFolderChange={handleFolderSelect}
            onShowFolderDrawer={() => setShowFolderDrawer(true)}
          />
        );
      case 'Upload':
        return (
          <UploadScreen
            activeFolderId={activeFolderId}
            folderName={folderName}
            onUploadDone={() => {}}
          />
        );
      case 'Search':
        return (
          <SearchScreen
            activeFolderId={activeFolderId}
            folders={folders}
          />
        );
      case 'Settings':
        return (
          <SettingsScreen
            user={user}
            folders={folders}
            activeFolderId={activeFolderId}
            folderName={folderName}
            onLogout={handleLogout}
            onFoldersChange={setFolders}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.folderBtn} onPress={() => setShowFolderDrawer(true)}>
          <Ionicons name={activeFolderId ? 'folder' : 'bookmark'} size={20} color="#4A90E2" />
          <Text style={styles.folderName} numberOfLines={1}>{folderName}</Text>
          <Ionicons name="chevron-down" size={16} color="#4A90E2" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          {user && (
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeLetter}>{(user.name || '?')[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Tab title ── */}
      <View style={styles.tabTitle}>
        <Text style={styles.tabTitleText}>{tab}</Text>
      </View>

      {/* ── Screen content ── */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* ── Bottom navigation ── */}
      <View style={styles.nav}>
        {TABS.map(t => {
          const isActive = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.navItem}
              onPress={() => setTab(t.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.navIndicator, isActive && styles.navIndicatorActive]}>
                <Ionicons
                  name={isActive ? t.iconActive : t.icon}
                  size={22}
                  color={isActive ? '#4A90E2' : '#A0AEC0'}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Folder drawer ── */}
      <FolderDrawer
        visible={showFolderDrawer}
        folders={folders}
        activeFolderId={activeFolderId}
        loading={foldersLoading}
        onSelect={handleFolderSelect}
        onClose={() => setShowFolderDrawer(false)}
        onCreateFolder={async () => {
          setShowFolderDrawer(false);
          // Redirect to Settings to create folder
          setTab('Settings');
        }}
      />
    </SafeAreaView>
  );
}

const NAV_HEIGHT = Platform.OS === 'ios' ? 84 : 68;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // On web: lock the root to the viewport — stops the browser page from scrolling
    ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } : {}),
  },

  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7FAFC', gap: 12 },
  splashTitle: { fontSize: 24, fontWeight: '800', color: '#1A202C', marginTop: 12 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
    backgroundColor: '#fff',
  },
  folderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EBF4FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    maxWidth: '70%',
  },
  folderName: { fontSize: 14, fontWeight: '700', color: '#2B6CB0', flexShrink: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userBadge: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#4A90E2', alignItems: 'center', justifyContent: 'center',
  },
  userBadgeLetter: { color: '#fff', fontWeight: '800', fontSize: 15 },

  tabTitle: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  tabTitleText: { fontSize: 22, fontWeight: '800', color: '#1A202C' },

  // Content must leave room for the floating nav at the bottom
  content: { flex: 1, paddingBottom: NAV_HEIGHT },

  // Nav is fixed to the viewport on web, absolute on native
  nav: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#EDF2F7',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  navItem:           { flex: 1, alignItems: 'center', gap: 2 },
  navIndicator:      { padding: 6, borderRadius: 12 },
  navIndicatorActive:{ backgroundColor: '#EBF4FF' },
  navLabel:          { fontSize: 10, color: '#A0AEC0', fontWeight: '500' },
  navLabelActive:    { color: '#4A90E2', fontWeight: '700' },
});