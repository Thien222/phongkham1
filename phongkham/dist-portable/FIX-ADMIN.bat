@echo off
title Fix Admin User
color 0E
cls

echo.
echo ========================================
echo   FIX ADMIN USER - PHONG KHAM MAT
echo ========================================
echo.
echo Script này sẽ tạo/cập nhật user admin:
echo   Username: admin
echo   Password: admin123
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
echo Step 2: Fixing admin user...
"..\nodejs\node.exe" src\scripts\fix-admin.js
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to fix admin user!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Admin user fixed successfully!
echo ========================================
echo.
echo You can now login with:
echo   Username: admin
echo   Password: admin123
echo.
echo You can now run START.bat to start the server.
echo.
pause


