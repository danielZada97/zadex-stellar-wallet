<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

$currency = isset($_GET['currency']) ? strtoupper(trim($_GET['currency'])) : null;
$to = 'ILS';
$limit = isset($_GET['days']) ? (int)$_GET['days'] : 30;
if ($limit < 1 || $limit > 365) $limit = 30;

if (!$currency) {
    echo json_encode(['success' => false, 'message' => 'currency parameter is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT rate, date FROM exchange_rates WHERE currency_from = ? AND currency_to = ? ORDER BY date DESC LIMIT ?");
    $stmt->execute([$currency, $to, $limit]);
    $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode([
        'success' => true,
        'history' => array_reverse($rates) // so oldest is first
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 