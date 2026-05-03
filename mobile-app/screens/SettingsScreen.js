import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, TextInput, Modal, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  logout, getMe, createFolder, deleteFolder, syncFolders,
} from '../services/telegramService';

export default function SettingsScreen({
  user, folders, activeFolderId, folderName,
  onLogout, onFoldersChange,
}) {
  const [showNewFolder,  setShowNewFolder]  = useState(false);
  const [newFolderName,  setNewFolderName]  = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [syncing,        setSyncing]        = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your session will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out', style: 'destructive',
          onPress: async () => {
            await logout();
            onLogout();
          },
        },
      ],
    );
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    try {
      const folder = await createFolder(name);
      onFoldersChange([...folders, folder]);
      setNewFolderName('');
      setShowNewFolder(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folder) => {
    Alert.alert(
      'Delete Folder',
      `Delete "${folder.name}" and ALL its files? This is permanent!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteFolder(folder.id);
              onFoldersChange(folders.filter(f => f.id !== folder.id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  const handleSyncFolders = async () => {
    setSyncing(true);
    try {
      const updated = await syncFolders();
      onFoldersChange(updated);
    } catch (e) {
      Alert.alert('Sync Error', e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

      {/* ── User card ── */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(user?.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          {user?.phone    && <Text style={styles.userSub}>📱 {user.phone}</Text>}
          {user?.username && <Text style={styles.userSub}>@{user.username}</Text>}
        </View>
      </View>

      {/* ── Active folder ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Location</Text>
        <View style={styles.infoRow}>
          <Ionicons name={activeFolderId ? 'folder' : 'bookmark'} size={20} color="#4A90E2" />
          <Text style={styles.infoText}>{folderName || 'Saved Messages'}</Text>
        </View>
      </View>

      {/* ── Folders ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Folders ({folders.length})</Text>
          <TouchableOpacity onPress={handleSyncFolders} style={styles.syncBtn} disabled={syncing}>
            {syncing
              ? <ActivityIndicator size="small" color="#4A90E2" />
              : <Ionicons name="refresh" size={18} color="#4A90E2" />
            }
          </TouchableOpacity>
        </View>

        {folders.length === 0
          ? <Text style={styles.emptyFolders}>No folders yet. Create one below.</Text>
          : folders.map(f => (
            <View key={f.id} style={styles.folderRow}>
              <Ionicons name="folder" size={18} color="#4A90E2" />
              <Text style={styles.folderName} numberOfLines={1}>{f.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteFolder(f)} style={styles.delBtn}>
                <Ionicons name="trash-outline" size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ))
        }

        <TouchableOpacity style={styles.newFolderBtn} onPress={() => setShowNewFolder(true)}>
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.newFolderText}>Create New Folder</Text>
        </TouchableOpacity>
      </View>

      {/* ── App info ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>Telegram Drive Mobile v1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="flash-outline" size={20} color="#718096" />
          <Text style={styles.infoText}>Direct gramjs — no proxy</Text>
        </View>
      </View>

      {/* ── Logout ── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#E74C3C" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* ── New Folder Modal ── */}
      <Modal visible={showNewFolder} transparent animationType="fade" onRequestClose={() => setShowNewFolder(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowNewFolder(false)} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>New Folder</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Folder name…"
            value={newFolderName}
            onChangeText={setNewFolderName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreateFolder}
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowNewFolder(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCreate} onPress={handleCreateFolder} disabled={creatingFolder}>
              {creatingFolder
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalCreateText}>Create</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#4A90E2', alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 26, fontWeight: '800', color: '#fff' },
  userInfo:     { flex: 1 },
  userName:     { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 4 },
  userSub:      { fontSize: 13, color: '#718096', marginTop: 2 },

  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  syncBtn:       { padding: 4 },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText:      { fontSize: 15, color: '#4A5568', fontWeight: '500' },

  emptyFolders: { fontSize: 13, color: '#A0AEC0', fontStyle: 'italic', marginBottom: 12 },
  folderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7FAFC',
  },
  folderName:   { flex: 1, fontSize: 14, color: '#2D3748', fontWeight: '500' },
  delBtn:       { padding: 4 },
  newFolderBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingVertical: 8 },
  newFolderText:{ color: '#4A90E2', fontWeight: '700', fontSize: 14 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 14,
    borderWidth: 2, borderColor: '#E74C3C',
  },
  logoutText: { color: '#E74C3C', fontWeight: '700', fontSize: 16 },

  modalBg:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    position: 'absolute', left: 24, right: 24, top: '35%',
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
  },
  modalTitle:      { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 16 },
  modalInput:      { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 16, color: '#1A202C', marginBottom: 16 },
  modalBtns:       { flexDirection: 'row', gap: 10 },
  modalCancel:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#EDF2F7' },
  modalCancelText: { color: '#718096', fontWeight: '700' },
  modalCreate:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#4A90E2' },
  modalCreateText: { color: '#fff', fontWeight: '700' },
});