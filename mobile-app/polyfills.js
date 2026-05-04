/**
 * polyfills.js
 * Uses require() NOT import — require is synchronous and sequential.
 * With ES import, all statements are hoisted, so global.Buffer = Buffer
 * runs AFTER every imported module has already evaluated — too late for gramjs.
 */

// ── 1. Buffer — MUST be first ────────────────────────────────────────────────
const { Buffer } = require('buffer');
global.Buffer = Buffer;

// ── 2. process ───────────────────────────────────────────────────────────────
const { Platform } = require('react-native');
if (!global.process) {
  global.process = require('process');
}
global.process.browser = false;
global.process.version  = global.process.version || 'v16.0.0';
global.process.versions = global.process.versions || {};

// ── 3. crypto.getRandomValues — AFTER Buffer so crypto-browserify can use it
require('react-native-get-random-values');
if (!global.crypto) global.crypto = {};
if (!global.crypto.getRandomValues) {
  // Fallback (already patched above, this is just safety)
  global.crypto.getRandomValues = function (typedArray) {
    for (let i = 0; i < typedArray.length; i++) {
      typedArray[i] = Math.floor(Math.random() * 256);
    }
    return typedArray;
  };
}

// ── 4. localStorage shim — gramjs caches TL schema here ─────────────────────
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

// ── 5. Web globals (web only) ────────────────────────────────────────────────
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.Buffer  = window.Buffer  || Buffer;
  window.process = window.process || global.process;
  window.global  = window.global  || window;
}
