/**
 * Telegram Drive - Local Proxy Server
 * Runs gramjs in Node.js and exposes REST API for mobile web app.
 * Start with: npm run server  (port 3001)
 */

const express = require('express');
const cors = require('cors');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

let client = null;
let savedPhone = null;
let savedCodeHash = null;
let sessionString = '';
let savedApiId = null;
let savedApiHash = null;

// ─── Helpers ───────────────────────────────────────────────────────────────

async function getOrInitClient(apiId, apiHash, session = '') {
  if (!client) {
    const str = new StringSession(session || sessionString);
    client = new TelegramClient(str, parseInt(apiId), apiHash, { connectionRetries: 5 });
    await client.connect();
  }
  return client;
}

function formatFile(m) {
  let name = 'Unknown';
  let type = 'file';
  let size = 0;
  if (m.media?.document) {
    const attr = m.media.document.attributes?.find(a => a.className === 'DocumentAttributeFilename');
    name = attr?.fileName || `file_${m.id}`;
    size = Number(m.media.document.size || 0);
    const vidAttr = m.media.document.attributes?.find(a => a.className === 'DocumentAttributeVideo');
    const imgAttr = m.media.document.mimeType?.startsWith('image/');
    if (vidAttr) type = 'video';
    else if (imgAttr) type = 'image';
    else type = 'document';
  } else if (m.media?.photo) {
    name = `photo_${m.id}.jpg`;
    type = 'image';
  }
  return { id: String(m.id), name, type, size, date: m.date };
}

// ─── Health ────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ ok: true, connected: !!client });
});

// ─── Auth ──────────────────────────────────────────────────────────────────

app.post('/api/auth/request-code', async (req, res) => {
  try {
    const { apiId, apiHash, phone } = req.body;
    if (!apiId || !apiHash || !phone) return res.status(400).json({ error: 'apiId, apiHash, phone required' });
    client = null;
    savedApiId = apiId;
    savedApiHash = apiHash;
    await getOrInitClient(apiId, apiHash);
    savedPhone = phone;
    const result = await client.sendCode({ apiId: parseInt(apiId), apiHash }, phone);
    savedCodeHash = result.phoneCodeHash;
    console.log(`✅ Code sent to ${phone}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('request-code error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/sign-in', async (req, res) => {
  try {
    const { code } = req.body;
    if (!client || !savedCodeHash) return res.status(400).json({ error: 'No active session. Start from phone step.' });
    await client.invoke(new Api.auth.SignIn({ phoneNumber: savedPhone, phoneCodeHash: savedCodeHash, phoneCode: code }));
    sessionString = client.session.save();
    console.log('✅ Signed in');
    res.json({ ok: true, nextStep: 'dashboard', session: sessionString });
  } catch (err) {
    const msg = err.message || String(err);
    if (msg.includes('SESSION_PASSWORD_NEEDED')) return res.json({ ok: false, nextStep: 'password' });
    console.error('sign-in error:', msg);
    res.status(500).json({ error: msg });
  }
});

app.post('/api/auth/check-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!client) return res.status(400).json({ error: 'No client' });
    const pwInfo = await client.invoke(new Api.account.GetPassword());
    const { computeCheck } = require('telegram/Password');
    const check = await computeCheck(pwInfo, password);
    await client.invoke(new Api.auth.CheckPassword({ password: check }));
    sessionString = client.session.save();
    console.log('✅ 2FA passed');
    res.json({ ok: true, session: sessionString });
  } catch (err) {
    console.error('check-password error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/restore', async (req, res) => {
  try {
    const { apiId, apiHash, session } = req.body;
    savedApiId = apiId;
    savedApiHash = apiHash;
    sessionString = session;
    await getOrInitClient(apiId, apiHash, session);
    const me = await client.getMe();
    res.json({ ok: true, user: { id: me.id?.toString(), name: me.firstName, phone: me.phone } });
  } catch (err) {
    client = null;
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    if (client) { await client.invoke(new Api.auth.LogOut()); }
    client = null; sessionString = ''; savedPhone = null; savedCodeHash = null;
    res.json({ ok: true });
  } catch { client = null; res.json({ ok: true }); }
});

// ─── Files ─────────────────────────────────────────────────────────────────

app.get('/api/files', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const entity = req.query.entity || 'me';
    const limit = parseInt(req.query.limit) || 50;
    const messages = await client.getMessages(entity, { limit });
    const files = messages.filter(m => m.media).map(formatFile);
    res.json({ ok: true, files });
  } catch (err) {
    console.error('get-files error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/files/delete', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const { messageId, folderId } = req.body;
    const entity = folderId ? folderId : 'me';
    await client.deleteMessages(entity, [parseInt(messageId)], { revoke: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/search', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const { q, folderId } = req.query;
    const entity = folderId || 'me';
    const messages = await client.getMessages(entity, { search: q, limit: 50 });
    const files = messages.filter(m => m.media).map(formatFile);
    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Folders ───────────────────────────────────────────────────────────────

app.get('/api/folders', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const dialogs = await client.getDialogs({ limit: 200 });
    const folders = dialogs
      .filter(d => d.isChannel && !d.isGroup)
      .map(d => ({ id: String(d.id), name: d.title }));
    res.json({ ok: true, folders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/folders/create', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const { name } = req.body;
    const result = await client.invoke(new Api.channels.CreateChannel({
      title: name,
      about: 'Telegram Drive Folder',
      megagroup: false,
      broadcast: false,
    }));
    const channel = result.chats[0];
    res.json({ ok: true, folder: { id: String(channel.id), name: channel.title } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/folders/delete', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const { folderId } = req.body;
    await client.invoke(new Api.channels.DeleteChannel({ channel: folderId }));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/folders/sync', async (req, res) => {
  try {
    if (!client) return res.status(401).json({ error: 'Not authenticated' });
    const dialogs = await client.getDialogs({ limit: 200 });
    const folders = dialogs
      .filter(d => d.isChannel && !d.isGroup)
      .map(d => ({ id: String(d.id), name: d.title }));
    res.json({ ok: true, folders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Telegram Drive Proxy Server running at http://localhost:${PORT}`);
  console.log('   Endpoints: /api/health, /api/auth/*, /api/files, /api/folders\n');
});
