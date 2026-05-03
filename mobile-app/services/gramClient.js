/**
 * gramClient.js
 * Singleton TelegramClient that runs gramjs DIRECTLY in the browser.
 * No proxy server needed.
 */
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

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
      useWSS: false,
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

  /** Persist session to localStorage */
  saveSession() {
    const s = this.client?.session?.save?.();
    if (s) {
      localStorage.setItem(SESSION_KEY,  s);
      localStorage.setItem(API_ID_KEY,   String(this._apiId));
      localStorage.setItem(API_HASH_KEY, this._apiHash);
    }
  }

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(API_ID_KEY);
    localStorage.removeItem(API_HASH_KEY);
    this.client         = null;
    this._phone         = null;
    this._phoneCodeHash = null;
    this._entityCache   = {};
    this._apiId         = null;
    this._apiHash       = null;
  }

  getSaved() {
    return {
      session: localStorage.getItem(SESSION_KEY)  || '',
      apiId:   localStorage.getItem(API_ID_KEY)   || '',
      apiHash: localStorage.getItem(API_HASH_KEY) || '',
    };
  }

  cacheEntity(id, entity) {
    if (id) this._entityCache[String(id)] = entity;
  }

  getCachedEntity(id) {
    return this._entityCache[String(id)] || null;
  }
}

export const gramClient = new GramClientManager();
