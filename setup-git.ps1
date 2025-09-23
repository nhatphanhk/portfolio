# Git Setup and Workflow Script for Portfolio Project
# This script automates the initial git configuration for professional development

Write-Host "=== Portfolio Project Git Setup ===" -ForegroundColor Cyan
Write-Host "Setting up Git configuration for one-week development sprint..." -ForegroundColor Green

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git detected: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Git Configuration Setup
Write-Host "`n--- Setting up Git configuration ---" -ForegroundColor Yellow

# Set up user configuration (user should update these)
Write-Host "Current git user configuration:" -ForegroundColor Cyan
$currentName = git config user.name 2>$null
$currentEmail = git config user.email 2>$null

if ($currentName) {
    Write-Host "Name: $currentName" -ForegroundColor White
} else {
    Write-Host "Name: Not set" -ForegroundColor Red
    Write-Host "Run: git config user.name 'Your Full Name'" -ForegroundColor Yellow
}

if ($currentEmail) {
    Write-Host "Email: $currentEmail" -ForegroundColor White
} else {
    Write-Host "Email: Not set" -ForegroundColor Red
    Write-Host "Run: git config user.email 'your.email@domain.com'" -ForegroundColor Yellow
}

# Set up recommended git settings
Write-Host "`nConfiguring Git settings for better workflow..." -ForegroundColor Cyan
git config --global core.autocrlf true
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global pull.rebase false

Write-Host "✓ Git global settings configured" -ForegroundColor Green

# Create comprehensive .gitignore
Write-Host "`n--- Creating .gitignore file ---" -ForegroundColor Yellow

if (-not (Test-Path ".gitignore")) {
    $gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/settings.json
.vscode/launch.json
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Temporary folders
tmp/
temp/

# Vercel deployment files
.vercel

# Database
*.db
*.sqlite

# Cache directories
.cache/
.parcel-cache/

# Storybook build outputs
storybook-static/

# Temporary testing files
test-results/
playwright-report/
"@

    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✓ .gitignore created successfully" -ForegroundColor Green
} else {
    Write-Host "✓ .gitignore already exists" -ForegroundColor Green
}

# Initialize git repository if not already initialized
Write-Host "`n--- Git Repository Setup ---" -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository already exists" -ForegroundColor Green
}

# Create git hooks directory if it doesn't exist
if (-not (Test-Path ".git/hooks")) {
    New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
}

# Create pre-commit hook for code quality
Write-Host "`n--- Setting up Git hooks ---" -ForegroundColor Yellow

$preCommitHook = @"
#!/bin/sh
# Pre-commit hook for portfolio project

echo "🔍 Running pre-commit checks..."

# Check for common issues
echo "Checking for debugging statements..."
if git diff --cached --name-only | xargs grep -l "console.log\|debugger" 2>/dev/null; then
    echo "⚠️  Warning: Found console.log or debugger statements"
    echo "Please remove them before committing"
fi

# Check for TypeScript files
if git diff --cached --name-only | grep -q "\.tsx\?$"; then
    echo "📝 TypeScript files detected"
    
    # Check if package.json has type-check script
    if grep -q '"type-check"' package.json 2>/dev/null; then
        echo "Running TypeScript check..."
        npm run type-check
        if [ $? -ne 0 ]; then
            echo "❌ TypeScript errors found. Please fix before committing."
            exit 1
        fi
        
        echo "Running linter..."
        npm run lint
        if [ $? -ne 0 ]; then
            echo "❌ Linting errors found. Please fix before committing."
            exit 1
        fi
        
        echo "Checking code formatting..."
        npm run format:check
        if [ $? -ne 0 ]; then
            echo "⚠️  Code formatting issues found. Run 'npm run format' to fix."
            echo "Or continue commit and format later."
        fi
    fi
fi

echo "✅ Pre-commit checks passed!"
exit 0
"@

$preCommitHookPath = ".git/hooks/pre-commit"
$preCommitHook | Out-File -FilePath $preCommitHookPath -Encoding UTF8

# Make hook executable (PowerShell equivalent)
if (Test-Path $preCommitHookPath) {
    Write-Host "✓ Pre-commit hook created" -ForegroundColor Green
}

# Create commit message template
Write-Host "`n--- Setting up commit message template ---" -ForegroundColor Yellow

$commitTemplate = @"
# Type(scope): Brief description (50 characters max)
#
# Longer description (if needed):
# - What was changed and why
# - Any breaking changes or important notes
#
# Types: feat, fix, docs, style, refactor, test, chore
# Scope: component name, page, api, config, etc.
#
# Examples:
# feat(navigation): add responsive mobile hamburger menu
# fix(contact): resolve email validation issue  
# docs(readme): update installation and setup instructions
# style(hero): improve responsive layout for mobile devices
# refactor(utils): extract common formatting functions
# test(contact): add unit tests for form validation
# chore(deps): update Next.js to latest version
#
# Remember:
# - Use present tense ("add" not "added")
# - Don't capitalize first letter of description
# - No period at the end of the description
"@

