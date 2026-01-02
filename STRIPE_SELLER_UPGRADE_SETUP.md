# Stripe Seller Upgrade Payment Setup

## ✅ Completed

### Backend
- ✅ Stripe service layer created (`backend/services/stripeService.js`)
- ✅ Payment controller with Stripe endpoints (`backend/controllers/paymentController.js`)
- ✅ Webhook handler with signature verification
- ✅ POST `/api/payment/stripe/seller-upgrade/create` endpoint
- ✅ POST `/api/payment/stripe/webhook` endpoint
- ✅ Swagger documentation added

### Frontend
- ✅ Updated `seller-upgrade-payment.tsx` with dual payment support
- ✅ Integrated Stripe Elements for card payment
- ✅ Added payment method selection (Stripe vs ZaloPay)
- ✅ Stripe packages installed: `@stripe/stripe-js`, `@stripe/react-stripe-js`

## 🔧 Required Setup Steps

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Frontend Environment Variables

Create or update `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51MAmWIFctfg3Hqr5IOrxgjVJpboHFgRwPFFyJ6qLAoEK0oqzZHd3T4ofg4hI3FQ882PRlwRC1R6JY6i1xi6PqPeP001mc4C0D7
```

### 3. Backend is Already Configured

Your `backend/.env` already has:
```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_587...
```

### 4. Start Stripe Webhook Listener (for local testing)
```bash
stripe listen --forward-to localhost:3000/api/payment/stripe/webhook
```

## 🧪 Testing the Flow

### 1. Navigate to Profile
- Go to your user profile at `/profile`
- Click "Nâng cấp tài khoản Seller" button

### 2. Choose Payment Method
- You'll see two options:
  - **Thẻ tín dụng/ghi nợ** (Stripe) - New!
  - **ZaloPay** (Existing)

### 3. Test Stripe Payment
Use these test cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**More test cards:** https://stripe.com/docs/testing#cards

### 4. Verify Success
After successful payment:
- Webhook will be triggered
- User role updated to SELLER
- Redirected to `/profile?upgradeSuccess=true`
- Success message displayed

## 📝 Payment Flow

```
1. User clicks "Nâng cấp tài khoản Seller"
   ↓
2. Navigates to /seller-upgrade-payment
   ↓
3. Selects payment method (Stripe or ZaloPay)
   ↓
4. If Stripe:
   - Frontend calls POST /api/payment/stripe/seller-upgrade/create
   - Backend creates PaymentIntent, returns clientSecret
   - Frontend displays Stripe Elements form
   - User enters card details
   - Frontend confirms payment with Stripe
   - Stripe sends webhook to backend
   - Backend verifies signature and updates user role
   - User redirected to profile with success message
```

## 🔐 Webhook Security

The webhook endpoint uses signature verification to ensure requests are genuinely from Stripe:

1. Stripe includes `stripe-signature` header
2. Backend reads raw body (must be preserved)
3. Backend verifies signature using webhook secret
4. Only processes verified webhooks

## 💰 Pricing

- **Amount:** 100,000 VND (~$4 USD)
- **Duration:** 7 days of Seller access
- **Currency:** VND (Vietnamese Dong)

## 🎨 UI Features

- Payment method selection cards
- Stripe Elements integrated payment form
- Real-time card validation
- Error handling and display
- Loading states
- Success/failure redirects
- Dark mode support

## 🚀 Production Checklist

Before going live:

1. [ ] Update Stripe keys to production keys (starts with `pk_live_` and `sk_live_`)
2. [ ] Set up webhook endpoint in Stripe Dashboard
3. [ ] Update `STRIPE_WEBHOOK_SECRET` with production secret
4. [ ] Test payment flow end-to-end
5. [ ] Verify user role updates correctly
6. [ ] Test webhook failure scenarios
7. [ ] Monitor Stripe Dashboard for successful payments

## 📚 Related Files

### Backend
- `backend/services/stripeService.js` - Stripe SDK wrapper
- `backend/controllers/paymentController.js` - Payment endpoints
- `backend/routes/paymentRoutes.js` - Route definitions
- `backend/app.js` - Webhook route mounted before body parsers

### Frontend
- `frontend/src/pages/Payment/seller-upgrade-payment.tsx` - Payment page
- `frontend/src/pages/Bidder/user-profile.tsx` - Upgrade button

## 🐛 Troubleshooting

### Webhook Signature Verification Fails
- Ensure webhook route is mounted BEFORE body parsers in `app.js`
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify Stripe CLI is forwarding to correct URL

### Payment Succeeds but Role Not Updated
- Check webhook logs in backend console
- Verify `handleStripePaymentSuccess` is called
- Check database connection

### Stripe Elements Not Loading
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for errors
- Ensure Stripe packages are installed

## 🎉 You're Ready!

The Stripe payment integration is complete. Users can now upgrade to Seller accounts using credit/debit cards through Stripe!
