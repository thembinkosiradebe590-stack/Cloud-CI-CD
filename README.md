Your verification code:WTC-DA5XDLF5
# Cloud CI/CD project — Render edition

A small Node.js API with automated tests, Docker builds, and deployment to Render after successful checks.

Start with [STAGE-2-SETUP.md](STAGE-2-SETUP.md). It includes the exact files to replace, Google Cloud cleanup, account setup, secrets, deployment verification, and rollback.

## Run locally

Use Node.js 24 or later:

```sh
npm run check
npm test
npm start
```

No npm install is required: the app and tests use Node's built-in modules. Visit http://localhost:8080 and http://localhost:8080/health.

## Pipeline

Pull request or push → syntax checks → HTTP and deployment-script tests → Docker build and smoke test.

Successful main branch checks → Render deploy hook for that exact commit → poll public health and version endpoints. Deployment requires RENDER_DEPLOY_ENABLED=true and the settings in the setup guide. Render rebuilds the same source commit with the Dockerfile; it does not reuse the CI image. The Node image tag can change over time, so these are not guaranteed byte-identical images.

## Endpoints

- `/`: JSON message and deployed commit version. Render's RENDER_GIT_COMMIT takes priority over APP_VERSION; local development defaults to local.
- `/health`: JSON status ok.
- Unknown paths: HTTP 404. Unsupported methods: HTTP 405.

The application binds to 0.0.0.0 and honours PORT. The container runs as a non-root user. Credentials belong in GitHub Secrets, never in the repository.

## Rollback

Follow [ROLLBACK.md](ROLLBACK.md). Rollback is manual and available for retained successful deploys. No Google Cloud account or configuration is required.
