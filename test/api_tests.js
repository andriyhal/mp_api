import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4000';
const TEST_USER = {
    email: 'tester@example.com',
    password: 'password'
};

let authToken = '';
let userId = '';

// Configure axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(testName, success, message = '') {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${testName}`);
    if (message) console.log(`   ${message}`);

    results.tests.push({
        name: testName,
        success,
        message
    });

    if (success) {
        results.passed++;
    } else {
        results.failed++;
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests for Metabolic Point Platform\n');
    console.log('=' .repeat(50));

    try {
        // Test 1: User Registration
        console.log('\n📝 Testing User Registration...');
        try {
            const registerResponse = await api.post('/register-user', {
                email: 'testuser_' + Date.now() + '@example.com',
                name: 'Test User',
                password: 'testpassword'
            });
            logTest('User Registration', registerResponse.status === 201, `Status: ${registerResponse.status}`);
        } catch (error) {
            logTest('User Registration', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 2: User Login
        console.log('\n🔐 Testing User Login...');
        try {
            const loginResponse = await api.post('/auth/login', TEST_USER);
            if (loginResponse.data.token) {
                authToken = loginResponse.data.token;
                userId = loginResponse.data.user.id;
                api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
                logTest('User Login', true, `Token received, User ID: ${userId}`);
            } else {
                logTest('User Login', false, 'No token received');
            }
        } catch (error) {
            logTest('User Login', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        if (!authToken) {
            console.log('\n❌ Cannot continue tests without authentication token');
            return;
        }

        // Test 3: Get User Profile
        console.log('\n👤 Testing Get User Profile...');
        try {
            const profileResponse = await api.get('/get-user-profile', {
                params: { userID: userId }
            });
            logTest('Get User Profile', profileResponse.status === 200, `Profile data received`);
        } catch (error) {
            logTest('Get User Profile', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 4: Submit Health Data
        console.log('\n🏥 Testing Submit Health Data...');
        try {
            const healthData = {
                UserID: userId,
                height: 170,
                weight: 70,
                waistCircumference: 85,
                bloodPressureSystolic: 120,
                bloodPressureDiastolic: 80,
                fastingBloodGlucose: 95,
                hdlCholesterol: 50,
                triglycerides: 150
            };
            const healthResponse = await api.post('/submit-health-data', healthData);
            logTest('Submit Health Data', healthResponse.status === 201, `Health data submitted`);
        } catch (error) {
            logTest('Submit Health Data', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 5: Get Health Data
        console.log('\n📊 Testing Get Health Data...');
        try {
            const healthDataResponse = await api.get('/get-health-data', {
                params: { userId: userId }
            });
            logTest('Get Health Data', healthDataResponse.status === 200, `Health data retrieved`);
        } catch (error) {
            logTest('Get Health Data', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 6: Get Health History
        console.log('\n📈 Testing Get Health History...');
        try {
            const historyResponse = await api.get('/get-health-history', {
                params: { userId: userId, parameter: 'weight' }
            });
            logTest('Get Health History', historyResponse.status === 200, `Health history retrieved`);
        } catch (error) {
            logTest('Get Health History', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 7: Calculate Health Score
        console.log('\n🧮 Testing Calculate Health Score...');
        try {
            const scoreResponse = await api.get('/calc-health-score', {
                params: { userId: userId }
            });
            logTest('Calculate Health Score', scoreResponse.status === 200, `Score: ${scoreResponse.data.score || 'N/A'}`);
        } catch (error) {
            logTest('Calculate Health Score', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 8: Get Average Health Metrics
        console.log('\n📏 Testing Get Average Health Metrics...');
        try {
            const avgResponse = await api.get('/average-health-metrics', {
                params: { age: 30, sex: 'male' }
            });
            logTest('Get Average Health Metrics', avgResponse.status === 200, `Average metrics retrieved`);
        } catch (error) {
            logTest('Get Average Health Metrics', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 9: Get Recommendations
        console.log('\n💡 Testing Get Recommendations...');
        try {
            const recoResponse = await api.get('/recommendation');
            logTest('Get Recommendations', recoResponse.status === 200, `Recommendations received`);
        } catch (error) {
            logTest('Get Recommendations', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 10: Get Recommendation Actions
        console.log('\n🎯 Testing Get Recommendation Actions...');
        try {
            const actionsResponse = await api.get('/get-reco-actions', {
                params: { userId: userId }
            });
            logTest('Get Recommendation Actions', actionsResponse.status === 200, `Actions received`);
        } catch (error) {
            logTest('Get Recommendation Actions', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 11: Get Recommendation Products
        console.log('\n🛍️ Testing Get Recommendation Products...');
        try {
            const productsResponse = await api.get('/get-reco-products', {
                params: { userId: userId }
            });
            logTest('Get Recommendation Products', productsResponse.status === 200, `Products received`);
        } catch (error) {
            logTest('Get Recommendation Products', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 12: File Upload Test (use real PDF from testdata folder)
        console.log('\n📁 Testing File Upload...');
        try {
            // Use the real PDF file from testdata folder
            const testFilePath = path.join(process.cwd(), 'test', 'testdata', 'YG December 2024.pdf');

            if (!fs.existsSync(testFilePath)) {
                logTest('File Upload', false, 'Test PDF file not found in testdata folder');
            } else {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(testFilePath));
                formData.append('UserID', userId);

                const uploadResponse = await api.post('/import-file', formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                logTest('File Upload', uploadResponse.status === 201, `File uploaded successfully - ${uploadResponse.data.generalHealthScore ? `Score: ${uploadResponse.data.generalHealthScore}` : 'No score calculated'}`);
            }
        } catch (error) {
            logTest('File Upload', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 13: Get Data Files
        console.log('\n📂 Testing Get Data Files...');
        try {
            const filesResponse = await api.post('/get-data-files', { UserID: userId });
            logTest('Get Data Files', filesResponse.status === 200, `Files list retrieved`);
        } catch (error) {
            logTest('Get Data Files', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 14: Token Refresh
        console.log('\n🔄 Testing Token Refresh...');
        try {
            const refreshResponse = await api.post('/auth/refresh', { token: authToken });
            if (refreshResponse.data.newToken) {
                authToken = refreshResponse.data.newToken;
                api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
                logTest('Token Refresh', true, `New token received`);
            } else {
                logTest('Token Refresh', false, 'No new token received');
            }
        } catch (error) {
            logTest('Token Refresh', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 15: Digital Journey Endpoints
        console.log('\n🛤️ Testing Digital Journey Endpoints...');
        try {
            const journeyResponse = await api.get('/digital-journey');
            logTest('Digital Journey', journeyResponse.status === 200, `Digital journey data received`);
        } catch (error) {
            logTest('Digital Journey', false, `Error: ${error.response?.data?.error || error.message}`);
        }

        // Test 16: Provider Network Endpoints
        console.log('\n👨‍⚕️ Testing Provider Network Endpoints...');
        try {
            const providerResponse = await api.get('/provider-network');
            logTest('Provider Network', providerResponse.status === 200, `Provider network data received`);
        } catch (error) {
            logTest('Provider Network', false, `Error: ${error.response?.data?.error || error.message}`);
        }

    } catch (error) {
        console.error('❌ Test execution error:', error.message);
    }

    // Print Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(test => !test.success).forEach(test => {
            console.log(`   - ${test.name}: ${test.message}`);
        });
    }

    console.log('\n🎉 API Testing Complete!');
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Tests interrupted by user');
    process.exit(0);
});

// Run the tests
runTests().catch(error => {
    console.error('💥 Fatal error during testing:', error);
    process.exit(1);
});
