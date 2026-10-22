import http from 'node:http';
import { pathToFileURL } from 'node:url';

export function createServer(version = process.env.APP_VERSION || 'local') {
  return http.createServer((req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET' });
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
    if (path === '/health') return res.end(JSON.stringify({ status: 'ok' }));
    if (path === '/') return res.end(JSON.stringify({ message: 'Cloud CI/CD demo', version }));
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createServer();
  const port = Number(process.env.PORT || 8080);
  server.listen(port, '0.0.0.0', () => console.log(`Listening on port ${port}`));
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => server.close(() => process.exit(0)));
  }
}
