<?php
header('Content-Type: application/json');
require 'api/config.php';
require 'api/db.php';

try {
    $currencies = ['USD', 'EUR', 'GBP', 'JPY'];
    $today = new DateTime();
    $days = 30;
    $pdo->beginTransaction();
    $inserted = 0;

    // 1. Insert fake rates for the last 29 days (excluding today) for X->ILS
    foreach ($currencies as $from) {
        if ($from === 'ILS') continue;
        $baseRate = 3 + mt_rand(-100, 100) / 100.0; // e.g., 2.00 - 4.00
        for ($i = $days - 1; $i >= 1; $i--) { // skip today (i=0)
            $date = clone $today;
            $date->modify("-$i days");
            $variation = $baseRate * (mt_rand(-20, 20) / 1000);
            $rate = round($baseRate + $variation, 4);
            $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = VALUES(rate)");
            $stmt->execute([$from, 'ILS', $rate, $date->format('Y-m-d')]);
            $inserted++;
        }
    }

    // 2. Fetch and insert today's real rates for X->ILS from Bank of Israel
    $xmlUrl = 'https://www.boi.org.il/PublicApi/GetExchangeRates?asXml=true';
    $xml = @simplexml_load_file($xmlUrl);
    $todayStr = $today->format('Y-m-d');
    $rates = [];
    if ($xml && isset($xml->ExchangeRates->ExchangeRateResponseDTO)) {
        foreach ($xml->ExchangeRates->ExchangeRateResponseDTO as $currency) {
            $code = (string)$currency->Key;
            $rate = (float)$currency->CurrentExchangeRate;
            $unit = (int)$currency->Unit;
            if ($unit > 0) {
                $rate = $rate / $unit;
            }
            $rates[$code] = $rate;
        }
        // Insert today's real rates for X->ILS
        foreach ($currencies as $from) {
            if ($from === 'ILS') continue;
            if (isset($rates[$from]) && isset($rates['ILS']) && $rates[$from] != 0) {
                $realRate = $rates['ILS'] / $rates[$from];
                $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = VALUES(rate)");
                $stmt->execute([$from, 'ILS', round($realRate, 4), $todayStr]);
                $inserted++;
            }
        }
    }
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Successfully populated $inserted exchange rates (X->ILS only, fake history + real today)",
        'date' => $todayStr
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