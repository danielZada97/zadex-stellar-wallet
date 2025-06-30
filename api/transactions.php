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

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing user_id']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            t.id,
            t.type,
            t.currency_from,
            t.currency_to,
            t.amount,
            t.rate,
            t.balance_after,
            t.created_at,
            t.status,
            u.name AS counterparty_name
        FROM transactions t
        LEFT JOIN users u ON t.counterparty_id = u.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $transactions
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
