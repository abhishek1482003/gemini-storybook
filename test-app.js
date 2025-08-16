const fetch = require('node-fetch');
const fs = require('fs');

async function testStoryGeneration() {
  console.log('Testing Gemini Storybook API...');
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-storybook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: 'A brave little mouse who discovers a magical garden' 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return;
    }

    const buffer = await response.buffer();
    const filename = `test_storybook_${Date.now()}.pdf`;
    fs.writeFileSync(filename, buffer);
    
    console.log(`✅ Success! PDF generated: ${filename}`);
    console.log(`📄 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('❌ Backend is not running. Please start it with: cd backend && npm start');
    return;
  }
  
  console.log('\n📚 Testing story generation...');
  await testStoryGeneration();
}

runTests();