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
echo.
echo ========================================
echo.

"..\nodejs\node.exe" src\index.js

if errorlevel 1 (
    echo.
    echo [ERROR] Server crashed! Check error above.
    pause
)

