#!/bin/bash
set -e

# Wait for MySQL to be ready
until mysqladmin ping -h "$DB_HOST" --silent; do
  echo 'Waiting for MySQL...'
  sleep 2
done

# Create schema if not exists
mysql -h "$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < /var/www/html/database-schema.sql

# Start Apache in the foreground
apache2-foreground 