/**
 * Cloudflare Pages Function — /api/auth
 * Ficheiro: functions/api/auth.js
 *
 * POST /api/auth  → verifica password, devolve token de sessão (1h)
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

export async function onRequest({ request, env }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Método não suportado' }, 405);
  }

  try {
    const { password } = await request.json();
    const correct = env.EDITOR_PASSWORD || 'wt2025';
if (password !== correct) {
      // pequeno delay para dificultar brute-force
      await new Promise(r => setTimeout(r, 500));
      return json({ error: 'Password incorreta' }, 401);
    }
    const token = await makeToken(env.EDITOR_PASSWORD);
    return json({ ok: true, token });
  } catch {
    return json({ error: 'Request inválido' }, 400);
  }
}
