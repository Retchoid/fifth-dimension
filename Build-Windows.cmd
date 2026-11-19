@echo off
setlocal
cd /d "%~dp0"
py -3.11 -m venv .build-venv
if errorlevel 1 goto fail
call .build-venv\Scripts\activate.bat
python -m pip install --upgrade pip
if errorlevel 1 goto fail
python -m pip install --only-binary=:all: --find-links wheels -r requirements-windows.txt
if errorlevel 1 goto fail
python -m pip check
if errorlevel 1 goto fail
python build_windows.py
if errorlevel 1 goto fail
echo.
echo Built dist\5D DPM\5D DPM.exe
echo Share the ENTIRE dist\5D DPM folder, zipped, including _internal.
pause
exit /b 0
:fail
echo Build failed. Keep this window open and copy its error message.
pause
exit /b 1
