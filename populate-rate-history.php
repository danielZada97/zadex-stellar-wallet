<?php
require 'api/db.php';

date_default_timezone_set('UTC');

$pairs = [
    ['USD', 'ILS'],
    ['EUR', 'ILS'],
    ['GBP', 'ILS'],
    ['JPY', 'ILS'],
];
$days = 30;
$today = new DateTime();

foreach ($pairs as $pair) {
    list($from, $to) = $pair;
    // Get today's real rate
    $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = ? ORDER BY date DESC LIMIT 1");
    $stmt->execute([$from, $to]);
    $todayRate = $stmt->fetchColumn();
    if (!$todayRate) {
        echo "No current rate for $from to $to\n";
        continue;
    }
    // Generate dummy rates for previous days
    $baseRate = $todayRate;
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = clone $today;
        $date->modify("-$i days");
        if ($i === 0) {
            $rate = $todayRate;
        } else {
            // Small random variation, max ±2%
            $variation = $baseRate * (mt_rand(-20, 20) / 1000);
            $rate = round($baseRate + $variation, 4);
        }
        $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = VALUES(rate)");
        $stmt->execute([$from, $to, $rate, $date->format('Y-m-d')]);
    }
    echo "Populated $days days for $from to $to\n";
}
echo "Done.\n"; 