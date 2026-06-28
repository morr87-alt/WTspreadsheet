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
  // aceita token da hora anterior (grace period)
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
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  // GET — ler dados (público)
  if (request.method === 'GET') {
    try {
      const raw = await env.WT_DATA.get('main');
      if (!raw) return json({});
      return new Response(raw, {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    } catch(e) {
      return json({ error: 'Erro ao ler: ' + e.message }, 500);
    }
  }

  // POST — guardar dados (requer token)
  if (request.method === 'POST') {
    const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
    const secret = env.EDITOR_PASSWORD || 'wt2025';

    if (!await verifyToken(token, secret)) {
      return json({ error: 'Não autorizado' }, 401);
    }
    try {
      // ler body como texto primeiro
      const bodyText = await request.text();

      // validar que é JSON válido
      let body;
      try {
        body = JSON.parse(bodyText);
      } catch(e) {
        return json({ error: 'JSON inválido: ' + e.message }, 400);
      }

      // adicionar metadata
      body._savedAt = new Date().toISOString();
      body._version = (body._version || 0) + 1;

      const toSave = JSON.stringify(body);

      // guardar principal
      await env.WT_DATA.put('main', toSave);

      // backup 7 dias (não bloqueia se falhar)
      try {
        await env.WT_DATA.put(`backup:${Date.now()}`, toSave, { expirationTtl: 604800 });
      } catch(e) {
        console.warn('Backup falhou:', e.message);
      }

      return json({ ok: true, savedAt: body._savedAt, version: body._version });
    } catch(e) {
      return json({ error: 'Erro ao guardar: ' + e.message }, 500);
    }
  }

  return json({ error: 'Método não suportado' }, 405);
}
