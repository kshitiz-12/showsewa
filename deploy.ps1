# ShowSewa Deployment Script
# PowerShell commands to initialize git and push to GitHub

Write-Host "🚀 Starting ShowSewa deployment setup..." -ForegroundColor Cyan

# Check if git is installed
Write-Host "`n📦 Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Initialize git repository
Write-Host "`n📂 Initializing Git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "⚠️  Git repository already initialized" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Add all files
Write-Host "`n📝 Adding files to git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added" -ForegroundColor Green

# Show what will be committed
Write-Host "`n📋 Files to be committed:" -ForegroundColor Yellow
git status --short

# Commit changes
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Initial commit: ShowSewa platform complete - entertainment booking for Nepal"
git commit -m $commitMessage
Write-Host "✅ Changes committed" -ForegroundColor Green

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "✅ Local Git setup complete!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan

Write-Host "`n📌 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub:" -ForegroundColor White
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host "`n2. Name it: showsewa" -ForegroundColor White
Write-Host "`n3. Then run these commands:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/showsewa.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan

Write-Host "`n📚 For deployment instructions, see:" -ForegroundColor Yellow
Write-Host "   - DEPLOY_QUICK_START.md" -ForegroundColor White
Write-Host "   - DEPLOYMENT_GUIDE.md" -ForegroundColor White

Write-Host "`n🎉 Ready to deploy!" -ForegroundColor Green

