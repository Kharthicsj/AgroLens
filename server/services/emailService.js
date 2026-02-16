const sendEmailViaBrevo = async (to, subject, html) => {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.NODEMAILER_MAIL || 'noreply@agrolens.com';
    const FROM_NAME = process.env.NODEMAILER_APP_NAME || 'AgroLens';

    if (!BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY not configured. Please add it to your environment variables.');
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: FROM_NAME,
                    email: FROM_EMAIL
                },
                to: [
                    {
                        email: to
                    }
                ],
                subject: subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle specific Brevo API errors
            if (response.status === 401) {
                throw new Error('Invalid Brevo API key. Please check your BREVO_API_KEY.');
            } else if (response.status === 400) {
                const errorMsg = errorData.message || 'Bad request';
                if (errorMsg.includes('sender')) {
                    throw new Error('Sender email not verified. Please verify your sender email in Brevo dashboard.');
                }
                throw new Error(`Email validation failed: ${errorMsg}`);
            } else if (response.status === 402) {
                throw new Error('Daily email limit exceeded. Please upgrade your Brevo plan or try again tomorrow.');
            } else {
                throw new Error(errorData.message || `Brevo API error: ${response.status}`);
            }
        }

        const data = await response.json();

        return {
            success: true,
            messageId: data.messageId,
            service: 'Brevo'
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
 * Uses Brevo API (HTTPS) - more reliable than SMTP on cloud platforms
 * Can send to ANY email address (no domain verification needed)
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
        const result = await sendEmailViaBrevo(email, subject, html);
        console.log('✅ OTP email sent successfully via Brevo');
        console.log('   Message ID:', result.messageId);
        return result;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error.message);

        // Provide user-friendly error messages
        if (error.message.includes('BREVO_API_KEY not configured')) {
            throw new Error('Email service not configured. Please contact support.');
        } else if (error.message.includes('Sender email not verified')) {
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