$commitTemplatePath = ".git/commit_template.txt"
$commitTemplate | Out-File -FilePath $commitTemplatePath -Encoding UTF8
git config commit.template $commitTemplatePath

Write-Host "✓ Commit message template configured" -ForegroundColor Green

# Set up helpful git aliases
Write-Host "`n--- Setting up Git aliases ---" -ForegroundColor Yellow

$aliases = @{
    "st" = "status"
    "co" = "checkout"
    "br" = "branch"
    "ci" = "commit"
    "unstage" = "reset HEAD --"
    "last" = "log -1 HEAD"
    "visual" = "!gitk"
    "graph" = "log --oneline --graph --decorate --all"
    "daily" = "log --since='1 day ago' --oneline"
}

foreach ($alias in $aliases.GetEnumerator()) {
    git config --global alias.$($alias.Key) $alias.Value
}

Write-Host "✓ Git aliases configured" -ForegroundColor Green

# Create initial project structure commit
Write-Host "`n--- Initial Commit Setup ---" -ForegroundColor Yellow

# Check if we have any commits
$hasCommits = $false
try {
    git rev-parse HEAD 2>$null | Out-Null
    $hasCommits = $true
} catch {
    $hasCommits = $false
}

if (-not $hasCommits) {
    Write-Host "Preparing initial commit..." -ForegroundColor Cyan
    
    # Stage all current files
    git add .
    
    # Create initial commit
    $initialCommitMessage = @"
chore(init): initial portfolio project setup

- Initialize Next.js project with TypeScript and Tailwind CSS
- Set up project documentation and planning files
- Configure Git workflow with hooks and templates
- Establish development rules and guidelines
- Create one-week development timeline and daily checklist

Project Structure:
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Comprehensive documentation in docs/

Development Plan:
- 7-day MVP development timeline
- Daily feature milestones
- Responsive portfolio website
- Contact form integration
- Dark/light mode toggle
- SEO optimization and performance tuning

Ready for Day 1 development sprint.
"@

    git commit -m $initialCommitMessage
    Write-Host "✓ Initial commit created" -ForegroundColor Green
} else {
    Write-Host "✓ Repository already has commits" -ForegroundColor Green
}

# Create development branch structure
Write-Host "`n--- Branch Structure Setup ---" -ForegroundColor Yellow

# Check if develop branch exists
$developExists = git branch --list develop 2>$null
if (-not $developExists) {
    git checkout -b develop 2>$null
    Write-Host "✓ Created development branch" -ForegroundColor Green
    git checkout main
} else {
    Write-Host "✓ Development branch already exists" -ForegroundColor Green
}

# Display final setup summary
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Git repository configured and ready" -ForegroundColor Green
Write-Host "✅ .gitignore file created" -ForegroundColor Green
Write-Host "✅ Pre-commit hooks installed" -ForegroundColor Green
Write-Host "✅ Commit templates configured" -ForegroundColor Green
Write-Host "✅ Git aliases set up" -ForegroundColor Green
Write-Host "✅ Branch structure created" -ForegroundColor Green

Write-Host "`n--- Next Steps ---" -ForegroundColor Yellow
Write-Host "1. Configure your Git user details:"
Write-Host "   git config user.name 'Your Full Name'" -ForegroundColor White
Write-Host "   git config user.email 'your.email@domain.com'" -ForegroundColor White
Write-Host ""
Write-Host "2. Connect to remote repository:"
Write-Host "   git remote add origin https://github.com/nhatphanhk/profolio.git" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Start development:"
Write-Host "   git checkout -b feature/day-1-foundation" -ForegroundColor White
Write-Host "   # Begin Day 1 tasks from docs/daily_checklist.md" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Daily Workflow:" -ForegroundColor Cyan
Write-Host "   • Morning: git checkout -b feature/day-X-description" -ForegroundColor White
Write-Host "   • Development: Regular commits with proper messages" -ForegroundColor White
Write-Host "   • Evening: Merge feature branch to main" -ForegroundColor White
Write-Host ""
Write-Host "📖 Available Git aliases:" -ForegroundColor Cyan
Write-Host "   git st      # git status" -ForegroundColor White
Write-Host "   git co      # git checkout" -ForegroundColor White
Write-Host "   git br      # git branch" -ForegroundColor White
Write-Host "   git ci      # git commit" -ForegroundColor White
Write-Host "   git graph   # visual commit history" -ForegroundColor White
Write-Host "   git daily   # commits from last 24 hours" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready to start your one-week portfolio development sprint!" -ForegroundColor Green
