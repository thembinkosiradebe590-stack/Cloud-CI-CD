import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deploymentConfig, deploy } from '../scripts/deploy-render.mjs';

const env = {
  RENDER_DEPLOY_HOOK_URL: 'https://api.render.com/deploy/srv-example?key=fake-test-key',
  RENDER_SERVICE_URL: 'https://example.onrender.com',
  EXPECTED_COMMIT: 'a'.repeat(40)
};
const response = body => ({ status: 200, ok: true, json: async () => body });
test('deploy hook targets the exact tested commit', () => {
  assert.equal(deploymentConfig(env).hook.searchParams.get('ref'), env.EXPECTED_COMMIT);
});
test('missing config fails before sending a request', () => {
  assert.throws(() => deploymentConfig({}), /commit SHA/);
});
test('a rejected hook fails the workflow', async () => {
  await assert.rejects(deploy(env, async () => ({ status: 401 }), async () => {}, 1), /HTTP 401/);
});
test('an old release does not count as successful deployment', async () => {
  const replies = [response({}), response({ status: 'ok' }), response({ version: 'old' })];
  await assert.rejects(deploy(env, async () => replies.shift(), async () => {}, 1), /did not match/);
});
test('waits through cold start and verifies healthy matching release', async () => {
  const replies = [response({}), { ok: false }, response({ status: 'ok' }), response({ version: env.EXPECTED_COMMIT })];
  await deploy(env, async () => replies.shift(), async () => {}, 2);
  assert.equal(replies.length, 0);
});
