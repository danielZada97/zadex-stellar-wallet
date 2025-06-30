<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'config.php';
require 'db.php';

// If 'from' and 'to' are provided, return today's rate for that pair
if (isset($_GET['from']) && isset($_GET['to'])) {
    $from = strtoupper(trim($_GET['from']));
    $to = strtoupper(trim($_GET['to']));
    $today = date('Y-m-d');
    $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = ? AND date = ?");
    $stmt->execute([$from, $to, $today]);
    $rate = $stmt->fetchColumn();
    if ($rate !== false) {
        echo json_encode([
            'success' => true,
            'from' => $from,
            'to' => $to,
            'date' => $today,
            'rate' => (float)$rate
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No rate found for today',
            'from' => $from,
            'to' => $to,
            'date' => $today
        ]);
    }
    exit;
}

$url = 'https://www.boi.org.il/currency.xml';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response || $http_code !== 200) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch rates from Bank of Israel',
        'http_code' => $http_code
    ]);
    exit;
}

$data = json_decode($response, true);
if (!$data || !isset($data['exchangeRates'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to parse JSON from Bank of Israel',
    ]);
    exit;
}

$currencies = ['USD', 'EUR', 'GBP', 'JPY'];
$inserted = 0;
$latest = [];
$date = null;

foreach ($data['exchangeRates'] as $rate) {
    $code = $rate['key'];
    if (in_array($code, $currencies)) {
        $unit = $rate['unit'];
        $value = $rate['currentExchangeRate'] / $unit;
        $date = substr($rate['lastUpdate'], 0, 10); // YYYY-MM-DD
        $stmt = $pdo->prepare("INSERT INTO exchange_rates (currency_from, currency_to, rate, date) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate = VALUES(rate), date = VALUES(date)");
        $stmt->execute([$code, 'ILS', $value, $date]);
        $inserted++;
        $latest[] = [
            'currency_from' => $code,
            'currency_to' => 'ILS',
            'rate' => $value,
            'date' => $date
        ];
        // Insert reverse rate ILS->XXX
        if ($value != 0) {
            $reverse_rate = 1 / $value;
            $stmt->execute(['ILS', $code, $reverse_rate, $date]);
            $inserted++;
        }
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Rates updated from Bank of Israel',
    'latest' => $latest,
    'inserted' => $inserted
]);
