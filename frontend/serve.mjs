import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PORT = 3000;
const html = readFileSync(resolve(import.meta.dirname, 'index.html'), 'utf8');

createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(PORT, () => {
  console.log(`\n  SE Project UI → http://localhost:${PORT}\n`);
});
