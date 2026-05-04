/**
 * gramClient.js
 * Singleton TelegramClient that runs gramjs DIRECTLY in React Native.
 * Uses AsyncStorage instead of localStorage for native Android compatibility.
 */
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY  = 'tg_session';
const API_ID_KEY   = 'tg_api_id';
const API_HASH_KEY = 'tg_api_hash';

class GramClientManager {
  constructor() {
    this.client         = null;
    this._phone         = null;
    this._phoneCodeHash = null;
    this._entityCache   = {};   // id(string) → entity
    this._apiId         = null;
    this._apiHash       = null;
  }

  /** Create and connect a new TelegramClient */
  async init(apiId, apiHash, sessionStr = '') {
    this._apiId   = apiId;
    this._apiHash = apiHash;
    const session = new StringSession(sessionStr || '');
    this.client   = new TelegramClient(session, parseInt(apiId, 10), apiHash, {
      connectionRetries: 5,
      useWSS: true,          // Use WebSockets — works on Android without native TCP
      deviceModel: 'Android',
      systemVersion: 'Android 15',
      appVersion: '1.0.0',
      langCode: 'en',
    });
    await this.client.connect();
    return this.client;
  }

  /** Return the active client, or throw */
  get() {
    if (!this.client) throw new Error('Not connected. Please log in.');
    return this.client;
  }

  isConnected() {
    return !!(this.client && this.client.connected);
  }

  /** Persist session to AsyncStorage (async — fire-and-forget is OK) */
  async saveSession() {
    try {
      const s = this.client?.session?.save?.();
      if (s) {
        await AsyncStorage.setItem(SESSION_KEY,  s);
        await AsyncStorage.setItem(API_ID_KEY,   String(this._apiId));
        await AsyncStorage.setItem(API_HASH_KEY, this._apiHash);
      }
    } catch (e) {
      console.warn('[gramClient] saveSession error:', e);
    }
  }

  async clearSession() {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, API_ID_KEY, API_HASH_KEY]);
    } catch {}
    this.client         = null;
    this._phone         = null;
    this._phoneCodeHash = null;
    this._entityCache   = {};
    this._apiId         = null;
    this._apiHash       = null;
  }

  async getSaved() {
    try {
      const values = await AsyncStorage.multiGet([SESSION_KEY, API_ID_KEY, API_HASH_KEY]);
      const map    = Object.fromEntries(values.map(([k, v]) => [k, v || '']));
      return {
        session: map[SESSION_KEY]  || '',
        apiId:   map[API_ID_KEY]   || '',
        apiHash: map[API_HASH_KEY] || '',
      };
    } catch {
      return { session: '', apiId: '', apiHash: '' };
    }
  }

  cacheEntity(id, entity) {
    if (id) this._entityCache[String(id)] = entity;
  }

  getCachedEntity(id) {
    return this._entityCache[String(id)] || null;
  }
}

export const gramClient = new GramClientManager();
