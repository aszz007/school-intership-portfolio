import {mkdir, copyFile, writeFile, readdir, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import seed from '../server/seed.mjs';
import {validateContent} from '../server/validation.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
// Explicit public allowlist: server code, database and credentials never enter dist.
export const publicFiles = ['index.html','styles.css','content.js','app.js','favicon.svg','admin/index.html','admin/admin.css','admin/admin.js'];
export async function build() {
  const dist = path.join(root, 'dist');
  const allowed = new Set([...publicFiles, '_routes.json', '_headers']);
  async function inspect(directory, prefix = '') {
    const entries = await readdir(directory, {withFileTypes:true});
    for (const entry of entries) {
      const name = prefix + entry.name;
      if (entry.isSymbolicLink()) throw new Error('Symlinks are not allowed in dist: ' + name);
      if (entry.isDirectory()) await inspect(path.join(directory, entry.name), name + '/');
      else if (!allowed.has(name)) throw new Error('Unexpected file in dist; review before publishing: ' + name);
    }
  }
  try {
    if ((await lstat(dist)).isSymbolicLink()) throw new Error('dist must not be a symlink');
    await inspect(dist);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  for (const name of publicFiles) {
    const target = path.join(dist, name); await mkdir(path.dirname(target), {recursive:true});
    await copyFile(path.join(root, name), target);
  }
  const content = validateContent(seed);
  await writeFile(path.join(dist, 'content.js'), 'window.PORTFOLIO_PROJECTS = ' + JSON.stringify(content.projects) + ';\nwindow.PORTFOLIO_PROFILE = ' + JSON.stringify(content.profile) + ';\n');
  await writeFile(path.join(dist, '_routes.json'), JSON.stringify({version:1, include:['/api/*'], exclude:[]}));
  await writeFile(path.join(dist, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'\n/api/*\n  Cache-Control: no-store\n`);
  return dist;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {await build(); console.log('Public files built in dist; backend remains in functions + server.');}
