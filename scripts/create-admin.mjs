import {mkdir, readFile, writeFile, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {passwordHash, newToken} from '../server/auth.mjs';
// Local private state is excluded from dist, Git and all source/material ZIPs.
export const privateDir = fileURLToPath(new URL('../.local/', import.meta.url));
export async function createAdmin(directory = privateDir) {
  await mkdir(directory, {recursive:true});
  const target = path.join(directory, 'credentials.json');
  try { await access(target); return JSON.parse(await readFile(target, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const password = newToken(); const salt = newToken().slice(0, 32);
  const credentials = {ADMIN_PASSWORD_HASH:salt + '.' + await passwordHash(password, salt)};
  await writeFile(target, JSON.stringify(credentials), {flag:'wx', mode:0o600});
  await writeFile(path.join(directory, '管理员登录.txt'), '本地后台：http://127.0.0.1:4180/admin/\n管理员密码（仅自己保管，不截图上传）：\n' + password + '\n\nCloudflare Secret 名称：ADMIN_PASSWORD_HASH\n值：\n' + credentials.ADMIN_PASSWORD_HASH + '\n', {flag:'wx', mode:0o600});
  return credentials;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {await createAdmin(); console.log('Credentials saved outside project: ' + privateDir);}
