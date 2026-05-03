/**
 * FileThumbnail.js
 * Shows a real image preview thumbnail for image files,
 * falls back to FileTypeIcon for everything else.
 *
 * Features:
 * - In-memory blob URL cache (no re-downloads on re-render)
 * - Max 3 concurrent thumbnail downloads (prevents API flood)
 * - Graceful fallback if download fails
 * - Fade-in animation when thumbnail loads
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import FileTypeIcon from './FileTypeIcon';
import { getThumbnailUrl } from '../services/telegramService';

// ─── In-memory cache: fileId → blob URL ───────────────────────────────────────
const cache = {};

// ─── Concurrency limiter (max 3 parallel downloads) ───────────────────────────
let active  = 0;
const MAX   = 3;
const queue = [];

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    const run = async () => {
      active++;
      try { resolve(await fn()); }
      catch (e) { reject(e); }
      finally {
        active--;
        if (queue.length > 0) queue.shift()();
      }
    };
    if (active < MAX) run();
    else queue.push(run);
  });
}

// ─── Image type detection ─────────────────────────────────────────────────────
const IMAGE_TYPES = new Set(['image', 'photo']);
const IMAGE_EXTS  = new Set(['jpg','jpeg','png','gif','webp','bmp','svg','avif','heic','tiff']);

function isImageFile(file) {
  if (!file) return false;
  if (IMAGE_TYPES.has(file.type)) return true;
  if (IMAGE_EXTS.has((file.ext || '').toLowerCase())) return true;
  if ((file.mimeType || '').startsWith('image/')) return true;
  return false;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function FileThumbnail({ file, folderId, size = 26 }) {
  const [thumbUrl, setThumbUrl] = useState(() => cache[file.id] || null);
  const [failed,   setFailed]   = useState(false);
  const fadeAnim  = useRef(new Animated.Value(thumbUrl ? 1 : 0)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!isImageFile(file) || failed) return;

    // Already cached
    if (cache[file.id]) {
      setThumbUrl(cache[file.id]);
      return;
    }

    // Queue the download
    enqueue(() => getThumbnailUrl(file.id, folderId))
      .then(url => {
        if (!mountedRef.current) { if (url) URL.revokeObjectURL(url); return; }
        if (url) {
          cache[file.id] = url;
          setThumbUrl(url);
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (mountedRef.current) setFailed(true);
      });
  }, [file.id, folderId]);

  const boxSize = size + 12;

  // ── Show thumbnail ─────────────────────────────────────────────────────────
  if (isImageFile(file) && thumbUrl && !failed) {
    return (
      <Animated.View style={[styles.thumbWrap, { width: boxSize, height: boxSize, opacity: fadeAnim }]}>
        <Image
          source={{ uri: thumbUrl }}
          style={[styles.thumb, { width: boxSize, height: boxSize }]}
          resizeMode="cover"
          onError={() => {
            cache[file.id] = null;
            setFailed(true);
            setThumbUrl(null);
          }}
        />
      </Animated.View>
    );
  }

  // ── Skeleton while loading ─────────────────────────────────────────────────
  if (isImageFile(file) && !thumbUrl && !failed) {
    return (
      <View style={[styles.skeleton, { width: boxSize, height: boxSize }]}>
        <View style={styles.skeletonShimmer} />
      </View>
    );
  }

  // ── Fallback: icon ─────────────────────────────────────────────────────────
  return <FileTypeIcon ext={file.ext} type={file.type} size={size} />;
}

const styles = StyleSheet.create({
  thumbWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  thumb: {
    borderRadius: 10,
  },
  skeleton: {
    borderRadius: 10,
    backgroundColor: '#EDF2F7',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonShimmer: {
    width: '60%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
});
