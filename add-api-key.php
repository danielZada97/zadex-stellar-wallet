<?php
/**
 * Add API Key to Environment Configuration
 */

echo "=== Add Exchange Rate API Key ===\n\n";

// Check if .env exists
if (!file_exists('.env')) {
    echo "❌ .env file not found!\n";
    echo "Please run setup-env.php first to create your .env file.\n";
    exit(1);
}

echo "Please enter your Exchange Rate API Key: ";
$handle = fopen("php://stdin", "r");
$api_key = trim(fgets($handle));
fclose($handle);

if (empty($api_key)) {
    echo "❌ API key cannot be empty!\n";
    exit(1);
}

// Read current .env file
$env_content = file_get_contents('.env');
$lines = explode("\n", $env_content);

// Update or add the API key
$updated = false;
foreach ($lines as $i => $line) {
    if (strpos($line, 'EXCHANGE_RATE_API_KEY=') === 0) {
        $lines[$i] = "EXCHANGE_RATE_API_KEY=$api_key";
        $updated = true;
        break;
    }
}

// If not found, add it
if (!$updated) {
    $lines[] = "EXCHANGE_RATE_API_KEY=$api_key";
}

// Write back to .env file
$new_content = implode("\n", $lines);
if (file_put_contents('.env', $new_content)) {
    echo "✅ API key added successfully!\n";
    echo "📁 Updated: " . realpath('.env') . "\n\n";
    
    echo "🔧 Next steps:\n";
    echo "1. Test the API: Visit http://localhost:8080/test-exchange-api.html\n";
    echo "2. Update exchange rates: Click 'Update Exchange Rates'\n";
    echo "3. Test conversion: Use your comprehensive test page\n\n";
    
    echo "🚀 Your wallet will now use Fixer.io API for better exchange rates!\n";
} else {
    echo "❌ Failed to update .env file!\n";
    exit(1);
}
?> 