#!/bin/bash

# Test Auction Settings API
# Make sure backend is running before executing this script

BACKEND_URL="http://localhost:3000"

echo "======================================"
echo "Test Auction Settings API"
echo "======================================"
echo ""

# Login as admin first
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST "$BACKEND_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Get current settings
echo "2. Getting current auction settings..."
GET_RESPONSE=$(curl -s -b cookies.txt "$BACKEND_URL/api/admin/auction-settings")
echo "$GET_RESPONSE" | jq '.'
echo ""

# Update settings
echo "3. Updating auction settings..."
UPDATE_RESPONSE=$(curl -s -b cookies.txt -X PUT "$BACKEND_URL/api/admin/auction-settings" \
  -H "Content-Type: application/json" \
  -d '{
    "autoExtendThreshold": 3,
    "autoExtendDuration": 15,
    "autoExtendDefault": false
  }')

echo "$UPDATE_RESPONSE" | jq '.'
echo ""

# Get updated settings
echo "4. Verifying updated settings..."
VERIFY_RESPONSE=$(curl -s -b cookies.txt "$BACKEND_URL/api/admin/auction-settings")
echo "$VERIFY_RESPONSE" | jq '.'
echo ""

# Reset to defaults
echo "5. Resetting to default settings..."
RESET_RESPONSE=$(curl -s -b cookies.txt -X PUT "$BACKEND_URL/api/admin/auction-settings" \
  -H "Content-Type: application/json" \
  -d '{
    "autoExtendThreshold": 5,
    "autoExtendDuration": 10,
    "autoExtendDefault": true
  }')

echo "$RESET_RESPONSE" | jq '.'
echo ""

# Clean up
rm -f cookies.txt

echo "======================================"
echo "Test completed!"
echo "======================================"

