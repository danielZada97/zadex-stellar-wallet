<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['user_id'], $data['currency'], $data['amount'])) {
    echo json_encode(['success' => false, 'message' => 'user_id, currency, and amount are required']);
    exit;
}

$user_id = (int)$data['user_id'];
$currency = strtoupper(trim($data['currency']));
$amount = (float)$data['amount'];

if ($amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Amount must be greater than zero']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Insert the transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions (user_id, type, currency_from, currency_to, amount, rate, balance_after, status)
        VALUES (?, 'deposit', ?, ?, ?, 1, 0, 'completed')
    ");
    $stmt->execute([$user_id, $currency, $currency, $amount]);

    // Update or insert into wallet
    $stmt = $pdo->prepare("
        INSERT INTO wallets (user_id, currency, balance)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)
    ");
    $stmt->execute([$user_id, $currency, $amount]);

    // Fetch the new balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$user_id, $currency]);
    $new_balance = $stmt->fetchColumn();

    // Update the balance_after in the last transaction
    $stmt = $pdo->prepare("UPDATE transactions SET balance_after = ? WHERE id = LAST_INSERT_ID()");
    $stmt->execute([$new_balance]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'new_balance' => $new_balance,
            'message' => 'Deposit successful'
        ]
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Deposit failed', 'error' => $e->getMessage()]);
}
