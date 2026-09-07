@echo off
REM הרצת כל הבדיקות ב-Windows.
setlocal
cd /d "%~dp0"
where py >nul 2>nul && (py -3 run_tests.py %*) || (python run_tests.py %*)
pause
endlocal
