# Push to New GitHub Repository

This environment does not contain authenticated GitHub credentials by default, so use the script below with a Personal Access Token.

## 1) Export credentials

```bash
export GITHUB_USERNAME="your-github-username"
export GITHUB_REPO="verify-dummy-ticket-ci4"
export GITHUB_TOKEN="ghp_xxx"
```

## 2) Run push script

```bash
./PUSH_NEW_GITHUB_REPO.sh
```

## What it does

- Creates a new local git repo in `ci4-foundation-export/`
- Copies all CI4 foundation files into that folder
- Creates `main` branch commit
- Adds remote: `https://github.com/$GITHUB_USERNAME/$GITHUB_REPO.git`
- Pushes to GitHub using token-auth URL
