# Tentacles Auto-Commit & Push Pipeline (PowerShell)
# Detects changes, generates a generic or timestamped commit, and pushes to main.

$ErrorActionPreference = "Stop"

Write-Host "[Tentacles DevSecOps] Checking for changes in workspace..." -ForegroundColor Cyan

# Check if there are changes
$gitStatus = git status -s
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "[Tentacles DevSecOps] No changes detected. Exiting." -ForegroundColor Yellow
    exit 0
}

# Add all files (respects .gitignore)
git add .

# Create timestamped commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMsg = "Auto-commit: Tentacles Workspace State @ $timestamp"
git commit -m $commitMsg

Write-Host "[Tentacles DevSecOps] Pushing to main branch..." -ForegroundColor Cyan

# Push to origin's main branch
try {
    git push origin main
    Write-Host "[Tentacles DevSecOps] ✅ Successfully synced workspace to GitHub." -ForegroundColor Green
} catch {
    Write-Host "[Tentacles DevSecOps] ❌ Failed to push. Please check your git remotes or network connection." -ForegroundColor Red
    exit 1
}
