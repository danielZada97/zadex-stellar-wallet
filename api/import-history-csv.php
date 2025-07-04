<?php
require 'api/db.php';

$csvFile = 'exchange_rates_2025.csv'; // Path to your combined CSV

if (($handle = fopen($csvFile, 'r')) !== false) {
    // Read header
    fgetcsv($handle);
    while (($row = fgetcsv($handle)) !== false) {
        $currency_from = $row[0];
        $currency_to = $row[1];
        $date = $row[2];
        $rate = $row[3];

        // Only insert if this date is NOT today (so we don't overwrite current rates)
        if ($date !== date('Y-m-d')) {
            $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = rate");
            $stmt->execute([$currency_from, $currency_to, $rate, $date]);
        }
    }
    fclose($handle);
    echo "History import complete!\n";
} else {
    echo "Failed to open CSV file.\n";
} 