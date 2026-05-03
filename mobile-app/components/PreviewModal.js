import React, { useEffect, useState, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMediaUrl, downloadFile } from '../services/telegramService';

const { width: W, height: H } = Dimensions.get('window');

// ── File-type helpers ──────────────────────────────────────────────────────────
const VIDEO_EXT  = ['mp4','mkv','avi','mov','webm','m4v','flv','wmv','mpeg','mpg'];
const AUDIO_EXT  = ['mp3','wav','ogg','flac','m4a','aac','opus','wma'];
const IMAGE_EXT  = ['jpg','jpeg','png','gif','webp','bmp','svg'];

function isVideo(file) {
  if (!file) return false;
  return file.type === 'video' ||
    VIDEO_EXT.includes((file.ext || '').toLowerCase()) ||
    (file.mimeType || '').startsWith('video/');
}
function isAudio(file) {
  if (!file) return false;
  return file.type === 'audio' ||
    AUDIO_EXT.includes((file.ext || '').toLowerCase()) ||
    (file.mimeType || '').startsWith('audio/');
}
function isImage(file) {
  if (!file) return false;
  return file.type === 'image' ||
    IMAGE_EXT.includes((file.ext || '').toLowerCase()) ||
    (file.mimeType || '').startsWith('image/');
}

// ── Web-native video / audio element ─────────────────────────────────────────
// React Native Web supports React.createElement for real HTML tags.
function WebVideo({ src, mimeType, style }) {
  return React.createElement('video', {
    src,
    controls:   true,
    autoPlay:   true,
    preload:    'auto',
    style: {
      width:      '100%',
      maxHeight:  '100%',
      objectFit:  'contain',
      outline:    'none',
      background: '#000',
      ...style,
    },
  });
}

