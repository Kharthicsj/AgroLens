import express from "express"
import { signup, signin } from "../controllers/User/Auth.js"

import { getFertilizerRecommendations, getFertilizerRecommendationById, getDistricts } from "../controllers/Fertilizer/recommendations.js"

import {
    detectDisease,
    getDetectionHistory,
    getDetectionById,
    updateDetection,
    deleteDetection,
    getUserStats,
    checkMLHealth
} from "../controllers/Disease/diseaseDetection.js"

import tokenAuth from "../middlewares/tokenAuth.js"
import getUserData from "../controllers/User/fetchUserData.js"
import updateProfile from "../controllers/User/updateProfile.js"

const router = express.Router()

router.get("/", (req, res) => {
    res.send("AgroLens Server is Running Successfully")
})

//Auth Routes
router.post("/signup", signup)
router.post("/signin", signin)

// Fertilizer recommendations (Public)
router.get("/fertilizer-recommendations/districts", getDistricts)
router.get("/fertilizer-recommendations", getFertilizerRecommendations)
router.get("/fertilizer-recommendations/:id", getFertilizerRecommendationById)

// ML Health Check (Public - for monitoring)
router.get("/ml-health", checkMLHealth)

//Protected Routes (Require Authentication)
router.use(tokenAuth)

// User Profile Routes
router.get("/fetchUser", getUserData)
router.put("/updateProfile", updateProfile)

// Disease Detection Routes
router.post("/disease/detect", detectDisease)
router.get("/disease/history", getDetectionHistory)
router.get("/disease/detection/:id", getDetectionById)
router.patch("/disease/detection/:id", updateDetection)
router.delete("/disease/detection/:id", deleteDetection)
router.get("/disease/stats", getUserStats)

export default router