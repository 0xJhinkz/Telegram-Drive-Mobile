/**
 * gramjs-crypto.js — Drop-in replacement for telegram/crypto/crypto.js
 *
 * The original file uses Web Crypto API (crypto.subtle.digest, importKey,
 * deriveBits) which does NOT exist in React Native / Hermes.
 *
 * This replacement uses crypto-browserify (sync, pure JS) which is already
 * shimmed via metro.config.js. Zero native dependencies.
 */

"use strict";
const aes = require("@cryptography/aes").default;
const { i2ab, ab2i } = require("telegram/crypto/converters");
const { getWords } = require("telegram/crypto/words");
const cryptoB = require("crypto-browserify");

class Counter {
  constructor(initialValue) {
    this._counter = Buffer.from(initialValue);
  }
  increment() {
    for (let i = 15; i >= 0; i--) {
      if (this._counter[i] === 255) {
        this._counter[i] = 0;
      } else {
        this._counter[i]++;
        break;
      }
    }
  }
}
exports.Counter = Counter;

class CTR {
  constructor(key, counter) {
    if (!(counter instanceof Counter)) {
      counter = new Counter(counter);
    }
    this._counter = counter;
    this._remainingCounter = undefined;
    this._remainingCounterIndex = 16;
    this._aes = new aes(getWords(key));
  }
  update(plainText) {
    return this.encrypt(plainText);
  }
  encrypt(plainText) {
    const encrypted = Buffer.from(plainText);
    for (let i = 0; i < encrypted.length; i++) {
      if (this._remainingCounterIndex === 16) {
        this._remainingCounter = Buffer.from(
          i2ab(this._aes.encrypt(ab2i(this._counter._counter)))
        );
        this._remainingCounterIndex = 0;
        this._counter.increment();
      }
      if (this._remainingCounter) {
        encrypted[i] ^= this._remainingCounter[this._remainingCounterIndex++];
      }
    }
    return encrypted;
  }
}
exports.CTR = CTR;

function createDecipheriv(algorithm, key, iv) {
  if (algorithm.includes("ECB")) {
    throw new Error("Not supported");
  }
  return new CTR(key, iv);
}
exports.createDecipheriv = createDecipheriv;

function createCipheriv(algorithm, key, iv) {
  if (algorithm.includes("ECB")) {
    throw new Error("Not supported");
  }
  return new CTR(key, iv);
}
exports.createCipheriv = createCipheriv;

function randomBytes(count) {
  const bytes = new Uint8Array(count);
  // Uses global.crypto.getRandomValues from react-native-get-random-values
  crypto.getRandomValues(bytes);
  return bytes;
}
exports.randomBytes = randomBytes;

/**
 * Hash class — uses crypto-browserify's createHash (synchronous)
 * instead of the Web Crypto API (self.crypto.subtle.digest).
 *
 * digest() returns a resolved Promise for compatibility with GramJS's
 * `await shaSum.digest()` pattern.
 */
class Hash {
  constructor(algorithm) {
    this.algorithm = algorithm;
    this._hash = cryptoB.createHash(algorithm);
  }
  update(data) {
    this._hash.update(Buffer.from(data));
  }
  async digest() {
    return this._hash.digest();
  }
}
exports.Hash = Hash;

/**
 * pbkdf2Sync — uses crypto-browserify's pbkdf2Sync (synchronous)
 * instead of Web Crypto API (crypto.subtle.importKey + deriveBits).
 */
async function pbkdf2Sync(password, salt, iterations, ...args) {
  return cryptoB.pbkdf2Sync(
    Buffer.from(password),
    Buffer.from(salt),
    iterations,
    64, // 512 bits = 64 bytes
    "sha512"
  );
}
exports.pbkdf2Sync = pbkdf2Sync;

function createHash(algorithm) {
  return new Hash(algorithm);
}
exports.createHash = createHash;
