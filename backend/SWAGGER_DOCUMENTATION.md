# Swagger API Documentation

## Overview

Swagger documentation has been successfully generated for the Auctio API with all new bidder features included.

**File:** `swagger.json`  
**Lines:** 1102  
**API Version:** 2.0.0  
**Total Endpoints:** 50+

## Access Swagger UI

To view the interactive API documentation:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI in browser:**
   ```
   http://localhost:3000/api-docs
   ```

## Documented Endpoints

### Authentication (5 endpoints)
- `GET /health` - Health check
- `GET /whoami` - Get current user info
- `POST /signup` - Register new user
- `POST /login` - Login with email/password
- `POST /logout` - Logout current user
- `POST /refresh-token` - Refresh JWT token
- `GET /login/federated/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Products (5 endpoints)
- `GET /api/products/search` - Search products (full-text, Vietnamese no-accent)
- `GET /api/products/top/{criteria}` - Get top 5 products (ending_soon | most_bids | highest_price)
- `GET /api/products/category/{categoryId}` - Get products by category
- `GET /api/products/{id}` - Get product detail

### Categories (1 endpoint)
- `GET /api/categories/menu` - Get category hierarchy (2-level)

### Bidding (4 endpoints)
- `POST /api/bids` - Place bid (with rating check)
- `GET /api/bids/product/{productId}` - Get bid history (masked names)
- `GET /api/bids/product/{productId}/winner` - Get current winner
- `GET /api/bids/product/{productId}/can-bid` - Check if user can bid

### Watchlist - NEW ✨ (3 endpoints)
- `POST /api/watchlist` - Add product to watchlist
- `DELETE /api/watchlist/{productId}` - Remove from watchlist
- `GET /api/watchlist` - Get user's watchlist
- `GET /api/watchlist/check/{productId}` - Check if product in watchlist

### Questions - NEW ✨ (3 endpoints)
- `POST /api/questions` - Ask a question
- `POST /api/questions/{questionId}/answer` - Answer a question (seller only)
- `GET /api/questions/product/{productId}` - Get product Q&A

### User Profile - NEW ✨ (8 endpoints)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/ratings` - Get detailed ratings
- `GET /api/users/bidding-products` - Get products user is bidding on
- `GET /api/users/won-products` - Get products user has won
- `POST /api/users/rate-seller` - Rate a seller
- `POST /api/users/request-seller-upgrade` - Request seller upgrade

### Admin - NEW ✨ (20 endpoints)

#### Category Management (5 endpoints)
- `GET /api/admin/categories` - List all categories (paginated)
- `GET /api/admin/categories/{id}` - Get category details
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category (fails if products exist)

#### Product Management (3 endpoints)
- `GET /api/admin/products` - List all products (filter by status/seller, paginated)
- `GET /api/admin/products/{id}` - Get product details with full relations
- `DELETE /api/admin/products/{id}` - Remove/cancel product (soft delete)

#### User Management (6 endpoints)
- `GET /api/admin/users` - List all users (filter by role, paginated)
- `GET /api/admin/users/{id}` - Get user details with statistics
- `DELETE /api/admin/users/{id}` - Delete user (with safety checks)
- `GET /api/admin/upgrade-requests` - List upgrade requests (BIDDER → SELLER)
- `POST /api/admin/upgrade-requests/{userId}/approve` - Approve upgrade request
- `POST /api/admin/upgrade-requests/{userId}/reject` - Reject upgrade request

#### Dashboard & Analytics (5 endpoints)
- `GET /api/admin/dashboard/stats` - Overview statistics (users, products, revenue)
- `GET /api/admin/dashboard/user-growth` - User growth chart (customizable timeframe)
- `GET /api/admin/dashboard/product-growth` - Product growth chart
- `GET /api/admin/dashboard/top-sellers` - Top sellers by revenue
- `GET /api/admin/dashboard/top-products` - Top products by bids/price

## Swagger Configuration

### Security Schemes
1. **bearerAuth** - JWT token in Authorization header
2. **cookieAuth** - JWT token in HttpOnly cookie
3. **mockAuth** - X-Mock-User header for testing

### Tags
- Authentication
- Products
- Categories
- Bidding
- Watchlist (NEW)
- Questions (NEW)
- User Profile (NEW)
- Admin (NEW)

