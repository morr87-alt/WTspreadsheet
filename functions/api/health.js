/**
 * Cloudflare Pages Function — /api/health
 * Ficheiro: functions/api/health.js
 */
export async function onRequest() {
  return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
