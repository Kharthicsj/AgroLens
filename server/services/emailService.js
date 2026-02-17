/*
 * ═══════════════════════════════════════════════════════════════════════════
 * EMAIL SERVICE - TWILIO SENDGRID API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 📧 Setup Instructions - Get Your SendGrid API Key (Takes 5 minutes):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * STEP 1: CREATE SENDGRID ACCOUNT
 * ─────────────────────────────────
 * • Visit: https://signup.sendgrid.com/
 * • Sign up with your email (FREE account - no credit card required)
 * • Verify your email address (check inbox/spam)
 * 
 * STEP 2: VERIFY SENDER IDENTITY (REQUIRED)
 * ──────────────────────────────────────────
 * • Login to SendGrid Dashboard: https://app.sendgrid.com/
 * • Go to: Settings → Sender Authentication
 *   URL: https://app.sendgrid.com/settings/sender_auth
 * 
 * Choose ONE option:
 * 
 *   Option A: Single Sender Verification (EASIEST - Recommended for testing)
 *   ────────────────────────────────────────────────────────────────────────
 *   • Click "Verify a Single Sender"
 *   • Fill in the form:
 *     - From Name: AgroLens
 *     - From Email: your-email@gmail.com (use your actual email)
 *     - Reply To: same as above
 *     - Company details (can be anything for testing)
 *   • Click "Create"
 *   • Check your email and click the verification link
 *   • ✅ Done! Your sender email is verified
 * 
 *   Option B: Domain Authentication (For production with custom domain)
 *   ───────────────────────────────────────────────────────────────────
 *   • Click "Authenticate Your Domain"
 *   • Enter your domain (e.g., agrolens.com)
 *   • Follow DNS setup instructions
 *   • Wait for DNS propagation (can take 24-48 hours)
 * 
 * STEP 3: CREATE API KEY
 * ──────────────────────
 * • Go to: Settings → API Keys
 *   URL: https://app.sendgrid.com/settings/api_keys
 * • Click "Create API Key" button
 * • Configure:
 *   - Name: "AgroLens Production API"
 *   - Permission Level: Choose "Restricted Access"
 *   - Permissions: Enable only "Mail Send" → Full Access
 * • Click "Create & View"
 * • ⚠️  IMPORTANT: Copy the API key NOW (starts with "SG.")
 *   You won't be able to see it again!
 * 
 * STEP 4: ADD TO YOUR .ENV FILE
 * ──────────────────────────────
 * Add these lines to your server/.env file:
 * 
 *   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   SENDGRID_FROM_EMAIL=your-verified-email@gmail.com
 *   NODEMAILER_APP_NAME=AgroLens
 * 
 * Replace:
 *   - SG.xxx... with your actual API key from Step 3
 *   - your-verified-email@gmail.com with the email you verified in Step 2
 * 
 * STEP 5: TEST THE SETUP
 * ──────────────────────
 * • Restart your Node.js server
 * • Try the password reset feature in your app
 * • Check SendGrid Dashboard → Activity Feed to see email status
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 📊 SENDGRID FREE TIER LIMITS:
 * • 100 emails per day (forever free)
 * • Send to ANY email address
 * • No domain required (with Single Sender Verification)
 * • Works immediately after verification
 * • Professional email delivery
 * 
 * 🔗 HELPFUL LINKS:
 * • SendGrid Dashboard: https://app.sendgrid.com/
 * • API Keys: https://app.sendgrid.com/settings/api_keys
 * • Sender Authentication: https://app.sendgrid.com/settings/sender_auth
 * • Activity Feed (Monitor emails): https://app.sendgrid.com/email_activity
 * • API Documentation: https://docs.sendgrid.com/api-reference/mail-send/mail-send
 * 
 * ⚠️  TROUBLESHOOTING:
 * • Error "Invalid API key": Check SENDGRID_API_KEY in .env file
 * • Error "From email address issue": Verify sender identity in Step 2
 * • Emails not arriving: Check Activity Feed in SendGrid Dashboard
 * • Daily limit reached: Upgrade plan or wait 24 hours
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const sendEmailViaSendGrid = async (to, subject, html) => {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.NODEMAILER_MAIL || 'noreply@agrolens.com';
    const FROM_NAME = process.env.NODEMAILER_APP_NAME || 'AgroLens';

    if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY not configured. Please add it to your environment variables.');
    }

    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                personalizations: [
                    {
                        to: [{ email: to }],
                        subject: subject
                    }
                ],
                from: {
                    email: FROM_EMAIL,
                    name: FROM_NAME
                },
                content: [
                    {
                        type: 'text/html',
                        value: html
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            let errorObj;
            try {
                errorObj = JSON.parse(errorData);
            } catch {
                errorObj = { errors: [{ message: errorData }] };
            }

            // Handle SendGrid API errors
            if (response.status === 401) {
                throw new Error('Invalid SendGrid API key. Please check your SENDGRID_API_KEY.');
            } else if (response.status === 403) {
                throw new Error('SendGrid API access forbidden. Please check your API key permissions.');
            } else if (response.status === 400) {
                const errorMsg = errorObj.errors?.[0]?.message || 'Bad request';
                if (errorMsg.includes('from email') || errorMsg.includes('sender')) {
                    throw new Error('From email address issue. Please verify your sender identity in SendGrid dashboard.');
                }
                throw new Error(`SendGrid validation error: ${errorMsg}`);
            } else {
                const errorMsg = errorObj.errors?.[0]?.message || 'Unknown error';
                throw new Error(`SendGrid API error: ${errorMsg}`);
            }
        }

        // SendGrid returns 202 on success with empty body
        return {
            success: true,
            messageId: response.headers.get('X-Message-Id') || 'sent',
            service: 'SendGrid'
        };
    } catch (error) {
        if (error.message.includes('fetch') || error.code === 'ENOTFOUND') {
            throw new Error('Network error. Unable to reach email service.');
        }
        throw error;
    }
};

// Generate HTML email template
const generateOTPEmailTemplate = (otp, appName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fa;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: rgba(255, 255, 255, 0.1);
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
            }
            .logo {
                font-size: 32px;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            }
            .tagline {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                margin-top: 8px;
            }
            .content {
                background: #ffffff;
                padding: 40px 30px;
            }
            .greeting {
                font-size: 24px;
                color: #2d3748;
                margin-bottom: 20px;
                font-weight: 600;
            }
            .message {
                font-size: 16px;
                color: #4a5568;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .otp-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .otp-label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .otp-code {
                font-size: 42px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 8px;
                margin: 10px 0;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            }
            .expiry-info {
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                margin-top: 15px;
            }
            .warning {
                background: #fff5f5;
                border-left: 4px solid #fc8181;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .warning-text {
                color: #742a2a;
                font-size: 14px;
                margin: 0;
            }
            .footer {
                background: #f7fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer-text {
                color: #718096;
                font-size: 13px;
                line-height: 1.8;
                margin: 5px 0;
            }
            .support-link {
                color: #667eea;
                text-decoration: none;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1 class="logo">🌾 ${appName}</h1>
                <p class="tagline">Smart Agriculture Solutions</p>
            </div>
            
            <div class="content">
                <h2 class="greeting">Password Reset Request</h2>
                
                <p class="message">
                    Hello! We received a request to reset your password. Use the OTP code below to complete your password reset:
                </p>
                
                <div class="otp-container">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">${otp}</div>
                    <div class="expiry-info">⏰ Valid for 10 minutes</div>
                </div>
                
                <p class="message">
                    Enter this code in the app to set your new password. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </p>
                
                <div class="warning">
                    <p class="warning-text">
                        <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. ${appName} will never ask for your OTP via phone or email.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p class="footer-text">
                    <strong>${appName}</strong><br>
                    Empowering Farmers with AI Technology
                </p>
                <p class="footer-text">
                    Need help? Contact us at <a href="mailto:${process.env.NODEMAILER_MAIL}" class="support-link">${process.env.NODEMAILER_MAIL}</a>
                </p>
                <p class="footer-text">
                    © ${new Date().getFullYear()} ${appName}. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Send OTP email with proper error handling
 * Uses SendGrid API (HTTPS) - reliable and works immediately, sends to any email
 */
