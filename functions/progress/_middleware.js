// Runs on Cloudflare Pages, in front of everything under /progress/.
// The encrypted files (*.bin) are only sent to a browser that holds a valid cookie from unlock.js.
// PROGRESS_PROOF is a secret set in the Pages project (Settings, Variables and Secrets). It is NOT the page password: it is a value made from it.
// If the secret is not set, nothing is gated and the page works as on a plain file host.
import { validCookie } from './_gate.js';
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (!env.PROGRESS_PROOF || !url.pathname.endsWith('.bin')) return next();
  if (!(await validCookie(request.headers.get('Cookie') || '', env.PROGRESS_PROOF))) return new Response('Locked', { status: 401, headers: { 'cache-control': 'no-store', 'content-type': 'text/plain' } });
  const r = await next(); const out = new Response(r.body, r); out.headers.set('cache-control', 'private, no-store'); return out;
}
