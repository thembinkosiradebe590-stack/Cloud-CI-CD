# Cloud CI/CD portfolio project

Build a pipeline that tests a small HTTP application, packages it in Docker, deploys it to the cloud, and supports rollback.

## Current status

The application, HTTP tests, Dockerfile, and GitHub Actions CI workflow are ready. Cloud deployment and rollback configuration are pending the choice of provider. Nothing has been published or deployed.

## Run locally

Install Node.js 22 or later, then run these commands from this folder:

```sh
npm test
npm start
```

Open http://localhost:8080 for the release version and http://localhost:8080/health for health status. This demo has no package dependencies.

## Container

With Docker installed:

```sh
docker build --build-arg APP_VERSION=demo-v1 -t cloud-demo:v1 .
docker run --rm -p 8080:8080 cloud-demo:v1
```

## GitHub setup

Create a GitHub repository and upload this folder's contents, including the hidden `.github` directory, to its root. Use `main` as the default branch. Open the Actions tab to inspect the first run. Pull requests also run the tests and container checks. Where your repository plan supports it, configure a branch rule requiring `test-and-build` before merging.

## Deployment milestone

After choosing a cloud provider, add identity federation, an image registry, and a deployment job that runs only after CI passes on main. Tag images with the Git commit SHA. Verify the deployed health endpoint and version. Document how to redeploy a previous successful image or route traffic to its revision.

## Portfolio demonstration

1. Open a pull request with a deliberately broken response; show a failed test.
2. Fix it and show the green checks.
3. Merge and show the new commit version on the cloud endpoint once deployment is configured.
4. Demonstrate rollback to the prior version.
5. Save screenshots, an architecture diagram, and a short explanation of what each stage protects against.

Never commit cloud credentials or local `.env` files.