function WebAudio({ src, mimeType }) {
  return React.createElement('audio', {
    src,
    controls: true,
    autoPlay: true,
    preload:  'auto',
    style: { width: '100%', marginTop: 20 },
  });
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct }) {
  return (
    <View style={ring.wrap}>
      <ActivityIndicator size="large" color="#4A90E2" />
      <View style={ring.labelWrap}>
        <Text style={ring.label}>{pct}%</Text>
      </View>
      <Text style={ring.sub}>Downloading…</Text>
      <Text style={ring.hint}>
        {pct < 30 ? 'Starting transfer' :
         pct < 80 ? 'Buffering video' :
         'Almost ready!'}
      </Text>
    </View>
  );
}
const ring = StyleSheet.create({
  wrap:     { alignItems: 'center', gap: 10 },
  labelWrap:{ position: 'absolute', top: 0, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  label:    { color: '#fff', fontWeight: '800', fontSize: 14 },
  sub:      { color: '#ccc', fontSize: 15, marginTop: 12, fontWeight: '600' },
  hint:     { color: '#888', fontSize: 12 },
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function PreviewModal({
  file, folderId,
  onClose, onNext, onPrev, hasNext, hasPrev,
}) {
  const [url,      setUrl]      = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const prevUrlRef = useRef(null);

  // Revoke old blob URLs to prevent memory leaks
  useEffect(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (!file) return;

    let alive = true;
    setUrl(null); setError(null); setLoading(true); setProgress(0);

    getMediaUrl(
      file.id,
      folderId,
      file.mimeType || '',
      (pct) => { if (alive) setProgress(pct); },
    )
      .then(u => {
        if (!alive) { if (u) URL.revokeObjectURL(u); return; }
        prevUrlRef.current = u;
        setUrl(u);
      })
      .catch(e => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [file?.id, folderId]);

  const handleDownload = async () => {
    try { await downloadFile(file.id, folderId, file.name); }
    catch (e) { alert('Download failed: ' + e.message); }
  };

  if (!file) return null;

  const vid  = isVideo(file);
  const aud  = isAudio(file);
  const img  = isImage(file);

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.hBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.hCenter}>
            <Text style={styles.hTitle} numberOfLines={1}>{file.name}</Text>
            {file.sizeStr ? <Text style={styles.hSub}>{file.sizeStr}</Text> : null}
          </View>
          <TouchableOpacity onPress={handleDownload} style={styles.hBtn}>
            <Ionicons name="download-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Loading with progress */}
          {loading && <ProgressRing pct={progress} />}

          {/* Error */}
          {!loading && error && (
            <View style={styles.center}>
              <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
              <Text style={styles.errTitle}>Preview failed</Text>
              <Text style={styles.errSub}>{error}</Text>
              <TouchableOpacity style={styles.dlBtn} onPress={handleDownload}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.dlTxt}>Download File</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Video player ── */}
          {!loading && !error && url && vid && (
            <View style={styles.videoWrap}>
              {Platform.OS === 'web'
                ? <WebVideo src={url} mimeType={file.mimeType} />
                : (
                  <View style={styles.center}>
                    <Ionicons name="videocam" size={64} color="#9B59B6" />
                    <Text style={styles.errTitle}>Video ready</Text>
                    <TouchableOpacity style={styles.dlBtn} onPress={handleDownload}>
                      <Ionicons name="download-outline" size={18} color="#fff" />
                      <Text style={styles.dlTxt}>Download to Play</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
            </View>
          )}

          {/* ── Audio player ── */}
          {!loading && !error && url && aud && (
            <View style={styles.audioWrap}>
              <View style={styles.audioIcon}>
                <Ionicons name="musical-notes" size={56} color="#1ABC9C" />
              </View>
              <Text style={styles.audioName} numberOfLines={2}>{file.name}</Text>
              {Platform.OS === 'web'
                ? <WebAudio src={url} mimeType={file.mimeType} />
                : (
                  <TouchableOpacity style={[styles.dlBtn, { marginTop: 16 }]} onPress={handleDownload}>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.dlTxt}>Download to Play</Text>
                  </TouchableOpacity>
                )
              }
            </View>
          )}

          {/* ── Image ── */}
          {!loading && !error && url && img && (
            <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
          )}

          {/* ── Generic file ── */}
          {!loading && !error && url && !vid && !aud && !img && (
            <View style={styles.center}>
              <Ionicons name="document-outline" size={72} color="#4A90E2" />
              <Text style={styles.errTitle}>{file.name}</Text>
              <Text style={styles.errSub}>{file.sizeStr}</Text>
              <TouchableOpacity style={[styles.dlBtn, { marginTop: 12 }]} onPress={handleDownload}>
                <Ionicons name="download-outline" size={18} color="#fff" />
                <Text style={styles.dlTxt}>Download File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Navigation ── */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={onPrev} disabled={!hasPrev}
            style={[styles.navBtn, !hasPrev && styles.navDisabled]}
          >
            <Ionicons name="chevron-back" size={28} color={hasPrev ? '#fff' : '#444'} />
          </TouchableOpacity>
          <Text style={styles.navInfo} numberOfLines={1}>{file.name}</Text>
          <TouchableOpacity
            onPress={onNext} disabled={!hasNext}
            style={[styles.navBtn, !hasNext && styles.navDisabled]}
          >
            <Ionicons name="chevron-forward" size={28} color={hasNext ? '#fff' : '#444'} />
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hBtn:    { padding: 10 },
  hCenter: { flex: 1, alignItems: 'center' },
  hTitle:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  hSub:    { color: '#aaa', fontSize: 11, marginTop: 2 },

  body: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16,
  },

  // Video
  videoWrap: {
    width: '100%',
    height: H * 0.65,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Audio
  audioWrap: {
    alignItems: 'center', padding: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, width: '100%',
  },
  audioIcon: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(26,188,156,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  audioName: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 8 },

  // Image
  image: { width: W - 32, height: H * 0.68, borderRadius: 8 },

  // Shared
  center:   { alignItems: 'center', gap: 10, padding: 24 },
  errTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  errSub:   { color: '#aaa', fontSize: 13, textAlign: 'center' },
  dlBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10, marginTop: 8,
  },
  dlTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 16, paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  navBtn:     { padding: 8 },
  navDisabled:{ opacity: 0.25 },
  navInfo:    { flex: 1, color: '#777', fontSize: 11, textAlign: 'center' },
});
