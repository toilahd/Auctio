const nodeMailer = require('nodemailer');
require('dotenv').config();

// Create transporter with SMTP configuration
const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "dawn.dicki47@ethereal.email",
        pass: process.env.SMTP_PASS || "1PYrR3JE4NSFuSqtxX",
    },
});

/**
 * Send email with options
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional)
 * @returns {Promise<Object>} - Email send result
 */
const sendEmail = async ({ to, subject, text, html, from }) => {
    const mailOptions = {
        from: from || process.env.SMTP_FROM || '"Auctio" <noreply@auctio.com>',
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return {
            success: true,
            messageId: info.messageId,
            preview: nodeMailer.getTestMessageUrl(info), // Only works with Ethereal
        };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (to, verificationToken, userName) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email</h1>
                </div>
                <div class="content">
                    <p>Hi ${userName},</p>
                    <p>Thank you for registering with Auctio! Please verify your email address by clicking the button below:</p>
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Auctio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to,
        subject: 'Verify Your Email - Auctio',
        html,
        text: `Hi ${userName},\n\nPlease verify your email by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hi ${userName},</p>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Auctio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to,
        subject: 'Reset Your Password - Auctio',
        html,
        text: `Hi ${userName},\n\nReset your password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour.`,
    });
};

/**
 * Send auction won notification
 */
const sendAuctionWonEmail = async (to, userName, productTitle, finalPrice) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10B981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .price { font-size: 24px; font-weight: bold; color: #10B981; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations! You Won!</h1>
                </div>
                <div class="content">
                    <p>Hi ${userName},</p>
                    <p>Congratulations! You've won the auction for:</p>
                    <h2>${productTitle}</h2>
                    <p>Final price: <span class="price">$${finalPrice}</span></p>
                    <p>Please complete your payment to finalize the purchase.</p>
                    <a href="${process.env.FRONTEND_URL}/orders" class="button">View Order</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Auctio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to,
        subject: `You Won! ${productTitle} - Auctio`,
        html,
        text: `Congratulations ${userName}! You've won the auction for ${productTitle} at $${finalPrice}. Please complete your payment.`,
    });
};

/**
 * Send bid notification to seller
 */
const sendNewBidEmail = async (to, sellerName, productTitle, bidAmount, bidderName) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Bid Received!</h1>
                </div>
                <div class="content">
                    <p>Hi ${sellerName},</p>
                    <p>Your auction has received a new bid:</p>
                    <h3>${productTitle}</h3>
                    <p><strong>Bid Amount:</strong> $${bidAmount}</p>
                    <p><strong>Bidder:</strong> ${bidderName}</p>
                    <a href="${process.env.FRONTEND_URL}/products" class="button">View Auction</a>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Auctio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return await sendEmail({
        to,
        subject: `New Bid on ${productTitle} - Auctio`,
        html,
        text: `Hi ${sellerName}, Your auction "${productTitle}" received a new bid of $${bidAmount} from ${bidderName}.`,
    });
};

/**
 * Test email configuration
 */
const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server connection failed:', error);
        return false;
    }
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendAuctionWonEmail,
    sendNewBidEmail,
    testEmailConnection,
    transporter,
};
