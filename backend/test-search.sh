#!/bin/bash

BASE_URL="http://localhost:3000/api/products"

echo "Vietnamese Full-Text Search Tests"
echo "=================================="
echo ""

echo "1. Search 'ao dai' (no accent)"
curl -s "$BASE_URL/search?q=ao%20dai" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "2. Search 'áo dài' (with accent)"
curl -s "$BASE_URL/search?q=%C3%A1o%20d%C3%A0i" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "3. Search 'tranh son mai' (no accent)"
curl -s "$BASE_URL/search?q=tranh%20son%20mai" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "4. Search 'bat trang' (no accent)"
curl -s "$BASE_URL/search?q=bat%20trang" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "5. Search 'Hà Nội' (with accent)"
curl -s "$BASE_URL/search?q=ha%20noi" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "6. Search 'dong ho' (watches - no accent)"
curl -s "$BASE_URL/search?q=dong%20ho" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "7. Search 'tui xach' (bags - no accent)"
curl -s "$BASE_URL/search?q=tui%20xach" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "8. Search 'viet nam'"
curl -s "$BASE_URL/search?q=viet%20nam" | jq '{total: .data.pagination.total, products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "9. Sort Vietnamese products by price (ascending)"
curl -s "$BASE_URL/search?q=viet&sortBy=price&order=asc" | jq '{products: [.data.products[] | {title, price: .currentPrice}]}'
echo ""

echo "=================================="
echo "Tests completed!"

