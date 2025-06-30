<?php
/**
 * Configuration Loader
 * Loads environment variables from .env file
 */

class Config {
    private static $config = [];
    
    /**
     * Load environment variables from .env file
     */
    public static function load($envFile = null) {
        if ($envFile === null) {
            // Try to find .env file in different locations
            $possiblePaths = [
                __DIR__ . '/../.env',
                __DIR__ . '/.env',
                dirname(__DIR__) . '/.env'
            ];
            
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    $envFile = $path;
                    break;
                }
            }
        }
        
        if ($envFile && file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }
                
                // Parse key=value pairs
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    
                    // Remove quotes if present
                    if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                        (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                        $value = substr($value, 1, -1);
                    }
                    
                    self::$config[$key] = $value;
                    
                    // Also set as environment variable if not already set
                    if (!getenv($key)) {
                        putenv("$key=$value");
                        $_ENV[$key] = $value;
                        $_SERVER[$key] = $value;
                    }
                }
            }
        }
    }
    
    /**
     * Get a configuration value
     */
    public static function get($key, $default = null) {
        // First check if it's already loaded
        if (empty(self::$config)) {
            self::load();
        }
        
        // Check in order: config array, environment variable, default
        if (isset(self::$config[$key])) {
            return self::$config[$key];
        }
        
        if (getenv($key) !== false) {
            return getenv($key);
        }
        
        return $default;
    }
    
    /**
     * Get all configuration values
     */
    public static function all() {
        if (empty(self::$config)) {
            self::load();
        }
        return self::$config;
    }
    
    /**
     * Check if a configuration key exists
     */
    public static function has($key) {
        if (empty(self::$config)) {
            self::load();
        }
        return isset(self::$config[$key]) || getenv($key) !== false;
    }
}

// Auto-load configuration when this file is included
Config::load(); 