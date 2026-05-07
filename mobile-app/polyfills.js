/**
 * polyfills.js
 * Console logs will appear in ADB logcat (tag: ReactNativeJS)
 */
console.log('[Polyfills] Starting...');

// ── 1. Buffer ────────────────────────────────────────────────────────────────
console.log('[Polyfills] Requiring buffer...');
const { Buffer } = require('buffer');
global.Buffer = Buffer;
console.log('[Polyfills] Buffer OK:', typeof global.Buffer);

// ── 2. process ───────────────────────────────────────────────────────────────
console.log('[Polyfills] Requiring process...');
const proc = require('process');
if (!global.process) global.process = proc;
global.process.browser  = false;
global.process.version  = global.process.version  || 'v16.0.0';
global.process.versions = global.process.versions || {};
console.log('[Polyfills] process OK');

// ── 3. react-native (for Platform) ───────────────────────────────────────────
console.log('[Polyfills] Requiring react-native Platform...');
const { Platform } = require('react-native');
console.log('[Polyfills] Platform OK:', Platform.OS);

// ── 4. crypto (getRandomValues + subtle) ─────────────────────────────────────
// GramJS's MTProto crypto layer (telegram/crypto/crypto.js) uses:
//   - crypto.getRandomValues() for nonce generation
//   - self.crypto.subtle.digest() for SHA-1/SHA-256 hashing
//   - crypto.subtle.importKey() + deriveBits() for PBKDF2
// React Native / Hermes has NONE of these. We need both:
//   1. react-native-get-random-values → crypto.getRandomValues
//   2. subtleCryptoShim.js → minimal crypto.subtle using crypto-browserify
console.log('[Polyfills] Requiring react-native-get-random-values...');
require('react-native-get-random-values');
console.log('[Polyfills] get-random-values OK');

if (!global.crypto) global.crypto = {};
if (!global.crypto.getRandomValues) {
  throw new Error(
    '[Polyfills] FATAL: crypto.getRandomValues is not available after loading ' +
    'react-native-get-random-values. Cannot initialize securely.'
  );
}

// Install crypto.subtle shim (pure JS, no native deps)
// Only implements digest/importKey/deriveBits — the 3 methods GramJS uses.
console.log('[Polyfills] Installing crypto.subtle shim...');
const { subtle } = require('./subtleCryptoShim');
global.crypto.subtle = subtle;
console.log('[Polyfills] crypto.subtle installed OK');
console.log('[Polyfills] crypto OK (getRandomValues + subtle)');

// ── 5. localStorage shim ──────────────────────────────────────────────────────
if (typeof global.localStorage === 'undefined') {
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
console.log('[Polyfills] localStorage OK');

// ── 6. Node.js globals needed by GramJS / dependencies ────────────────────────
// `self` — used by whatwg-fetch and GramJS for global context detection
if (typeof global.self === 'undefined') {
  global.self = global;
}

// `__filename` — used by node-localstorage / write-file-atomic inside GramJS
if (typeof global.__filename === 'undefined') {
  global.__filename = '';
}

// `navigator.userAgent` — GramJS uses this for initConnection device info
if (typeof global.navigator === 'undefined') {
  global.navigator = {};
}
if (!global.navigator.userAgent) {
  global.navigator.userAgent = 'TelegramDrive/1.0 (React Native)';
}
console.log('[Polyfills] Node globals OK');

// ── 7. Web globals ────────────────────────────────────────────────────────────
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.Buffer  = window.Buffer  || Buffer;
  window.process = window.process || global.process;
  window.global  = window.global  || window;
}

console.log('[Polyfills] All done!');

