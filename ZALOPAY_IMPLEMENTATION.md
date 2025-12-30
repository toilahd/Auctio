# ZaloPay Integration - Implementation Summary

## What Was Implemented

This implementation integrates the ZaloPay payment gateway into the auction platform for two payment flows:
1. **Seller Upgrade Payment** (500,000 VND for 7 days)
2. **Auction Winner Payment** (variable amount)

## Files Created/Modified

### Backend

#### New Files
- **`/backend/services/zalopayService.js`** - Core ZaloPay integration service
  - Creates payment orders
  - Generates MAC signatures
  - Verifies callback signatures
  - Handles both seller and auction payment flows

- **`/backend/.env.zalopay.example`** - Environment variable template
- **`/backend/ZALOPAY_INTEGRATION.md`** - Complete integration guide

#### Modified Files
- **`/backend/controllers/paymentController.js`**
  - Added `createSellerUpgradeOrder()` - Initiate seller upgrade payment
  - Added `createAuctionPaymentOrder()` - Initiate auction payment
  - Added `zalopayCallback()` - Handle ZaloPay webhooks
  - Added `handleSellerUpgradePayment()` - Process seller upgrade after payment
  - Added `handleAuctionPayment()` - Process auction payment after payment

- **`/backend/routes/paymentRoutes.js`**
  - Added `POST /api/payment/seller-upgrade/create` - Create seller upgrade order
  - Added `POST /api/payment/auction/create` - Create auction payment order
  - Added `POST /api/payment/zalopay-callback` - ZaloPay webhook endpoint

### Frontend

#### New Files
- **`/frontend/src/pages/Payment/payment-result.tsx`** - Payment result page
  - Shows payment success/failure
  - Handles redirect from ZaloPay
  - Updates user role for seller upgrades

#### Modified Files
- **`/frontend/src/pages/Payment/seller-upgrade-payment.tsx`**
  - Changed from mock payment to real ZaloPay integration
  - Calls backend to create ZaloPay order
  - Redirects user to `order_url`

- **`/frontend/src/main.tsx`**
  - Added `/payment-result` route

## How It Works

### Flow 1: Seller Upgrade Payment

1. **User initiates payment**
   - User clicks "Upgrade to Seller" on profile
   - Navigates to `/seller-upgrade-payment`

2. **Frontend creates order**
   - Calls `POST /api/payment/seller-upgrade/create`
   - Receives `order_url` from backend

3. **User redirected to ZaloPay**
   - Frontend redirects to `order_url`
   - User completes payment on ZaloPay gateway

4. **ZaloPay processes payment**
   - User enters payment information
   - ZaloPay validates and processes

5. **ZaloPay callback**
   - ZaloPay posts to `POST /api/payment/zalopay-callback`
   - Backend verifies MAC signature
   - Backend updates user role to SELLER

6. **User redirected back**
   - ZaloPay redirects to `/payment-result?type=seller`
   - Shows success message
   - User can navigate back to profile

### Flow 2: Auction Payment

Similar flow but:
- Uses `POST /api/payment/auction/create`
- Transaction type: `AUCTION_PAYMENT`
- Updates order status instead of user role
- Redirects to `/payment-result?type=auction`

## Configuration Required

### 1. Environment Variables

Add to `/backend/.env`:

```env
ZALOPAY_APPID=your_app_id_here
ZALOPAY_KEY1=your_key1_here
ZALOPAY_KEY2=your_key2_here
FRONTEND_URL=http://localhost:5173
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
```

### 2. ZaloPay Setup

1. Register at [ZaloPay Merchant Portal](https://merchant.zalopay.vn/)
2. Create sandbox/production app
3. Get credentials (APPID, KEY1, KEY2)
4. Configure callback URL in dashboard:
   ```
   https://your-domain.com/api/payment/zalopay-callback
   ```

### 3. Testing Locally

Use ngrok to expose local server for callbacks:

```bash
# Start backend
cd backend
npm start

# In another terminal, start ngrok
ngrok http 8080

# Use ngrok URL in ZaloPay dashboard
# Example: https://abc123.ngrok.io/api/payment/zalopay-callback
```

## API Endpoints

### Create Seller Upgrade Order
```
POST /api/payment/seller-upgrade/create
Auth: Required (Bearer token)
Body: { userId: "user-uuid" }
Response: { success: true, data: { order_url, app_trans_id } }
```

### Create Auction Payment Order
```
POST /api/payment/auction/create
Auth: Required (Bearer token)
Body: { orderId, buyerId, amount, productTitle }
Response: { success: true, data: { order_url, app_trans_id } }
```

### ZaloPay Callback
```
POST /api/payment/zalopay-callback
Auth: None (called by ZaloPay)
Body: { data, mac, type }
Response: { return_code: 1, return_message: "success" }
```

## Transaction ID Format

```
yymmdd_TYPE_timestamp

Examples:
241231_SELLER_1703998800000  (Seller upgrade)
241231_AUCTION_1703999000000 (Auction payment)
```

## Security Features

1. **MAC Verification**
   - All callbacks verified with HMAC-SHA256
   - Uses KEY2 from ZaloPay

2. **Transaction IDs**
   - Unique IDs prevent duplicate processing
   - Format: `yymmdd_TYPE_timestamp`

3. **Embed Data**
   - Merchant info includes payment type and IDs
   - Encrypted in ZaloPay transaction

## Testing Checklist

- [ ] Add ZaloPay credentials to `.env`
- [ ] Start backend server
- [ ] Start frontend dev server
- [ ] Setup ngrok for local testing
- [ ] Update callback URL in ZaloPay dashboard
- [ ] Test seller upgrade payment
- [ ] Verify callback received and processed
- [ ] Check user role updated to SELLER
- [ ] Test auction payment flow
- [ ] Verify order status updated to PAID

## Next Steps (Optional Enhancements)

1. **Payment History**
   - Store payment records in database
   - Create Payment model in Prisma

2. **Refund Support**
   - Implement ZaloPay refund API
   - Add refund button for admins

3. **Payment Status Query**
   - Check payment status with ZaloPay API
   - Display in admin dashboard

4. **Error Handling**
   - Add retry logic for failed callbacks
   - Send email notifications for payment failures

5. **Analytics**
   - Track payment success rate
   - Monitor transaction volumes

## Documentation

See `/backend/ZALOPAY_INTEGRATION.md` for complete documentation including:
- Detailed flow diagrams
- MAC generation examples
- Troubleshooting guide
- API references
- Security best practices

## Support

For issues:
1. Check backend logs: `/backend/logs/`
2. Review ZaloPay documentation
3. Test with sandbox first
4. Check MAC signature generation
5. Verify callback URL accessibility
