#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing Product & Category APIs"
echo "================================"

echo -e "\n1. Category Menu:"
curl -s "$BASE_URL/api/categories/menu" | jq '{
  success,
  categories: .data | map({
    name,
    productCount,
    children: .children | map({name, productCount})
  })
}'

echo -e "\n2. Search All Products:"
curl -s "$BASE_URL/api/products/search" | jq '{
  success,
  total: .data.pagination.total,
  products: .data.products | map({title, currentPrice, bidCount, endTime})
}'

echo -e "\n3. Search 'iphone':"
curl -s "$BASE_URL/api/products/search?q=iphone" | jq '{
  success,
  found: .data.pagination.total,
  products: .data.products | map({title, currentPrice, seller: .seller.fullName})
}'

echo -e "\n4. Top Ending Soon:"
curl -s "$BASE_URL/api/products/top/ending_soon" | jq '{
  success,
  products: .data | map({title, currentPrice, endTime, bidCount})
}'

echo -e "\n5. Top Most Bids:"
curl -s "$BASE_URL/api/products/top/most_bids" | jq '{
  success,
  products: .data | map({title, bidCount, currentPrice})
}'

echo -e "\n6. Top Highest Price:"
curl -s "$BASE_URL/api/products/top/highest_price" | jq '{
  success,
  products: .data | map({title, currentPrice, startPrice, bidCount})
}'

echo -e "\n7. Products by Category:"
curl -s "$BASE_URL/api/products/category/cat-electronics-phones" | jq '{
  success,
  total: .data.pagination.total,
  products: .data.products | map({title, currentPrice, bidCount})
}'

echo -e "\n8. Product Detail:"
PRODUCT_ID=$(PGPASSWORD=postgres psql -h localhost -U postgres -d auctio_db -t -A -c "SELECT id FROM \"Product\" WHERE status='ACTIVE' LIMIT 1;" 2>/dev/null | tr -d ' ')
curl -s "$BASE_URL/api/products/$PRODUCT_ID" | jq '{
  success,
  product: {
    title: .data.title,
    currentPrice: .data.currentPrice,
    buyNowPrice: .data.buyNowPrice,
    images: .data.images,
    seller: {
      name: .data.seller.fullName,
      positiveRatings: .data.seller.positiveRatings,
      negativeRatings: .data.seller.negativeRatings
    },
    currentWinner: {
      name: .data.currentWinner.fullName,
      positiveRatings: .data.currentWinner.positiveRatings,
      negativeRatings: .data.currentWinner.negativeRatings
    },
    timeLeft: .data.timeLeft,
    category: .data.category,
    bidCount: .data.bidCount,
    questionCount: .data.questionCount,
    questions: .data.questions | map({
      asker: .asker.fullName,
      question: .content,
      answer: .answer.content
    }),
    relatedProducts: .data.relatedProducts | map({title, currentPrice})
  }
}'

echo -e "\n================================"
echo "All tests completed!"

