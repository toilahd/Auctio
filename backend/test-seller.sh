#!/bin/bash

# Seller API Test Script
# Tests all seller endpoints

BASE_URL="http://localhost:3000"
SELLER_API="$BASE_URL/api/seller"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "Seller API Integration Tests"
echo "============================================"
echo ""

# Get test data from database
echo "Fetching test data from database..."

# Get a seller user
SELLER_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
  SELECT id FROM \"User\" WHERE role = 'SELLER' LIMIT 1;
" 2>/dev/null | tr -d ' \n')

if [ -z "$SELLER_ID" ]; then
  echo "${RED}No seller found. Creating test seller...${NC}"
  SELLER_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
    INSERT INTO \"User\" (id, email, password, \"fullName\", role, \"createdAt\", \"updatedAt\")
    VALUES (gen_random_uuid(), 'testseller@example.com', 'hashed', 'Test Seller', 'SELLER', NOW(), NOW())
    RETURNING id;
  " 2>/dev/null | tr -d ' \n')
fi

# Get a category
CATEGORY_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
  SELECT id FROM \"Category\" LIMIT 1;
" 2>/dev/null | tr -d ' \n')

echo "Seller ID: $SELLER_ID"
echo "Category ID: $CATEGORY_ID"
echo ""

# Mock auth header
AUTH_HEADER="X-Mock-User: seller1"

# Test 1: Create Product
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Create Product"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

END_TIME=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ")

PRODUCT_RESPONSE=$(curl -s -X POST "$SELLER_API/products" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"title\": \"MacBook Pro 16 M3 Max - Test\",
    \"description\": \"Brand new MacBook Pro with M3 Max chip. Original warranty.\",
    \"images\": [
      \"https://example.com/macbook1.jpg\",
      \"https://example.com/macbook2.jpg\",
      \"https://example.com/macbook3.jpg\"
    ],
    \"startPrice\": 50000000,
    \"stepPrice\": 500000,
    \"buyNowPrice\": 70000000,
    \"categoryId\": \"$CATEGORY_ID\",
    \"autoExtend\": true,
    \"endTime\": \"$END_TIME\"
  }")

echo "$PRODUCT_RESPONSE" | jq .

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.id' 2>/dev/null)

if [ "$PRODUCT_ID" != "null" ] && [ -n "$PRODUCT_ID" ]; then
  echo "${GREEN}✓ Product created: $PRODUCT_ID${NC}"
else
  echo "${RED}✗ Failed to create product${NC}"
  PRODUCT_ID=""
fi
echo ""

# Test 2: Get Active Products
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Get Active Products"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ACTIVE_RESPONSE=$(curl -s "$SELLER_API/products/active?page=1&limit=5" \
  -H "$AUTH_HEADER")

echo "$ACTIVE_RESPONSE" | jq '{
  success: .success,
  total: .data.total,
  page: .data.page,
  totalPages: .data.totalPages,
  productCount: (.data.products | length)
}'

ACTIVE_COUNT=$(echo "$ACTIVE_RESPONSE" | jq '.data.total' 2>/dev/null)
if [ "$ACTIVE_COUNT" -ge 0 ] 2>/dev/null; then
  echo "${GREEN}✓ Found $ACTIVE_COUNT active products${NC}"
else
  echo "${RED}✗ Failed to get active products${NC}"
fi
echo ""

# Test 3: Append Description (only if product was created)
if [ -n "$PRODUCT_ID" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Test 3: Append Description"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  APPEND_RESPONSE=$(curl -s -X PATCH "$SELLER_API/products/$PRODUCT_ID/description" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{
      "description": "Additional info: Battery health 100%. No scratches or dents."
    }')

  echo "$APPEND_RESPONSE" | jq '{
    success: .success,
    productId: .data.id,
    descriptionPreview: (.data.description | split("\n") | .[0:3] | join("\n"))
  }'

  if [ "$(echo "$APPEND_RESPONSE" | jq -r '.success')" = "true" ]; then
    echo "${GREEN}✓ Description appended${NC}"
  else
    echo "${RED}✗ Failed to append description${NC}"
  fi
  echo ""
