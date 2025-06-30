<?php
/**
 * Environment Setup Script
 * Creates .env file from env.example
 */

echo "=== Zadex Stellar Wallet Environment Setup ===\n\n";

// Check if .env already exists
if (file_exists('.env')) {
    echo "⚠️  .env file already exists!\n";
    echo "Do you want to overwrite it? (y/N): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    fclose($handle);
    
    if (trim(strtolower($line)) !== 'y') {
        echo "Setup cancelled.\n";
        exit;
    }
}

// Read the example file
if (!file_exists('env.example')) {
    echo "❌ env.example file not found!\n";
    exit(1);
}

$exampleContent = file_get_contents('env.example');
$lines = explode("\n", $exampleContent);

echo "Please provide the following configuration values:\n\n";

$newContent = "";
foreach ($lines as $line) {
    $line = trim($line);
    
    // Skip empty lines and comments
    if (empty($line) || strpos($line, '#') === 0) {
        $newContent .= $line . "\n";
        continue;
    }
    
    // Check if it's a key=value pair
    if (strpos($line, '=') !== false) {
        list($key, $defaultValue) = explode('=', $line, 2);
        $key = trim($key);
        $defaultValue = trim($defaultValue);
        
        // Remove quotes from default value
        if ((substr($defaultValue, 0, 1) === '"' && substr($defaultValue, -1) === '"') ||
            (substr($defaultValue, 0, 1) === "'" && substr($defaultValue, -1) === "'")) {
            $defaultValue = substr($defaultValue, 1, -1);
        }
        
        // Special handling for API key
        if ($key === 'EXCHANGE_RATE_API_KEY') {
            echo "🔑 Exchange Rate API Key (press Enter to skip and use fallback): ";
            $handle = fopen("php://stdin", "r");
            $input = trim(fgets($handle));
            fclose($handle);
            
            if (empty($input)) {
                $newContent .= "$key=\n";
                echo "   Using fallback API (no key required)\n";
            } else {
                $newContent .= "$key=$input\n";
                echo "   ✅ API key set\n";
            }
            continue;
        }
        
        // Special handling for database password
        if ($key === 'DB_PASS') {
            echo "🗄️  Database Password (press Enter if no password): ";
            $handle = fopen("php://stdin", "r");
            $input = trim(fgets($handle));
            fclose($handle);
            
            $newContent .= "$key=$input\n";
            continue;
        }
        
        // For other values, use default or ask
        if ($defaultValue !== '' && $defaultValue !== 'your_*_here') {
            echo "📝 $key [$defaultValue]: ";
            $handle = fopen("php://stdin", "r");
            $input = trim(fgets($handle));
            fclose($handle);
            
            if (empty($input)) {
                $newContent .= "$key=$defaultValue\n";
            } else {
                $newContent .= "$key=$input\n";
            }
        } else {
            echo "📝 $key: ";
            $handle = fopen("php://stdin", "r");
            $input = trim(fgets($handle));
            fclose($handle);
            
            $newContent .= "$key=$input\n";
        }
    } else {
        $newContent .= $line . "\n";
    }
}

// Write the .env file
if (file_put_contents('.env', $newContent)) {
    echo "\n✅ .env file created successfully!\n";
    echo "📁 Location: " . realpath('.env') . "\n\n";
    
    echo "🔧 Next steps:\n";
    echo "1. Make sure your database is running\n";
    echo "2. Import the database schema: database-schema-fixed.sql\n";
    echo "3. Test the API endpoints\n";
    echo "4. Start your frontend: npm run dev\n\n";
    
    echo "🚀 Your wallet application is ready to use!\n";
} else {
    echo "\n❌ Failed to create .env file!\n";
    exit(1);
}
?> 