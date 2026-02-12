#!/usr/bin/env node
/**
 * Test Script for AgroLens Production Services
 * Tests Backend and ML API health on Render
 */

const axios = require('axios');

const BACKEND_URL = 'https://agrolensbackend.onrender.com';
const ML_API_URL = 'https://agrolens-ml-api.onrender.com';

console.log('\n' + '='.repeat(60));
console.log('🧪 AgroLens Production Service Health Check');
console.log('='.repeat(60) + '\n');

// Test Backend
async function testBackend() {
    console.log('📡 Testing Backend API...');
    console.log(`   URL: ${BACKEND_URL}`);

    try {
        const startTime = Date.now();
        const response = await axios.get(BACKEND_URL, {
            timeout: 90000 // 90 seconds for cold start
        });
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`   ✅ Backend is responding!`);
        console.log(`   ⏱️  Response time: ${duration}s`);
        console.log(`   📦 Response:`, response.data);

        if (duration > 50) {
            console.log(`   ⚠️  Cold start detected (${duration}s > 50s)`);
        }

        return true;
    } catch (error) {
        console.log(`   ❌ Backend Error:`);
        console.log(`   Message: ${error.message}`);
        if (error.code === 'ECONNABORTED') {
            console.log(`   ⏱️  Timeout - Service may be sleeping`);
        }
        return false;
    }
}

// Test ML API
async function testMLAPI() {
    console.log('\n🤖 Testing ML API...');
    console.log(`   URL: ${ML_API_URL}`);

    try {
        const startTime = Date.now();
        const response = await axios.get(`${ML_API_URL}/health`, {
            timeout: 90000 // 90 seconds for cold start
        });
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`   ✅ ML API is responding!`);
        console.log(`   ⏱️  Response time: ${duration}s`);
        console.log(`   📦 Response:`, response.data);

        if (duration > 50) {
            console.log(`   ⚠️  Cold start detected (${duration}s > 50s)`);
        }

        return true;
    } catch (error) {
        console.log(`   ❌ ML API Error:`);
        console.log(`   Message: ${error.message}`);
        if (error.code === 'ECONNABORTED') {
            console.log(`   ⏱️  Timeout - Service may be sleeping`);
        }
        return false;
    }
}

// Test ML API Classes
async function testMLClasses() {
    console.log('\n📚 Testing ML API Classes...');

    try {
        const response = await axios.get(`${ML_API_URL}/api/classes`, {
            timeout: 30000
        });

        console.log(`   ✅ Classes loaded!`);
        console.log(`   📊 Total classes: ${response.data.num_classes}`);
        console.log(`   📋 Sample classes:`, response.data.classes.slice(0, 5));

        return true;
    } catch (error) {
        console.log(`   ❌ Classes Error: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('⏰ Note: First request may take 50-90 seconds if services are sleeping\n');

    const backendOk = await testBackend();
    const mlApiOk = await testMLAPI();
    const classesOk = await testMLClasses();

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`   Backend:    ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   ML API:     ${mlApiOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   ML Classes: ${classesOk ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60) + '\n');

    if (backendOk && mlApiOk && classesOk) {
        console.log('🎉 All services are healthy!');
        console.log('✅ You can now test the app on your phone\n');
    } else {
        console.log('⚠️  Some services are not responding');
        console.log('💡 Troubleshooting steps:');
        console.log('   1. Check Render dashboard for service status');
        console.log('   2. Verify environment variables are set');
        console.log('   3. Check service logs for errors');
        console.log('   4. Wait a few minutes and try again\n');
    }
}

// Run
runTests().catch(console.error);