fi

# Test 4: Create a Question and Answer it
if [ -n "$PRODUCT_ID" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Test 4: Answer Question"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Get or create a bidder
  BIDDER_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
    SELECT id FROM \"User\" WHERE role = 'BIDDER' LIMIT 1;
  " 2>/dev/null | tr -d ' \n')

  if [ -z "$BIDDER_ID" ]; then
    echo "${YELLOW}Creating test bidder...${NC}"
    BIDDER_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
      INSERT INTO \"User\" (id, email, password, \"fullName\", role, \"createdAt\", \"updatedAt\")
      VALUES (gen_random_uuid(), 'testbidder@example.com', 'hashed', 'Test Bidder', 'BIDDER', NOW(), NOW())
      RETURNING id;
    " 2>/dev/null | tr -d ' \n')
  fi

  if [ -n "$BIDDER_ID" ]; then
    # Create a question using the askerId field (not userId)
    QUESTION_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
      INSERT INTO \"Question\" (id, content, \"productId\", \"askerId\", \"createdAt\", \"updatedAt\")
      VALUES (gen_random_uuid(), 'Does it come with original charger?', '$PRODUCT_ID', '$BIDDER_ID', NOW(), NOW())
      RETURNING id;
    " 2>/dev/null | grep -E '^[0-9a-f]{8}-[0-9a-f]{4}' | head -1 | tr -d ' \n')

    if [ -n "$QUESTION_ID" ]; then
      echo "Question created: $QUESTION_ID"

      ANSWER_RESPONSE=$(curl -s -X POST "$SELLER_API/questions/$QUESTION_ID/answer" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d '{
          "content": "Yes, it comes with original MagSafe 3 charger and USB-C cable."
        }')

      echo "$ANSWER_RESPONSE" | jq '{
        success: .success,
        answerId: .data.id,
        answer: .data.content
      }'

      if [ "$(echo "$ANSWER_RESPONSE" | jq -r '.success')" = "true" ]; then
        echo "${GREEN}✓ Question answered${NC}"
      else
        echo "${RED}✗ Failed to answer question${NC}"
        echo "Error: $(echo "$ANSWER_RESPONSE" | jq -r '.message')"
      fi
    else
      echo "${RED}✗ Failed to create question${NC}"
    fi
  else
    echo "${RED}✗ Failed to get/create bidder${NC}"
  fi
  echo ""
fi

# Test 5: Get Completed Products
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Get Completed Products"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a completed product for testing
if [ -n "$SELLER_ID" ] && [ -n "$CATEGORY_ID" ] && [ -n "$BIDDER_ID" ]; then
  echo "Creating test completed product..."

  COMPLETED_PRODUCT_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
    INSERT INTO \"Product\" (
      id, title, \"titleNoAccent\", description, images,
      \"startPrice\", \"stepPrice\", \"currentPrice\", \"buyNowPrice\",
      \"autoExtend\", status, \"endTime\", \"bidCount\",
      \"categoryId\", \"sellerId\", \"currentWinnerId\",
      \"createdAt\", \"updatedAt\"
    ) VALUES (
      gen_random_uuid(),
      'Completed Auction - Test Product',
      'completed auction - test product',
      'This auction has ended',
      ARRAY['https://example.com/img1.jpg', 'https://example.com/img2.jpg', 'https://example.com/img3.jpg'],
      10000000, 100000, 12000000, 15000000,
      false, 'ENDED', NOW() - INTERVAL '1 day', 5,
      '$CATEGORY_ID', '550e8400-e29b-41d4-a716-446655440002', '$BIDDER_ID',
      NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'
    ) RETURNING id;
  " 2>/dev/null | tr -d ' \n')

  if [ -n "$COMPLETED_PRODUCT_ID" ]; then
    echo "${GREEN}✓ Test completed product created: $COMPLETED_PRODUCT_ID${NC}"
  fi
fi

COMPLETED_RESPONSE=$(curl -s "$SELLER_API/products/completed?page=1&limit=5" \
  -H "$AUTH_HEADER")

