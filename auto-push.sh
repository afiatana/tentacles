#!/bin/bash
# Tentacles Auto-Commit & Push Pipeline
# Detects changes, generates a generic or timestamped commit, and pushes to main.

# Navigate to workspace root
cd "$(dirname "$0")"

echo "[Tentacles DevSecOps] Checking for changes in workspace..."

if [[ -z $(git status -s) ]]; then
  echo "[Tentacles DevSecOps] No changes detected. Exiting."
  exit 0
fi

# Add all tracked and untracked files (respecting .gitignore)
git add .

# Generate commit message based on timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Auto-commit: Tentacles Workspace State @ $TIMESTAMP"

# Commit changes
git commit -m "$COMMIT_MSG"

echo "[Tentacles DevSecOps] Pushing to main branch..."
# Push to origin main
git push origin main

if [ $? -eq 0 ]; then
  echo "[Tentacles DevSecOps] ✅ Successfully synced workspace to GitHub."
else
  echo "[Tentacles DevSecOps] ❌ Failed to push. Please check your git remotes."
  exit 1
fi
