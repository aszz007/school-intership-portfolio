import http from 'node:http';
import path from 'node:path';
import {readFile, mkdir} from 'node:fs/promises';
import {Readable} from 'node:stream';
import {build, publicFiles} from './build.mjs';
import {createAdmin, privateDir} from './create-admin.mjs';
import {localDB} from '../server/local-db.mjs';
import {handleRequest} from '../server/handler.mjs';
const port = Number(process.env.PORT || 4180);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid port');
const origin = 'http://127.0.0.1:' + port;
const dataDir = process.env.PORTFOLIO_DATA_DIR || privateDir;
const dist = await build(); await mkdir(dataDir, {recursive:true});
const credentials = await createAdmin(dataDir); const DB = localDB(path.join(dataDir, 'content.sqlite'));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (url.origin !== origin || req.headers.host !== '127.0.0.1:' + port) { res.writeHead(403).end(); return; }
    if (url.pathname.startsWith('/api/')) {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, String(value));
      headers.set('CF-Connecting-IP', req.socket.remoteAddress || 'local');
      const request = new Request(url, {method:req.method, headers, ...(!['GET','HEAD'].includes(req.method) ? {body:Readable.toWeb(req), duplex:'half'} : {})});
      const response = await handleRequest(request, {DB, ...credentials});
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    let name = url.pathname.replace(/^\//, ''); if (!name || name.endsWith('/')) name += 'index.html';
    if (!publicFiles.includes(name)) { res.writeHead(404).end('Not found'); return; }
    const bytes = await readFile(path.join(dist, name));
    res.writeHead(200, {'Content-Type':types[path.extname(name)], 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff', 'X-Frame-Options':'DENY',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(500).end('Local service error'); }
});
server.listen(port, '127.0.0.1', () => console.log('Portfolio: ' + origin + '/\nAdmin: ' + origin + '/admin/\nPrivate login file: ' + path.join(dataDir, '管理员登录.txt')));
process.on('SIGINT', () => { server.close(() => { DB.close(); process.exit(0); }); });
