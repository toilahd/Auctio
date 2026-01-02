# Stripe Payment Integration Guide

## Overview

Stripe payment integration for Auctio auction platform with webhook support for secure payment verification.

## Backend Implementation ✅

### 1. Files Created/Updated

- ✅ **`backend/services/stripeService.js`** - Stripe SDK wrapper
- ✅ **`backend/controllers/paymentController.js`** - Added Stripe methods
- ✅ **`backend/routes/paymentRoutes.js`** - Added Stripe routes
- ✅ **`backend/.env.example`** - Added Stripe config

### 2. Environment Variables

Add to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Get these values:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Go to https://dashboard.stripe.com/test/webhooks
4. Click **Add endpoint** → Enter your webhook URL
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 3. Install Stripe SDK

```bash
cd backend
npm install stripe
```

### 4. Backend Endpoints

#### Auction Payment
```http
POST /api/payment/stripe/auction/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-uuid"
}

Response:
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 1000000,
    "currency": "vnd",
    "orderId": "order-uuid"
  }
}
```

#### Seller Upgrade Payment
```http
POST /api/payment/stripe/seller-upgrade/create
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 100000,
    "currency": "vnd"
  }
}
```

#### Webhook (Stripe → Backend)
```http
POST /api/payment/stripe/webhook
Stripe-Signature: <signature>
Content-Type: application/json

[Stripe sends this automatically]
```

**Webhook Events Handled:**
- `payment_intent.succeeded` → Mark order as PAID, update product status to PAYED
- `payment_intent.payment_failed` → Log failure (optional notification)

### 5. Webhook Setup

1. **For Local Development** (use Stripe CLI):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payment/stripe/webhook

# Copy the webhook signing secret (ws_...)
```

2. **For Production**:
- Go to https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- Enter: `https://your-domain.com/api/payment/stripe/webhook`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy signing secret

---

## Frontend Implementation

### 1. Install Stripe.js

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Variables

Add to `frontend/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

**Get this value:**
- Go to https://dashboard.stripe.com/test/apikeys
- Copy **Publishable key**

### 3. Stripe Context Provider

Create `frontend/src/contexts/StripeContext.tsx`:

```tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
```

Wrap your app in `main.tsx`:

```tsx
import { StripeProvider } from './contexts/StripeContext';

<StripeProvider>
  <App />
</StripeProvider>
```

### 4. Stripe Payment Component

Create `frontend/src/components/StripeCheckoutForm.tsx`:

```tsx
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const StripeCheckoutForm = ({ onSuccess, onError }: StripeCheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          'Thanh toán'
        )}
      </Button>
    </form>
  );
};
```

### 5. Auction Payment Flow

Update `frontend/src/pages/order-completion.tsx`:

```tsx
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inside your component:
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [showStripeModal, setShowStripeModal] = useState(false);

const handleStripePayment = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payment/stripe/auction/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: product?.id }),
    });

    const data = await response.json();

    if (data.success) {
      setClientSecret(data.data.clientSecret);
      setShowStripeModal(true);
    } else {
      alert(data.message || 'Không thể tạo thanh toán');
    }
  } catch (error) {
    console.error('Error creating Stripe payment:', error);
    alert('Đã xảy ra lỗi');
  }
};

// In your JSX:
{showStripeModal && clientSecret && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6">
      <h3 className="text-xl font-bold mb-4">Thanh toán bằng Stripe</h3>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeCheckoutForm
          onSuccess={() => {
            setShowStripeModal(false);
            alert('Thanh toán thành công!');
            fetchProduct();
          }}
          onError={(error) => {
            alert(error);
          }}
        />
      </Elements>
      <Button
        variant="outline"
        onClick={() => setShowStripeModal(false)}
        className="w-full mt-3"
      >
        Hủy
      </Button>
    </div>
  </div>
)}

