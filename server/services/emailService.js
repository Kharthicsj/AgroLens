import nodemailer from 'nodemailer';

// Create transporter with multiple fallback configurations
const createTransporter = () => {
    // Configuration 1: Port 587 with STARTTLS (most compatible with hosting platforms)
    const config1 = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.NODEMAILER_MAIL,
            pass: process.env.NODEMAILER_APP_PASSWORD
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        pool: true,
        maxConnections: 5,
        maxMessages: 10,
        rateDelta: 1000,
        rateLimit: 5
    };

    return nodemailer.createTransport(config1);
};

// Fallback transporter for port 465
const createFallbackTransporter = () => {
    const config2 = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.NODEMAILER_MAIL,
            pass: process.env.NODEMAILER_APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        pool: true,
        maxConnections: 5,
        maxMessages: 10
    };

    return nodemailer.createTransport(config2);
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

// Send OTP email with retry logic
export const sendOTPEmail = async (email, otp) => {
    // Validate email and OTP
    if (!email || !otp) {
        throw new Error('Email and OTP are required');
    }

    // Check environment variables
    if (!process.env.NODEMAILER_MAIL || !process.env.NODEMAILER_APP_PASSWORD) {
        console.error('Missing email environment variables');
        throw new Error('Email service not configured properly');
    }

    const appName = process.env.NODEMAILER_APP_NAME || 'AgroLens';
    const mailOptions = {
        from: `"${appName}" <${process.env.NODEMAILER_MAIL}>`,
        to: email,
        subject: `${appName} - Password Reset OTP`,
        html: generateOTPEmailTemplate(otp, appName)
    };

    console.log('Sending OTP email to:', email);

    // Try primary transporter (Port 587)
    try {
        const transporter = createTransporter();
        console.log('Attempting with port 587 (STARTTLS)...');
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully via port 587:', info.messageId);
        transporter.close(); // Close connection pool
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.log('Port 587 failed, trying fallback port 465 (SSL)...', error.message);
        
        // Try fallback transporter (Port 465)
        try {
            const fallbackTransporter = createFallbackTransporter();
            const info = await fallbackTransporter.sendMail(mailOptions);
            console.log('OTP email sent successfully via port 465:', info.messageId);
            fallbackTransporter.close(); // Close connection pool
            return { success: true, messageId: info.messageId };
        } catch (fallbackError) {
            console.error('Both port 587 and 465 failed');
            console.error('Port 587 error:', error.code, error.message);
            console.error('Port 465 error:', fallbackError.code, fallbackError.message);
            throw new Error('Failed to send OTP email. Please check your network and try again.');
        }
    }
};

export default { sendOTPEmail };
