// test-email.js
// Test script for email configuration
const {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendAuctionWonEmail,
    sendNewBidEmail,
    testEmailConnection
} = require('./config/email');

async function testEmails() {
    console.log('🧪 Testing Email Configuration...\n');

    // Test 1: Check connection
    console.log('1. Testing SMTP connection...');
    const isConnected = await testEmailConnection();

    if (!isConnected) {
        console.error('❌ Failed to connect to email server. Please check your SMTP settings in .env');
        return;
    }

    console.log('\n2. Testing basic email...');
    try {
        const result = await sendEmail({
            to: 'test@example.com',
            subject: 'Test Email from Auctio',
            text: 'This is a test email',
            html: '<h1>Test Email</h1><p>This is a test email from Auctio</p>'
        });
        console.log('✅ Basic email sent:', result.messageId);
        if (result.preview) {
            console.log('📧 Preview URL:', result.preview);
        }
    } catch (error) {
        console.error('❌ Failed to send basic email:', error.message);
    }

    console.log('\n3. Testing verification email...');
    try {
        const result = await sendVerificationEmail(
            'newuser@example.com',
            'test-token-12345',
            'John Doe'
        );
        console.log('✅ Verification email sent:', result.messageId);
        if (result.preview) {
            console.log('📧 Preview URL:', result.preview);
        }
    } catch (error) {
        console.error('❌ Failed to send verification email:', error.message);
    }

    console.log('\n4. Testing password reset email...');
    try {
        const result = await sendPasswordResetEmail(
            'user@example.com',
            'reset-token-67890',
            'Jane Smith'
        );
        console.log('✅ Password reset email sent:', result.messageId);
        if (result.preview) {
            console.log('📧 Preview URL:', result.preview);
        }
    } catch (error) {
        console.error('❌ Failed to send password reset email:', error.message);
    }

    console.log('\n5. Testing auction won email...');
    try {
        const result = await sendAuctionWonEmail(
            'winner@example.com',
            'Alice Winner',
            'Vintage Camera',
            299.99
        );
        console.log('✅ Auction won email sent:', result.messageId);
        if (result.preview) {
            console.log('📧 Preview URL:', result.preview);
        }
    } catch (error) {
        console.error('❌ Failed to send auction won email:', error.message);
    }

    console.log('\n6. Testing new bid email...');
    try {
        const result = await sendNewBidEmail(
            'seller@example.com',
            'Bob Seller',
            'Vintage Camera',
            250.00,
            'Charlie Bidder'
        );
        console.log('✅ New bid email sent:', result.messageId);
        if (result.preview) {
            console.log('📧 Preview URL:', result.preview);
        }
    } catch (error) {
        console.error('❌ Failed to send new bid email:', error.message);
    }

    console.log('\n✅ Email testing complete!');
}

// Run tests
testEmails().catch(console.error);

