@echo off
title Reset Database
color 0C
cls

echo.
echo ========================================
echo   RESET DATABASE - PHONG KHAM MAT
echo ========================================
echo.
echo CẢNH BÁO: Script này sẽ XÓA toàn bộ dữ liệu!
echo.
echo Bạn có chắc chắn muốn tiếp tục?
echo.
pause

cd /d "%~dp0"

REM Set database path
set "DB_PATH=%~dp0data\dev.db"

REM Backup old database if exists
if exist "%DB_PATH%" (
    echo.
    echo Creating backup...
    set "BACKUP_PATH=%~dp0data\dev.db.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
    set "BACKUP_PATH=%BACKUP_PATH: =0%"
    copy "%DB_PATH%" "%BACKUP_PATH%" >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] Could not create backup (database might be locked)
        echo Please close the server first!
        pause
        exit /b 1
    )
    echo Backup saved to: %BACKUP_PATH%
)

REM Delete old database
if exist "%DB_PATH%" (
    echo.
    echo Deleting old database...
    del "%DB_PATH%" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Could not delete database!
        echo Please close the server first!
        pause
        exit /b 1
    )
    echo Old database deleted!
)

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
echo Step 2: Creating new database...
"..\nodejs\node.exe" node_modules\prisma\build\index.js db push --skip-generate
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to create database!
    pause
    exit /b 1
)

echo.
echo Step 3: Seeding initial data...
if exist "src\scripts\seed.js" (
    "..\nodejs\node.exe" src\scripts\seed.js
    echo Seeding completed!
) else (
    echo No seed script found, skipping...
)

echo.
echo ========================================
echo   Database reset completed!
echo ========================================
echo.
echo You can now run START.bat to start the server.
echo.
pause


