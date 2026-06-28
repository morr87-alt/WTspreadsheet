/**
 * Cloudflare Pages Function — /api/data
 * Ficheiro: functions/api/data.js
 *
 * GET  /api/data  → devolve todos os dados guardados (público)
 * POST /api/data  → guarda dados (requer token de sessão)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function makeToken(secret) {
  const hour = Math.floor(Date.now() / 3_600_000);
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${secret}:${hour}`));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).slice(0, 32);
}

async function verifyToken(token, secret) {
  const t1 = await makeToken(secret);
  // aceita token da hora anterior também (grace period)
  const hour = Math.floor(Date.now() / 3_600_000) - 1;
  const enc  = new TextEncoder();
  const key  = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${secret}:${hour}`));
  const t2  = btoa(String.fromCharCode(...new Uint8Array(sig))).slice(0, 32);
  return token === t1 || token === t2;
}

export async function onRequest({ request, env }) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  // GET → ler dados (público, sem auth)
  if (request.method === 'GET') {
    const raw = await env.WT_DATA.get('main', { type: 'json' });
    return json(raw || {});
  }

  // POST → guardar dados (requer token)
  if (request.method === 'POST') {
    const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
    if (!await verifyToken(token, env.EDITOR_PASSWORD)) {
      return json({ error: 'Não autorizado' }, 401);
    }
    try {
      const body = await request.json();
      body._savedAt = new Date().toISOString();
      body._version = (body._version || 0) + 1;
      // guardar dados principais
      await env.WT_DATA.put('main', JSON.stringify(body));
      // backup automático com expiração de 7 dias
      await env.WT_DATA.put(
        `backup:${Date.now()}`,
        JSON.stringify(body),
        { expirationTtl: 604800 }
      );
      return json({ ok: true, savedAt: body._savedAt, version: body._version });
    } catch (e) {
      return json({ error: 'Erro ao guardar: ' + e.message }, 500);
    }
  }

  return json({ error: 'Método não suportado' }, 405);
}
