import mongoose from "mongoose";

const fertilizerRecommendationSchema = new mongoose.Schema(
    {
        District: { type: String, required: true, trim: true, index: true },
        Soil_Type: { type: String, trim: true, default: "" },
        Crop_Name: { type: String, required: true, trim: true, index: true },
        Basal_Fertilizer: { type: String, trim: true, default: "" },
        Basal_Dosage_kg_per_acre: { type: Number },
        Topdress1_Fertilizer: { type: String, trim: true, default: "" },
        Topdress1_Stage: { type: String, trim: true, default: "" },
        Topdress1_Dosage_kg_per_acre: { type: Number },
        Topdress2_Fertilizer: { type: String, trim: true, default: "" },
        Topdress2_Stage: { type: String, trim: true, default: "" },
        Topdress2_Dosage_kg_per_acre: { type: Number },
        Notes: { type: String, trim: true, default: "" },
    },
    {
        timestamps: true,
        collection: 'fertilizerRecommendations'
    }
);

fertilizerRecommendationSchema.index({ District: 1, Soil_Type: 1, Crop_Name: 1 });

const FertilizerRecommendation = mongoose.model(
    "FertilizerRecommendation",
    fertilizerRecommendationSchema
);

export default FertilizerRecommendation;