echo "$COMPLETED_RESPONSE" | jq '{
  success: .success,
  total: .data.total,
  page: .data.page,
  totalPages: .data.totalPages,
  productCount: (.data.products | length)
}'

# Show first completed product details if any
FIRST_COMPLETED=$(echo "$COMPLETED_RESPONSE" | jq -r '.data.products[0].title // empty' 2>/dev/null)
if [ -n "$FIRST_COMPLETED" ]; then
  echo "First completed product: $FIRST_COMPLETED"
  echo "$COMPLETED_RESPONSE" | jq '.data.products[0] | {
    title: .title,
    finalPrice: .currentPrice,
    winner: .currentWinner.fullName,
    bidCount: ._count.bids
  }'
fi

COMPLETED_COUNT=$(echo "$COMPLETED_RESPONSE" | jq '.data.total' 2>/dev/null)
if [ "$COMPLETED_COUNT" -ge 0 ] 2>/dev/null; then
  echo "${GREEN}✓ Found $COMPLETED_COUNT completed products${NC}"
else
  echo "${RED}✗ Failed to get completed products${NC}"
fi
echo ""

# Test 6: Deny Bidder (requires a product with bids)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Deny Bidder"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Use the product we just created and place a bid on it
if [ -n "$PRODUCT_ID" ]; then
  echo "Creating test bid on product..."

  # Get bidder1's actual ID from mock user
  ACTUAL_BIDDER_ID=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d auctio_db -t -A -c "
    SELECT id FROM \"User\" WHERE role = 'BIDDER' AND email = 'bidder1@example.com' LIMIT 1;
  " 2>/dev/null | tr -d ' \n')

  if [ -z "$ACTUAL_BIDDER_ID" ]; then
    ACTUAL_BIDDER_ID="550e8400-e29b-41d4-a716-446655440005"
  fi

  # Place a bid using the bidding API
  BID_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bids" \
    -H "Content-Type: application/json" \
    -H "X-Mock-User: bidder1" \
    -d "{
      \"productId\": \"$PRODUCT_ID\",
      \"maxAmount\": 51000000
    }")

  BID_SUCCESS=$(echo "$BID_RESPONSE" | jq -r '.success' 2>/dev/null)

  if [ "$BID_SUCCESS" = "true" ]; then
    echo "${GREEN}✓ Test bid placed${NC}"

    # Get the actual bidderId from the bid response
    BIDDER_TO_DENY=$(echo "$BID_RESPONSE" | jq -r '.data.bid.bidderId' 2>/dev/null)

    if [ -z "$BIDDER_TO_DENY" ] || [ "$BIDDER_TO_DENY" = "null" ]; then
      BIDDER_TO_DENY=$ACTUAL_BIDDER_ID
    fi

    echo "Denying bidder: $BIDDER_TO_DENY"

    # Now try to deny this bidder
    DENY_RESPONSE=$(curl -s -X POST "$SELLER_API/products/$PRODUCT_ID/deny-bidder" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER" \
      -d "{
        \"bidderId\": \"$BIDDER_TO_DENY\",
        \"reason\": \"Test denial - suspicious bidding pattern\"
      }")

    echo "$DENY_RESPONSE" | jq .

    if [ "$(echo "$DENY_RESPONSE" | jq -r '.success')" = "true" ]; then
      echo "${GREEN}✓ Bidder denied successfully${NC}"

      # Verify bidder was denied by checking product status
      PRODUCT_CHECK=$(curl -s "$BASE_URL/api/products/$PRODUCT_ID" | jq '{
        currentWinnerId: .data.currentWinnerId,
        currentPrice: .data.currentPrice,
        status: .data.status
      }')
      echo "Product after denial: $PRODUCT_CHECK"
    else
      echo "${RED}✗ Failed to deny bidder${NC}"
      echo "Error: $(echo "$DENY_RESPONSE" | jq -r '.message')"
    fi
  else
    echo "${YELLOW}⚠ Failed to place test bid: $(echo "$BID_RESPONSE" | jq -r '.message')${NC}"
  fi
else
  echo "${YELLOW}⚠ Skipped: No product available${NC}"
fi