// Add Stripe payment button:
<Button onClick={handleStripePayment} className="w-full" size="lg" variant="secondary">
  <CreditCard className="w-5 h-5 mr-2" />
  Thanh toán qua Stripe
</Button>
```

---

## Payment Flow Diagram

```
┌─────────┐                ┌─────────┐                ┌────────┐
│ Browser │                │ Backend │                │ Stripe │
└────┬────┘                └────┬────┘                └───┬────┘
     │                          │                         │
     │  1. Create payment       │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │  2. Create PaymentIntent│
     │                          ├────────────────────────>│
     │                          │                         │
     │                          │  3. Return clientSecret │
     │                          │<────────────────────────┤
     │                          │                         │
     │  4. Return clientSecret  │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
     │  5. Confirm payment      │                         │
     ├──────────────────────────┼────────────────────────>│
     │                          │                         │
     │  6. Payment result       │                         │
     │<─────────────────────────┼─────────────────────────┤
     │                          │                         │
     │                          │  7. Webhook (success)   │
     │                          │<────────────────────────┤
     │                          │                         │
     │                          │  8. Update order PAID   │
     │                          │     Update product PAYED│
     │                          │                         │
     │                          │  9. Return 200 OK       │
     │                          ├────────────────────────>│
     │                          │                         │
```

---

## Testing

### 1. Test Cards

Use these cards in Stripe test mode:

| Card Number         | Result                  |
|---------------------|-------------------------|
| 4242 4242 4242 4242 | Success                 |
| 4000 0000 0000 9995 | Declined (insufficient) |
| 4000 0000 0000 0002 | Declined (generic)      |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 2. Test Webhooks Locally

```bash
# Terminal 1: Start your backend
cd backend
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:3000/api/payment/stripe/webhook

# Terminal 3: Trigger test payment
stripe trigger payment_intent.succeeded
```

### 3. Test in Browser

1. Go to product detail page
2. Click "Thanh toán qua Stripe"
3. Enter test card: `4242 4242 4242 4242`
4. Check webhook logs in terminal
5. Verify order status changed to PAID
6. Verify product status changed to PAYED

---

## Production Checklist

- [ ] Switch to live Stripe keys (remove `_test_`)
- [ ] Update webhook endpoint URL to production domain
- [ ] Enable webhook signature verification
- [ ] Set up Stripe webhook monitoring
- [ ] Configure payment failure notifications
- [ ] Add refund handling (if needed)
- [ ] Test with real payment methods
- [ ] Set up Stripe Radar for fraud prevention
- [ ] Configure 3D Secure for required regions

---

## Common Issues

### Issue: Webhook signature verification fails
**Solution:** Make sure you're using the correct signing secret for your environment (test vs live)

### Issue: "Raw body already parsed"
**Solution:** Webhook route must use `express.raw()` middleware before parsing JSON

### Issue: Payment succeeds but order not updated
**Solution:** Check webhook logs - ensure webhook endpoint is publicly accessible

### Issue: clientSecret expired
**Solution:** PaymentIntents expire after 24 hours. Create a new one if expired

---

## API Reference

### Backend Endpoints

| Method | Endpoint                                | Auth     | Description                    |
|--------|-----------------------------------------|----------|--------------------------------|
| POST   | `/api/payment/stripe/auction/create`    | Required | Create auction payment intent  |
| POST   | `/api/payment/stripe/seller-upgrade/create` | Required | Create seller upgrade intent |
| POST   | `/api/payment/stripe/webhook`           | None     | Stripe webhook handler         |

### Stripe Service Methods

```javascript
// Create payment intent for auction
await stripeService.createAuctionPaymentIntent(orderId, productId, buyerId, amount, title);

// Create payment intent for seller upgrade
await stripeService.createSellerUpgradeIntent(userId, amount);

// Verify webhook signature
const event = stripeService.verifyWebhookSignature(payload, signature);

// Get payment intent details
const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

// Cancel payment intent
await stripeService.cancelPaymentIntent(paymentIntentId);
```

---

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
