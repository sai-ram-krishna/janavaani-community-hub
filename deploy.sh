#!/bin/bash

# JANAVAANI Deployment Script
# This script helps deploy the JANAVAANI project to GitHub and cloud platforms

echo "🚀 JANAVAANI Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

echo "✅ Git repository found"

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes found. Committing all changes..."
    git add .
    git commit -m "Final commit before deployment - $(date)"
else
    echo "✅ All files are committed"
fi

# Display current status
echo ""
echo "📊 Current Git Status:"
git status --short

echo ""
echo "📋 Project Summary:"
echo "- Frontend: HTML, CSS, JavaScript"
echo "- Backend: Node.js, Express.js"
echo "- Database: MongoDB"
echo "- Files: $(git ls-files | wc -l) files ready for deployment"

echo ""
echo "🌟 Next Steps:"
echo "1. Create GitHub repository: https://github.com/new"
echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/janavaani-community-hub.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Deploy to cloud platform (Render/Railway/Heroku)"

echo ""
echo "🔗 Deployment Platforms:"
echo "- Render: https://render.com (Recommended)"
echo "- Railway: https://railway.app"
echo "- Heroku: https://heroku.com"

echo ""
echo "✅ Deployment script completed successfully!"
echo "📖 See GITHUB_DEPLOYMENT_GUIDE.md for detailed instructions"
