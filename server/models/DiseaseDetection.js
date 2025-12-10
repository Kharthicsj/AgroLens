import mongoose from "mongoose";

const diseaseDetectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true
        },
        cloudinaryPublicId: {
            type: String,
            trim: true,
            default: ""
        },
        prediction: {
            diseaseName: {
                type: String,
                required: true,
                trim: true
            },
            confidence: {
                type: Number,
                required: true,
                min: 0,
                max: 1
            },
            confidencePercentage: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            classIndex: {
                type: Number,
                required: true
            }
        },
        allPredictions: [{
            class: {
                type: String,
                required: true
            },
            confidence: {
                type: Number,
                required: true
            },
            percentage: {
                type: Number,
                required: true
            }
        }],
        cropType: {
            type: String,
            trim: true,
            default: ""
        },
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ['pending', 'analyzed', 'treated', 'resolved'],
            default: 'analyzed'
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: 'diseaseDetections'
    }
);

// Indexes for better query performance
diseaseDetectionSchema.index({ userId: 1, createdAt: -1 });
diseaseDetectionSchema.index({ 'prediction.diseaseName': 1 });
diseaseDetectionSchema.index({ status: 1 });
diseaseDetectionSchema.index({ isDeleted: 1 });

// Virtual for getting detection age
diseaseDetectionSchema.virtual('detectionAge').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to get user-friendly prediction summary
diseaseDetectionSchema.methods.getPredictionSummary = function () {
    return {
        disease: this.prediction.diseaseName,
        confidence: `${this.prediction.confidencePercentage.toFixed(2)}%`,
        date: this.createdAt.toLocaleDateString(),
        status: this.status
    };
};

// Static method to get user's detection history
diseaseDetectionSchema.statics.getUserHistory = async function (userId, limit = 10) {
    return this.find({
        userId,
        isDeleted: false
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-allPredictions -__v');
};

// Static method to get statistics
diseaseDetectionSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
        {
            $group: {
                _id: '$prediction.diseaseName',
                count: { $sum: 1 },
                avgConfidence: { $avg: '$prediction.confidence' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return stats;
};

const DiseaseDetection = mongoose.model("DiseaseDetection", diseaseDetectionSchema);

export default DiseaseDetection;
