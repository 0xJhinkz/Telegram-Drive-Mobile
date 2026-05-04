import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, FlatList, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { uploadFile } from '../services/telegramService';

// ─── File picker: native uses expo-document-picker, web uses <input> ──────────
async function pickFiles() {
  if (Platform.OS === 'web') {
    // Web fallback — browser file input
    return new Promise((resolve) => {
      const input    = document.createElement('input');
      input.type     = 'file';
      input.multiple = true;
      input.onchange = (e) => resolve(Array.from(e.target.files || []));
      input.click();
    });
  }

  // Native Android / iOS — expo-document-picker
  const { getDocumentAsync } = await import('expo-document-picker');
  const result = await getDocumentAsync({
    type:     '*/*',
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) return [];

  // result.assets is an array of { uri, name, size, mimeType }
  return (result.assets || []).map((asset) => ({
    uri:      asset.uri,
    name:     asset.name,
    size:     asset.size  || 0,
    mimeType: asset.mimeType || 'application/octet-stream',
    // gramjs uploadFile on native expects a file-like object with uri
    _isNative: true,
  }));
}

const STATUS_COLOR = { pending: '#718096', uploading: '#4A90E2', done: '#27AE60', error: '#E74C3C' };
const STATUS_ICON  = { pending: 'time-outline', uploading: 'cloud-upload-outline', done: 'checkmark-circle', error: 'alert-circle' };

export default function UploadScreen({ activeFolderId, folderName, onUploadDone }) {
  const [queue,   setQueue]   = useState([]);
  const [running, setRunning] = useState(false);
  const uploadRef = useRef(false);

  const addFiles = async () => {
    try {
      const files = await pickFiles();
      if (!files.length) return;
      const newItems = files.map(f => ({
        id:       Math.random().toString(36).slice(2),
        file:     f,
        name:     f.name,
        sizeStr:  formatBytes(f.size),
        status:   'pending',
        progress: 0,
        error:    null,
      }));
      setQueue(prev => [...prev, ...newItems]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not pick files.');
    }
  };

  const startUpload = async () => {
    if (uploadRef.current || running) return;
    uploadRef.current = true;
    setRunning(true);

    for (const item of queue.filter(i => i.status === 'pending' || i.status === 'error')) {
      if (!uploadRef.current) break;
      setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i));
      try {
        await uploadFile(item.file, activeFolderId, (pct) => {
          setQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: pct } : i));
        });
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'done', progress: 100 } : i));
      } catch (e) {
        setQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: e.message } : i));
      }
    }

    uploadRef.current = false;
    setRunning(false);
    onUploadDone?.();
  };

  const cancelUpload = () => { uploadRef.current = false; setRunning(false); };
  const removeItem   = (id) => setQueue(prev => prev.filter(i => i.id !== id));
  const clearDone    = ()   => setQueue(prev => prev.filter(i => i.status !== 'done'));

  const pendingCount = queue.filter(i => i.status === 'pending').length;
  const doneCount    = queue.filter(i => i.status === 'done').length;

  return (
    <View style={styles.container}>
      {/* Destination banner */}
      <View style={styles.destBanner}>
        <Ionicons name="folder" size={18} color="#4A90E2" />
        <Text style={styles.destText}>Uploading to: <Text style={styles.destName}>{folderName || 'Saved Messages'}</Text></Text>
      </View>

      {/* Drop / pick zone */}
      <TouchableOpacity style={styles.dropZone} onPress={addFiles} activeOpacity={0.8}>
        <View style={styles.dropIcon}>
          <Ionicons name="cloud-upload" size={48} color="#4A90E2" />
        </View>
        <Text style={styles.dropTitle}>Tap to select files</Text>
        <Text style={styles.dropSub}>All file types supported</Text>
      </TouchableOpacity>

      {/* Queue */}
      {queue.length > 0 && (
        <>
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>{queue.length} file(s) queued</Text>
            {doneCount > 0 && (
              <TouchableOpacity onPress={clearDone}>
                <Text style={styles.clearDone}>Clear done</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={queue}
            keyExtractor={i => i.id}
            style={styles.list}
            renderItem={({ item }) => (
              <View style={styles.queueRow}>
                <Ionicons name={STATUS_ICON[item.status]} size={22} color={STATUS_COLOR[item.status]} />
                <View style={styles.queueMeta}>
                  <Text style={styles.queueName} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.progressRow}>
                    {item.status === 'uploading' && (
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                      </View>
                    )}
                    <Text style={[styles.queueStatus, { color: STATUS_COLOR[item.status] }]}>
                      {item.status === 'uploading' ? `${item.progress}%` :
                       item.status === 'error'     ? item.error :
                       item.status === 'done'      ? 'Uploaded' :
                       item.sizeStr}
                    </Text>
                  </View>
                </View>
                {item.status !== 'uploading' && (
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                    <Ionicons name="close" size={18} color="#A0AEC0" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        {pendingCount > 0 && !running && (
          <TouchableOpacity style={styles.uploadBtn} onPress={startUpload}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload {pendingCount} File{pendingCount > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
        {running && (
          <TouchableOpacity style={[styles.uploadBtn, styles.cancelBtn]} onPress={cancelUpload}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.uploadBtnText}>  Uploading… Tap to Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.addBtn} onPress={addFiles}>
          <Ionicons name="add" size={20} color="#4A90E2" />
          <Text style={styles.addBtnText}>Add More Files</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024)    return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },

  destBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EBF4FF', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#BEE3F8',
  },
  destText: { fontSize: 13, color: '#2B6CB0' },
  destName: { fontWeight: '700' },

  dropZone: {
    margin: 16, borderRadius: 20, borderWidth: 2, borderStyle: 'dashed',
    borderColor: '#4A90E2', backgroundColor: '#EBF4FF',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 40, gap: 8,
  },
  dropIcon:  { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dropTitle: { fontSize: 18, fontWeight: '700', color: '#2B6CB0' },
  dropSub:   { fontSize: 13, color: '#718096' },

  queueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 4 },
  queueTitle:  { fontSize: 14, fontWeight: '700', color: '#4A5568' },
  clearDone:   { fontSize: 13, color: '#4A90E2', fontWeight: '600' },
  list:        { maxHeight: 260 },

  queueRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    padding: 12, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  queueMeta:    { flex: 1 },
  queueName:    { fontSize: 13, fontWeight: '600', color: '#2D3748', marginBottom: 4 },
  progressRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar:  { flex: 1, height: 4, backgroundColor: '#EDF2F7', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#4A90E2', borderRadius: 2 },
  queueStatus:  { fontSize: 11, fontWeight: '600' },
  removeBtn:    { padding: 4 },

  actions:       { padding: 16, gap: 10, marginTop: 'auto' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#4A90E2', padding: 16, borderRadius: 14,
    shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  cancelBtn:     { backgroundColor: '#E74C3C' },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: '#4A90E2', padding: 14, borderRadius: 14,
  },
  addBtnText: { color: '#4A90E2', fontWeight: '700', fontSize: 15 },
});