#!/bin/bash

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/bids"
DB="auctio_db"
DB_USER="postgres"
DB_PASS="postgres"

set -e

psql_exec() {
  PGPASSWORD=$DB_PASS psql -h localhost -U $DB_USER -d $DB -t -A -c "$1"
}

curl_post() {
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-Mock-User: $1" \
    -d "$2" "$API_URL"
}

curl -sf "$BASE_URL/health" >/dev/null || {
  echo "Server not running"; exit 1;
}

psql_exec "
INSERT INTO \"User\" (id,email,password,\"fullName\",role,\"createdAt\",\"updatedAt\")
VALUES
('550e8400-e29b-41d4-a716-446655440002','seller@example.com','x','Seller','SELLER',NOW(),NOW()),
('550e8400-e29b-41d4-a716-446655440005','b1@example.com','x','Bidder1','BIDDER',NOW(),NOW()),
('550e8400-e29b-41d4-a716-446655440006','b2@example.com','x','Bidder2','BIDDER',NOW(),NOW()),
('550e8400-e29b-41d4-a716-446655440007','b3@example.com','x','Bidder3','BIDDER',NOW(),NOW()),
('550e8400-e29b-41d4-a716-446655440008','b4@example.com','x','Bidder4','BIDDER',NOW(),NOW())
ON CONFLICT (id) DO NOTHING;"

CATEGORY_ID=$(psql_exec "SELECT id FROM \"Category\" LIMIT 1")

PRODUCT_ID=$(psql_exec "
INSERT INTO \"Product\" (id,title,\"titleNoAccent\",description,images,\"startPrice\",\"stepPrice\",\"currentPrice\",status,\"endTime\",\"bidCount\",\"categoryId\",\"sellerId\",\"createdAt\",\"updatedAt\")
VALUES (gen_random_uuid(),'AutoBid Test','AutoBid Test','test',ARRAY['x'],10000000,100000,10000000,'ACTIVE',NOW()+INTERVAL '1 day',0,'$CATEGORY_ID','550e8400-e29b-41d4-a716-446655440002',NOW(),NOW())
RETURNING id;" | grep -E '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')

echo "Product: $PRODUCT_ID"

curl_post bidder1 "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":11000000}" | jq .
curl_post bidder2 "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":10800000}" | jq .
curl_post bidder3 "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":11500000}" | jq .
curl_post bidder4 "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":11500000}" | jq .
curl_post bidder4 "{\"productId\":\"$PRODUCT_ID\",\"maxAmount\":11700000}" | jq .

curl -s -H "X-Mock-User: bidder1" "$API_URL/product/$PRODUCT_ID/winner" | jq .

