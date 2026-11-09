@echo off
cd /d "%~dp0"
echo ====================================================================
echo  NexHire AI - Push to GitHub
echo  Target: https://github.com/vinu21699/AI-Interview-and-Resume-Analyzer-Guide
echo ====================================================================
echo.
echo Pushing 'main' branch to origin...
echo (If prompted, please click 'Sign in with your browser' to authenticate)
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================================
    echo  SUCCESS! Your code has been pushed to your GitHub repository.
    echo ====================================================================
) else (
    echo.
    echo Push failed or was cancelled. If you have existing commits on remote,
    echo you may need to force push:
    echo   git push -u origin main --force
)
echo.
pause
