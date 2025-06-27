// Test script to verify frontend-backend integration
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testSendOTP() {
  try {
    console.log('🔍 Testing Send OTP API...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9876543210'
      })
    });

    const result = await response.json();
    
    console.log('✅ Send OTP Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(result, null, 2));
    
    if (result.success && result.demoOTP) {
      console.log('🔑 Demo OTP:', result.demoOTP);
      return result.demoOTP;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Send OTP Error:', error.message);
    return null;
  }
}

async function testVerifyOTP(otp) {
  try {
    console.log('\n🔍 Testing Verify OTP API...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '9876543210',
        otp: otp || '123456',
        name: 'Test User'
      })
    });

    const result = await response.json();
    
    console.log('✅ Verify OTP Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Verify OTP Error:', error.message);
    return null;
  }
}

async function testCORS() {
  try {
    console.log('\n🔍 Testing CORS from frontend perspective...');
    
    // Simulate a browser request with Origin header
    const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify({
        phone: '9876543210'
      })
    });

    console.log('✅ CORS Test Response:');
    console.log('Status:', response.status);
    console.log('CORS Headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    });
    
  } catch (error) {
    console.error('❌ CORS Test Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Frontend-Backend Integration Test\n');
  
  // Test Send OTP
  const otp = await testSendOTP();
  
  // Test Verify OTP
  await testVerifyOTP(otp);
  
  // Test CORS
  await testCORS();
  
  console.log('\n✨ Integration test complete!');
}

main().catch(console.error);
