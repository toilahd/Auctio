#!/bin/bash

BASE_URL="http://localhost:3000"
BIDDER1="bidder1"
BIDDER2="bidder2"
SELLER1="seller1"

echo "=========================================="
echo "Testing Bidder Features (Section 2.1-2.6)"
echo "=========================================="

# Get a test product ID
PRODUCT_ID=$(PGPASSWORD=postgres psql -h localhost -U postgres -d auctio_db -t -A -c "SELECT id FROM \"Product\" WHERE status='ACTIVE' LIMIT 1;" 2>/dev/null | tr -d ' ')

echo -e "\nTest Product ID: $PRODUCT_ID"

echo -e "\n=========================================="
echo "2.1 Watchlist Management"
echo "=========================================="

echo -e "\n1. Add product to watchlist:"
curl -s -X POST "$BASE_URL/api/watchlist" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"productId\":\"$PRODUCT_ID\"}" | jq '{success, message}'

echo -e "\n2. Check if product is in watchlist:"
curl -s "$BASE_URL/api/watchlist/check/$PRODUCT_ID" \
  -H "X-Mock-User: $BIDDER1" | jq '{success, inWatchlist: .data.inWatchlist}'

echo -e "\n3. Get user's watchlist:"
curl -s "$BASE_URL/api/watchlist" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    total: .data.pagination.total,
    products: .data.products | map({title, currentPrice, addedAt})
  }'

echo -e "\n4. Remove from watchlist:"
curl -s -X DELETE "$BASE_URL/api/watchlist/$PRODUCT_ID" \
  -H "X-Mock-User: $BIDDER1" | jq '{success, message}'

echo -e "\n=========================================="
echo "2.2 Bidding with Rating Check"
echo "=========================================="

echo -e "\n1. Check bidder rating before bidding:"
curl -s "$BASE_URL/api/users/profile" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    fullName: .data.fullName,
    positiveRatings: .data.positiveRatings,
    negativeRatings: .data.negativeRatings,
    totalRatings: .data.totalRatings,
    ratingPercentage: .data.ratingPercentage
  }'

echo -e "\n2. Place bid (with automatic rating check):"
curl -s -X POST "$BASE_URL/api/bids" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":11000000}" | jq '{
    success,
    message,
    currentPrice: .data.currentPrice,
    winnerId: .data.winnerId
  }'

echo -e "\n=========================================="
echo "2.3 Bid History (Masked Names)"
echo "=========================================="

echo -e "\nGet bid history with masked bidder names:"
curl -s "$BASE_URL/api/bids/product/$PRODUCT_ID" | jq '{
  success,
  total: .data.total,
  bids: .data.bids | map({
    amount,
    bidder: .bidder.fullName,
    time: .createdAt,
    isAutoBid
  })
}'

echo -e "\n=========================================="
echo "2.4 Q&A System"
echo "=========================================="

echo -e "\n1. Ask a question about the product:"
QUESTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/questions" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"content\":\"Is this product in good condition?\"}")
echo "$QUESTION_RESPONSE" | jq '{success, message}'

QUESTION_ID=$(echo "$QUESTION_RESPONSE" | jq -r '.data.id')

echo -e "\n2. Get all questions for the product:"
curl -s "$BASE_URL/api/questions/product/$PRODUCT_ID" | jq '{
  success,
  questions: .data | map({
    asker: .asker.fullName,
    question: .content,
    answered: (.answer != null)
  })
}'

echo -e "\n3. Seller answers the question:"
curl -s -X POST "$BASE_URL/api/questions/$QUESTION_ID/answer" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $SELLER1" \
  -d "{\"content\":\"Yes, the product is in excellent condition!\"}" | jq '{success, message}'

echo -e "\n4. View Q&A again (with answer):"
curl -s "$BASE_URL/api/questions/product/$PRODUCT_ID" | jq '{
  success,
  qa: .data | map({
    asker: .asker.fullName,
    question: .content,
    answer: .answer.content
  })
}'

echo -e "\n=========================================="
echo "2.5 User Profile Management"
echo "=========================================="

echo -e "\n1. Get current profile:"
curl -s "$BASE_URL/api/users/profile" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    fullName: .data.fullName,
    email: .data.email,
    role: .data.role,
    ratings: {
      positive: .data.positiveRatings,
      negative: .data.negativeRatings,
      percentage: .data.ratingPercentage
    }
  }'

echo -e "\n2. Update profile:"
curl -s -X PUT "$BASE_URL/api/users/profile" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"fullName\":\"Alice Updated\",\"address\":\"123 New Street\"}" | jq '{success, message}'

echo -e "\n3. Change password:"
curl -s -X POST "$BASE_URL/api/users/change-password" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"oldPassword\":\"password123\",\"newPassword\":\"newpassword123\"}" | jq '{success, message}'

echo -e "\n4. Get detailed ratings:"
curl -s "$BASE_URL/api/users/ratings" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    summary: .data.summary,
    ratingsCount: (.data.ratings | length)
  }'

echo -e "\n5. Get watchlist (from profile):"
curl -s "$BASE_URL/api/watchlist" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    total: .data.pagination.total
  }'

echo -e "\n6. Get bidding products:"
curl -s "$BASE_URL/api/users/bidding-products" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    total: .data.pagination.total,
    products: .data.products | map({title, isWinning, currentPrice})
  }'

echo -e "\n7. Get won products:"
curl -s "$BASE_URL/api/users/won-products" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    total: .data.pagination.total,
    products: .data.products | map({title, currentPrice})
  }'

echo -e "\n8. Rate a seller:"
SELLER_ID=$(PGPASSWORD=postgres psql -h localhost -U postgres -d auctio_db -t -A -c "SELECT id FROM \"User\" WHERE role='SELLER' LIMIT 1;" 2>/dev/null | tr -d ' ')
curl -s -X POST "$BASE_URL/api/users/rate-seller" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User: $BIDDER1" \
  -d "{\"toUserId\":\"$SELLER_ID\",\"type\":\"POSITIVE\",\"comment\":\"Great seller, fast shipping!\"}" | jq '{success, message}'

echo -e "\n=========================================="
echo "2.6 Request Seller Upgrade"
echo "=========================================="

echo -e "\nRequest seller upgrade (approved within 7 days):"
curl -s -X POST "$BASE_URL/api/users/request-seller-upgrade" \
  -H "X-Mock-User: $BIDDER1" | jq '{
    success,
    message,
    upgradeStatus: .data.upgradeStatus,
    requestedAt: .data.upgradeRequestedAt
  }'

echo -e "\n=========================================="
echo "All Bidder Features Tested!"
echo "=========================================="

