# JANAVAANI Deployment Script for Windows PowerShell
# This script helps deploy the JANAVAANI project to GitHub and cloud platforms

Write-Host "🚀 JANAVAANI Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not found. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository found" -ForegroundColor Green

# Check if all files are committed
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Uncommitted changes found. Committing all changes..." -ForegroundColor Yellow
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Final commit before deployment - $timestamp"
} else {
    Write-Host "✅ All files are committed" -ForegroundColor Green
}

# Display current status
Write-Host ""
Write-Host "📊 Current Git Status:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "📋 Project Summary:" -ForegroundColor Cyan
Write-Host "- Frontend: HTML, CSS, JavaScript"
Write-Host "- Backend: Node.js, Express.js"
Write-Host "- Database: MongoDB"
$fileCount = (git ls-files | Measure-Object).Count
Write-Host "- Files: $fileCount files ready for deployment"

Write-Host ""
Write-Host "🌟 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create GitHub repository: https://github.com/new"
Write-Host "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/janavaani-community-hub.git"
Write-Host "3. Push to GitHub: git push -u origin main"
Write-Host "4. Deploy to cloud platform (Render/Railway/Heroku)"

Write-Host ""
Write-Host "🔗 Deployment Platforms:" -ForegroundColor Cyan
Write-Host "- Render: https://render.com (Recommended)"
Write-Host "- Railway: https://railway.app"
Write-Host "- Heroku: https://heroku.com"

Write-Host ""
Write-Host "✅ Deployment script completed successfully!" -ForegroundColor Green
Write-Host "📖 See GITHUB_DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Blue
