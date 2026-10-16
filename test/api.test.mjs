import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRequest} from '../server/handler.mjs';
import {localDB} from '../server/local-db.mjs';
import {passwordHash, digest} from '../server/auth.mjs';
import {validateContent} from '../server/validation.mjs';
import seed from '../server/seed.mjs';
const origin = 'https://portfolio.example';
const password = 'integration-test-only-long-password';
const salt = 'a1'.repeat(16);
const encoded = salt + '.' + await passwordHash(password, salt);
function fixture() {
  const DB = localDB();
  const env = {DB, ADMIN_PASSWORD_HASH:encoded};
  const call = (path, method = 'GET', payload, cookie = '', from = origin) => handleRequest(new Request(origin + '/api/' + path, {
    method, headers:{'Content-Type':'application/json', Origin:from, Cookie:cookie, 'CF-Connecting-IP':'192.0.2.1'},
    ...(payload !== undefined ? {body:typeof payload === 'string' ? payload : JSON.stringify(payload)} : {})
  }), env);
  const login = async () => {
    const response = await call('login','POST',{password});
    assert.equal(response.status, 200); return response.headers.get('set-cookie').split(';')[0];
  };
  return {DB, env, call, login};
}
test('public seed retains real research projects, ImageGrab and HTTPS links', async () => {
  const f = fixture();
  try {
    const response = await f.call('content'); const data = await response.json();
    assert.equal(response.status, 200); assert.equal(data.revision, 1);
    assert.deepEqual(data.projects.filter(p => p.category === 'research').map(p => p.id), ['req2inst','req2web']);
    assert.ok(data.projects.some(p => p.id === 'imagegrab'));
    assert.equal(data.projects.find(p => p.id === 'portfolio').liveUrl,'https://school-internship-portfolio-aszz007.pages.dev/');
    assert.equal(JSON.stringify(data).includes('ADMIN_PASSWORD'), false);
    assert.equal(data.projects.some(p => p.demoUrl), false);
  } finally { f.DB.close(); }
});
test('unauthenticated edits, forged cookies, cross-origin writes and malformed bodies rejected', async () => {
  const f = fixture();
  try {
    assert.equal((await f.call('content','PUT',seed)).status,401);
    assert.equal((await f.call('content','PUT',seed,'portfolio_session='+'f'.repeat(64))).status,401);
    assert.equal((await f.call('login','POST',{password},'','https://evil.example')).status,403);
    assert.equal((await f.call('login','POST','{')).status,400);
    assert.equal((await f.call('login','POST',{password:'wrong'})).status,401);
    assert.equal((await f.call('content','PATCH',{})).status,405);
  } finally { f.DB.close(); }
});
test('authenticated save persists for independent reader; stale revision cannot overwrite', async () => {
  const f = fixture();
  try {
    const data = await (await f.call('content')).json(); const cookie = await f.login();
    data.profile.introduction = '用于隔离测试的修改，不是个人经历记录';
    const saved = await f.call('content','PUT',data,cookie); assert.equal(saved.status,200);
    assert.equal((await saved.json()).revision, 2);
    assert.equal((await (await f.call('content')).json()).profile.introduction,data.profile.introduction);
    assert.equal((await f.call('content','PUT',data,cookie)).status,409);
    assert.equal((await (await f.call('session','GET',undefined,cookie)).json()).authenticated,true);
  } finally { f.DB.close(); }
});
test('invalid links, duplicate projects and oversized content rejected atomically', async () => {
  const f = fixture();
  try {
    const data = await (await f.call('content')).json(); const cookie = await f.login();
    for (const url of ['javascript:alert(1)','https://user:pass@example.com','http://example.com']) {
      const bad = structuredClone(data); bad.projects[0].sourceUrl = url;
      assert.equal((await f.call('content','PUT',bad,cookie)).status,400);
    }
    const bad = structuredClone(data); bad.projects.push(bad.projects[0]);
    assert.equal((await f.call('content','PUT',bad,cookie)).status,400);
    assert.equal((await f.call('content','PUT','x'.repeat(100000),cookie)).status,400);
    assert.equal((await (await f.call('content')).json()).revision,1);
  } finally { f.DB.close(); }
});
test('server session uses HttpOnly Secure cookie and is revoked on logout', async () => {
  const f = fixture();
  try {
    const login = await f.call('login','POST',{password});
    const value = login.headers.get('set-cookie');
    assert.match(value,/HttpOnly/); assert.match(value,/SameSite=Strict/); assert.match(value,/Secure/);
    const cookie = value.split(';')[0];
    const token = cookie.split('=')[1];
    const row = await f.DB.prepare('SELECT expires FROM sessions WHERE token_hash = ?').bind(await digest(token)).first();
    assert.ok(row.expires > Date.now());
    await f.call('logout','POST',{},cookie);
    assert.equal((await (await f.call('session','GET',undefined,cookie)).json()).authenticated,false);
  } finally { f.DB.close(); }
});
test('expired session cannot edit and password guesses are rate limited', async () => {
  const f = fixture();
  try {
    const cookie = await f.login();
    await f.DB.prepare('UPDATE sessions SET expires = 0').run();
    assert.equal((await (await f.call('session','GET',undefined,cookie)).json()).authenticated,false);
    for (let i = 0; i < 4; i++) assert.equal((await f.call('login','POST',{password:'wrong'})).status,401);
    assert.equal((await f.call('login','POST',{password})).status,429);
  } finally { f.DB.close(); }
});
test('unconfigured cloud environment fails visibly instead of pretending to persist', async () => {
  assert.equal((await handleRequest(new Request(origin+'/api/content'), {})).status,503);
  const f = fixture();
  try { f.env.ADMIN_PASSWORD_HASH = ''; assert.equal((await f.call('login','POST',{password})).status,503); }
  finally { f.DB.close(); }
});
test('content values are plain strings; credentials and unexpected fields are not saved', () => {
  const data = validateContent({...seed, password:'secret'});
  assert.equal('password' in data,false);
  assert.throws(() => validateContent({...seed, profile:{...seed.profile,name:''}}));
  assert.throws(() => validateContent({...seed, projects:[{...seed.projects[0], art:'<script>'}]}));
});
