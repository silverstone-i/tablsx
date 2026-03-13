# tablsx Release Guide

This playbook walks through the complete release process for `@nap-sft/tablsx`.
Every step is spelled out with explanations so you always know *why* you are typing a command.

---

## Table of Contents

1. [Big Picture](#1-big-picture)
2. [Versioning](#2-versioning)
3. [Pre-flight Checklist](#3-pre-flight-checklist)
4. [Release Stages](#4-release-stages)
   - [4.1 Merging a Feature Branch into Dev](#41-merging-a-feature-branch-into-dev)
   - [4.2 Release Candidate Workflow](#42-release-candidate-workflow)
   - [4.3 Promoting RC to Final Release](#43-promoting-rc-to-final-release)
   - [4.4 Direct Release from Dev (No RC)](#44-direct-release-from-dev-no-rc)
5. [Publishing](#5-publishing)
   - [5.1 Automated npm Publish (CI)](#51-automated-npm-publish-ci)
   - [5.2 Manual npm Publish (Fallback)](#52-manual-npm-publish-fallback)
   - [5.3 Verifying a Publication](#53-verifying-a-publication)
6. [Documentation Deployment](#6-documentation-deployment)
7. [Post-Release Tasks](#7-post-release-tasks)
8. [Quick Reference](#8-quick-reference)

---

## 1. Big Picture

The typical release flow:

```
feature branch ──PR──▸ dev ──PR──▸ release/X.Y.Z (RC) ──PR──▸ main (final)
```

Alternative direct release flow (for simple, low-risk releases):

```
feature branch ──PR──▸ dev ──PR──▸ main (final)
```

Key branches:

- **Feature branches** (e.g., `xlsx`, `fix-auth`): Where development happens
- **`dev`**: Integration branch where features are merged and tested together
- **`release/X.Y.Z`**: Release candidate branch for pre-release testing
- **`main`**: Production-ready code only

All merges happen through **Pull Requests** — never push directly to `dev` or `main`.

---

## 2. Versioning

tablsx follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### 2.1 Version Bump Commands

All commands use `--no-git-tag-version` to prevent npm from creating tags automatically (you'll tag manually after review).

#### Final Release Versions

| Release Type | Command | Example |
|--------------|---------|---------|
| Patch (bug fix) | `npm version patch --no-git-tag-version` | 1.2.1 → 1.2.2 |
| Minor (new feature) | `npm version minor --no-git-tag-version` | 1.2.1 → 1.3.0 |
| Major (breaking) | `npm version major --no-git-tag-version` | 1.2.1 → 2.0.0 |
| Explicit version | `npm version 1.2.2 --no-git-tag-version` | → 1.2.2 |

#### Release Candidate Versions

| Release Type | Command | Example |
|--------------|---------|---------|
| Patch RC | `npm version prepatch --preid=rc --no-git-tag-version` | 1.2.1 → 1.2.2-rc.0 |
| Minor RC | `npm version preminor --preid=rc --no-git-tag-version` | 1.2.1 → 1.3.0-rc.0 |
| Major RC | `npm version premajor --preid=rc --no-git-tag-version` | 1.2.1 → 2.0.0-rc.0 |
| Bump RC number | `npm version prerelease --preid=rc --no-git-tag-version` | 1.2.2-rc.0 → 1.2.2-rc.1 |

### 2.2 Checking the Current Version

```bash
node -p "require('./package.json').version"
```

### 2.3 When to Use Each Version Type

- **Patch**: Bug fixes, dependency updates, documentation fixes
- **Minor**: New features, new exports, new optional parameters
- **Major**: Removed features, renamed exports, changed behavior, breaking schema changes

---

## 3. Pre-flight Checklist

Run these commands before starting any release process:

```bash
git status                  # Confirm working tree is clean
git switch dev              # Switch to dev branch (or your starting branch)
git pull origin dev         # Pull latest changes
npm ci                      # Install exact dependency versions
npm test                    # Run tests (vitest)
npm run lint                # Check code style (ESLint)
```

If any step fails, stop and fix it before proceeding.

---

## 4. Release Stages

### 4.1 Merging a Feature Branch into Dev

When your feature branch is ready to be integrated:

#### Step 1: Ensure your feature branch is up to date

```bash
git switch dev
git pull origin dev
git switch <feature-branch>       # e.g., git switch xlsx
git rebase dev                    # Rebase onto latest dev
```

#### Step 2: Run tests on your feature branch

```bash
npm ci
npm test
npm run lint
```

#### Step 3: Push and create a PR to dev

```bash
git push origin <feature-branch>
gh pr create --base dev --head <feature-branch> --title "Feature: description"
```

Wait for CI to pass (tests, lint, examples, docs build), then merge the PR on GitHub.

#### Step 4: Clean up

```bash
git switch dev
git pull origin dev                           # Pull the merged changes
git branch -d <feature-branch>               # Delete local feature branch
```

The remote branch is auto-deleted by GitHub after PR merge (if configured).

---

### 4.2 Release Candidate Workflow

Use this workflow when you want to validate before the final release.

#### Step 1: Create the release branch from dev

```bash
git switch dev
git pull origin dev
git switch -c release/X.Y.Z       # e.g., release/1.2.2
```

#### Step 2: Bump to RC version

Choose the appropriate command based on your release type:

```bash
# For a patch release candidate:
npm version prepatch --preid=rc --no-git-tag-version

# For a minor release candidate:
npm version preminor --preid=rc --no-git-tag-version

# For a major release candidate:
npm version premajor --preid=rc --no-git-tag-version
```

#### Step 3: Update documentation

- Update `CHANGELOG.md` with the new version and changes

#### Step 4: Commit, tag, and push

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z-rc.0"
git tag vX.Y.Z-rc.0
git push --set-upstream origin release/X.Y.Z
git push origin vX.Y.Z-rc.0
```

Pushing the RC tag triggers the automated npm publish workflow, which publishes with the `rc` dist-tag.

#### Step 5: Test the RC

- Install and test the RC in a separate project:
  ```bash
  npm install @nap-sft/tablsx@rc
  ```
- Run any manual validation needed

#### Step 6: If issues are found, iterate

```bash
git switch release/X.Y.Z
# ... make fixes ...
npm version prerelease --preid=rc --no-git-tag-version  # Bumps rc.0 → rc.1
git add package.json package-lock.json
git commit -m "fix: description of fix"
git tag vX.Y.Z-rc.1
git push origin release/X.Y.Z
git push origin vX.Y.Z-rc.1       # Triggers automated publish with --tag rc
```

---

### 4.3 Promoting RC to Final Release

After the RC has been validated:

#### Step 1: Create a PR from release branch to main

```bash
git push origin release/X.Y.Z     # Ensure release branch is pushed
gh pr create --base main --head release/X.Y.Z --title "Release X.Y.Z"
```

Wait for CI to pass, then merge the PR.

#### Step 2: Pull main and bump to final version

```bash
git switch main
git pull origin main
npm version X.Y.Z --no-git-tag-version   # Removes the -rc.N suffix
```

#### Step 3: Update changelog and commit

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "X.Y.Z"
git tag vX.Y.Z
```

#### Step 4: Push (triggers automated publish and docs deploy)

```bash
git push origin main
git push origin vX.Y.Z            # Triggers npm publish workflow
```

#### Step 5: Clean up release branch

```bash
git branch -d release/X.Y.Z
git push origin --delete release/X.Y.Z
```

---

### 4.4 Direct Release from Dev (No RC)

Use this workflow for simple, low-risk releases (small bug fixes, documentation updates).

#### Step 1: Ensure dev is ready

```bash
git switch dev
git pull origin dev
npm ci
npm test
npm run lint
```

#### Step 2: Create a PR from dev to main

```bash
gh pr create --base main --head dev --title "Release X.Y.Z"
```

Wait for CI to pass, then merge the PR.

#### Step 3: Pull main and bump version

```bash
git switch main
git pull origin main
npm version patch --no-git-tag-version   # or minor/major as appropriate
```

#### Step 4: Update changelog, commit, and tag

```bash
# Update CHANGELOG.md with the new version
git add package.json package-lock.json CHANGELOG.md
git commit -m "X.Y.Z"
git tag vX.Y.Z
```

#### Step 5: Push (triggers automated publish and docs deploy)

```bash
git push origin main
git push origin vX.Y.Z            # Triggers npm publish workflow
```

---

## 5. Publishing

### 5.1 Automated npm Publish (CI)

The `.github/workflows/publish.yml` workflow handles publishing automatically:

- **Final releases**: Pushing a `vX.Y.Z` tag publishes with `--tag latest`
- **Release candidates**: Pushing a `vX.Y.Z-rc.N` tag publishes with `--tag rc`

The workflow runs tests and lint as a safety gate before publishing.

**Required setup**: Add your npm token as a GitHub Actions secret named `NPM_TOKEN`:
1. Generate a token: `npm token create` (or use npmjs.com → Access Tokens)
2. Add to GitHub: Repo Settings → Secrets and variables → Actions → New repository secret → `NPM_TOKEN`

### 5.2 Manual npm Publish (Fallback)

If you need to publish manually:

```bash
npm whoami                         # Verify you're logged in
npm publish --tag latest           # For final releases
npm publish --tag rc               # For release candidates
```

### 5.3 Verifying a Publication

```bash
npm view @nap-sft/tablsx versions --json | tail -5
npm view @nap-sft/tablsx dist-tags
```

Expected output after a final release:

```
{ latest: 'X.Y.Z', rc: 'X.Y.Z-rc.N' }
```

#### Clean up dist-tags (if needed)

```bash
# Move latest tag if needed
npm dist-tag add @nap-sft/tablsx@X.Y.Z latest

# Remove old rc tag (optional)
npm dist-tag rm @nap-sft/tablsx rc
```

---

## 6. Documentation Deployment

Documentation is built with **VitePress** and deployed to **GitHub Pages** automatically.

### Automatic Deployment

The `.github/workflows/docs.yml` workflow deploys docs whenever code is pushed to `main`. No manual steps required — every release automatically updates the live documentation.

### Manual Local Preview

```bash
npm run docs:dev                   # Start local dev server
npm run docs:build                 # Build production docs
npm run docs:preview               # Preview the production build locally
```

### GitHub Pages Setup (One-Time)

1. Go to repo Settings → Pages
2. Under "Build and deployment", select **Source: GitHub Actions**
3. The docs workflow will handle the rest

---

## 7. Post-Release Tasks

### 7.1 Sync dev with main

```bash
git switch dev
git pull origin dev
git merge --ff-only main           # Fast-forward dev to include release
git push origin dev
```

If fast-forward fails (dev has new commits), use a regular merge:

```bash
git merge main
git push origin dev
```

### 7.2 Create a GitHub Release (Optional)

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes-file CHANGELOG.md
```

Or via the GitHub UI:
1. Go to Releases → Draft a new release
2. Select the tag (e.g., `vX.Y.Z`)
3. Paste release notes from `CHANGELOG.md`
4. For RCs, check "This is a pre-release"
5. Publish

### 7.3 Monitor

- Watch CI/CD runs on GitHub Actions
- Check npm for the published package: `npm view @nap-sft/tablsx`
- Verify docs are live on GitHub Pages

---

## 8. Quick Reference

### Starting a release from a feature branch

```bash
# Merge feature into dev via PR
git push origin <feature-branch>
gh pr create --base dev --head <feature-branch> --title "Feature: description"
# After PR is merged:
git switch dev && git pull origin dev

# Option A: Direct release (no RC)
gh pr create --base main --head dev --title "Release X.Y.Z"
# After PR is merged:
git switch main && git pull origin main
npm version patch --no-git-tag-version
# Update CHANGELOG.md
git add package.json package-lock.json CHANGELOG.md
git commit -m "X.Y.Z"
git tag vX.Y.Z
git push origin main && git push origin vX.Y.Z

# Option B: Release candidate first
git switch -c release/X.Y.Z
npm version prepatch --preid=rc --no-git-tag-version
# Update CHANGELOG.md
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to vX.Y.Z-rc.0"
git tag vX.Y.Z-rc.0
git push --set-upstream origin release/X.Y.Z
git push origin vX.Y.Z-rc.0
# ... test, then promote to final (see section 4.3) ...
```

### Version bump cheat sheet

| Scenario | Command |
|----------|---------|
| Bug fix release | `npm version patch --no-git-tag-version` |
| New feature release | `npm version minor --no-git-tag-version` |
| Breaking change release | `npm version major --no-git-tag-version` |
| First RC for patch | `npm version prepatch --preid=rc --no-git-tag-version` |
| First RC for minor | `npm version preminor --preid=rc --no-git-tag-version` |
| First RC for major | `npm version premajor --preid=rc --no-git-tag-version` |
| Next RC iteration | `npm version prerelease --preid=rc --no-git-tag-version` |
| RC to final | `npm version X.Y.Z --no-git-tag-version` |

### CI/CD Workflows

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| CI (`ci.yml`) | Push/PR to dev, main | Tests, lint, examples, docs build |
| Publish (`publish.yml`) | Push of `v*` tag | Publishes to npm |
| Docs (`docs.yml`) | Push to main | Deploys VitePress to GitHub Pages |
