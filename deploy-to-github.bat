@echo off
echo 🚀 JANAVAANI GitHub Deployment Script
echo =====================================
echo.
echo This script will deploy your JANAVAANI project to GitHub
echo Make sure you have created the repository first at:
echo https://github.com/sai-ram-krishna/janavaani-community-hub
echo.
pause

echo 📡 Adding GitHub remote...
git remote add origin https://github.com/sai-ram-krishna/janavaani-community-hub.git

echo 🔄 Renaming branch to main...
git branch -M main

echo 🚀 Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Deployment completed!
echo Your project is now live at:
echo https://github.com/sai-ram-krishna/janavaani-community-hub
echo.
pause
