@echo off
title Phong Kham Mat - Server
color 0A
cls

echo.
echo ========================================
echo   HE THONG QUAN LY PHONG KHAM MAT
echo ========================================
echo.
echo Dang khoi dong server...
echo.

cd /d "%~dp0"

REM Set absolute database path
set "DB_PATH=%~dp0data\dev.db"
set "DATABASE_URL=file:%DB_PATH%"

REM Ensure data folder exists
if not exist "data" mkdir data

REM Copy default database if not exists
if not exist "%DB_PATH%" (
    echo.
    echo Creating default database...
    cd app
    "..\nodejs\node.exe" "node_modules\prisma\build\index.js" db push
    "..\nodejs\node.exe" src\scripts\seed.js
    cd ..
)

cd app

echo Checking Prisma Client...
"..\nodejs\node.exe" "node_modules\prisma\build\index.js" generate
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to generate Prisma Client!
    pause
    exit /b 1
)

echo.
echo Starting server...
echo Database: %DB_PATH%
echo.
echo ========================================
echo.

"..\nodejs\node.exe" src\index.js

if errorlevel 1 (
    echo.
    echo [ERROR] Server crashed! Check error above.
    pause
)

