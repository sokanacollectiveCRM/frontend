// Script to check if contract ID is saved in localStorage
// Run this in the browser console after sending a contract

console.log('🔍 Checking contract verification data in localStorage...');

// Get the stored contract verification data
const contractVerification = localStorage.getItem('contractVerification');

if (contractVerification) {
  try {
    const data = JSON.parse(contractVerification);
    console.log('✅ Contract verification data found:');
    console.log('📄 Contract ID:', data.contractId);
    console.log('👤 Client Email:', data.clientEmail);
    console.log('👤 Client Name:', data.clientName);
    console.log('⏰ Timestamp:', new Date(data.timestamp).toLocaleString());
    console.log('💰 Amounts:', data.amounts);
    console.log('📊 Full Data:', data);
  } catch (error) {
    console.error('❌ Error parsing contract verification data:', error);
    console.log('Raw data:', contractVerification);
  }
} else {
  console.log('❌ No contract verification data found in localStorage');
}

// Also check for any other contract-related data
console.log('\n🔍 Checking for other contract-related localStorage items...');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('contract') || key.includes('Contract'))) {
    console.log(`📦 Found: ${key} =`, localStorage.getItem(key));
  }
}

// Check auth token as well
const authToken = localStorage.getItem('authToken');
if (authToken) {
  console.log('🔑 Auth token found:', authToken.substring(0, 20) + '...');
} else {
  console.log('❌ No auth token found');
}
