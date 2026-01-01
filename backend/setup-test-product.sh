#!/bin/bash

# Setup Test Product for Proxy Bidding

BASE_URL="http://localhost:3000"

echo "========================================"
echo "🔧 Setting Up Test Product"
echo "========================================"
echo ""

# Login as seller to create product
echo "🔑 Logging in as seller..."
SELLER_EMAIL="seller1@example.com"
SELLER_PASS="password123"

SELLER_RESPONSE=$(curl -s -X POST "${BASE_URL}/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$SELLER_EMAIL\",
        \"password\": \"$SELLER_PASS\",
        \"captcha\": \"test-token\"
    }")

SELLER_TOKEN=$(echo "$SELLER_RESPONSE" | jq -r '.accessToken')

if [ -z "$SELLER_TOKEN" ] || [ "$SELLER_TOKEN" == "null" ]; then
    echo "❌ Seller login failed!"
    echo "$SELLER_RESPONSE"
    exit 1
fi

echo "✅ Seller logged in successfully"
echo ""

# Get first category
echo "📂 Getting category..."
CATEGORY_RESPONSE=$(curl -s "${BASE_URL}/api/categories")
CATEGORY_ID=$(echo "$CATEGORY_RESPONSE" | jq -r '.data[0].id')

if [ -z "$CATEGORY_ID" ] || [ "$CATEGORY_ID" == "null" ]; then
    echo "❌ No categories found!"
    exit 1
fi

echo "✅ Using category: $CATEGORY_ID"
echo ""

# Get an ACTIVE product from database instead of creating new
echo "📦 Finding an ACTIVE test product..."

PRODUCT_RESPONSE=$(curl -s "${BASE_URL}/api/products?status=ACTIVE&limit=1")
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].id')

if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" == "null" ]; then
    echo "⚠️  No ACTIVE products found in database"
    echo "📝 Creating new test product..."

    # Calculate end time (24 hours from now)
    END_TIME=$(date -u -d "+24 hours" +"%Y-%m-%dT%H:%M:%S.000Z")

    CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/seller/products" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $SELLER_TOKEN" \
        -d "{
            \"title\": \"Proxy Bidding Test Product\",
            \"description\": \"<p>Product for testing proxy bidding logic</p>\",
            \"startPrice\": 10000000,
            \"stepPrice\": 100000,
            \"buyNowPrice\": null,
            \"endTime\": \"$END_TIME\",
            \"categoryId\": \"$CATEGORY_ID\",
            \"images\": [\"https://via.placeholder.com/400\", \"https://via.placeholder.com/400\", \"https://via.placeholder.com/400\"]
        }")

    PRODUCT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')

    if [ -z "$PRODUCT_ID" ] || [ "$PRODUCT_ID" == "null" ]; then
        echo "❌ Failed to create product!"
        echo "$CREATE_RESPONSE"
        exit 1
    fi

    echo "✅ Product created successfully!"
    echo "   Product ID: $PRODUCT_ID"
    echo "   Start Price: 10,000,000 VND"
    echo "   Step Price: 100,000 VND"
    echo "   End Time: $END_TIME"
else
    PRODUCT_TITLE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].title')
    START_PRICE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].startPrice')
    STEP_PRICE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].stepPrice')
    CURRENT_PRICE=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].currentPrice')
    END_TIME=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.products[0].endTime')

    echo "✅ Found existing test product!"
    echo "   Product ID: $PRODUCT_ID"
    echo "   Title: $PRODUCT_TITLE"
    echo "   Start Price: $(printf "%'d" $START_PRICE) VND"
    echo "   Current Price: $(printf "%'d" $CURRENT_PRICE) VND"
    echo "   Step Price: $(printf "%'d" $STEP_PRICE) VND"
    echo "   End Time: $END_TIME"
fi
echo ""

# Save product ID to file for test script
echo "$PRODUCT_ID" > /tmp/test-product-id.txt

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Product ID saved to: /tmp/test-product-id.txt"
echo "Run: ./test-proxy-bidding-with-product.sh"

