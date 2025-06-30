# PowerShell script to update .env file with API key

$apiKey = "cf52bc47c775435987c0c3809279c771"

# Read the .env file
$content = Get-Content ".env"

# Update the API key line
$updatedContent = $content | ForEach-Object {
    if ($_ -match "^EXCHANGE_RATE_API_KEY=") {
        "EXCHANGE_RATE_API_KEY=$apiKey"
    } else {
        $_
    }
}

# Write back to .env file
$updatedContent | Set-Content ".env"

Write-Host "ENV file updated with API key: $apiKey"
Write-Host "Next steps:"
Write-Host "1. Test the API: Visit http://localhost:8080/test-exchange-api.html"
Write-Host "2. Update exchange rates: Click 'Update Exchange Rates'"
Write-Host "3. Test conversion: Use your comprehensive test page"
Write-Host ""
Write-Host "Your wallet will now use Fixer.io API for better exchange rates!" 