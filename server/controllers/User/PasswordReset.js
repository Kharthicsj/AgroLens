import userModel from "../../models/User.js";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../../services/emailService.js";

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Forgot Password - Send OTP
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !email.trim()) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                error: true,
                success: false,
                message: "No account found with this email address"
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Save OTP and expiry to database
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp);

            return res.status(200).json({
                error: false,
                success: true,
                message: "OTP sent successfully to your email"
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

            // Clear OTP from database if email fails
            user.otp = null;
            user.otpExpiry = null;
            await user.save();

            return res.status(500).json({
                error: true,
                success: false,
                message: "Failed to send OTP email. Please try again later."
            });
        }

    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error"
        });
    }
}

// Reset Password - Verify OTP and Update Password
async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate inputs
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "Email, OTP, and new password are required"
            });
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({
                error: true,
                success: false,
                message: "No account found with this email address"
            });
        }

        // Check if OTP exists
        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "No OTP request found. Please request a new OTP"
            });
        }

        // Check if OTP is expired
        if (new Date() > user.otpExpiry) {
            // Clear expired OTP
            user.otp = null;
            user.otpExpiry = null;
            await user.save();

            return res.status(400).json({
                error: true,
                success: false,
                message: "OTP has expired. Please request a new one"
            });
        }

        // Verify OTP
        if (user.otp !== otp.trim()) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "Invalid OTP. Please check and try again"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({
            error: false,
            success: true,
            message: "Password reset successful. Please login with your new password"
        });

    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error"
        });
    }
}

export { forgotPassword, resetPassword };
