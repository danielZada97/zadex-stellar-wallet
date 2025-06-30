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

if (!isset($data['email'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

$email = $data['email'];
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    echo json_encode([
        'success' => true,
        'data' => [
            'user_id' => $user['id'],
            'name' => $user['name'],
            'preferred_currency' => $user['preferred_currency'] ?? 'ILS'
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
