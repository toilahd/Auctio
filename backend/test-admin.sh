#!/bin/bash

BASE_URL="http://localhost:3000/api/admin"
ADMIN_HEADER="X-Mock-User: admin"

echo "==================================="
echo "Admin API Integration Tests"
echo "==================================="
echo ""

# Create admin user if not exists
PGPASSWORD=postgres psql -h localhost -U postgres -d auctio_db > /dev/null 2>&1 <<EOF
INSERT INTO "User" (id, email, password, "fullName", role, "createdAt", "updatedAt")
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', 'hash', 'Admin User', 'ADMIN', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
EOF

echo "1. Dashboard Stats"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/dashboard/stats" | jq .
echo ""

echo "2. Get All Categories"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/categories?page=1&limit=5" | jq '.data.categories[] | {id, name, parent: .parent.name, productCount: ._count.products}'
echo ""

echo "3. Create Category"
NEW_CAT=$(curl -s -H "$ADMIN_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"Test Category"}' \
  "$BASE_URL/categories" | jq -r '.data.id')
echo "Created category: $NEW_CAT"
echo ""

echo "4. Update Category"
curl -s -H "$ADMIN_HEADER" -H "Content-Type: application/json" \
  -X PUT -d '{"name":"Updated Test Category"}' \
  "$BASE_URL/categories/$NEW_CAT" | jq .
echo ""

echo "5. Get All Products"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/products?page=1&limit=3" | jq '.data.products[] | {title, status, seller: .seller.fullName, bids: ._count.bids}'
echo ""

echo "6. Get All Users"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/users?page=1&limit=5" | jq '.data.users[] | {fullName, email, role, products: ._count.products, bids: ._count.bids}'
echo ""

echo "7. Get Upgrade Requests"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/upgrade-requests" | jq .
echo ""

echo "8. User Growth (Last 7 days)"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/dashboard/user-growth?days=7" | jq .
echo ""

echo "9. Top Products by Bids"
curl -s -H "$ADMIN_HEADER" "$BASE_URL/dashboard/top-products?limit=3&sortBy=bids" | jq '.data[] | {title, bidCount, currentPrice}'
echo ""

echo "10. Delete Test Category"
curl -s -H "$ADMIN_HEADER" -X DELETE "$BASE_URL/categories/$NEW_CAT" | jq .
echo ""

echo "==================================="
echo "Admin API Tests Complete"
echo "==================================="

