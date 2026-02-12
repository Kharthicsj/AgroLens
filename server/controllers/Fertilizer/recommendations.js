import FertilizerRecommendation from "../../models/FertilizerRecommendation.js";

export async function getFertilizerRecommendations(req, res) {
    try {
        const { district, soilType, crop } = req.query;

        const filter = {};
        if (district) filter.District = district;
        if (soilType) filter.Soil_Type = soilType;
        if (crop) filter.Crop_Name = crop;

        const recommendations = await FertilizerRecommendation.find(filter).lean();

        return res.status(200).json({
            error: false,
            success: true,
            count: recommendations.length,
            data: recommendations,
        });
    } catch (err) {
        console.error("getFertilizerRecommendations error", err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error",
        });
    }
}

// GET /fertilizer-recommendations/districts - Get unique districts
export async function getDistricts(req, res) {
    try {

        // Check total count first
        const totalCount = await FertilizerRecommendation.countDocuments();

        if (totalCount === 0) {
            console.log("WARNING: No documents found in collection!");
        }

        const districts = await FertilizerRecommendation.distinct("District");


        const sortedDistricts = districts.filter(d => d && d.trim()).sort();

        return res.status(200).json({
            error: false,
            success: true,
            count: sortedDistricts.length,
            data: sortedDistricts,
        });
    } catch (err) {
        console.error("=== getDistricts error ===", err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error",
            details: err.message
        });
    }
}

// GET /fertilizer-recommendations/:id
export async function getFertilizerRecommendationById(req, res) {
    try {
        const { id } = req.params;
        const recommendation = await FertilizerRecommendation.findById(id).lean();

        if (!recommendation) {
            return res.status(404).json({
                error: true,
                success: false,
                message: "Recommendation not found",
            });
        }

        return res.status(200).json({
            error: false,
            success: true,
            data: recommendation,
        });
    } catch (err) {
        console.error("getFertilizerRecommendationById error", err);
        return res.status(500).json({
            error: true,
            success: false,
            message: "Internal Server Error",
        });
    }
}
