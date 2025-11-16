@echo off
title Migrate Database
color 0E
cls

echo.
echo ========================================
echo   MIGRATE DATABASE - PHONG KHAM MAT
echo ========================================
echo.
echo LƯU Ý: Tắt server trước khi chạy script này!
echo.
pause

cd /d "%~dp0"

REM Set database path
set "DB_PATH=%~dp0data\dev.db"
set "DATABASE_URL=file:%DB_PATH%"

REM Ensure data folder exists
if not exist "data" mkdir data

cd app

echo.
echo Step 1: Generating Prisma Client...
"..\nodejs\node.exe" node_modules\prisma\build\index.js generate
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to generate Prisma Client!
    pause
    exit /b 1
)

echo.
echo Step 2: Pushing schema to database...
"..\nodejs\node.exe" node_modules\prisma\build\index.js db push
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to push schema!
    pause
    exit /b 1
)

echo.
echo Step 3: Seeding database with 50+ sample records (optional)...
if exist "src\scripts\seed-full.js" (
    "..\nodejs\node.exe" src\scripts\seed-full.js
    echo Seeding completed!
) else if exist "src\scripts\seed.js" (
    "..\nodejs\node.exe" src\scripts\seed.js
    echo Seeding completed!
) else (
    echo No seed script found, skipping...
)

echo.
echo ========================================
echo   Migration completed successfully!
echo ========================================
echo.
echo You can now run START.bat to start the server.
echo.
pause

