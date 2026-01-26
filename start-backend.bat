@echo off
REM Start Backend Server Script for Windows

echo.
echo ====================================
echo FrontierLMS Backend Startup
echo ====================================
echo.

REM Check if backend folder exists
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the root directory
    pause
    exit /b 1
)

REM Check if node_modules exists in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo Starting backend server...
echo.
cd backend
call npm start

pause
