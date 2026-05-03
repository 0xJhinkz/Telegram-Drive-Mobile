import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { searchFiles, searchGlobal, downloadFile, deleteFile } from '../services/telegramService';
import FileTypeIcon from '../components/FileTypeIcon';
import EmptyState   from '../components/EmptyState';
import PreviewModal from '../components/PreviewModal';
import ContextMenu  from '../components/ContextMenu';

export default function SearchScreen({ activeFolderId, folders }) {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [scope,      setScope]      = useState('folder'); // 'folder' | 'global'
  const [previewIdx, setPreviewIdx] = useState(-1);
  const [ctxFile,    setCtxFile]    = useState(null);
  const [showCtx,    setShowCtx]    = useState(false);
  const debounce     = useRef(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim() || query.length < 2) { setResults([]); return; }

    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const fn = scope === 'global' ? searchGlobal : (q) => searchFiles(q, activeFolderId);
        const data = await fn(query.trim());
        setResults(data);
      } catch (e) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounce.current);
  }, [query, scope, activeFolderId]);

  const previewFile = previewIdx >= 0 ? results[previewIdx] : null;

  const renderResult = ({ item, index }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => setPreviewIdx(index)}
      onLongPress={() => { setCtxFile(item); setShowCtx(true); }}
      activeOpacity={0.7}
    >
      <FileTypeIcon ext={item.ext} type={item.type} size={24} />
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.sub}>{item.sizeStr}  ·  {item.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={searching ? '#4A90E2' : '#A0AEC0'} />
        <TextInput
          style={styles.input}
          placeholder="Search files..."
          placeholderTextColor="#A0AEC0"
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
            <Ionicons name="close-circle" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      {/* Scope toggle */}
      <View style={styles.scopeRow}>
        {['folder', 'global'].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.scopeBtn, scope === s && styles.scopeBtnActive]}
            onPress={() => setScope(s)}
          >
            <Ionicons
              name={s === 'folder' ? 'folder-open' : 'globe-outline'}
              size={14}
              color={scope === s ? '#fff' : '#718096'}
            />
            <Text style={[styles.scopeText, scope === s && styles.scopeTextActive]}>
              {s === 'folder' ? 'This Folder' : 'All Folders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {searching
        ? <View style={styles.center}><ActivityIndicator color="#4A90E2" /><Text style={styles.hint}>Searching…</Text></View>
        : query.length < 2
          ? <EmptyState icon="search-outline" title="Start typing to search" subtitle="Minimum 2 characters" />
          : (
            <FlatList
              data={results}
              keyExtractor={i => i.id}
              renderItem={renderResult}
              ListEmptyComponent={<EmptyState icon="sad-outline" title="No results" subtitle={`Nothing matched "${query}"`} />}
              contentContainerStyle={results.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
            />
          )
      }

      {/* Modals */}
      <PreviewModal
        file={previewFile}
        folderId={activeFolderId}
        onClose={() => setPreviewIdx(-1)}
        onNext={() => setPreviewIdx(i => Math.min(i + 1, results.length - 1))}
        onPrev={() => setPreviewIdx(i => Math.max(i - 1, 0))}
        hasNext={previewIdx < results.length - 1}
        hasPrev={previewIdx > 0}
      />

      <ContextMenu
        visible={showCtx}
        file={ctxFile}
        onClose={() => setShowCtx(false)}
        onPreview={() => setPreviewIdx(results.indexOf(ctxFile))}
        onDownload={() => ctxFile && downloadFile(ctxFile.id, activeFolderId, ctxFile.name).catch(e => alert(e.message))}
        onDelete={async () => {
          if (!ctxFile) return;
          try {
            await deleteFile(ctxFile.id, activeFolderId);
            setResults(prev => prev.filter(f => f.id !== ctxFile.id));
          } catch (e) { alert(e.message); }
        }}
        onMove={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  center:    { alignItems: 'center', paddingTop: 40, gap: 8 },
  hint:      { color: '#A0AEC0', fontSize: 13, marginTop: 8 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', margin: 12, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  input: { flex: 1, fontSize: 16, color: '#2D3748' },

  scopeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 8 },
  scopeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#EDF2F7',
  },
  scopeBtnActive: { backgroundColor: '#4A90E2' },
  scopeText:      { fontSize: 13, color: '#718096', fontWeight: '600' },
  scopeTextActive:{ color: '#fff' },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6,
    padding: 12, borderRadius: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  meta: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#1A202C', marginBottom: 2 },
  sub:  { fontSize: 12, color: '#A0AEC0' },
});