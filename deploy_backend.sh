#!/bin/bash

echo "🚀 Starte Backend Deployment Automation (Git & Render)"
echo "======================================================"

# Check if git is initialized
if [ -d .git ]; then
    echo "✅ Git Repository ist bereits initialisiert."
else
    echo "📦 Initialisiere neues Git Repository..."
    git init
fi

# Add all files
echo "➕ Füge Dateien zum Commit hinzu..."
git add .

# Commit changes
echo "💾 Erstelle Commit..."
git commit -m "feat: initial commit for render deployment"

# Prompt for GitHub URL
echo ""
read -p "🔗 Bitte gib die URL deines leeren GitHub-Repositories ein (z.B. https://github.com/user/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Fehler: Keine URL eingegeben. Abbruch."
    exit 1
fi

# Configure remote and push
echo "🌍 Konfiguriere Remote und lade Code hoch..."
git branch -M main
git remote add origin "$REPO_URL" || git remote set-url origin "$REPO_URL"
git push -u origin main

echo "======================================================"
echo "✅ Push erfolgreich! Render.com erkennt dieses Repository nun automatisch anhand der render.yaml."
