/**
 * gramClient.js
 *
 * IMPORTANT: gramjs (telegram package) is lazy-loaded via require() inside
 * each function. Importing it at the top level triggers its module initialization
 * (including crypto operations) BEFORE React Native's JS bridge is ready,
 * causing "Cannot read property 'slice' of undefined" crashes on Hermes.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tg_session';

// Lazily resolved gramjs constructors
let _TelegramClient = null;
let _StringSession  = null;

function getGramJS() {
  if (!_TelegramClient) {
    _TelegramClient = require('telegram').TelegramClient;
    _StringSession  = require('telegram/sessions').StringSession;
  }
  return { TelegramClient: _TelegramClient, StringSession: _StringSession };
}

class GramClientManager {
  constructor() {
    this._client = null;
    this._entityCache = {};
  }

  async init(apiId, apiHash, sessionStr = '') {
    if (!apiId || !apiHash) {
      throw new Error('apiId and apiHash are required to initialize the Telegram client.');
    }
    const { TelegramClient, StringSession } = getGramJS();

    const session = new StringSession(sessionStr);

    this._client = new TelegramClient(session, parseInt(apiId, 10), apiHash, {
      connectionRetries: 5,
      useWSS: false,
    });

    await this._client.connect();
    return this._client;
  }

  get() {
    if (!this._client) throw new Error('Telegram client not initialized');
    return this._client;
  }

  // ── Entity cache ─────────────────────────────────────────────────────────
  cacheEntity(id, entity) {
    this._entityCache[id] = entity;
  }

  getCachedEntity(id) {
    return this._entityCache[id] || null;
  }

  // ── Session persistence ──────────────────────────────────────────────────
  async saveSession() {
    if (!this._client) return;
    const sessionStr = this._client.session.save();
    const data = JSON.stringify({
      session: sessionStr,
      apiId:   this._apiId,
      apiHash: this._apiHash,
    });
    await AsyncStorage.setItem(STORAGE_KEY, data);
  }

  async getSaved() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { session: null, apiId: null, apiHash: null };
    try {
      return JSON.parse(raw);
    } catch {
      // Legacy format: raw session string with no apiId/apiHash
      return { session: null, apiId: null, apiHash: null };
    }
  }

  async clearSession() {
    this._entityCache = {};
    await AsyncStorage.removeItem(STORAGE_KEY);
    await this.disconnect();
  }

  async disconnect() {
    if (this._client) {
      await this._client.disconnect();
      this._client = null;
    }
  }
}

export const gramClient = new GramClientManager();
