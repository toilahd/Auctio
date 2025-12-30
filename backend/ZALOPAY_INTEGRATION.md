# ZaloPay Integration Guide

## Overview
This project integrates ZaloPay payment gateway for two payment flows:
1. **Seller Upgrade Payment** - 500,000 VND for 7-day seller privileges
2. **Auction Payment** - Variable amount when winning an auction

## Architecture

### Flow Diagram
```
User → Frontend → Backend → ZaloPay Gateway → User Payment → ZaloPay Callback → Backend → Update DB
```

### Components

#### Backend
- **Service**: `/backend/services/zalopayService.js`
  - `createSellerUpgradeOrder(userId, amount)` - Create seller upgrade payment
  - `createAuctionPaymentOrder(orderId, buyerId, amount, productTitle)` - Create auction payment
  - `verifyCallback(callbackData)` - Verify ZaloPay callback signature
  - `generateTransactionId(type)` - Generate unique transaction IDs

- **Controller**: `/backend/controllers/paymentController.js`
  - `createSellerUpgradeOrder` - Initiate seller upgrade payment
  - `createAuctionPaymentOrder` - Initiate auction payment
  - `zalopayCallback` - Handle ZaloPay webhooks
  - `handleSellerUpgradePayment` - Process seller upgrade after payment
  - `handleAuctionPayment` - Process auction payment after payment

- **Routes**: `/backend/routes/paymentRoutes.js`
  ```
  POST /api/payment/seller-upgrade/create - Create seller upgrade order
  POST /api/payment/auction/create - Create auction payment order
  POST /api/payment/zalopay-callback - ZaloPay webhook callback
  ```

#### Frontend
- **Payment Page**: `/frontend/src/pages/Payment/seller-upgrade-payment.tsx`
  - Calls backend to create ZaloPay order
  - Redirects user to `order_url` from ZaloPay

- **Result Page**: `/frontend/src/pages/Payment/payment-result.tsx`
  - Shows payment result after user returns from ZaloPay
  - Displays success/failure messages
  - Updates user role in cookie for seller upgrades

## Setup Instructions

### 1. Environment Variables
Copy the example file and fill in your ZaloPay credentials:

```bash
cd backend
cp .env.zalopay.example .env
```

Edit `.env`:
```env
ZALOPAY_APPID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
FRONTEND_URL=http://localhost:5173
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
```

