import userModel from "../../models/User.js";

async function getUserData(req, res) {
    try {
        const { userId, email } = req.userData;

        const userDetails = await userModel.findOne({ _id: userId, email: email })

        if (!userDetails) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "No userData found"
            })
        }

        return res.status(200).json({
            error: false,
            success: true,
            userData: userDetails,
            message: "User Details fetched successfully"
        })

    } catch (err) {
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error",
        })
    }
}

export default getUserData