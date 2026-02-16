import nodemailer from 'nodemailer';

// Multiple transporter configurations to try in sequence
const createTransporters = () => {
    const transporters = [];

    // Configuration 1: OAuth2 with port 587 (STARTTLS)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        transporters.push({
            name: 'OAuth2-587',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    type: 'OAuth2',
                    user: process.env.NODEMAILER_MAIL,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            }
        });

        // Configuration 2: OAuth2 with port 465 (SSL)
        transporters.push({
            name: 'OAuth2-465',
            config: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: process.env.NODEMAILER_MAIL,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false
                }
            }
        });
    }

    // Configuration 3: App Password with port 587
    if (process.env.NODEMAILER_APP_PASSWORD) {
        transporters.push({
            name: 'AppPass-587',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.NODEMAILER_MAIL,
                    pass: process.env.NODEMAILER_APP_PASSWORD
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            }
        });

        // Configuration 4: App Password with port 465
        transporters.push({
            name: 'AppPass-465',
            config: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.NODEMAILER_MAIL,
                    pass: process.env.NODEMAILER_APP_PASSWORD
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false
                }
            }
        });

        // Configuration 5: App Password with port 2525 (alternative port, less likely to be blocked)
        transporters.push({
            name: 'AppPass-2525',
            config: {
                host: 'smtp.gmail.com',
                port: 2525,
                secure: false,
                auth: {
                    user: process.env.NODEMAILER_MAIL,
                    pass: process.env.NODEMAILER_APP_PASSWORD
                },
                connectionTimeout: 30000,
                greetingTimeout: 30000,
                socketTimeout: 30000,
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            }
        });
    }

    return transporters;
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

// Send OTP email
// Send OTP email with multiple fallback configurations
export const sendOTPEmail = async (email, otp) => {
    // Validate email and OTP
    if (!email || !otp) {
        throw new Error('Email and OTP are required');
    }

    // Check environment variables
    if (!process.env.NODEMAILER_MAIL) {
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

    const transporters = createTransporters();
    
    if (transporters.length === 0) {
        throw new Error('No email authentication configured. Please set up OAuth2 or App Password.');
    }

    const errors = [];

    // Try each transporter configuration
    for (const { name, config } of transporters) {
        try {
            console.log(`Attempting to send email using ${name}...`);
            const transporter = nodemailer.createTransport(config);
            
            // Skip verification and try sending directly (verification can also timeout on Render)
            const info = await transporter.sendMail(mailOptions);
            console.log(`✓ OTP email sent successfully using ${name}:`, info.messageId);
            
            // Close the transporter
            transporter.close();
            
            return { success: true, messageId: info.messageId, method: name };
        } catch (error) {
            console.log(`✗ ${name} failed:`, error.code || error.message);
            errors.push({ method: name, error: error.message, code: error.code });
            // Continue to next transporter
            continue;
        }
    }

    // If all transporters failed
    console.error('All email sending methods failed:');
    errors.forEach(({ method, error, code }) => {
        console.error(`  - ${method}: ${code || 'ERROR'} - ${error}`);
    });

    throw new Error('Failed to send OTP email. All connection methods failed. Please check your email configuration and network.');
};

export default { sendOTPEmail };
