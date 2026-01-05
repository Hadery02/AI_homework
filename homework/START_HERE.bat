@echo off
REM START_HERE.bat - Quick start for Windows users

color 0A
cls

echo.
echo =========================================
echo.
echo  ^|^|  G-PARKING - Mobile Testing Setup  ^|^|
echo.
echo =========================================
echo.
echo [Step 1] Install Dependencies
echo    $ npm install
echo.
echo [Step 2] Start Server
echo    $ npm start
echo.
echo [Step 3] Open on Mobile
echo    - Copy URL from console
echo    - Open in phone browser
echo    - Done! ^^^!
echo.
echo =========================================
echo.
echo Mobile URL Format:
echo    http://[YOUR_IP]:3000/parking-en.html
echo.
echo Desktop URL:
echo    http://localhost:3000/parking-en.html
echo.
echo =========================================
echo.
echo Quick Links:
echo    - MOBILE_SETUP.md - Full guide
echo    - ENGLISH_MOBILE_READY.md - Quick start
echo    - TRANSLATION_COMPLETE.md - What's new
echo.
echo Ready? Let's go! ^^^!
echo.
echo (Press Enter to continue...)
pause

echo.
echo Starting installation...
echo.
call npm install

echo.
echo.
echo =========================================
echo Installation complete^^^!
echo.
echo Next: Run this command to start server:
echo.
echo    npm start
echo.
echo Then open mobile URL in your phone browser
echo =========================================
echo.
pause
