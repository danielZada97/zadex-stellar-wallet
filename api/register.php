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

if (!isset($data['name'], $data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Name, email, and password required']);
    exit;
}

$name = $data['name'];
$email = $data['email'];
$password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
$preferred_currency = $data['preferred_currency'] ?? 'ILS';

// Validate preferred_currency
$allowed_currencies = ['USD', 'EUR', 'ILS', 'GBP', 'JPY'];
if (!in_array($preferred_currency, $allowed_currencies)) {
    echo json_encode(['success' => false, 'message' => 'Invalid preferred currency']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, preferred_currency) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password_hash, $preferred_currency]);
    $user_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => $user_id,
            'name' => $name,
            'preferred_currency' => $preferred_currency
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) { // Duplicate entry
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
}