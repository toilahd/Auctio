#!/bin/bash

# ZaloPay Integration Test Script
# This script helps test the ZaloPay integration locally

echo "🔍 ZaloPay Integration Test"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please copy .env.zalopay.example to .env and fill in your credentials"
    exit 1
fi

# Check environment variables
echo "📋 Checking environment variables..."

check_env_var() {
    if grep -q "^$1=" .env && ! grep -q "^$1=your_" .env && ! grep -q "^$1=$" .env; then
        echo "✅ $1 is set"
        return 0
    else
        echo "❌ $1 is missing or not configured"
        return 1
    fi
}

all_vars_set=true

check_env_var "ZALOPAY_APPID" || all_vars_set=false
check_env_var "ZALOPAY_KEY1" || all_vars_set=false
check_env_var "ZALOPAY_KEY2" || all_vars_set=false
check_env_var "FRONTEND_URL" || all_vars_set=false

if [ "$all_vars_set" = false ]; then
    echo ""
    echo "⚠️  Please configure missing environment variables in .env"
    exit 1
fi

echo ""
echo "✅ All environment variables configured"
echo ""

# Test ZaloPay service
echo "🧪 Testing ZaloPay service..."
echo ""

# Create test script
cat > test-zalopay.js << 'EOF'
import zalopayService from './services/zalopayService.js';

async function test() {
  try {
    console.log('Creating seller upgrade order...');
    const result = await zalopayService.createSellerUpgradeOrder('test-user-123', 500000);
    
    if (result.success) {
      console.log('✅ Order created successfully!');
      console.log('Transaction ID:', result.app_trans_id);
      console.log('Order URL:', result.order_url);
      console.log('Token:', result.zp_trans_token);
    } else {
      console.log('❌ Failed to create order:', result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();
EOF

# Run test
node test-zalopay.js

# Clean up
rm test-zalopay.js

echo ""
echo "📝 Next steps:"
echo "1. If the test passed, your ZaloPay credentials are valid"
echo "2. Start the backend server: npm start"
echo "3. Start the frontend: cd ../frontend && npm run dev"
echo "4. For local testing, expose your server with ngrok:"
echo "   ngrok http 8080"
echo "5. Update callback URL in ZaloPay dashboard with ngrok URL"
echo "   Example: https://abc123.ngrok.io/api/payment/zalopay-callback"
echo ""
echo "📚 See ZALOPAY_INTEGRATION.md for detailed documentation"
