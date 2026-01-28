@echo off
REM Start Frontend Server Script for Windows

echo.
echo ====================================
echo FrontierLMS Frontend Startup
echo ====================================
echo.

REM Check if frontend folder exists
if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the root directory
    pause
    exit /b 1
)

REM Check if node_modules exists in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting frontend server on http://localhost:3000
echo.
cd frontend
call npm run dev

pause
