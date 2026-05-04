/**
 * polyfills.js - Must be the VERY FIRST import in index.js
 * Sets up all Node.js globals synchronously before gramjs loads.
 */
import { Platform } from 'react-native';

// ── 1. Buffer ───────────────────────────────────────────────────────────────
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// ── 2. crypto.getRandomValues (needed by gramjs randomBytes) ────────────────
import 'react-native-get-random-values'; // patches global.crypto natively

// Fallback in case the native patch fails
if (!global.crypto) global.crypto = {};
if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = function (typedArray) {
    for (let i = 0; i < typedArray.length; i++) {
      typedArray[i] = Math.floor(Math.random() * 256);
    }
    return typedArray;
  };
}

// ── 3. process ──────────────────────────────────────────────────────────────
if (!global.process) {
  global.process = {
    env:      {},
    version:  '',
    versions: {},
    platform: Platform.OS,
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    browser:  false,
  };
}

// ── 4. localStorage shim (gramjs caches TL schema here) ─────────────────────
// React Native has no localStorage — gramjs calls it without guard
if (!global.localStorage) {
  const _store = {};
  global.localStorage = {
    getItem:    (k)    => (_store[k] !== undefined ? _store[k] : null),
    setItem:    (k, v) => { _store[k] = String(v); },
    removeItem: (k)    => { delete _store[k]; },
    clear:      ()     => { Object.keys(_store).forEach(k => delete _store[k]); },
    get length()       { return Object.keys(_store).length; },
    key:        (i)    => Object.keys(_store)[i] || null,
  };
}

// ── 5. global shim (web only) ───────────────────────────────────────────────
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  if (!window.process) window.process = global.process;
  if (!window.global)  window.global  = window;
}
