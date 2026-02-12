import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image string or file path
 * @param {string} userId - User ID for organizing folders
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = async (imageData, userId = 'unknown') => {
    try {
        // Validate Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('❌ Missing Cloudinary credentials:', {
                cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
                api_key: !!process.env.CLOUDINARY_API_KEY,
                api_secret: !!process.env.CLOUDINARY_API_SECRET
            });
            throw new Error('Cloudinary credentials are not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment variables.');
        }

        console.log('☁️  Cloudinary config check: ✅ All credentials present');
        console.log('📦 Image data length:', imageData.length);
        console.log('📦 Image data prefix:', imageData.substring(0, 30));

        const uploadOptions = {
            folder: `AgroLens/disease-detection/${userId}`,
            resource_type: 'image',
            format: 'jpg',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' },
                { width: 1024, height: 1024, crop: 'limit' }
            ],
            tags: ['disease-detection', 'agrolens'],
            timeout: 120000 // 120 seconds timeout for large images
        };

        console.log('📤 Uploading to Cloudinary folder:', uploadOptions.folder);
        const result = await cloudinary.uploader.upload(imageData, uploadOptions);
        console.log('✅ Cloudinary upload successful!');
        console.log('   - Public ID:', result.public_id);
        console.log('   - URL:', result.secure_url);
        console.log('   - Size:', result.bytes, 'bytes');

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            createdAt: result.created_at
        };
    } catch (error) {
        console.error('❌ Cloudinary upload error:', {
            message: error.message,
            name: error.name,
            http_code: error.http_code
        });

        // More specific error messages
        let errorMessage = 'Failed to upload image to Cloudinary';
        if (error.message.includes('Invalid image')) {
            errorMessage += ': Invalid image format. Please ensure the image is a valid JPEG/PNG.';
        } else if (error.message.includes('credentials')) {
            errorMessage += ': Invalid Cloudinary credentials. Please check your environment variables.';
        } else if (error.message.includes('timeout')) {
            errorMessage += ': Upload timeout. The image may be too large.';
        } else {
            errorMessage += `: ${error.message}`;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            result: result.result
        };
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
};

/**
 * Get image details from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>} - Image details
 */
export const getImageDetails = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            success: true,
            url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            createdAt: result.created_at
        };
    } catch (error) {
        console.error('Cloudinary get details error:', error);
        throw new Error(`Failed to get image details: ${error.message}`);
    }
};

/**
 * Get all images in user's folder
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} - Array of image resources
 */
export const getUserImages = async (userId, maxResults = 50) => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `AgroLens/disease-detection/${userId}`,
            max_results: maxResults
        });

        return {
            success: true,
            images: result.resources,
            total: result.resources.length
        };
    } catch (error) {
        console.error('Cloudinary get user images error:', error);
        throw new Error(`Failed to get user images: ${error.message}`);
    }
};

export default cloudinary;
