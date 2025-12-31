# ZaloPay Integration - Quick Reference

## 🚀 Quick Start

### 1. Setup Environment Variables
```bash
cd backend
cp .env.zalopay.example .env
# Edit .env with your ZaloPay credentials
```

### 2. Required Variables
```env
ZALOPAY_APPID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
FRONTEND_URL=http://localhost:5173
```

### 3. Test Integration
```bash
cd backend
./test-zalopay-integration.sh
```

### 4. Start Servers
```bash
# Backend
cd backend
npm start

# Frontend (in another terminal)
cd frontend
npm run dev
```

### 5. Setup Callback (for local testing)
```bash
# In another terminal
ngrok http 8080

# Copy the ngrok URL and update in ZaloPay dashboard:
# https://abc123.ngrok.io/api/payment/zalopay-callback
```

## 📋 API Endpoints

### Create Seller Upgrade Payment
```bash
POST http://localhost:8080/api/payment/seller-upgrade/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-uuid"
}
```

### Create Auction Payment
```bash
POST http://localhost:8080/api/payment/auction/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order-uuid",
  "buyerId": "user-uuid",
  "amount": 1000000,
  "productTitle": "Product Name"
}
```

### ZaloPay Callback (Webhook)
```bash
POST http://localhost:8080/api/payment/zalopay-callback
Content-Type: application/json

{
  "data": "{...}",
  "mac": "signature",
  "type": 1
}
```

## 🔧 Testing with curl

### Test Seller Upgrade
```bash
# Get auth token first by logging in
TOKEN="your_jwt_token"

curl -X POST http://localhost:8080/api/payment/seller-upgrade/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-uuid"}'
```

### Test Auction Payment
```bash
curl -X POST http://localhost:8080/api/payment/auction/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId":"order-uuid",
    "buyerId":"user-uuid",
    "amount":1000000,
    "productTitle":"Test Product"
  }'
```

## 🎯 User Journey

### Seller Upgrade
1. Login as BIDDER
2. Go to Profile (`/profile`)
3. Click "Nâng cấp lên Seller"
4. Click "Thanh toán ngay" on payment page
5. Complete payment on ZaloPay
6. Redirected back to `/payment-result?type=seller`
7. Role updated to SELLER

### Auction Payment
1. Win an auction
2. Navigate to won auctions page
3. Click "Thanh toán"
4. Redirected to ZaloPay
5. Complete payment
6. Redirected back to `/payment-result?type=auction`
7. Order marked as PAID

## 🔍 Debugging

### Check Backend Logs
```bash
tail -f backend/logs/combined.log
```

### Check ZaloPay Response
```javascript
// In browser console
fetch('/api/payment/seller-upgrade/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ userId: 'your-user-id' })
})
.then(r => r.json())
.then(console.log)
```

### Test Callback Manually
```bash
curl -X POST http://localhost:8080/api/payment/zalopay-callback \
  -H "Content-Type: application/json" \
  -d '{
    "data": "{\"amount\":500000}",
    "mac": "test",
    "type": 1
  }'
```

## 📊 Transaction ID Format

```
Format: yymmdd_TYPE_timestamp

Examples:
241231_SELLER_1703998800000  → Seller upgrade
241231_AUCTION_1703999000000 → Auction payment

Components:
- yymmdd: Date (241231 = Dec 31, 2024)
- TYPE: SELLER or AUCTION
- timestamp: Unix milliseconds
```

## 🔐 MAC Signature

### Creating Order (uses KEY1)
```
Data = app_id|app_trans_id|app_user|amount|app_time|embed_data|item
MAC = HMAC-SHA256(Data, KEY1)
```

### Verifying Callback (uses KEY2)
```
Data = callback.data
MAC = HMAC-SHA256(Data, KEY2)
Verify: MAC === callback.mac
```

## ⚠️ Common Issues

### "Invalid signature"
- Check KEY1 and KEY2 are correct
- Ensure no extra spaces in .env
- Verify data format matches exactly

### Callback not received
- Check callback URL in ZaloPay dashboard
- Use ngrok for local testing
- Verify server is running and accessible

### Order creation fails
- Check ZaloPay credentials
- Verify endpoint URL (sandbox vs production)
- Check network connectivity
- Review backend logs

### User not upgraded after payment
- Check backend logs for callback processing
- Verify MAC calculation
- Check database connection
- Ensure user exists and is BIDDER

## 📚 Documentation Files

- `ZALOPAY_INTEGRATION.md` - Complete integration guide
- `ZALOPAY_IMPLEMENTATION.md` - Implementation summary
- `.env.zalopay.example` - Environment template
- `test-zalopay-integration.sh` - Test script

## 🔗 Resources

- ZaloPay Docs: https://docs.zalopay.vn/
- Merchant Portal: https://merchant.zalopay.vn/
- Sandbox: https://sandbox.zalopay.vn/

## 💡 Tips

1. **Always test in sandbox first** before production
2. **Use ngrok for local callback testing**
3. **Check logs** when debugging issues
4. **Verify MAC signatures** in all callbacks
5. **Keep KEY2 secret** - it's for callback verification
6. **Transaction IDs must be unique** - use timestamp
7. **Callback must respond quickly** - ZaloPay has timeout
8. **HTTPS required in production** for callback URL

## 🎉 Success Checklist

- [ ] Environment variables configured
- [ ] Test script passes
- [ ] Backend server running
- [ ] Frontend server running
- [ ] ngrok exposing callback URL
- [ ] Callback URL updated in ZaloPay dashboard
- [ ] Test payment completes successfully
- [ ] Callback received and verified
- [ ] User/order updated correctly
- [ ] Payment result page shows success

---

**Need help?** Check `ZALOPAY_INTEGRATION.md` for detailed documentation.
