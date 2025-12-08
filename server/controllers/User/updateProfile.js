import userModel from "../../models/User.js";
import bcrypt from "bcryptjs";

async function updateProfile(req, res) {
    try {
        const { userId } = req.userData;
        const { name, phone, location, currentPassword, newPassword } = req.body;

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: true,
                success: false,
                message: "User not found"
            });
        }

        // Prepare update object
        const updateData = {};

        // Validate and add fields to update
        if (name !== undefined && name.trim() !== '') {
            updateData.name = name.trim();
        }

        if (phone !== undefined) {
            updateData.phone = phone.trim();
        }

        if (location !== undefined) {
            updateData.location = location.trim();
        }

        // Handle password update if provided
        if (newPassword && currentPassword) {
            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            // Validate new password strength
            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "New password must be at least 6 characters long"
                });
            }

            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);
            updateData.password = hashedNewPassword;
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "No valid fields provided for update"
            });
        }

        // Update user profile
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from response

        return res.status(200).json({
            error: false,
            success: true,
            message: "Profile updated successfully",
            userData: updatedUser
        });

    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error"
        });
    }
}

export default updateProfile;
