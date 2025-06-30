<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Only GET method allowed']);
    exit;
}

if (!isset($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'user_id is required']);
    exit;
}

$user_id = (int)$_GET['user_id'];
$display_currency = $_GET['display_currency'] ?? 'ILS';

try {
    // Get all balances for the user
    $stmt = $pdo->prepare("SELECT currency, balance FROM wallets WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $balances = $stmt->fetchAll();

    // Convert to the format expected by frontend
    $balance_data = [];
    foreach ($balances as $balance) {
        $balance_data[$balance['currency']] = (float)$balance['balance'];
    }

    // If no balances found, return empty object
    if (empty($balance_data)) {
        $balance_data = [];
    }

    echo json_encode([
        'success' => true,
        'data' => $balance_data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to get balance', 'error' => $e->getMessage()]);
} 