import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TYPE_MAP = {
  // Images
  jpg: { icon: 'image',          color: '#FF6B6B' },
  jpeg:{ icon: 'image',          color: '#FF6B6B' },
  png: { icon: 'image',          color: '#FF6B6B' },
  gif: { icon: 'image',          color: '#FF6B6B' },
  webp:{ icon: 'image',          color: '#FF6B6B' },
  svg: { icon: 'image',          color: '#FF6B6B' },
  bmp: { icon: 'image',          color: '#FF6B6B' },
  // Video
  mp4: { icon: 'videocam',       color: '#9B59B6' },
  mkv: { icon: 'videocam',       color: '#9B59B6' },
  avi: { icon: 'videocam',       color: '#9B59B6' },
  mov: { icon: 'videocam',       color: '#9B59B6' },
  webm:{ icon: 'videocam',       color: '#9B59B6' },
  // Audio
  mp3: { icon: 'musical-notes',  color: '#1ABC9C' },
  wav: { icon: 'musical-notes',  color: '#1ABC9C' },
  ogg: { icon: 'musical-notes',  color: '#1ABC9C' },
  flac:{ icon: 'musical-notes',  color: '#1ABC9C' },
  m4a: { icon: 'musical-notes',  color: '#1ABC9C' },
  // PDF
  pdf: { icon: 'document-text',  color: '#E74C3C' },
  // Archives
  zip: { icon: 'archive',        color: '#F39C12' },
  rar: { icon: 'archive',        color: '#F39C12' },
  '7z':{ icon: 'archive',        color: '#F39C12' },
  tar: { icon: 'archive',        color: '#F39C12' },
  gz:  { icon: 'archive',        color: '#F39C12' },
  // Office
  doc: { icon: 'document',       color: '#2980B9' },
  docx:{ icon: 'document',       color: '#2980B9' },
  xls: { icon: 'grid',           color: '#27AE60' },
  xlsx:{ icon: 'grid',           color: '#27AE60' },
  ppt: { icon: 'easel',          color: '#E67E22' },
  pptx:{ icon: 'easel',          color: '#E67E22' },
  // Text / Code
  txt: { icon: 'reader',         color: '#7F8C8D' },
  md:  { icon: 'reader',         color: '#7F8C8D' },
  json:{ icon: 'code-slash',     color: '#3498DB' },
  js:  { icon: 'code-slash',     color: '#F1C40F' },
  ts:  { icon: 'code-slash',     color: '#3498DB' },
  py:  { icon: 'code-slash',     color: '#3498DB' },
  rs:  { icon: 'code-slash',     color: '#E74C3C' },
  html:{ icon: 'globe',          color: '#E67E22' },
  css: { icon: 'color-palette',  color: '#9B59B6' },
  // APK
  apk: { icon: 'logo-android',   color: '#27AE60' },
  // Folder
  folder:{ icon: 'folder',       color: '#4A90E2' },
};

export function getFileIconInfo(ext = '', type = '') {
  const e = ext.toLowerCase();
  if (TYPE_MAP[e]) return TYPE_MAP[e];
  switch (type) {
    case 'image':   return { icon: 'image',         color: '#FF6B6B' };
    case 'video':   return { icon: 'videocam',       color: '#9B59B6' };
    case 'audio':   return { icon: 'musical-notes',  color: '#1ABC9C' };
    case 'pdf':     return { icon: 'document-text',  color: '#E74C3C' };
    case 'archive': return { icon: 'archive',        color: '#F39C12' };
    case 'folder':  return { icon: 'folder',         color: '#4A90E2' };
    default:        return { icon: 'document',       color: '#95A5A6' };
  }
}

export default function FileTypeIcon({ ext, type, size = 28 }) {
  const { icon, color } = getFileIconInfo(ext, type);
  return (
    <View style={{
      width: size + 12, height: size + 12,
      borderRadius: 10,
      backgroundColor: color + '22',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Ionicons name={icon} size={size} color={color} />
    </View>
  );
}
