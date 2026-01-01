#!/bin/bash

# Test Proxy Bidding Logic
# Verify that the bidding system works according to proxy bidding rules

BASE_URL="http://localhost:3000"

echo "========================================"
echo "🧪 Testing Proxy Bidding Logic"
echo "========================================"
echo ""

# Test credentials
BIDDER1_EMAIL="bidder1@example.com"
BIDDER1_PASS="password123"

BIDDER2_EMAIL="bidder2@example.com"
BIDDER2_PASS="password123"

BIDDER3_EMAIL="bidder3@example.com"
BIDDER3_PASS="password123"

echo "📝 Test Account Credentials:"
echo "   Bidder 1: $BIDDER1_EMAIL / $BIDDER1_PASS"
echo "   Bidder 2: $BIDDER2_EMAIL / $BIDDER2_PASS"
echo "   Bidder 3: $BIDDER3_EMAIL / $BIDDER3_PASS"
echo ""

# Function to login and get token
login() {
    local email=$1
    local password=$2

    RESPONSE=$(curl -s -X POST "${BASE_URL}/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"captcha\": \"test-token\"
        }")

    TOKEN=$(echo "$RESPONSE" | jq -r '.accessToken')
    echo "$TOKEN"
}

# Function to place bid
place_bid() {
    local token=$1
    local product_id=$2
    local max_amount=$3

    curl -s -X POST "${BASE_URL}/api/bids" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "{
            \"productId\": \"$product_id\",
            \"maxAmount\": $max_amount
        }"
}

# Function to get current winner
get_winner() {
    local token=$1
    local product_id=$2

    curl -s -X GET "${BASE_URL}/api/bids/product/$product_id/winner" \
        -H "Authorization: Bearer $token"
}

echo "🔑 Logging in users..."
TOKEN1=$(login "$BIDDER1_EMAIL" "$BIDDER1_PASS")
TOKEN2=$(login "$BIDDER2_EMAIL" "$BIDDER2_PASS")
TOKEN3=$(login "$BIDDER3_EMAIL" "$BIDDER3_PASS")

if [ -z "$TOKEN1" ] || [ -z "$TOKEN2" ] || [ -z "$TOKEN3" ]; then
    echo "❌ Login failed!"
    exit 1
fi

echo "✅ All users logged in successfully"
echo ""

# Use the auto-bid test product
PRODUCT_ID="prod-auto-bid-test"

echo "📦 Testing on product: $PRODUCT_ID"
echo "   Start Price: 10,000,000 VND"
echo "   Step Price: 100,000 VND"
echo ""

echo "========================================"
echo "Test Case 1: First Bid"
echo "========================================"
echo "Bidder1 bids with max = 11,000,000 VND"
RESULT=$(place_bid "$TOKEN1" "$PRODUCT_ID" 11000000)
echo "$RESULT" | jq '.'

WINNER=$(get_winner "$TOKEN1" "$PRODUCT_ID")
CURRENT_PRICE=$(echo "$WINNER" | jq -r '.data.currentPrice')
WINNER_NAME=$(echo "$WINNER" | jq -r '.data.currentWinner.fullName')

echo "✅ Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
echo "✅ Current Winner: $WINNER_NAME"
echo "📊 Expected: 10,000,000 VND (start price)"
echo ""

echo "========================================"
echo "Test Case 2: New Max < Current Max"
echo "========================================"
echo "Bidder2 bids with max = 10,800,000 VND"
echo "Expected: Bidder1 still wins, price = 10,900,000"
RESULT=$(place_bid "$TOKEN2" "$PRODUCT_ID" 10800000)
echo "$RESULT" | jq '.'

WINNER=$(get_winner "$TOKEN1" "$PRODUCT_ID")
CURRENT_PRICE=$(echo "$WINNER" | jq -r '.data.currentPrice')
WINNER_NAME=$(echo "$WINNER" | jq -r '.data.currentWinner.fullName')

echo "✅ Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
echo "✅ Current Winner: $WINNER_NAME"
echo "📊 Expected: 10,900,000 VND (Bidder2's max + step)"
echo ""

echo "========================================"
echo "Test Case 3: New Max > Current Max"
echo "========================================"
echo "Bidder3 bids with max = 12,000,000 VND"
echo "Expected: Bidder3 wins, price = 11,100,000"
RESULT=$(place_bid "$TOKEN3" "$PRODUCT_ID" 12000000)
echo "$RESULT" | jq '.'

WINNER=$(get_winner "$TOKEN1" "$PRODUCT_ID")
CURRENT_PRICE=$(echo "$WINNER" | jq -r '.data.currentPrice')
WINNER_NAME=$(echo "$WINNER" | jq -r '.data.currentWinner.fullName')

echo "✅ Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
echo "✅ Current Winner: $WINNER_NAME"
echo "📊 Expected: 11,100,000 VND (old max + step)"
echo ""

echo "========================================"
echo "Test Case 4: New Max = Current Max"
echo "========================================"
echo "Bidder1 bids again with max = 12,000,000 VND"
echo "Expected: Bidder3 still wins (first-come priority)"
RESULT=$(place_bid "$TOKEN1" "$PRODUCT_ID" 12000000)
echo "$RESULT" | jq '.'

WINNER=$(get_winner "$TOKEN1" "$PRODUCT_ID")
CURRENT_PRICE=$(echo "$WINNER" | jq -r '.data.currentPrice')
WINNER_NAME=$(echo "$WINNER" | jq -r '.data.currentWinner.fullName')

echo "✅ Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
echo "✅ Current Winner: $WINNER_NAME"
echo "📊 Expected: 12,000,000 VND, Winner: Bidder #3 (came first)"
echo ""

echo "========================================"
echo "Test Case 5: Incremental Increases"
echo "========================================"
echo "Bidder2 bids with max = 12,500,000 VND"
echo "Expected: Bidder2 wins, price = 12,100,000"
RESULT=$(place_bid "$TOKEN2" "$PRODUCT_ID" 12500000)
echo "$RESULT" | jq '.'

WINNER=$(get_winner "$TOKEN1" "$PRODUCT_ID")
CURRENT_PRICE=$(echo "$WINNER" | jq -r '.data.currentPrice')
WINNER_NAME=$(echo "$WINNER" | jq -r '.data.currentWinner.fullName')

echo "✅ Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
echo "✅ Current Winner: $WINNER_NAME"
echo "📊 Expected: 12,100,000 VND (previous max + step)"
echo ""

echo "========================================"
echo "📊 Final Bid History"
echo "========================================"
curl -s -X GET "${BASE_URL}/api/bids/product/${PRODUCT_ID}?limit=10" \
    -H "Authorization: Bearer $TOKEN1" | jq '.data.bids[] | {bidder: .bidder.fullName, amount: .amount, isAutoBid: .isAutoBid}'

echo ""
echo "========================================"
echo "✅ Proxy Bidding Test Complete!"
echo "========================================"

