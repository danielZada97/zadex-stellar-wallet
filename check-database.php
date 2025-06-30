<?php
header('Content-Type: application/json');
require 'api/config.php';
require 'api/db.php';

try {
    $results = [];
    
    // Check if database exists
    $stmt = $pdo->query("SELECT DATABASE() as current_db");
    $currentDb = $stmt->fetch();
    $results['current_database'] = $currentDb['current_db'];
    
    // Check all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $results['tables'] = $tables;
    
    // Check exchange_rates table structure
    if (in_array('exchange_rates', $tables)) {
        $stmt = $pdo->query("DESCRIBE exchange_rates");
        $columns = $stmt->fetchAll();
        $results['exchange_rates_structure'] = $columns;
        
        // Check if there are any records
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM exchange_rates");
        $count = $stmt->fetch();
        $results['exchange_rates_count'] = $count['count'];
        
        // Check for USD to EUR rate specifically
        $stmt = $pdo->prepare("SELECT * FROM exchange_rates WHERE currency_from = 'USD' AND currency_to = 'EUR'");
        $stmt->execute();
        $usd_eur = $stmt->fetch();
        $results['usd_to_eur_exists'] = $usd_eur ? true : false;
        if ($usd_eur) {
            $results['usd_to_eur_rate'] = $usd_eur['rate'];
        }
    } else {
        $results['exchange_rates_structure'] = 'Table does not exist';
        $results['exchange_rates_count'] = 0;
        $results['usd_to_eur_exists'] = false;
    }
    
    // Check wallets table
    if (in_array('wallets', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM wallets");
        $count = $stmt->fetch();
        $results['wallets_count'] = $count['count'];
    }
    
    // Check users table
    if (in_array('users', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $count = $stmt->fetch();
        $results['users_count'] = $count['count'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 