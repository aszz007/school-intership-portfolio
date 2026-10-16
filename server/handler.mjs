import seed from './seed.mjs';
import {validateContent} from './validation.mjs';
import {digest, newToken, passwordMatches} from './auth.mjs';

const sessionLife = 2 * 60 * 60 * 1000;
const reply = (data, status = 200, more = {}) => new Response(JSON.stringify(data), {status, headers:{
  'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff', ...more
}});
async function body(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('请使用JSON格式');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('内容为空');
  const chunks = []; let total = 0;
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 96 * 1024) { await reader.cancel(); throw new Error('内容超过96KB限制'); }
    chunks.push(value);
  }
  const data = new Uint8Array(total); let offset = 0;
  chunks.forEach(chunk => { data.set(chunk, offset); offset += chunk.length; });
  return JSON.parse(new TextDecoder().decode(data));
}
async function content(db) {
  let row = await db.prepare('SELECT payload, revision FROM content WHERE id = 1').first();
  if (!row) {
    await db.prepare('INSERT OR IGNORE INTO content (id, payload, revision) VALUES (1, ?, 1)').bind(JSON.stringify(validateContent(seed))).run();
    row = await db.prepare('SELECT payload, revision FROM content WHERE id = 1').first();
  }
  return {...JSON.parse(row.payload), revision:row.revision};
}
function cookie(request, value, age) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `portfolio_session=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${age}${secure}`;
}
async function authenticated(request, db) {
  const token = request.headers.get('cookie')?.match(/(?:^|;\s*)portfolio_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return false;
  const row = await db.prepare('SELECT expires FROM sessions WHERE token_hash = ?').bind(await digest(token)).first();
  return !!row && row.expires > Date.now();
}
export async function handleRequest(request, env) {
  const pathname = new URL(request.url).pathname.replace(/\/$/, '');
  const method = request.method;
  if (!env.DB) return reply({error:'后台数据库尚未配置'}, 503);
  if (!['GET', 'POST', 'PUT'].includes(method)) return reply({error:'不支持此操作'}, 405);
  if (method !== 'GET' && request.headers.get('origin') !== new URL(request.url).origin) return reply({error:'请求来源不正确'}, 403);
  try {
    if (pathname === '/api/content' && method === 'GET') return reply(await content(env.DB));
    if (pathname === '/api/session' && method === 'GET') return reply({authenticated:await authenticated(request, env.DB)});
    if (pathname === '/api/login' && method === 'POST') {
      if (!/^[a-f0-9]{32}\.[a-f0-9]{64}$/.test(env.ADMIN_PASSWORD_HASH || '')) return reply({error:'管理员密码尚未配置'}, 503);
      const now = Date.now();
      await env.DB.prepare('DELETE FROM attempts WHERE reset_at <= ?').bind(now).run();
      await env.DB.prepare('DELETE FROM sessions WHERE expires <= ?').bind(now).run();
      const client = await digest(request.headers.get('CF-Connecting-IP') || 'local');
      for (const key of [client, 'global-login-limit']) {
        const row = await env.DB.prepare('INSERT INTO attempts (client_key, count, reset_at) VALUES (?, 1, ?) ON CONFLICT(client_key) DO UPDATE SET count = count + 1 RETURNING count').bind(key, now + 15 * 60 * 1000).first();
        if (row.count > (key === client ? 5 : 30)) return reply({error:'尝试过于频繁，请15分钟后再试'}, 429);
      }
      const data = await body(request);
      if (!await passwordMatches(data.password, env.ADMIN_PASSWORD_HASH)) return reply({error:'密码不正确'}, 401);
      const token = newToken();
      await env.DB.prepare('INSERT INTO sessions (token_hash, expires) VALUES (?, ?)').bind(await digest(token), now + sessionLife).run();
      return reply({authenticated:true}, 200, {'Set-Cookie':cookie(request, token, sessionLife / 1000)});
    }
    if (pathname === '/api/logout' && method === 'POST') {
      const token = request.headers.get('cookie')?.match(/(?:^|;\s*)portfolio_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await digest(token)).run();
      return reply({authenticated:false}, 200, {'Set-Cookie':cookie(request, '', 0)});
    }
    if (pathname === '/api/content' && method === 'PUT') {
      if (!await authenticated(request, env.DB)) return reply({error:'请先登录管理后台'}, 401);
      let next, revision;
      try {
        const input = await body(request);
        revision = input.revision;
        if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('版本不正确，请重新加载');
        next = validateContent(input);
      } catch (error) { return reply({error:error.message}, 400); }
      const result = await env.DB.prepare('UPDATE content SET payload = ?, revision = revision + 1 WHERE id = 1 AND revision = ?').bind(JSON.stringify(next), revision).run();
      if (result.meta.changes !== 1) return reply({error:'内容已在其他窗口更新，请重新加载后再修改'}, 409);
      return reply({...next, revision:revision + 1});
    }
    return reply({error:'没有这个接口'}, 404);
  } catch (error) {
    if (error instanceof SyntaxError || error.message === '请使用JSON格式' || error.message === '内容为空' || error.message === '内容超过96KB限制') return reply({error:'请求内容格式不正确或过长'}, 400);
    return reply({error:'后台暂时不可用，请稍后重试'}, 500);
  }
}
