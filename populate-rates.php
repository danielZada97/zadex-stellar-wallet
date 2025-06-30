<?php
header('Content-Type: application/json');
require 'api/config.php';
require 'api/db.php';

try {
    // Check if exchange_rates table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'exchange_rates'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'success' => false,
            'message' => 'exchange_rates table does not exist. Please import the database schema first.'
        ]);
        exit;
    }
    
    $today = date('Y-m-d');
    
    // Sample exchange rates (approximate current rates)
    $rates = [
        ['USD', 'EUR', 0.85],
        ['USD', 'GBP', 0.73],
        ['USD', 'ILS', 3.65],
        ['EUR', 'USD', 1.18],
        ['EUR', 'GBP', 0.86],
        ['EUR', 'ILS', 4.29],
        ['GBP', 'USD', 1.37],
        ['GBP', 'EUR', 1.16],
        ['GBP', 'ILS', 5.00],
        ['ILS', 'USD', 0.27],
        ['ILS', 'EUR', 0.23],
        ['ILS', 'GBP', 0.20],
        // Same currency rates
        ['USD', 'USD', 1.0],
        ['EUR', 'EUR', 1.0],
        ['GBP', 'GBP', 1.0],
        ['ILS', 'ILS', 1.0]
    ];
    
    $pdo->beginTransaction();
    
    $inserted = 0;
    foreach ($rates as $rate) {
        $stmt = $pdo->prepare("
            INSERT INTO exchange_rates (currency_from, currency_to, rate, date)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE rate = VALUES(rate)
        ");
        $stmt->execute([$rate[0], $rate[1], $rate[2], $today]);
        $inserted++;

        // If this is a XXX->ILS rate, also insert ILS->XXX as 1/rate
        if ($rate[1] === 'ILS' && $rate[2] != 0 && $rate[0] !== 'ILS') {
            $reverse_rate = 1 / $rate[2];
            $stmt->execute(['ILS', $rate[0], $reverse_rate, $today]);
            $inserted++;
        }
    }
    
    $pdo->commit();
    
    // Verify the rates were inserted
    $stmt = $pdo->prepare("SELECT * FROM exchange_rates WHERE currency_from = 'USD' AND currency_to = 'EUR'");
    $stmt->execute();
    $usd_eur = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully populated $inserted exchange rates",
        'data' => [
            'rates_inserted' => $inserted,
            'usd_to_eur_rate' => $usd_eur ? $usd_eur['rate'] : 'not found',
            'date' => $today
        ]
    ]);
    
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 