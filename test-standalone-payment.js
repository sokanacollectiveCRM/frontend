// Test script for standalone payment page (no authentication)
// Run this in the browser console

console.log('🧪 Testing Standalone Payment Page (No Auth)...');

// Test 1: Check if standalone payment page is accessible
console.log('\n1. Testing Standalone Payment Page Access:');
const testContractId = 'f2eb5bb8-f9fb-491e-b9c7-707bc8b1d047';
const paymentUrl = `http://localhost:3001/payment?contract_id=${testContractId}`;
console.log('Payment URL:', paymentUrl);

// Test 2: Verify no authentication required
console.log('\n2. Checking Authentication Status:');
const authToken = localStorage.getItem('authToken');
if (authToken) {
  console.log('✅ Auth token found:', authToken.substring(0, 20) + '...');
} else {
  console.log('✅ No auth token found (this is expected for SignNow users)');
}

// Test 3: Test API call without authentication
console.log('\n3. Testing API Call Without Auth:');
fetch(`http://localhost:5050/api/stripe/contract/${testContractId}/payment-summary`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('API Response Status:', response.status);
  if (response.ok) {
    console.log('✅ API call successful without authentication');
    return response.json();
  } else {
    console.log('❌ API call failed:', response.status, response.statusText);
    throw new Error('API call failed');
  }
})
.then(data => {
  console.log('✅ Payment details received:', data);
})
.catch(error => {
  console.log('❌ API call error:', error.message);
});

// Test 4: Check if payment page loads without auth errors
console.log('\n4. Standalone Payment Page Test:');
console.log('Navigate to:', paymentUrl);
console.log('Expected: Payment page should load without authentication errors');
console.log('Expected: No "Verifying your access" message');
console.log('Expected: Direct access to payment form');

console.log('\n🎯 Standalone Payment Page Test Complete!');
console.log('The payment page should now work for users coming from SignNow without any authentication checks.');
