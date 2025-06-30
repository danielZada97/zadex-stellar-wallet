<?php
require_once 'config.php';

// Get database configuration from environment variables
$db_host = Config::get('DB_HOST', 'localhost');
$db_name = Config::get('DB_NAME', 'zadex');
$db_user = Config::get('DB_USER', 'root');
$db_pass = Config::get('DB_PASS', '');
$db_port = Config::get('DB_PORT', '3306');
$db_charset = Config::get('DB_CHARSET', 'utf8mb4');

try {
    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=$db_charset";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
