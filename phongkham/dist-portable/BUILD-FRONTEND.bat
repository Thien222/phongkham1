@echo off
title Build Frontend for Portable
color 0B
cls

echo.
echo ========================================
echo   BUILD FRONTEND FOR PORTABLE
echo ========================================
echo.

cd /d "%~dp0"

REM Step 1: Build the client
echo Step 1: Building frontend...
cd ..\apps\client
call npm run build
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to build frontend!
    pause
    exit /b 1
)

echo.
echo Step 2: Copying built files to portable...

REM Create client-dist folder if not exists
if not exist "..\..\dist-portable\app\client-dist" mkdir "..\..\dist-portable\app\client-dist"

REM Copy all files from dist to client-dist
xcopy /E /I /Y "dist\*" "..\..\dist-portable\app\client-dist\"
if errorlevel 1 (
    echo.
    echo [ERROR] Failed to copy files!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend has been built and copied to:
echo %~dp0app\client-dist
echo.
echo You can now run START.bat
echo.
pause
