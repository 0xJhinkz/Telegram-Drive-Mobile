import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ icon = 'folder-open-outline', title = 'Nothing here yet', subtitle = '' }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={56} color="#CBD5E0" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F7FAFC',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  title:    { fontSize: 18, fontWeight: '700', color: '#4A5568', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', lineHeight: 20 },
});
