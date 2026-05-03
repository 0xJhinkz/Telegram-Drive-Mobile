import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FolderDrawer({ visible, folders, activeFolderId, onSelect, onClose, onCreateFolder, loading }) {
  const items = [
    { id: null, name: 'Saved Messages', icon: 'bookmark', special: true },
    ...folders,
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Drive</Text>
          <TouchableOpacity onPress={onCreateFolder} style={styles.newBtn}>
            <Ionicons name="add" size={22} color="#4A90E2" />
            <Text style={styles.newBtnText}>New Folder</Text>
          </TouchableOpacity>
        </View>

        {loading
          ? <ActivityIndicator color="#4A90E2" style={{ marginTop: 24 }} />
          : (
            <FlatList
              data={items}
              keyExtractor={i => String(i.id)}
              renderItem={({ item }) => {
                const isActive = String(item.id) === String(activeFolderId);
                return (
                  <TouchableOpacity
                    style={[styles.item, isActive && styles.itemActive]}
                    onPress={() => { onSelect(item.id); onClose(); }}
                  >
                    <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                      <Ionicons
                        name={item.special ? 'bookmark' : 'folder'}
                        size={20}
                        color={isActive ? '#fff' : '#4A90E2'}
                      />
                    </View>
                    <Text style={[styles.itemName, isActive && styles.itemNameActive]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={18} color="#4A90E2" />}
                  </TouchableOpacity>
                );
              }}
            />
          )
        }
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '75%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E2E8F0', alignSelf: 'center', marginTop: 10, marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  newBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  newBtnText:  { color: '#4A90E2', fontWeight: '600', fontSize: 14 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F7FAFC',
  },
  itemActive:     { backgroundColor: '#EBF4FF' },
  iconWrap:       { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: '#4A90E2' },
  itemName:       { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
  itemNameActive: { fontWeight: '700', color: '#1A202C' },
});
