<?php
header('Content-Type: application/json');
require 'api/config.php';
require 'api/db.php';

try {
    $xmlUrl = 'https://www.boi.org.il/PublicApi/GetExchangeRates?asXml=true';
    $xml = simplexml_load_file($xmlUrl);

    if (!$xml) {
        echo json_encode(['success' => false, 'message' => 'Failed to load XML from Bank of Israel']);
        exit;
    }

    $today = date('Y-m-d');
    $rates = [];

    // Parse new XML structure
    if (isset($xml->ExchangeRates->ExchangeRateResponseDTO)) {
        foreach ($xml->ExchangeRates->ExchangeRateResponseDTO as $currency) {
            $code = (string)$currency->Key;
            $rate = (float)$currency->CurrentExchangeRate;
            $unit = (int)$currency->Unit;
            if ($unit > 0) {
                $rate = $rate / $unit; // Normalize to per-1-unit
            }
            $rates[$code] = $rate;
        }
    }

    // Add ILS itself
    $rates['ILS'] = 1.0;

    // Prepare rates for your table: all pairs via ILS as base
    $currencies = array_keys($rates);
    $pdo->beginTransaction();
    $inserted = 0;

    // Import fake historical rates from CSV (skip today)
    $csvFile = __DIR__ . '/exchange_rates_2025.csv';
    if (file_exists($csvFile)) {
        if (($handle = fopen($csvFile, 'r')) !== false) {
            // Read header
            fgetcsv($handle);
            $imported = 0;
            while (($row = fgetcsv($handle)) !== false) {
                $currency_from = $row[0];
                $currency_to = $row[1];
                $date = $row[2];
                $rate = $row[3];
                // Only insert for days before today
                if ($date !== $today) {
                    $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = VALUES(rate)");
                    $stmt->execute([$currency_from, $currency_to, $rate, $date]);
                    $imported++;
                }
            }
            fclose($handle);
            // Optionally, you can add to the JSON response:
            // echo "Imported $imported historical rates from CSV.\n";
        }
    }

    // Now fetch and insert today's real rates from Bank of Israel (always overwrite)
    foreach ($currencies as $from) {
        foreach ($currencies as $to) {
            if ($from === $to) {
                $rate = 1.0;
            } else {
                // Convert from->to via ILS as base
                $rate = $rates[$to] / $rates[$from];
            }
            $stmt = $pdo->prepare("
                INSERT INTO exchange_rates (currency_from, currency_to, rate, date)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE rate = VALUES(rate)
            ");
            $stmt->execute([$from, $to, $rate, $today]);
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Successfully populated $inserted exchange rates from Bank of Israel",
        'date' => $today
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