import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FertilizerRecommendation from './models/FertilizerRecommendation.js';

dotenv.config();

async function testConnection() {
    try {
        console.log('Connecting to:', process.env.MONGO_DB);
        await mongoose.connect(process.env.MONGO_DB);
        console.log('✅ MongoDB connected successfully');

        const count = await FertilizerRecommendation.countDocuments();
        console.log('📊 Total documents:', count);

        const districts = await FertilizerRecommendation.distinct('District');
        console.log('📍 Total districts:', districts.length);
        console.log('📍 Districts:', districts.sort());

        // Get sample document
        const sample = await FertilizerRecommendation.findOne();
        console.log('\n📄 Sample document:');
        console.log(JSON.stringify(sample, null, 2));

        await mongoose.disconnect();
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testConnection();
