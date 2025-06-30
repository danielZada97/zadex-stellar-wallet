<?php
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input
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

    // Check balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$user_id, $currency]);
    $balance = $stmt->fetchColumn();

    if ($balance === false || $balance < $amount) {
        throw new Exception('Insufficient funds');
    }

    // Deduct balance
    $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?");
    $stmt->execute([$amount, $user_id, $currency]);

    // Get new balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$user_id, $currency]);
    $new_balance = $stmt->fetchColumn();

    // Log transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions (user_id, type, currency_from, currency_to, amount, rate, balance_after)
        VALUES (?, 'withdraw', ?, ?, ?, 1, ?)
    ");
    $stmt->execute([$user_id, $currency, $currency, $amount, $new_balance]);

    $pdo->commit();

    echo json_encode(['success' => true, 'new_balance' => $new_balance]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
