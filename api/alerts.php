<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get alerts for a user
    if (!isset($_GET['user_id'])) {
        echo json_encode(['success' => false, 'message' => 'user_id is required']);
        exit;
    }
    $user_id = (int)$_GET['user_id'];
    $stmt = $pdo->prepare("SELECT * FROM alerts WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $alerts = $stmt->fetchAll();
    echo json_encode(['success' => true, 'data' => $alerts]);
    exit;
}

if ($method === 'POST') {
    // Create a new alert
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['user_id'], $data['currency'], $data['threshold'], $data['direction'])) {
        echo json_encode(['success' => false, 'message' => 'user_id, currency, threshold, and direction are required']);
        exit;
    }
    $user_id = (int)$data['user_id'];
    $currency = strtoupper(trim($data['currency']));
    $threshold = (float)$data['threshold'];
    $direction = $data['direction'] === 'above' ? 'above' : 'below';

    try {
        $stmt = $pdo->prepare("INSERT INTO alerts (user_id, currency, threshold, direction) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $currency, $threshold, $direction]);
        $alert_id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT * FROM alerts WHERE id = ?");
        $stmt->execute([$alert_id]);
        $alert = $stmt->fetch();
        echo json_encode(['success' => true, 'data' => $alert, 'message' => 'Alert created']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to create alert', 'error' => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    // Delete an alert by ID
    parse_str($_SERVER['QUERY_STRING'], $query);
    if (!isset($query['alert_id'])) {
        echo json_encode(['success' => false, 'message' => 'alert_id is required']);
        exit;
    }
    $alert_id = (int)$query['alert_id'];
    $stmt = $pdo->prepare("DELETE FROM alerts WHERE id = ?");
    $stmt->execute([$alert_id]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Alert deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Alert not found or already deleted']);
    }
    exit;
}

// If method is not handled
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
exit;