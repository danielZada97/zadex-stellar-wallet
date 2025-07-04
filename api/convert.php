<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

// Always update exchange rates before conversion
exec('php /var/www/html/populate-rates.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['user_id'], $data['from_currency'], $data['to_currency'], $data['amount'])) {
    echo json_encode(['success' => false, 'message' => 'user_id, from_currency, to_currency, and amount are required']);
    exit;
}

$user_id = (int)$data['user_id'];
$from_currency = strtoupper(trim($data['from_currency']));
$to_currency = strtoupper(trim($data['to_currency']));
$amount = (float)$data['amount'];

if ($amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Amount must be greater than zero']);
    exit;
}

if ($from_currency === $to_currency) {
    echo json_encode(['success' => false, 'message' => 'Cannot convert to the same currency']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Check user's balance in source currency
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$user_id, $from_currency]);
    $from_balance = $stmt->fetchColumn();

    if ($from_balance === false || $from_balance < $amount) {
        throw new Exception('Insufficient funds in ' . $from_currency);
    }

    // Get exchange rate from the database (Bank of Israel only)
    $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = ? ORDER BY date DESC LIMIT 1");
    $stmt->execute([$from_currency, $to_currency]);
    $rate = $stmt->fetchColumn();

    // If direct rate not found, try cross rate via ILS
    if (!$rate) {
        if ($from_currency !== 'ILS' && $to_currency !== 'ILS') {
            // Get from_currency -> ILS
            $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = 'ILS' ORDER BY date DESC LIMIT 1");
            $stmt->execute([$from_currency]);
            $from_to_ils = $stmt->fetchColumn();
            // Get to_currency -> ILS
            $stmt->execute([$to_currency]);
            $to_to_ils = $stmt->fetchColumn();
            if ($from_to_ils && $to_to_ils) {
                $rate = $from_to_ils / $to_to_ils;
            }
        }
    }

    // If still not found, try reverse rate
    if (!$rate) {
        $stmt = $pdo->prepare("SELECT rate FROM exchange_rates WHERE currency_from = ? AND currency_to = ? ORDER BY date DESC LIMIT 1");
        $stmt->execute([$to_currency, $from_currency]);
        $reverse_rate = $stmt->fetchColumn();
        if ($reverse_rate && $reverse_rate != 0) {
            $rate = 1 / $reverse_rate;
        }
    }

    if (!$rate) {
        throw new Exception('Exchange rate not found for ' . $from_currency . ' to ' . $to_currency . '. Please update rates.');
    }

    // Convert
    $converted_amount = $amount * $rate;

    // Update balances
    $stmt = $pdo->prepare("UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?");
    $stmt->execute([$amount, $user_id, $from_currency]);

    $stmt = $pdo->prepare("
        INSERT INTO wallets (user_id, currency, balance)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE balance = balance + VALUES(balance)
    ");
    $stmt->execute([$user_id, $to_currency, $converted_amount]);

    // Fetch updated balances
    $stmt = $pdo->prepare("SELECT balance FROM wallets WHERE user_id = ? AND currency = ?");
    $stmt->execute([$user_id, $from_currency]);
    $from_balance_after = $stmt->fetchColumn();

    $stmt->execute([$user_id, $to_currency]);
    $to_balance_after = $stmt->fetchColumn();

    // Record transaction
    $stmt = $pdo->prepare("
        INSERT INTO transactions (user_id, type, currency_from, currency_to, amount, rate, balance_after, status)
        VALUES (?, 'convert', ?, ?, ?, ?, ?, 'completed')
    ");
    $stmt->execute([$user_id, $from_currency, $to_currency, $amount, $rate, $to_balance_after]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'converted_amount' => round($converted_amount, 2),
        'from_balance' => round($from_balance_after, 2),
        'to_balance' => round($to_balance_after, 2),
        'rate' => $rate
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
