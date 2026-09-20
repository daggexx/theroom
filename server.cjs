'use strict';
// Static files plus a small state API. No dependencies: Privy access tokens are plain ES256 JWTs,
// and Node can verify those with the app's public verification key from the Privy dashboard.
//
//   config.json   — copy config.example.json and fill in the Privy app id and verification key.
//   data/         — one JSON file per player, keyed by a hash of their Privy user id.
//
// With no Privy app configured the server runs in guest mode: the client sends its own local id and the
// server trusts it. That keeps the game playable and testable offline; it is NOT safe for deployment.
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const TYPES = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
 '.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const NEVER_SERVE = new Set(['config.json','package-lock.json']); // secrets and noise stay off the wire
const MAX_BODY = 512 * 1024;

function loadConfig(){
  try{
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT,'config.json'),'utf8'));
    const privy = raw.privy || {};
    if(privy.appId) return {...raw, privy, mode:'privy'};
    return {...raw, privy, mode:'guest'};
  }catch{ return {privy:{}, mode:'guest'}; }
}
let config = loadConfig();

// ---- Privy access tokens ------------------------------------------------------
// A Privy access token is an ES256 JWT with iss "privy.io" and aud set to the app id. Privy publishes the app's
// public signing keys, so there is no key to copy by hand and a rotation is picked up on its own; a
// verificationKey in config.json overrides that and keeps verification offline.
const b64url = s => Buffer.from(s, 'base64url');
const JWKS_URL = id => `https://auth.privy.io/api/v1/apps/${encodeURIComponent(id)}/jwks.json`;
const jwks = {keys: new Map(), fetched: 0, pending: null};
function refreshKeys(){
  if(jwks.pending) return jwks.pending;
  if(Date.now() - jwks.fetched < 60000) return Promise.resolve();   // an unknown kid must not become a fetch loop
  jwks.pending = (async () => {
    try{
      const response = await fetch(JWKS_URL(config.privy.appId));
      if(!response.ok) throw new Error('jwks ' + response.status);
      const {keys} = await response.json();
      const next = new Map();
      for(const jwk of keys || [])
        if(jwk.kty === 'EC' && jwk.alg === 'ES256' && jwk.kid) next.set(jwk.kid, crypto.createPublicKey({key: jwk, format: 'jwk'}));
      if(next.size) jwks.keys = next;
      jwks.fetched = Date.now();
    }finally{ jwks.pending = null; }
  })();
  return jwks.pending;
}
async function signingKey(kid){
  if(config.privy.verificationKey) return config.privy.verificationKey;
  if(!jwks.keys.has(kid)) await refreshKeys();
  const key = jwks.keys.get(kid);
  if(!key) throw new Error('unknown signing key');
  return key;
}
async function verifyPrivyToken(token){
  const parts = String(token||'').split('.');
  if(parts.length !== 3) throw new Error('malformed token');
  const [head, body, sig] = parts;
  let header, claims;
  try{ header = JSON.parse(b64url(head)); claims = JSON.parse(b64url(body)); }
  catch{ throw new Error('unreadable token'); }
  if(header.alg !== 'ES256') throw new Error('unexpected algorithm');
  // The signature is the raw r||s pair, not DER, so Node needs to be told which encoding to expect.
  const key = await signingKey(header.kid);
  const ok = crypto.verify('sha256', Buffer.from(`${head}.${body}`), {key, dsaEncoding: 'ieee-p1363'}, b64url(sig));
  if(!ok) throw new Error('bad signature');
  if(claims.iss !== 'privy.io') throw new Error('wrong issuer');
  if(claims.aud !== config.privy.appId) throw new Error('wrong audience');
  if(!claims.sub) throw new Error('no subject');
  const now = Math.floor(Date.now()/1000);
  if(typeof claims.exp !== 'number' || claims.exp <= now) throw new Error('token expired');
  return claims;
}

// Who is asking? A verified Privy user, or — only while no Privy app is configured — a self-declared guest.
async function identify(req){
  const auth = req.headers.authorization || '';
  if(auth.startsWith('Bearer ')){
    if(config.mode !== 'privy') throw new Error('no Privy app configured');
    const claims = await verifyPrivyToken(auth.slice(7).trim());
    return {id: claims.sub, kind: 'privy'};
  }
  const guest = req.headers['x-guest-id'];
  if(config.mode === 'guest' && typeof guest === 'string' && /^[a-z0-9-]{8,64}$/.test(guest))
    return {id: 'guest:' + guest, kind: 'guest'};
  throw new Error('not signed in');
}

