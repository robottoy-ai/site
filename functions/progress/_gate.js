// Shared by _middleware.js and unlock.js. The cookie is "<expiry in seconds>.<HMAC-SHA256 of that expiry>", keyed with the secret.
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function sign(text, secret) {
  const k = await crypto.subtle.importKey('raw', enc.encode('cookie:' + secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(text)));
}
export function same(a, b) {                       // compares in constant time
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
}
export async function makeCookie(secret, hours = 12) {
  const exp = Math.floor(Date.now() / 1000) + hours * 3600; const value = exp + '.' + (await sign('pg1.' + exp, secret));
  return `pg=${value}; Path=/progress; Max-Age=${hours * 3600}; HttpOnly; Secure; SameSite=Strict`;
}
export async function validCookie(header, secret) {
  const m = /(?:^|;\s*)pg=(\d{9,12})\.([0-9a-f]{64})(?:;|$)/.exec(header); if (!m) return false;
  if (+m[1] < Date.now() / 1000) return false; return same(m[2], await sign('pg1.' + m[1], secret));
}
