// POST /progress/unlock with the proof (64 hex characters) as the body. A right proof sets the cookie that lets the encrypted files through.
import { same, makeCookie } from './_gate.js';
const plain = (text, status, extra = {}) => new Response(text, { status, headers: { 'cache-control': 'no-store', 'content-type': 'text/plain', ...extra } });
export async function onRequestPost({ request, env }) {
  if (!env.PROGRESS_PROOF) return plain('No gate here', 404);
  const body = ((await request.text()) || '').trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(body) || !same(body, String(env.PROGRESS_PROOF).trim().toLowerCase())) { await new Promise((r) => setTimeout(r, 700)); return plain('No', 401); }   // slow answer to a wrong guess
  return plain('OK', 200, { 'set-cookie': await makeCookie(String(env.PROGRESS_PROOF).trim().toLowerCase()) });
}
export const onRequest = () => plain('Method not allowed', 405);
