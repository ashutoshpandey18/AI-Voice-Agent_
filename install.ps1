# ========================================
# AI Voice Agent - Complete Installation Script
# ========================================
# This script installs all dependencies for:
# - Root (concurrently)
# - Backend (Express + TypeScript)
# - Frontend (React + Vite)
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Voice Agent - Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Yellow
if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installing Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install root dependencies
Write-Host "📦 [1/3] Installing root dependencies (concurrently)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Root dependencies installed" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "📦 [2/3] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

# Install frontend dependencies
Write-Host "📦 [3/3] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verifying Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if critical packages are installed
Write-Host "🔍 Verifying critical packages..." -ForegroundColor Yellow

$backendPackages = @("express", "mongoose", "axios", "pdfkit", "express-rate-limit", "typescript")
$frontendPackages = @("react", "react-dom", "@tanstack/react-query", "recharts", "axios", "vite")

Write-Host ""
Write-Host "Backend packages:" -ForegroundColor Cyan
Set-Location backend
foreach ($pkg in $backendPackages) {
    $installed = npm list $pkg --depth=0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $pkg" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $pkg (not found)" -ForegroundColor Yellow
    }
}
Set-Location ..

Write-Host ""
Write-Host "Frontend packages:" -ForegroundColor Cyan
Set-Location frontend
foreach ($pkg in $frontendPackages) {
    $installed = npm list $pkg --depth=0 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $pkg" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $pkg (not found)" -ForegroundColor Yellow
    }
}
Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure environment variables:" -ForegroundColor White
Write-Host "   • Copy backend/.env.example to backend/.env" -ForegroundColor Gray
Write-Host "   • Copy frontend/.env.example to frontend/.env.local" -ForegroundColor Gray
Write-Host "   • Add your MongoDB URI and OpenWeather API key" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Access the application:" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   • Admin Dashboard: http://localhost:3000/admin" -ForegroundColor Gray
Write-Host "   • Backend API: http://localhost:5000" -ForegroundColor Gray
Write-Host "   • API Health: http://localhost:5000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed documentation, see:" -ForegroundColor Cyan
Write-Host "   • README.md" -ForegroundColor Gray
Write-Host "   • ADMIN_DASHBOARD_GUIDE.md" -ForegroundColor Gray
Write-Host "   • API_DOCUMENTATION.md" -ForegroundColor Gray
Write-Host ""
