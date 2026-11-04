# QuickCart / Morven — secure environment setup
This patch only changes repository tracking. It does **not** replace your API keys, configure Vercel, or delete the exposure from Git history.

## BEFORE merging into main
1. Open Vercel > Morven project > Settings > Environment Variables and check that every required environment variable from `.env.example` exists for the target deployment environment. **Do not put secret values in GitHub issues, commits or PRs.**
2. Back up your existing local `.env` and `.env.local` files in a safe place **outside this repository** before switching/pulling a branch that deletes previously tracked env files. Otherwise Git may remove those local files.
3. Copy `.env.example` to `.env.local` locally and supply your environment values. Next.js automatically reads `.env.local`. You can also use `vercel env pull .env.local` for Vercel-managed development variables.
4. Test `npm run dev` locally, and a Vercel preview deploy, confirming sign-in, MongoDB, Cloudinary, and Paystack **test** initialization.
5. **Rotate/revoke all keys previously committed publicly**, especially Paystack, Clerk secret, MongoDB database password, Cloudinary secret and Inngest keys; then update local and Vercel values. Simply deleting a file is not a security fix because Git history and forks can expose it.
6. Redeploy after updating Vercel environment variables, since existing deployments do not automatically receive changed values.
7. Do not force-push or rewrite Git history casually: GitHub's sensitive-data-removal guide describes how to coordinate cleanup without losing collaborators' work.

## No code rewrites are required
The app already reads credentials as `process.env.PAYSTACK_SECRET_KEY`, `process.env.MONGODB_URI`, etc. You can keep exactly the same variable names when moving values out of GitHub. The key values need rotation because they were publicly exposed; the *code* can remain the same.

## Safe Git hygiene
This change adds `.env` and `.env.*` to `.gitignore`, except `.env.example`, and removes the currently tracked `.env` and `.env.local` entries. The original values remain visible in historical Git commits until GitHub-sensitive-data cleanup and revocation are handled.

Official guidance:
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- https://vercel.com/docs/environment-variables
