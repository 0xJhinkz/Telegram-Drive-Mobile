import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MoveModal({ visible, folders, currentFolderId, onSelect, onClose }) {
  const items = [
    { id: null, name: 'Saved Messages', special: true },
    ...folders.filter(f => String(f.id) !== String(currentFolderId)),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#718096" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Move To…</Text>
          <View style={{ width: 22 }} />
        </View>

        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => { onSelect(item.id); onClose(); }}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.special ? 'bookmark' : 'folder'} size={20} color="#4A90E2" />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E0" />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '65%', paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F7FAFC',
  },
  iconWrap:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EBF4FF', alignItems: 'center', justifyContent: 'center' },
  itemName:  { flex: 1, fontSize: 15, color: '#2D3748', fontWeight: '500' },
});
