#!/bin/bash

# Test Auction Scheduler
# This script tests the auction scheduler functionality

BACKEND_URL="http://localhost:3000"

echo "======================================"
echo "Test Auction Scheduler"
echo "======================================"
echo ""

# Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST "$BACKEND_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Manually trigger close expired auctions
echo "2. Manually closing expired auctions..."
CLOSE_RESPONSE=$(curl -s -b cookies.txt -X POST "$BACKEND_URL/api/admin/close-expired-auctions")

echo "$CLOSE_RESPONSE" | jq '.'
echo ""

# Get products to verify
echo "3. Checking products status..."
PRODUCTS_RESPONSE=$(curl -s -b cookies.txt "$BACKEND_URL/api/admin/products?limit=5")

echo "$PRODUCTS_RESPONSE" | jq '.data.products[] | {id: .id, title: .title, status: .status, endTime: .endTime}'
echo ""

# Clean up
rm -f cookies.txt

echo "======================================"
echo "Test completed!"
echo "======================================"
echo ""
echo "📝 Notes:"
echo "- Scheduler runs automatically every 60 seconds"
echo "- You can also trigger manually via API endpoint"
echo "- Check logs for scheduler activity"

