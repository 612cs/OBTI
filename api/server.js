import http from 'http';
import handler from './generate-avatar.js';
import { readFileSync } from 'fs';

// 加载 .env.local
try {
  const envContent = readFileSync('.env.local', 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
} catch {}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, service: 'obti-api' }));
    return;
  }

  // 添加 status 和 setHeader 方法
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };

  // 模拟 Vercel API 格式
  const originalEnd = res.end;
  res.send = function(body) {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    if (body && typeof body === 'object') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      originalEnd.call(res, JSON.stringify(body));
    } else {
      originalEnd.call(res, body);
    }
  };

  // 解析 body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }
    handler(req, res);
  });
});

server.listen(3000, () => {
  console.log('API server running on http://localhost:3000');
});