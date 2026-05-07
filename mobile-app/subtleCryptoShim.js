/**
 * subtleCryptoShim.js
 *
 * Minimal SubtleCrypto polyfill for React Native / Hermes.
 * Only implements the 3 methods GramJS actually calls:
 *   - subtle.digest("SHA-1" | "SHA-256", data)
 *   - subtle.importKey("raw", keyData, { name: "PBKDF2" }, ...)
 *   - subtle.deriveBits({ name: "PBKDF2", hash, salt, iterations }, key, length)
 *
 * Uses crypto-browserify which is already shimmed via metro.config.js.
 */

const cryptoBrowserify = require('crypto-browserify');

const HASH_MAP = {
  'SHA-1':   'sha1',
  'SHA-256': 'sha256',
  'SHA-384': 'sha384',
  'SHA-512': 'sha512',
};

const subtle = {
  /**
   * SubtleCrypto.digest()
   * Used by GramJS for MTProto SHA-1/SHA-256 hashing.
   */
  async digest(algorithm, data) {
    const alg = typeof algorithm === 'string' ? algorithm : algorithm.name;
    const nodeAlg = HASH_MAP[alg];
    if (!nodeAlg) throw new Error(`[SubtleCryptoShim] Unsupported algorithm: ${alg}`);

    const buf = Buffer.from(data);
    const hash = cryptoBrowserify.createHash(nodeAlg);
    hash.update(buf);
    return hash.digest().buffer;
  },

  /**
   * SubtleCrypto.importKey()
   * Used by GramJS for PBKDF2 password hashing.
   * Returns the raw key material wrapped in an object.
   */
  async importKey(format, keyData, algorithm, extractable, usages) {
    if (format !== 'raw') {
      throw new Error(`[SubtleCryptoShim] Only "raw" format supported, got: ${format}`);
    }
    return { _keyData: Buffer.from(keyData), algorithm };
  },

  /**
   * SubtleCrypto.deriveBits()
   * Used by GramJS for PBKDF2 key derivation (2FA passwords).
   */
  async deriveBits(algorithm, key, length) {
    if (algorithm.name !== 'PBKDF2') {
      throw new Error(`[SubtleCryptoShim] Only PBKDF2 supported, got: ${algorithm.name}`);
    }
    const nodeHash = HASH_MAP[algorithm.hash] || algorithm.hash;
    const result = cryptoBrowserify.pbkdf2Sync(
      key._keyData,
      Buffer.from(algorithm.salt),
      algorithm.iterations,
      length / 8,
      nodeHash
    );
    return result.buffer;
  },
};

module.exports = { subtle };
