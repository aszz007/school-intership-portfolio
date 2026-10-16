import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const privateRoot = fileURLToPath(new URL('../.local/test-data/', import.meta.url));
const origin = 'http://127.0.0.1:4181';
async function start(dataDir) {
  const child = spawn(process.execPath, ['scripts/dev.mjs'], {cwd:root, windowsHide:true,
    env:{...process.env, PORT:'4181', PORTFOLIO_DATA_DIR:dataDir}, stdio:['ignore','pipe','pipe']});
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {child.kill(); reject(new Error('Local server startup timed out'));},15000);
    child.once('error', error => {clearTimeout(timer); reject(error);});
    child.once('exit', code => {clearTimeout(timer); reject(new Error('Server exited before ready: '+code));});
    child.stdout.on('data', bytes => {if (bytes.toString().includes('Portfolio:')) {clearTimeout(timer); resolve();}});
  });
  return child;
}
async function stop(child) {
  const ended = new Promise(resolve => child.once('exit',resolve)); child.kill(); await ended;
}
test('actual HTTP: authenticated edit survives service restart; private files never served', async () => {
  await mkdir(privateRoot,{recursive:true});
  const dataDir = await mkdtemp(path.join(privateRoot,'portfolio-http-'));
  let child = await start(dataDir);
  try {
    const home = await fetch(origin+'/');
    assert.equal(home.status,200); assert.match(await home.text(),/id="profile-title"/);
    assert.match(home.headers.get('content-security-policy'),/script-src 'self'/);
    for (const name of ['/server/seed.mjs','/.env','/credentials.json','/schema.sql','/../.local/credentials.json']) assert.equal((await fetch(origin+name)).status,404);
    assert.equal((await fetch(origin+'/admin/')).status,200);
    const content = await (await fetch(origin+'/api/content')).json();
    const password = (await readFile(path.join(dataDir,'管理员登录.txt'),'utf8')).split('\n')[2];
    const login = await fetch(origin+'/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
    assert.equal(login.status,200);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    content.profile.headline = '独立HTTP持久化测试';
    const saved = await fetch(origin+'/api/content',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(content)});
    assert.equal(saved.status,200);
    assert.equal((await (await fetch(origin+'/api/content')).json()).profile.headline,'独立HTTP持久化测试');
    await stop(child); child = await start(dataDir);
    assert.equal((await (await fetch(origin+'/api/content')).json()).profile.headline,'独立HTTP持久化测试');
    assert.equal((await (await fetch(origin+'/api/session',{headers:{Cookie:cookie}})).json()).authenticated,true);
  } finally {await stop(child);}
});
