import express from "express"
import { signup, signin } from "../controllers/User/Auth.js"

import { getFertilizerRecommendations, getFertilizerRecommendationById, getDistricts } from "../controllers/Fertilizer/recommendations.js"

import tokenAuth from "../middlewares/tokenAuth.js"
import getUserData from "../controllers/User/fetchUserData.js"
import updateProfile from "../controllers/User/updateProfile.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("Server is Running Successfully")
})

//Auth Routes
router.post("/signup", signup)
router.post("/signin", signin)

// Fertilizer recommendations
router.get("/fertilizer-recommendations/districts", getDistricts)
router.get("/fertilizer-recommendations", getFertilizerRecommendations)
router.get("/fertilizer-recommendations/:id", getFertilizerRecommendationById)

//Protected Routes
router.use(tokenAuth)

router.get("/fetchUser", getUserData)
router.put("/updateProfile", updateProfile)

export default router