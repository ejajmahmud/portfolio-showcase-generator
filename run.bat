@echo off
title Portfolio Showcase Studio
echo ========================================================
echo   Portfolio Showcase Generator (bezel.fit iPhone 17 Pro Max)
echo ========================================================
echo.
cd /d "%~dp0"
echo Starting web server on http://localhost:8000...
echo Opening browser...
start http://localhost:8000
python server.py
pause
