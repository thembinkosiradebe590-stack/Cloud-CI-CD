import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, resolveVersion } from '../server.js';

let server;
let base;
test('Render commit takes precedence over the Docker build default', () => {
  assert.equal(resolveVersion({ RENDER_GIT_COMMIT: 'render-commit', APP_VERSION: 'local' }), 'render-commit');
});
test('local Docker image keeps its build version', () => {
  assert.equal(resolveVersion({ APP_VERSION: 'built-commit' }), 'built-commit');
});
test('local development has a readable fallback version', () => {
  assert.equal(resolveVersion({}), 'local');
});
before(async () => {
  server = createServer('test-commit');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('release endpoint identifies the deployed version', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { message: 'Cloud CI/CD demo', version: 'test-commit' });
});
test('health endpoint supports monitoring', async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});
test('unknown paths return 404', async () => {
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
test('unsupported methods return 405', async () => {
  const response = await fetch(base, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});
