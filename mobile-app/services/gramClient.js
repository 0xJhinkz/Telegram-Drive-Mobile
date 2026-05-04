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
  }

  async init(sessionStr = '') {
    const { TelegramClient, StringSession } = getGramJS();

    const apiId   = parseInt(process.env.EXPO_PUBLIC_API_ID   || '28121035', 10);
    const apiHash =           process.env.EXPO_PUBLIC_API_HASH || '2d09e6db4e8e7e8c4571aab94ea33a23';
    const session = new StringSession(sessionStr);

    this._client = new TelegramClient(session, apiId, apiHash, {
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

  async disconnect() {
    if (this._client) {
      await this._client.disconnect();
      this._client = null;
    }
  }

  async saveSession(session) {
    await AsyncStorage.setItem(STORAGE_KEY, session);
  }

  async getSaved() {
    return await AsyncStorage.getItem(STORAGE_KEY);
  }

  async clearSession() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await this.disconnect();
  }
}

export const gramClient = new GramClientManager();