export const sendOTPEmail = async (email, otp) => {
    // Validate inputs
    if (!email || !otp) {
        throw new Error('Email and OTP are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    const appName = process.env.NODEMAILER_APP_NAME || 'AgroLens';
    const subject = `${appName} - Password Reset OTP`;
    const html = generateOTPEmailTemplate(otp, appName);

    console.log('📧 Sending OTP email to:', email);

    try {
        const result = await sendEmailViaSendGrid(email, subject, html);
        console.log('✅ OTP email sent successfully via SendGrid');
        console.log('   Message ID:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);

        // Provide user-friendly error messages
        if (error.message.includes('SENDGRID_API_KEY not configured')) {
            throw new Error('Email service not configured. Please contact support.');
        } else if (error.message.includes('From email address issue') || error.message.includes('sender identity')) {
            throw new Error('Email service configuration error. Please contact support.');
        } else if (error.message.includes('Invalid email format')) {
            throw new Error('Invalid email address. Please check and try again.');
        } else if (error.message.includes('Daily email limit exceeded')) {
            throw new Error('Service temporarily unavailable. Please try again later.');
        } else if (error.message.includes('Network error')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        } else {
            // Generic error for production (don't expose internal details)
            throw new Error('Failed to send OTP email. Please try again later or contact support.');
        }
    }
};

export default { sendOTPEmail };
