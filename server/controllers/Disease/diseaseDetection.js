import axios from 'axios';
import DiseaseDetection from '../../models/DiseaseDetection.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

// ML API Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
const ML_API_TIMEOUT = 30000; // 30 seconds

/**
 * Detect disease from image (Base64)
 * @route POST /api/disease/detect
 * @access Private (requires authentication)
 */
export const detectDisease = async (req, res) => {
    try {
        const { image, cropType, location, notes } = req.body;
        const userId = req.user._id; // From auth middleware

        console.log(`🔍 Disease detection request from user: ${userId}`);

        // Validate required fields
        if (!image) {
            console.error('❌ No image data received');
            return res.status(400).json({
                success: false,
                message: 'Image data is required (base64 format)'
            });
        }

        console.log(`📦 Received image data: ${image.length} characters`);

        // Convert base64 to data URI if not already in that format
        let base64Data = image;
        if (!image.startsWith('data:image')) {
            // Add data URI prefix for Cloudinary
            base64Data = `data:image/jpeg;base64,${image}`;
            console.log('✅ Added data URI prefix to base64 string');
        }

        // Step 1: Upload image to Cloudinary
        console.log('📤 Step 1: Uploading to Cloudinary...');
        let cloudinaryResult;
        try {
            cloudinaryResult = await uploadToCloudinary(base64Data, userId.toString());
            console.log(`✅ Cloudinary upload successful!`);
            console.log(`   - Public ID: ${cloudinaryResult.publicId}`);
            console.log(`   - URL: ${cloudinaryResult.url.substring(0, 60)}...`);
        } catch (uploadError) {
            console.error('❌ Cloudinary upload failed:', uploadError.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload image to Cloudinary',
                error: uploadError.message
            });
        }

        const imageUrl = cloudinaryResult.url;
        const cloudinaryPublicId = cloudinaryResult.publicId;

        // Step 2: Call ML API with Cloudinary URL
        console.log('🤖 Step 2: Sending to ML API...');
        console.log(`   - ML API URL: ${ML_API_URL}/api/predict`);
        console.log(`   - Image URL: ${imageUrl.substring(0, 60)}...`);

        let mlResponse;
        try {
            mlResponse = await axios.post(
                `${ML_API_URL}/api/predict`,
                { imageUrl },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: ML_API_TIMEOUT
                }
            );

            console.log('✅ ML API response received');

            // Check if ML API returned success
            if (!mlResponse.data.success) {
                throw new Error(mlResponse.data.error || 'ML prediction failed');
            }

            console.log(`   - Prediction: ${mlResponse.data.prediction}`);
            console.log(`   - Confidence: ${mlResponse.data.confidence_percentage.toFixed(2)}%`);
        } catch (mlError) {
            console.error('❌ ML API error:', mlError.message);

            // Clean up: Delete uploaded image from Cloudinary if ML fails
            try {
                await deleteFromCloudinary(cloudinaryPublicId);
                console.log('🧹 Cleaned up Cloudinary image after ML failure');
            } catch (cleanupError) {
                console.error('⚠️  Failed to cleanup image:', cleanupError.message);
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to analyze image',
                error: mlError.message
            });
        }

        const predictionData = mlResponse.data;

        // Step 3: Save detection result to database
        console.log('💾 Step 3: Saving to database...');
        const detectionRecord = new DiseaseDetection({
            userId,
            imageUrl,
            cloudinaryPublicId,
            prediction: {
                diseaseName: predictionData.prediction,
                confidence: predictionData.confidence,
                confidencePercentage: predictionData.confidence_percentage,
                classIndex: predictionData.class_index
            },
            allPredictions: predictionData.all_predictions || [],
            cropType: cropType || 'unknown',
            location: location || {},
            notes: notes || '',
            status: 'analyzed'
        });

        await detectionRecord.save();

        console.log(`✅ Detection saved successfully!`);
        console.log(`   - Database ID: ${detectionRecord._id}`);
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ DETECTION COMPLETE: ${predictionData.prediction}`);
        console.log(`   Confidence: ${predictionData.confidence_percentage.toFixed(2)}%`);
        console.log(`${'='.repeat(60)}\n`);

        // Step 4: Return response to frontend
        return res.status(200).json({
            success: true,
            message: 'Disease detected successfully',
            data: {
                detectionId: detectionRecord._id,
                imageUrl: detectionRecord.imageUrl,
                cloudinaryPublicId: detectionRecord.cloudinaryPublicId,
                prediction: {
                    disease: predictionData.prediction,
                    confidence: predictionData.confidence,
                    confidencePercentage: predictionData.confidence_percentage,
                    classIndex: predictionData.class_index
                },
                allPredictions: predictionData.all_predictions,
                timestamp: detectionRecord.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Disease detection error:', error.message);

        // Handle ML API connection errors
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'ML service is currently unavailable. Please try again later.'
            });
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: 'ML prediction timeout. The image may be too large or service is slow.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to detect disease',
            error: error.message
        });
    }
};

/**
 * Get user's detection history
 * @route GET /api/disease/history
 * @access Private
 */
export const getDetectionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 20, page = 1, status } = req.query;

        const query = {
            userId,
            isDeleted: false
        };

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [detections, total] = await Promise.all([
            DiseaseDetection.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .select('-allPredictions -__v'),
            DiseaseDetection.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                detections,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Error fetching detection history:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch detection history',
            error: error.message
        });
    }
};

/**
 * Get single detection details
 * @route GET /api/disease/detection/:id
 * @access Private
 */
export const getDetectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const detection = await DiseaseDetection.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!detection) {
            return res.status(404).json({
                success: false,
                message: 'Detection not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: detection
        });

    } catch (error) {
        console.error('Error fetching detection:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch detection details',
            error: error.message
        });
    }
};

/**
 * Update detection status or notes
 * @route PATCH /api/disease/detection/:id
 * @access Private
 */
export const updateDetection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { status, notes, cropType } = req.body;

        const detection = await DiseaseDetection.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!detection) {
            return res.status(404).json({
                success: false,
                message: 'Detection not found'
            });
        }

        // Update fields
        if (status) detection.status = status;
        if (notes !== undefined) detection.notes = notes;
        if (cropType !== undefined) detection.cropType = cropType;

        await detection.save();

        return res.status(200).json({
            success: true,
            message: 'Detection updated successfully',
            data: detection
        });

    } catch (error) {
        console.error('Error updating detection:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update detection',
            error: error.message
        });
    }
};

/**
 * Delete detection (soft delete + cleanup Cloudinary)
 * @route DELETE /api/disease/detection/:id
 * @access Private
 */
export const deleteDetection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { hardDelete = false } = req.query; // Optional: permanently delete from Cloudinary

        const detection = await DiseaseDetection.findOne({
            _id: id,
            userId,
            isDeleted: false
        });

        if (!detection) {
            return res.status(404).json({
                success: false,
                message: 'Detection not found'
            });
        }

        // Soft delete in database
        detection.isDeleted = true;
        await detection.save();

        // If hardDelete requested, also remove from Cloudinary
        if (hardDelete && detection.cloudinaryPublicId) {
            try {
                await deleteFromCloudinary(detection.cloudinaryPublicId);
                console.log(`🗑️  Image deleted from Cloudinary: ${detection.cloudinaryPublicId}`);
            } catch (cloudinaryError) {
                console.error('⚠️  Failed to delete from Cloudinary:', cloudinaryError.message);
                // Don't fail the request if Cloudinary deletion fails
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Detection deleted successfully',
            cloudinaryDeleted: hardDelete
        });

    } catch (error) {
        console.error('Error deleting detection:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete detection',
            error: error.message
        });
    }
};

/**
 * Get user's disease statistics
 * @route GET /api/disease/stats
 * @access Private
 */
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await DiseaseDetection.getUserStats(userId);
        const totalDetections = await DiseaseDetection.countDocuments({
            userId,
            isDeleted: false
        });

        return res.status(200).json({
            success: true,
            data: {
                totalDetections,
                diseaseBreakdown: stats
            }
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

/**
 * Check ML API health
 * @route GET /api/disease/ml-health
 * @access Private
 */
export const checkMLHealth = async (req, res) => {
    try {
        const response = await axios.get(`${ML_API_URL}/health`, {
            timeout: 5000
        });

        return res.status(200).json({
            success: true,
            mlService: response.data
        });

    } catch (error) {
        return res.status(503).json({
            success: false,
            message: 'ML service is unavailable',
            error: error.message
        });
    }
};
