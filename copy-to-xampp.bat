@echo off
echo Copying PHP files to XAMPP backend...
echo.

REM Create the backend directory if it doesn't exist
if not exist "C:\xampp\htdocs\backend\api" (
    mkdir "C:\xampp\htdocs\backend\api"
    echo Created directory: C:\xampp\htdocs\backend\api
)

REM Copy all PHP files
copy "api\*.php" "C:\xampp\htdocs\backend\api\"

echo.
echo Files copied successfully!
echo Backend API is now available at: http://localhost/backend/api/
echo.
pause 