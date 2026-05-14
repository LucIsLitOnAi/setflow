#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Automated Backend Deployment Setup..."

# 1. Initialize Git repository if it doesn't exist
if [ ! -d ".git" ]; then
    echo "📦 Initializing new Git repository..."
    git init
    git branch -M main
else
    echo "📦 Git repository already initialized."
fi

# 2. Add all files
echo "➕ Adding files to staging..."
git add .

# 3. Commit changes (only if there are changes to commit)
if git diff-index --quiet HEAD --; then
    echo "✅ No changes to commit."
else
    echo "📝 Committing changes..."
    git commit -m "chore: Prepare backend for Render.com deployment"
fi

# 4. Prompt for GitHub repository URL
echo ""
echo "🔗 Please enter the URL of your newly created (empty) GitHub repository."
echo "Example: https://github.com/YourUsername/mosaic-backend.git"
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL cannot be empty. Deployment aborted."
    exit 1
fi

# 5. Handle remote origin
if git remote | grep -q "^origin$"; then
    echo "🔄 Updating existing remote 'origin'..."
    git remote set-url origin "$REPO_URL"
else
    echo "🔄 Adding remote 'origin'..."
    git remote add origin "$REPO_URL"
fi

# 6. Push to GitHub
echo "⬆️ Pushing code to GitHub (branch: main)..."
git push -u origin main

echo ""
echo "🎉 Code successfully pushed to $REPO_URL!"
echo "Render.com should now automatically detect the render.yaml file and start the deployment."
