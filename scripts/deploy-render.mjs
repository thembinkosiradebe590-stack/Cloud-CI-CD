import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

export function deploymentConfig(env) {
  const commit = env.EXPECTED_COMMIT;
  if (!/^[a-f0-9]{40}$/.test(commit || '')) throw new Error('EXPECTED_COMMIT must be a full Git commit SHA.');
  let hook, service;
  try {
    hook = new URL(env.RENDER_DEPLOY_HOOK_URL);
    service = new URL(env.RENDER_SERVICE_URL);
  } catch {
    throw new Error('Set the Render deploy hook secret and service URL variable in GitHub.');
  }
  if (hook.protocol !== 'https:' || hook.hostname !== 'api.render.com' || !hook.pathname.startsWith('/deploy/') || !hook.searchParams.get('key') || hook.username || hook.password || hook.port) {
    throw new Error('Use the complete secret deploy hook URL from Render Settings.');
  }
  if (service.protocol !== 'https:' || !service.hostname.endsWith('.onrender.com') || service.username || service.password || service.port) {
    throw new Error('RENDER_SERVICE_URL must be your HTTPS onrender.com address.');
  }
  hook.searchParams.set('ref', commit);
  return { hook, origin: service.origin, commit };
}

export async function deploy(env = process.env, request = fetch, pause = sleep, attempts = 60) {
  const { hook, origin, commit } = deploymentConfig(env);
  let result;
  try {
    result = await request(hook, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000) });
  } catch {
    throw new Error('Deploy hook request failed. Check Render Events before retrying; the request may have been accepted.');
  }
  if (![200, 202].includes(result.status)) throw new Error(`Render rejected deployment (HTTP ${result.status}). Check the hook secret and service settings.`);
  console.log('Deployment requested. Waiting for the tested commit to respond.');
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const health = await request(`${origin}/health`, { signal: AbortSignal.timeout(5000) });
      if (!health.ok || (await health.json()).status !== 'ok') throw new Error('Not healthy yet');
      const page = await request(`${origin}/`, { signal: AbortSignal.timeout(5000) });
      if (page.ok && (await page.json()).version === commit) {
        console.log(`Verified ${origin} at commit ${commit}`);
        if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `Deployed app: ${origin}\n\nVerified commit: ${commit}\n`);
        return;
      }
    } catch { /* Cold starts and old releases can respond while deployment proceeds. */ }
    console.log(`Waiting for release (${attempt}/${attempts})...`);
    if (attempt < attempts) await pause(10000);
  }
  throw new Error('Live version did not match before timeout. Inspect Render Events and logs. This does not automatically roll back or cancel a Render deployment.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  deploy().catch(error => { console.error(error.message); process.exitCode = 1; });
}
