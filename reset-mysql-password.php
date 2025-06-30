<?php
// Script to reset MySQL root password to empty (default XAMPP setup)
echo "MySQL Root Password Reset Script\n";
echo "================================\n\n";

echo "This script will help you reset the MySQL root password to empty (default XAMPP setup).\n";
echo "If you know your current root password, you can use it to reset.\n\n";

echo "Instructions:\n";
echo "1. Open XAMPP Control Panel\n";
echo "2. Stop MySQL if it's running\n";
echo "3. Click 'Config' next to MySQL\n";
echo "4. Select 'my.ini'\n";
echo "5. Find the line: #skip-grant-tables\n";
echo "6. Uncomment it by removing the #: skip-grant-tables\n";
echo "7. Save the file\n";
echo "8. Start MySQL in XAMPP\n";
echo "9. Run this script again\n\n";

echo "Alternative method (if you know your current password):\n";
echo "1. Open phpMyAdmin at http://localhost/phpmyadmin\n";
echo "2. Log in with your current root password\n";
echo "3. Go to 'User accounts' tab\n";
echo "4. Click 'Edit privileges' for root@localhost\n";
echo "5. Click 'Change password'\n";
echo "6. Leave password fields empty\n";
echo "7. Click 'Go'\n\n";

echo "After resetting, update your .env file to have:\n";
echo "DB_USER=root\n";
echo "DB_PASS=\n\n";

echo "Press Enter to continue...";
fgets(STDIN);

// Try to connect with empty password
try {
    $pdo = new PDO(
        "mysql:host=localhost;port=3306;charset=utf8mb4",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✓ Successfully connected with empty password!\n";
    echo "✓ Your MySQL root user is now configured correctly for XAMPP.\n";
    
} catch (PDOException $e) {
    echo "❌ Still cannot connect with empty password: " . $e->getMessage() . "\n";
    echo "\nPlease follow the instructions above to reset your MySQL root password.\n";
}
?> 