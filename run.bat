@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo    Bank Account Simulator Starting...
echo    Port: 8083
echo ==========================================

REM Check if node_modules exists
if not exist "node_modules\" (
    echo.
    echo Node.js libraries not found. Installing...
    call npm install
)

echo.
echo Starting development server...
call npm run dev

pause
