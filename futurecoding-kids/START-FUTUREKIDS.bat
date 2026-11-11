@echo off
REM Double-click this file to start FutureKids.
cd /d "%~dp0"
title FutureKids
where npm >/dev/null 2>/dev/null || (echo Node.js is not installed. Get the LTS version from https://nodejs.org and try again. & pause & exit /b 1)
if not exist node_modules (
  echo Installing FutureKids for the first time... this takes a minute or two.
  call npm install || (echo npm install failed - see the messages above. & pause & exit /b 1)
)
echo.
echo Starting FutureKids... your browser will open at http://localhost:5173
echo Keep this window open while you use the app. Close it to stop.
echo.
call npm run dev -- --open --port 5173 --strictPort
pause
