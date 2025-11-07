#!/bin/bash

# Script to fix nginx proxy_pass configuration
# This script removes the trailing slash from proxy_pass directive

set -e  # Exit on any error

CONFIG_FILE="/etc/nginx/sites-available/ab-education.ru"
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

echo "=== Nginx Proxy Configuration Fix Script ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: This script must be run as root (use sudo)"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file not found at $CONFIG_FILE"
    exit 1
fi

echo "Step 1: Reading current nginx configuration..."
echo "---"
grep -n "proxy_pass" "$CONFIG_FILE" || echo "No proxy_pass directives found"
echo "---"
echo ""

# Create backup
echo "Step 2: Creating backup at $BACKUP_FILE..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "Backup created successfully"
echo ""

# Fix the proxy_pass configuration
echo "Step 3: Updating proxy_pass directive..."
sed -i 's|proxy_pass http://localhost:3001/;|proxy_pass http://localhost:3001;|g' "$CONFIG_FILE"
echo "Configuration updated"
echo ""

echo "Step 4: New configuration:"
echo "---"
grep -n "proxy_pass" "$CONFIG_FILE"
echo "---"
echo ""

# Test nginx configuration
echo "Step 5: Testing nginx configuration..."
if nginx -t; then
    echo "Nginx configuration test passed!"
    echo ""
    
    # Reload nginx
    echo "Step 6: Reloading nginx..."
    systemctl reload nginx
    echo "Nginx reloaded successfully"
    echo ""
    
    # Wait a moment for nginx to fully reload
    sleep 2
    
    # Test the API endpoint
    echo "Step 7: Testing API endpoint..."
    echo "Running: curl -s -o /dev/null -w '%{http_code}' http://localhost/api/health"
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/health)
    echo "HTTP Response Code: $HTTP_CODE"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo "SUCCESS! The fix appears to be working."
        echo "- HTTP 200: API endpoint is responding correctly"
        echo "- HTTP 404: Nginx is now properly forwarding to the API (endpoint may not exist)"
        echo ""
        echo "Full API response:"
        curl -s http://localhost/api/health || echo "(API endpoint returned an error or doesn't exist)"
    else
        echo "WARNING: Received unexpected HTTP code: $HTTP_CODE"
        echo "The nginx configuration was updated and reloaded, but the API may not be responding."
        echo "Check if your API is running on port 3001."
    fi
else
    echo "ERROR: Nginx configuration test failed!"
    echo "Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "Backup restored. No changes were made to the running configuration."
    exit 1
fi

echo ""
echo "=== Fix Complete ==="
echo "Backup saved at: $BACKUP_FILE"
echo ""
echo "The issue was:"
echo "  - proxy_pass http://localhost:3001/ (with trailing slash)"
echo "  - This strips the /api/ prefix from requests"
echo ""
echo "Fixed to:"
echo "  - proxy_pass http://localhost:3001 (no trailing slash)"
echo "  - This preserves the full request path including /api/"
