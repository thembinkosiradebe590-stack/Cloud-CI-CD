# Manual rollback on Render

1. Set the GitHub repository variable RENDER_DEPLOY_ENABLED to false.
2. Wait for any running GitHub deployment and queued/running Render deployment to finish, or cancel them explicitly. Changing the variable does not stop a job already running. Avoid pushing changes during the exercise.
3. In Render, open the service's Deploys/Events history. Choose a previous successful deploy with a retained build artifact, then select Rollback and confirm Rollback to this deploy.
4. Wait for it to become live. Open `/health` and `/`; compare the version with the selected old commit. Save a screenshot.
5. Fix or revert the undesired Git change. Keep Render Auto-Deploy set to Off because GitHub Actions controls releases through the hook.
6. Set RENDER_DEPLOY_ENABLED back to true. Run the GitHub workflow on main or push the corrected commit.

On Render's Free plan, rollback is limited to the two most recent previous deploys. If an older build is unavailable, revert the change in Git, run tests, and deploy the resulting new commit instead.

Dashboard rollback does not revert Git history. Disabling Render's native Auto-Deploy does not disable our GitHub deploy hook; that is why step 1 matters. The pipeline does not perform automatic rollback after a smoke-test failure.

Reference: https://render.com/docs/rollbacks and https://render.com/docs/free
