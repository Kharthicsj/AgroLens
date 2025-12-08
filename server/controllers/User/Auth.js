import userModel from "../../models/User.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

async function signup(req, res) {
    try {
        const { name, email, password, phone, location } = req.body

        const isExistingUser = await userModel.findOne({ email: email })
        if (isExistingUser) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "User account already exists"
            })
        } else {
            const hashedPassword = await bcrypt.hash(password, 12)

            const newUser = new userModel({
                name,
                email,
                password: hashedPassword,
                phone,
                location
            })

            const result = await newUser.save();
            return res.status(200).json({
                error: false,
                success: true,
                message: result
            })
        }

    } catch (err) {
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error"
        })
    }
}

async function signin(req, res) {
    try {
        const { email, password } = req.body

        const isExistingUser = await userModel.findOne({ email: email });

        if (!isExistingUser) {
            return res.status(400).json({
                error: true,
                success: false,
                message: "User account does not exist"
            })
        } else {
            const isValidPassword = await bcrypt.compare(password, isExistingUser.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    error: true,
                    success: false,
                    message: "Incorrect Password"
                })
            } else {
                const token = jwt.sign({ userId: isExistingUser._id, email: isExistingUser.email },
                    "MySecretCode", {
                    expiresIn: "7d"
                })
                return res.status(200).json({
                    error: false,
                    success: true,
                    message: "Login Successful",
                    token: token
                })
            }
        }

    } catch (err) {
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error"
        })
    }
}

export { signup, signin }