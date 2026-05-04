/**
 * polyfills.js
 * Must be imported FIRST (see index.js).
 * Provides Node.js globals for gramjs running in React Native + web.
 */
import { Platform } from 'react-native';

// Crypto random values (required by gramjs for key generation)
import 'react-native-get-random-values';

// Buffer
import { Buffer } from 'buffer';
if (typeof global !== 'undefined') {
  global.Buffer = global.Buffer || Buffer;
}
// Only touch window on web — it doesn't exist on native Android
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// process
if (typeof global !== 'undefined' && !global.process) {
  global.process = {
    env:      {},
    version:  '',
    versions: {},
    platform: Platform.OS,
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    browser:  Platform.OS === 'web',
  };
}
if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.process) {
  window.process = global.process || {
    env:      {},
    version:  '',
    versions: {},
    platform: 'browser',
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    browser:  true,
  };
}

// global shim (web only)
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}
