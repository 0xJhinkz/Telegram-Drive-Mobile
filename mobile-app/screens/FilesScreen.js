import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, TextInput, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  getFiles, deleteFile, downloadFile, moveFiles,
} from '../services/telegramService';
import FileTypeIcon  from '../components/FileTypeIcon';
import FileThumbnail from '../components/FileThumbnail';
import EmptyState   from '../components/EmptyState';
import PreviewModal from '../components/PreviewModal';
import ContextMenu  from '../components/ContextMenu';
import MoveModal    from '../components/MoveModal';
import FolderDrawer from '../components/FolderDrawer';

export default function FilesScreen({
  activeFolderId, folderName, folders, onFolderChange,
  onShowFolderDrawer, onFolderCreated, onFolderDeleted,
}) {
  const [files,      setFiles]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState([]);   // selected file IDs
  const [previewIdx, setPreviewIdx] = useState(-1);
  const [ctxFile,    setCtxFile]    = useState(null);
  const [showCtx,    setShowCtx]    = useState(false);
  const [showMove,   setShowMove]   = useState(false);
  const [busyIds,    setBusyIds]    = useState({});

  // ── Load files ──────────────────────────────────────────────────────────
  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else             setLoading(true);
    try {
      const data = await getFiles(activeFolderId, 200);
      setFiles(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFolderId]);

  useEffect(() => { load(); setSelected([]); setSearch(''); }, [activeFolderId]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const displayed = search.trim()
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  // ── Selection helpers ────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const clearSelect = () => setSelected([]);

  // ── File press / long-press ──────────────────────────────────────────────
  const handlePress = (file) => {
    if (selected.length > 0) { toggleSelect(file.id); return; }
    // open preview
    const idx = displayed.indexOf(file);
    setPreviewIdx(idx);
  };

  const handleLongPress = (file) => {
    setCtxFile(file);
    setShowCtx(true);
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const setBusy = (id, busy) => setBusyIds(prev => ({ ...prev, [id]: busy }));

  const handleDelete = async (file) => {
    Alert.alert('Delete File', `Delete "${file.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setBusy(file.id, true);
          try {
            await deleteFile(file.id, activeFolderId);
            setFiles(prev => prev.filter(f => f.id !== file.id));
          } catch (e) {
            Alert.alert('Error', e.message);
          } finally {
            setBusy(file.id, false);
          }
        },
      },
    ]);
  };

  const handleBulkDelete = () => {
    Alert.alert('Delete Files', `Delete ${selected.length} file(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            for (const id of selected) {
              await deleteFile(id, activeFolderId);
            }
            setFiles(prev => prev.filter(f => !selected.includes(f.id)));
            clearSelect();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleDownload = async (file) => {
    setBusy(file.id, true);
    try {
      await downloadFile(file.id, activeFolderId, file.name);
    } catch (e) {
      Alert.alert('Download Error', e.message);
    } finally {
      setBusy(file.id, false);
    }
  };

  const handleMove = async (targetFolderId) => {
    if (!ctxFile) return;
    setBusy(ctxFile.id, true);
    try {
      await moveFiles([ctxFile.id], activeFolderId, targetFolderId);
      setFiles(prev => prev.filter(f => f.id !== ctxFile.id));
      setCtxFile(null);
    } catch (e) {
      Alert.alert('Move Error', e.message);
    } finally {
      setBusy(ctxFile.id, false);
    }
  };

  // ── Preview navigation ───────────────────────────────────────────────────
  const previewFile = previewIdx >= 0 ? displayed[previewIdx] : null;
  const hasNext     = previewIdx >= 0 && previewIdx < displayed.length - 1;
  const hasPrev     = previewIdx > 0;

  // ── Render file row ──────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const isSelected = selected.includes(item.id);
    const isBusy     = busyIds[item.id];

    return (
      <TouchableOpacity
        style={[styles.row, isSelected && styles.rowSelected]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {selected.length > 0 && (
          <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
            {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        )}
        <FileThumbnail file={item} folderId={activeFolderId} size={26} />
        <View style={styles.rowMeta}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowSub}>{item.sizeStr}  ·  {item.date}</Text>
        </View>
        {isBusy
          ? <ActivityIndicator size="small" color="#4A90E2" />
          : (
            <TouchableOpacity onPress={() => handleLongPress(item)} style={styles.moreBtn}>
              <Ionicons name="ellipsis-vertical" size={18} color="#A0AEC0" />
            </TouchableOpacity>
          )
        }
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#A0AEC0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter files..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Bulk toolbar ── */}
      {selected.length > 0 && (
        <View style={styles.bulkBar}>
          <TouchableOpacity onPress={clearSelect} style={styles.bulkBtn}>
            <Ionicons name="close" size={20} color="#718096" />
          </TouchableOpacity>
          <Text style={styles.bulkLabel}>{selected.length} selected</Text>
          <TouchableOpacity onPress={handleBulkDelete} style={styles.bulkBtn}>
            <Ionicons name="trash" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── File list ── */}
      {loading
        ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading files…</Text>
          </View>
        )
        : (
          <FlatList
            data={displayed}
            keyExtractor={i => i.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={['#4A90E2']} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="cloud-outline"
                title={search ? 'No matching files' : 'No files yet'}
                subtitle={search ? 'Try a different search term' : 'Upload files using the Upload tab'}
              />
            }
            contentContainerStyle={displayed.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
          />
        )
      }

      {/* ── Modals ── */}
      <PreviewModal
        file={previewFile}
        folderId={activeFolderId}
        onClose={() => setPreviewIdx(-1)}
        onNext={() => setPreviewIdx(i => Math.min(i + 1, displayed.length - 1))}
        onPrev={() => setPreviewIdx(i => Math.max(i - 1, 0))}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />

      <ContextMenu
        visible={showCtx}
        file={ctxFile}
        onClose={() => setShowCtx(false)}
        onPreview={() => {
          const idx = displayed.indexOf(ctxFile);
          setPreviewIdx(idx >= 0 ? idx : 0);
        }}
        onDownload={() => ctxFile && handleDownload(ctxFile)}
        onDelete={() => ctxFile && handleDelete(ctxFile)}
        onMove={() => setShowMove(true)}
      />

      <MoveModal
        visible={showMove}
        folders={folders}
        currentFolderId={activeFolderId}
        onSelect={handleMove}
        onClose={() => setShowMove(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F7FAFC' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#718096', fontSize: 14, marginTop: 8 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', margin: 12, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748' },

  bulkBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EBF4FF', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#BEE3F8',
  },
  bulkBtn:   { padding: 4 },
  bulkLabel: { flex: 1, textAlign: 'center', fontWeight: '700', color: '#2B6CB0' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    padding: 12, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  rowSelected: { backgroundColor: '#EBF4FF', borderWidth: 1.5, borderColor: '#4A90E2' },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#CBD5E0',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  rowMeta: { flex: 1 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#1A202C', marginBottom: 2 },
  rowSub:  { fontSize: 12, color: '#A0AEC0' },
  moreBtn: { padding: 4 },
});