<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

$debug = [];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Only POST method allowed', 'debug' => $debug]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$debug['input'] = $data;

if (!isset($data['from_user_id'], $data['to_user_email'], $data['from_currency'], $data['to_currency'], $data['amount'])) {
    echo json_encode(['success' => false, 'message' => 'from_user_id, to_user_email, from_currency, to_currency, and amount are required', 'debug' => $debug]);
    exit;
}

$from_user_id = (int)$data['from_user_id'];
$to_user_email = trim($data['to_user_email']);
$from_currency = strtoupper(trim($data['from_currency']));
$to_currency = strtoupper(trim($data['to_currency']));
$amount = (float)$data['amount'];

$debug['from_user_id'] = $from_user_id;
$debug['to_user_email'] = $to_user_email;
$debug['from_currency'] = $from_currency;
$debug['to_currency'] = $to_currency;
$debug['amount'] = $amount;

if ($amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Amount must be greater than zero', 'debug' => $debug]);
    exit;
}

try {
    $pdo->beginTransaction();

    // Find recipient user by email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$to_user_email]);
    $to_user_id = $stmt->fetchColumn();
    $debug['to_user_id'] = $to_user_id;

    if (!$to_user_id) {
        $pdo->rollBack();
        $debug['users_found'] = false;
        echo json_encode([
            'success' => false,
            'message' => 'Recipient user does not exist. Please check the email address.',
            'debug' => $debug
        ]);
        exit;
    }

    // Prevent transferring to yourself
    if ($from_user_id === (int)$to_user_id) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false,
            'message' => 'You cannot transfer funds to yourself.',
            'debug' => $debug
        ]);
        exit;
    }

    // Check sender balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$from_user_id, $from_currency]);
    $from_balance = $stmt->fetchColumn();
    $debug['from_balance'] = $from_balance;

    if ($from_balance === false || $from_balance < $amount) {
        $pdo->rollBack();
        $debug['insufficient_funds'] = true;
        echo json_encode([
            'success' => false,
            'message' => "Insufficient funds in $from_currency",
            'debug' => $debug
        ]);
        exit;
    }

    // Get exchange rate
    if ($from_currency === $to_currency) {
        $rate = 1;
        $debug['exchange_rate'] = $rate;
        $debug['same_currency'] = true;
    } else {
        $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = ? ORDER BY date DESC LIMIT 1");
        $stmt->execute([$from_currency, $to_currency]);
        $rate = $stmt->fetchColumn();
        $debug['exchange_rate'] = $rate;
        $debug['same_currency'] = false;

        // If direct rate not found, try reverse rate
        if ($rate === false || $rate == 0) {
            $stmt->execute([$to_currency, $from_currency]);
            $reverse_rate = $stmt->fetchColumn();
            if ($reverse_rate && $reverse_rate != 0) {
                $rate = 1 / $reverse_rate;
                $debug['exchange_rate'] = $rate;
                $debug['used_reverse_rate'] = true;
            }
        }
    }

    if ($rate === false) {
        $pdo->rollBack();
        $debug['exchange_rate_found'] = false;
        echo json_encode([
            'success' => false,
            'message' => 'Exchange rate not found',
            'debug' => $debug
        ]);
        exit;
    }

    $converted_amount = $amount * $rate;
    $debug['converted_amount'] = $converted_amount;

    // Deduct from sender
    $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?");
    $stmt->execute([$amount, $from_user_id, $from_currency]);

    // Add to recipient
    $stmt = $pdo->prepare("INSERT INTO wallets (user_id, currency, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)");
    $stmt->execute([$to_user_id, $to_currency, $converted_amount]);

    // Get new sender balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$from_user_id, $from_currency]);
    $from_new_balance = $stmt->fetchColumn();
    $debug['from_new_balance'] = $from_new_balance;

    // Record transaction for sender
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, currency_from, currency_to, amount, rate, balance_after, status, counterparty_id) VALUES (?, 'transfer', ?, ?, ?, ?, ?, 'completed', ?)");
    $stmt->execute([$from_user_id, $from_currency, $to_currency, $amount, $rate, $from_new_balance, $to_user_id]);

    // Record transaction for recipient
    // Get new recipient balance
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$to_user_id, $to_currency]);
    $to_new_balance = $stmt->fetchColumn();
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, type, currency_from, currency_to, amount, rate, balance_after, status, counterparty_id) VALUES (?, 'receive', ?, ?, ?, ?, ?, 'completed', ?)");
    $stmt->execute([$to_user_id, $from_currency, $to_currency, $converted_amount, $rate, $to_new_balance, $from_user_id]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Transfer successful',
        'data' => [
            'from_user_id' => $from_user_id,
            'to_user_id' => $to_user_id,
            'from_currency' => $from_currency,
            'to_currency' => $to_currency,
            'amount' => $amount,
            'rate' => $rate,
            'converted_amount' => $converted_amount,
            'from_new_balance' => $from_new_balance
        ],
        'debug' => $debug
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    $debug['exception'] = $e->getMessage();
    echo json_encode([
        'success' => false,
        'message' => 'Transfer failed',
        'error' => $e->getMessage(),
        'debug' => $debug
    ]);
}
