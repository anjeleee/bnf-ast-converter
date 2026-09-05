@echo off
setlocal enabledelayedexpansion

title BNFgen - Compiler Syntax Analyzer & Tree Synthesizer
color 0B

echo ===============================================================================
echo               BNFgen: Compiler Syntax Analyzer & Tree Visualizer            
echo                 Course Final Project - Formal Language Parser               
echo ===============================================================================
echo.

:: 1. Verify Python Installation
echo [*] Checking Python environment...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python 3 was not found in your system PATH!
    echo Please install Python 3.8+ from https://www.python.org/
    echo IMPORTANT: Make sure to check 'Add python.exe to PATH' during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VER=%%i
echo [*] Detected %PYTHON_VER%

:: 2. Verify and Install Backend Python Dependencies
echo [*] Checking backend requirements (fastapi, uvicorn)...
python -m pip install -q -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Could not auto-install dependencies via pip.
    echo Attempting to proceed with currently installed packages...
)

:: 3. Check for Pre-built Frontend Assets
if not exist "frontend\dist\index.html" (
    echo [*] Pre-built frontend bundle not detected in frontend\dist.
    echo [*] Checking for Node.js and npm to build production assets...
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        echo [*] Node.js and npm detected. Installing dependencies and building frontend...
        cd frontend
        call npm install --silent
        call npm run build
        cd ..
        echo [*] Frontend production build generated successfully.
    ) else (
        echo [WARNING] Node.js is not installed and frontend\dist is missing.
        echo If the browser displays a 404 or blank page, please install Node.js (LTS)
        echo from https://nodejs.org/ and run 'npm run build' inside the frontend directory.
    )
)

echo.
echo ===============================================================================
echo   - Web GUI URL   : http://localhost:8000
echo   - API Health    : http://localhost:8000/health
echo   - API Docs      : http://localhost:8000/docs
echo   - To stop app   : Press CTRL+C in this command window
echo ===============================================================================
echo.

:: 4. Launch Browser
echo [*] Launching browser to http://localhost:8000...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8000"

:: 5. Run Unified FastAPI Server
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000

pause