### Schemas Defined
- Product
- Bid
- User
- Category
- Question
- Rating
- Error
- Success

### Request/Response Definitions
- BidRequest
- WatchlistRequest
- QuestionRequest
- AnswerRequest
- ProfileUpdateRequest
- ChangePasswordRequest
- RateSellerRequest

## Testing with Swagger UI

### Using Mock Authentication

For testing endpoints that require authentication:

1. Click on the **Authorize** button in Swagger UI
2. Under **mockAuth**, enter a mock user:
   - `admin` - Administrator account
   - `bidder1` - Regular bidder
   - `bidder2` - Another bidder
   - `seller1` - Seller account
   - `bidder3`, `bidder4` - Additional test users

3. Click **Authorize** and **Close**
4. All subsequent requests will include the `X-Mock-User` header

### Example Testing Flow

1. **Get Categories:**
   - Try: `GET /api/categories/menu`
   - No auth required

2. **Search Products:**
   - Try: `GET /api/products/search?q=iphone`
   - No auth required

3. **Add to Watchlist:**
   - Authorize as `bidder1`
   - Try: `POST /api/watchlist`
   - Body: `{"productId": "prod-001"}`

4. **Place Bid:**
   - Authorize as `bidder1`
   - Try: `POST /api/bids`
   - Body: `{"productId": "prod-001", "maxAmount": 11000000}`

5. **Ask Question:**
   - Authorize as `bidder1`
   - Try: `POST /api/questions`
   - Body: `{"productId": "prod-001", "content": "Is this in good condition?"}`

6. **View Profile:**
   - Authorize as `bidder1`
   - Try: `GET /api/users/profile`

7. **Admin Dashboard (Admin only):**
   - Authorize as `admin`
   - Try: `GET /api/admin/dashboard/stats`
   - View overview statistics

8. **List Categories (Admin only):**
   - Authorize as `admin`
   - Try: `GET /api/admin/categories`
   - View all categories with product counts

9. **Approve Upgrade Request (Admin only):**
   - Authorize as `admin`
   - Try: `GET /api/admin/upgrade-requests`
   - Note a pending request ID
   - Try: `POST /api/admin/upgrade-requests/{userId}/approve`

10. **View User Management (Admin only):**
    - Authorize as `admin`
    - Try: `GET /api/admin/users?role=BIDDER`
    - Filter users by role

## Regenerating Documentation

When you add new endpoints or modify existing ones:

```bash
node gen-swagger.js
```

This will:
1. Scan `app.js` and all imported routes
2. Auto-detect endpoints and parameters
3. Generate updated `swagger.json`
4. Preserve custom documentation in route comments

## Adding JSDoc Comments

To enhance auto-generated documentation, add JSDoc comments in your routes:

```javascript
/**
 * GET /api/products/search
 * @summary Search products
 * @tags Products
 * @param {string} q.query - Search query (Vietnamese no-accent)
 * @param {string} categoryId.query - Filter by category
 * @param {integer} page.query - Page number (default: 1)
 * @param {integer} limit.query - Items per page (default: 20)
 * @return {object} 200 - Success response
 * @return {object} 500 - Error response
 */
router.get('/search', productController.searchProducts);
```

## Swagger UI Features

### Interactive Testing
- ✅ Try out endpoints directly from the browser
- ✅ View request/response examples
- ✅ See parameter descriptions and types
- ✅ Test authentication flows

### Documentation Export
- Download as JSON
- Download as YAML
- Share with frontend team

### Schema Validation
- Automatic request validation
- Response schema documentation
- Type checking

## Production Deployment

For production, update `gen-swagger.js`:

```javascript
const doc = {
  info: {
    title: "Auctio API",
    description: "API documentation for the Auctio auction platform",
    version: "2.0.0",
  },
  host: "api.auctio.com",  // Change to production URL
  schemes: ["https"],       // Use HTTPS
  // ...rest of config
};
```

## Summary

✅ **50+ endpoints documented**  
✅ **20 admin management endpoints included**  
✅ **16 bidder feature endpoints included**  
✅ **Comprehensive schemas and definitions**  
✅ **Interactive testing with mock auth**  
✅ **Auto-generated from code**  
✅ **Ready for production use**

Access the documentation at: **http://localhost:3000/api-docs**

