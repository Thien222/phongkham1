@echo off
title Cleanup Locked Files
color 0C
cls

echo.
echo ========================================
echo   Cleaning up locked files...
echo ========================================
echo.
echo This script will attempt to delete remaining
echo node_modules that may have locked files.
echo.
echo Make sure to close all Node.js processes,
echo VS Code, and other editors before running this.
echo.
pause

cd /d "%~dp0"

echo.
echo Attempting to delete node_modules (root)...
if exist "node_modules" (
    rmdir /s /q "node_modules" 2>nul
    if exist "node_modules" (
        echo.
        echo [WARNING] Some files are still locked.
        echo Please close all Node.js processes and try again.
        echo Or manually delete: %CD%\node_modules
    ) else (
        echo Successfully deleted node_modules (root)
    )
) else (
    echo node_modules (root) already deleted
)

echo.
echo ========================================
echo   Cleanup complete!
echo ========================================
echo.
pause



