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

// ── 4. crypto.getRandomValues ────────────────────────────────────────────────
// react-native-get-random-values provides a CSPRNG implementation.
// If this import fails, we intentionally let it crash — falling back to
// Math.random() would silently produce predictable values used for
// MTProto encryption keys, which is a critical security risk.
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
console.log('[Polyfills] crypto.getRandomValues OK');

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

// ── 6. Web globals ────────────────────────────────────────────────────────────
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.Buffer  = window.Buffer  || Buffer;
  window.process = window.process || global.process;
  window.global  = window.global  || window;
}

console.log('[Polyfills] All done!');