### 2. Get ZaloPay Credentials
1. Register at [ZaloPay Merchant Portal](https://merchant.zalopay.vn/)
2. Create a sandbox/production app
3. Get `APPID`, `KEY1`, and `KEY2` from the dashboard

### 3. Configure Callback URL
In ZaloPay dashboard, set callback URL to:
```
https://your-domain.com/api/payment/zalopay-callback
```

For local testing with ngrok:
```bash
ngrok http 8080
# Use the ngrok URL: https://abc123.ngrok.io/api/payment/zalopay-callback
```

## Payment Flows

### Seller Upgrade Payment

#### 1. User Initiates Payment
User clicks "Upgrade to Seller" button on profile page.

#### 2. Frontend Creates Order
```typescript
const response = await fetch('/api/payment/seller-upgrade/create', {
  method: 'POST',
  body: JSON.stringify({ userId }),
  credentials: 'include'
});
const { order_url } = await response.json();
window.location.href = order_url; // Redirect to ZaloPay
```

#### 3. Backend Creates ZaloPay Order
```javascript
// Controller
const paymentOrder = await zalopayService.createSellerUpgradeOrder(userId, 500000);

// Service generates:
// - Transaction ID: yymmdd_SELLER_timestamp
// - MAC signature using KEY1
// - Embed data with redirect URL and merchant info
// - POST to ZaloPay API
// Returns: { order_url, app_trans_id, zp_trans_token }
```

#### 4. User Pays on ZaloPay
User completes payment on ZaloPay gateway.

#### 5. ZaloPay Callback
ZaloPay posts payment result to callback URL:

```javascript
POST /api/payment/zalopay-callback
{
  "data": "{\"amount\":500000,\"app_trans_id\":\"241231_SELLER_123456\",...}",
  "mac": "abc123...",
  "type": 1
}
```

#### 6. Backend Verifies and Processes
```javascript
// Verify MAC signature
if (!zalopayService.verifyCallback(req.body)) {
  return res.status(400).json({ return_code: -1 });
}

// Parse data
const data = JSON.parse(req.body.data);
const merchantInfo = JSON.parse(JSON.parse(data.embed_data).merchantinfo);

// Update user role to SELLER
await prisma.user.update({
  where: { id: merchantInfo.userId },
  data: {
    role: 'SELLER',
    upgradeRequestedAt: new Date(),
    upgradeStatus: 'APPROVED'
  }
});
```

#### 7. User Redirected Back
After payment, ZaloPay redirects user to:
```
http://localhost:5173/payment-result?type=seller&apptransid=241231_SELLER_123456&amount=500000
```

### Auction Payment Flow

Similar to seller upgrade, but:
- Uses `createAuctionPaymentOrder(orderId, buyerId, amount, productTitle)`
- Transaction ID format: `yymmdd_AUCTION_timestamp`
- Updates order status to PAID instead of user role
- Redirect: `/payment-result?type=auction`

## Transaction ID Format

```
yymmdd_TYPE_timestamp

Examples:
241231_SELLER_1703998800000
241231_AUCTION_1703999000000
```

Components:
- `yymmdd`: Year-month-day (6 digits)
- `TYPE`: Payment type (SELLER or AUCTION)
- `timestamp`: Unix timestamp in milliseconds

## MAC Generation

### Creating Payment Order (KEY1)
```javascript
const data = [
  app_id,
  app_trans_id,
  app_user,
  amount,
  app_time,
  embed_data,
  item
].join('|');

const mac = crypto
  .createHmac('sha256', KEY1)
  .update(data)
  .digest('hex');
```

### Verifying Callback (KEY2)
```javascript
const data = [
  callbackData.data
].join('');

const mac = crypto
  .createHmac('sha256', KEY2)
  .update(data)
  .digest('hex');

return mac === callbackData.mac;
```

## Testing

### 1. Test Seller Upgrade
```bash
# Start backend
cd backend
npm start

# Start frontend
cd frontend
npm run dev

# Login as BIDDER user
# Navigate to profile
# Click "Upgrade to Seller"
# Complete payment on ZaloPay sandbox
```

### 2. Test Callback Locally
Use ngrok to expose your local server:

```bash
# Terminal 1: Start backend
npm start

# Terminal 2: Start ngrok
ngrok http 8080

# Update ZaloPay dashboard with ngrok URL
# Complete a test payment
# Check logs for callback data
```

### 3. Mock Callback (for testing)
```bash
curl -X POST http://localhost:8080/api/payment/zalopay-callback \
  -H "Content-Type: application/json" \
  -d '{
    "data": "{\"amount\":500000,\"app_trans_id\":\"241231_SELLER_123456\",\"embed_data\":\"{\\\"merchantinfo\\\":\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"SELLER_UPGRADE\\\\\\\",\\\\\\\"userId\\\\\\\":\\\\\\\"user-123\\\\\\\"}\\\"}\"}"
    "mac": "generated_mac_here",
    "type": 1
  }'
```

## Security Considerations

### 1. MAC Verification
Always verify MAC signature in callback to prevent tampering:
```javascript
if (!zalopayService.verifyCallback(req.body)) {
  return res.status(400).json({ return_code: -1 });
}
```

### 2. Callback Endpoint
- No authentication required (ZaloPay calls it)
- Must verify MAC signature
- Must respond with `return_code: 1` on success
- Must be publicly accessible (use ngrok for local testing)

### 3. Environment Variables
Never commit `.env` file with real credentials:
```bash
echo ".env" >> .gitignore
```

### 4. HTTPS Required
In production, callback URL must use HTTPS:
```
https://your-domain.com/api/payment/zalopay-callback
```

## Troubleshooting

### Issue: "Invalid signature" error
**Solution**: Check KEY1 and KEY2 are correct, ensure data string format matches exactly.

### Issue: Callback not received
**Solution**: 
- Check callback URL in ZaloPay dashboard
- Use ngrok for local testing
- Check firewall rules
- Check logs for errors

### Issue: Payment successful but user not upgraded
**Solution**:
- Check backend logs for callback processing
- Verify MAC calculation
- Check database connection
- Ensure user exists and is BIDDER

### Issue: order_url not generated
**Solution**:
- Check ZaloPay credentials (APPID, KEY1)
- Check ZaloPay endpoint URL
- Check network connection
- Check request format

## API Reference

### Create Seller Upgrade Order
```http
POST /api/payment/seller-upgrade/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid"
}

Response:
{
  "success": true,
  "data": {
    "order_url": "https://qcgateway.zalopay.vn/...",
    "app_trans_id": "241231_SELLER_123456",
    "zp_trans_token": "token123"
  }
}
```

### Create Auction Payment Order
```http
POST /api/payment/auction/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "buyerId": "user-uuid",
  "amount": 1000000,
  "productTitle": "Product name"
}

Response:
{
  "success": true,
  "data": {
    "order_url": "https://qcgateway.zalopay.vn/...",
    "app_trans_id": "241231_AUCTION_123456",
    "zp_trans_token": "token123"
  }
}
```

### ZaloPay Callback (Webhook)
```http
POST /api/payment/zalopay-callback
Content-Type: application/json

{
  "data": "{...encrypted_data...}",
  "mac": "signature",
  "type": 1
}

Response:
{
  "return_code": 1,
  "return_message": "success"
}
```

## Resources

- [ZaloPay Documentation](https://docs.zalopay.vn/)
- [ZaloPay Merchant Portal](https://merchant.zalopay.vn/)
- [ZaloPay Sandbox](https://sandbox.zalopay.vn/)

## Support

For issues or questions:
1. Check ZaloPay documentation
2. Check backend logs: `/backend/logs/`
3. Test with ZaloPay sandbox first
4. Contact ZaloPay support for API issues
