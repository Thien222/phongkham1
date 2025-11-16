@echo off
title Phong Kham Mat - Development Mode
color 0B
cls

echo.
echo ========================================
echo   HE THONG QUAN LY PHONG KHAM MAT
echo   Development Mode - Local
echo ========================================
echo.

cd /d "%~dp0"

echo Checking dependencies...
if not exist "node_modules" (
    echo.
    echo Installing dependencies (this will install for all workspaces)...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)

echo.
echo Setting up database...
cd apps\server

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    (
        echo PORT=4000
        echo DATABASE_URL="file:./dev.db"
        echo MONGO_URI=
        echo CORS_ORIGIN=http://localhost:5173
    ) > .env
    echo .env file created!
)

REM Generate Prisma Client
echo.
echo Generating Prisma Client...
call npm run prisma:generate
if errorlevel 1 (
    echo.
    echo [WARNING] Failed to generate Prisma Client!
)

REM Push schema
echo.
echo Setting up database schema...
call npm run prisma:push
if errorlevel 1 (
    echo.
    echo [WARNING] Failed to push schema!
)

cd ..\..

echo.
echo ========================================
echo   Starting Server and Client...
echo ========================================
echo.
echo Server will run on: http://localhost:4000
echo Client will run on: http://localhost:5173
echo.
echo Opening 2 new windows...
echo.

REM Start server in new window
start "Phong Kham - Server" cmd /k "cd /d %~dp0apps\server && npm run dev"

REM Wait a bit for server to start
timeout /t 3 /nobreak >nul

REM Start client in new window
start "Phong Kham - Client" cmd /k "cd /d %~dp0apps\client && npm run dev"

echo.
echo ========================================
echo   Both servers are starting...
echo   Check the 2 new windows for status
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
