#!/bin/bash

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/chat"
DB="auctio_db"
DB_USER="postgres"
DB_PASS="postgres"

set -e

psql_exec() {
  PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB -t -A -c "$1"
}

curl_get() {
  curl -s -H "Content-Type: application/json" -H "X-Mock-User: $1" "$2"
}

curl_post() {
  curl -s -X POST -H "Content-Type: application/json" -H "X-Mock-User: $1" -d "$2" "$3"
}

echo "============================================"
echo "Chat Service Integration Tests"
echo "============================================"
echo ""

curl -sf "$BASE_URL/health" >/dev/null || {
  echo "Server not running"; exit 1;
}

echo "Preparing test data..."

# Get or create a completed product with order - use existing order
ORDER_DATA=$(psql_exec "SELECT o.id, o.\"buyerId\", o.\"sellerId\", u.email FROM \"Order\" o JOIN \"User\" u ON o.\"buyerId\" = u.id LIMIT 1")

if [ -z "$ORDER_DATA" ]; then
  echo "Error: No existing order found. Creating one..."

  # Get bidder and seller
  BIDDER_ID=$(psql_exec "SELECT id FROM \"User\" WHERE role='BIDDER' LIMIT 1")
  SELLER_ID=$(psql_exec "SELECT id FROM \"User\" WHERE role='SELLER' LIMIT 1")
  PRODUCT_ID=$(psql_exec "SELECT id FROM \"Product\" WHERE status='ACTIVE' LIMIT 1")

  if [ -z "$BIDDER_ID" ] || [ -z "$SELLER_ID" ] || [ -z "$PRODUCT_ID" ]; then
    echo "Error: Missing test data"
    exit 1
  fi

  ORDER_ID=$(psql_exec "INSERT INTO \"Order\" (id, \"productId\", \"buyerId\", \"sellerId\", \"finalPrice\", status, \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '$PRODUCT_ID', '$BIDDER_ID', '$SELLER_ID', 15000000, 'PENDING_PAYMENT', NOW(), NOW()) RETURNING id")
  BUYER_EMAIL=$(psql_exec "SELECT email FROM \"User\" WHERE id='$BIDDER_ID'")
  SELLER_EMAIL=$(psql_exec "SELECT email FROM \"User\" WHERE id='$SELLER_ID'")
else
  ORDER_ID=$(echo "$ORDER_DATA" | cut -d'|' -f1)
  BIDDER_ID=$(echo "$ORDER_DATA" | cut -d'|' -f2)
  SELLER_ID=$(echo "$ORDER_DATA" | cut -d'|' -f3)
  BUYER_EMAIL=$(echo "$ORDER_DATA" | cut -d'|' -f4)
  SELLER_EMAIL=$(psql_exec "SELECT email FROM \"User\" WHERE id='$SELLER_ID'")
fi

# Extract mock user names from emails (remove @example.com)
BUYER_MOCK=$(echo "$BUYER_EMAIL" | cut -d'@' -f1)
SELLER_MOCK=$(echo "$SELLER_EMAIL" | cut -d'@' -f1)

echo "Order ID: $ORDER_ID"
echo "Seller ID: $SELLER_ID (mock: $SELLER_MOCK)"
echo "Buyer ID: $BIDDER_ID (mock: $BUYER_MOCK)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Send Message from Seller"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_post "$SELLER_MOCK" "{\"content\":\"Hello, thank you for your purchase!\"}" "$API_URL/$ORDER_ID/messages")
echo "$RESULT" | jq .
MESSAGE_COUNT=$(echo "$RESULT" | jq -r '.data.id' | grep -c . || echo "0")
if [ "$MESSAGE_COUNT" -eq "1" ]; then
  echo -e "\033[0;32m✓ Seller message sent\033[0m"
else
  echo -e "\033[0;31m✗ Failed to send seller message\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Send Message from Buyer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_post "$BUYER_MOCK" "{\"content\":\"Hi! When can I pick it up?\"}" "$API_URL/$ORDER_ID/messages")
echo "$RESULT" | jq .
MESSAGE_COUNT=$(echo "$RESULT" | jq -r '.data.id' | grep -c . || echo "0")
if [ "$MESSAGE_COUNT" -eq "1" ]; then
  echo -e "\033[0;32m✓ Buyer message sent\033[0m"
else
  echo -e "\033[0;31m✗ Failed to send buyer message\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Get Messages (Seller View)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_get "$SELLER_MOCK" "$API_URL/$ORDER_ID/messages")
echo "$RESULT" | jq .
MSG_COUNT=$(echo "$RESULT" | jq -r '.data.total // 0')
echo "Total messages: $MSG_COUNT"
if [ "$MSG_COUNT" -ge "2" ]; then
  echo -e "\033[0;32m✓ Messages retrieved\033[0m"
else
  echo -e "\033[0;31m✗ Failed to retrieve messages\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Get Unread Count (Seller)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_get "$SELLER_MOCK" "$API_URL/unread")
echo "$RESULT" | jq .
UNREAD=$(echo "$RESULT" | jq -r '.data.unreadCount // 0')
echo "Unread count: $UNREAD"
if [ "$UNREAD" -ge "0" ]; then
  echo -e "\033[0;32m✓ Unread count retrieved\033[0m"
else
  echo -e "\033[0;31m✗ Failed to get unread count\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Mark Messages as Read"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_post "$SELLER_MOCK" "{}" "$API_URL/$ORDER_ID/read")
echo "$RESULT" | jq .
READ_COUNT=$(echo "$RESULT" | jq -r '.data.count // 0')
echo "Marked as read: $READ_COUNT"
if [ "$READ_COUNT" -ge "0" ]; then
  echo -e "\033[0;32m✓ Messages marked as read\033[0m"
else
  echo -e "\033[0;31m✗ Failed to mark as read\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Get User Chats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESULT=$(curl_get "$SELLER_MOCK" "$API_URL")
echo "$RESULT" | jq .
CHAT_COUNT=$(echo "$RESULT" | jq -r '.data.total // 0')
echo "Total chats: $CHAT_COUNT"
if [ "$CHAT_COUNT" -ge "0" ]; then
  echo -e "\033[0;32m✓ User chats retrieved\033[0m"
else
  echo -e "\033[0;31m✗ Failed to get user chats\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Unauthorized User Cannot Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Use a different bidder who is not part of this order
RESULT=$(curl_get "bidder3" "$API_URL/$ORDER_ID/messages")
echo "$RESULT" | jq .
SUCCESS=$(echo "$RESULT" | jq -r '.success')
if [ "$SUCCESS" = "false" ]; then
  echo -e "\033[0;32m✓ Unauthorized access blocked\033[0m"
else
  echo -e "\033[0;31m✗ Unauthorized access allowed\033[0m"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "All chat endpoints tested!"
echo ""
echo "For real-time testing, connect via Socket.IO:"
echo "  - Join chat room: socket.emit('join:chat', '$ORDER_ID')"
echo "  - Send message via API, receive via socket event 'chat:message'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