// ---- player state -------------------------------------------------------------
const fileFor = id => path.join(DATA, crypto.createHash('sha256').update(id).digest('hex').slice(0,32) + '.json');
async function readState(id){
  try{ return JSON.parse(await fsp.readFile(fileFor(id),'utf8')); }
  catch{ return null; }
}
async function writeState(id, state){
  await fsp.mkdir(DATA, {recursive:true});
  const file = fileFor(id), temp = file + '.tmp';
  const record = {id, updated: new Date().toISOString(), save: state.save ?? null, room: state.room ?? null};
  await fsp.writeFile(temp, JSON.stringify(record));
  await fsp.rename(temp, file);           // a crash mid-write must not leave a half-written save
  return record;
}

function send(res, status, body, type='application/json; charset=utf-8'){
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store'});
  res.end(data);
}
function readBody(req){
  // On overflow we stop buffering and reject at once, but let the rest of the upload drain: tearing the socket
  // down here would reach the client as a connection error instead of the 413 we want it to see.
  return new Promise((resolve, reject) => {
    let size = 0, over = false; const chunks = [];
    req.on('data', chunk => {
      if(over) return;
      size += chunk.length;
      if(size > MAX_BODY){ over = true; chunks.length = 0; reject(new Error('payload too large')); return; }
      chunks.push(chunk);
    });
    req.on('end', () => { if(over) return;
      try{ resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }catch{ reject(new Error('bad JSON')); } });
    req.on('error', reject);
  });
}

async function api(req, res, pathname){
  // What the client needs to boot: never the verification key, never a secret.
  if(pathname === '/api/config' && req.method === 'GET')
    return send(res, 200, {mode: config.mode, privy: config.mode === 'privy'
      ? {appId: config.privy.appId, clientId: config.privy.clientId || null, sdkUrl: config.privy.sdkUrl || null}
      : null});

  let who;
  try{ who = await identify(req); }
  catch(error){ return send(res, 401, {error: error.message}); }

  if(pathname === '/api/state' && req.method === 'GET'){
    const state = await readState(who.id);
    return send(res, 200, {player: {id: who.id, kind: who.kind}, state: state && {save: state.save, room: state.room, updated: state.updated}});
  }
  if(pathname === '/api/state' && req.method === 'PUT'){
    let body;
    try{ body = await readBody(req); }
    catch(error){ req.resume(); return send(res, error.message === 'bad JSON' ? 400 : 413, {error: error.message}); }
    if(body.save && typeof body.save !== 'object') return send(res, 400, {error:'save must be an object'});
    if(body.room && typeof body.room !== 'object') return send(res, 400, {error:'room must be an object'});
    const record = await writeState(who.id, body);
    return send(res, 200, {ok: true, updated: record.updated});
  }
  return send(res, 404, {error: 'no such endpoint'});
}

function serveFile(res, pathname){
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.join(ROOT, rel), type = TYPES[path.extname(file)];
  const parts = rel.split('/');
  const hidden = parts.some(part => part.startsWith('.')) || parts[0] === 'data' || NEVER_SERVE.has(rel);
  if(!type || hidden || !file.startsWith(ROOT + path.sep)){ res.writeHead(404); return res.end('Not found'); }
  fs.stat(file, (error, stat) => {
    if(error || !stat.isFile()){ res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type': type, 'Cache-Control': 'no-store'});
    fs.createReadStream(file).pipe(res);
  });
}

function handle(req, res){
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if(pathname === '/favicon.ico'){ res.writeHead(204); return res.end(); }
  if(pathname.startsWith('/api/'))
    return api(req, res, pathname).catch(error => send(res, 500, {error: error.message}));
  serveFile(res, pathname);
}

// Loopback only, but on both families: Windows often resolves "localhost" to ::1, and Privy's allowed-origin
// list wants a localhost URL, so the page has to answer under both spellings.
const port = config.port || 4173;
const hosts = config.hosts || ['127.0.0.1', '::1'];
let listening = 0;
for(const host of hosts){
  const server = http.createServer(handle);
  server.on('error', error => {
    if(error.code !== 'EADDRNOTAVAIL' && error.code !== 'EAFNOSUPPORT') console.warn(host + ': ' + error.message);
  });
  server.listen(port, host, () => {
    if(listening++) return;
    console.log('theroom on http://localhost:' + port + ' (ve http://127.0.0.1:' + port + ')  ·  ' +
      (config.mode === 'privy' ? 'Privy girişi açık · ' + config.privy.appId : 'misafir modu (Privy yapılandırılmadı)'));
    if(config.mode === 'privy' && !config.privy.verificationKey)
      refreshKeys().then(() => console.log(jwks.keys.size
        ? `imza anahtarları alındı (${jwks.keys.size})`
        : 'imza anahtarları alınamadı — App ID doğru mu?'))
        .catch(error => console.log('imza anahtarları alınamadı: ' + error.message));
  });
}
