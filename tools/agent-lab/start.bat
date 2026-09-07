@echo off
REM הרצת מעבדת הסוכנים ב-Windows. דורש Python 3.9 ומעלה בלבד.
setlocal
cd /d "%~dp0"
where py >nul 2>nul && (py -3 run.py --open %*) || (python run.py --open %*)
if errorlevel 1 pause
endlocal
