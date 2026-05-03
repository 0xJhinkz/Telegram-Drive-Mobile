import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContextMenu({ visible, file, onClose, onDownload, onDelete, onMove, onPreview }) {
  if (!visible || !file) return null;

  const actions = [
    { icon: 'eye-outline',       label: 'Preview',         color: '#4A90E2', onPress: onPreview },
    { icon: 'download-outline',  label: 'Download',        color: '#27AE60', onPress: onDownload },
    { icon: 'move-outline',      label: 'Move to Folder',  color: '#F39C12', onPress: onMove },
    { icon: 'trash-outline',     label: 'Delete',          color: '#E74C3C', onPress: onDelete },
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.menu}>
        <View style={styles.fileInfo}>
          <Ionicons name="document" size={22} color="#4A90E2" />
          <Text style={styles.fileName} numberOfLines={2}>{file.name}</Text>
        </View>
        {actions.map(a => (
          <TouchableOpacity
            key={a.label}
            style={styles.action}
            onPress={() => { onClose(); a.onPress?.(); }}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
              <Ionicons name={a.icon} size={20} color={a.color} />
            </View>
            <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  menu: {
    position: 'absolute', left: 24, right: 24,
    backgroundColor: '#fff', borderRadius: 20,
    overflow: 'hidden', top: '30%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
  },
  fileInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
    backgroundColor: '#F7FAFC',
  },
  fileName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#2D3748' },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F7FAFC',
  },
  actionIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 16, fontWeight: '600' },
});
