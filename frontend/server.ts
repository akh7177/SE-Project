import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runRequirementsThenSdlc } from '../src/mastra/workflow.js';

const PORT = 3001;
const htmlPath = resolve(process.cwd(), 'frontend/index.html');

createServer(async (req, res) => {
  // CORS headers just in case
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve Frontend UI
  if (req.method === 'GET' && req.url === '/') {
    try {
      const html = readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500);
      res.end('Error loading index.html');
    }
    return;
  }

  // Handle Workflow API Request
  if (req.method === 'POST' && req.url === '/api/run') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body);
        if (!prompt) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing prompt' }));
          return;
        }

        console.log(`\n[API] Running workflow for scenario...`);
        const result = await runRequirementsThenSdlc(prompt);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`\n🚀 SE Project UI + API Server running at http://localhost:${PORT}\n`);
});
