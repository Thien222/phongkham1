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

cd app

echo Step 1: Generating Prisma Client...
"..\nodejs\node.exe" node_modules\prisma\build\index.js generate
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to generate Prisma Client!
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing database schema...
if not exist "%DB_PATH%" (
    echo Creating new database...
    "..\nodejs\node.exe" node_modules\prisma\build\index.js db push --skip-generate
    if errorlevel 1 (
        echo [WARNING] Failed to create database, will try again on next run
    ) else (
        echo Database created successfully!
        if exist "src\scripts\seed.js" (
            echo Seeding initial data...
            "..\nodejs\node.exe" src\scripts\seed.js
        )
    )
) else (
    echo Updating database schema...
    "..\nodejs\node.exe" node_modules\prisma\build\index.js db push --skip-generate
    if errorlevel 1 (
        echo [WARNING] Database might be locked or schema already up to date
    )
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

