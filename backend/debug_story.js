const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyB9KSN5Tsn-wZua99GtnxnjCstAITw3L-U');

async function testStoryGeneration() {
  console.log('🧪 Testing story generation step by step...\n');
  
  try {
    console.log('Step 1: Testing Gemini API connection...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const testPrompt = 'Generate a simple JSON response: {"message": "Hello World"}';
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    
    console.log('✅ Gemini API working');
    console.log('Sample response:', response.text().substring(0, 100) + '...\n');
    
    console.log('Step 2: Testing story generation...');
    const storyPrompt = `Create a 5-page children's storybook based on this prompt: "A brave little mouse named Pip". 
    
    Return the response in this exact JSON format:
    {
      "title": "Story Title",
      "characters": "Brief description of main characters for consistency",
      "pages": [
        {
          "pageNumber": 1,
          "text": "Page 1 text content",
          "imagePrompt": "Detailed description for page 1 image"
        },
        {
          "pageNumber": 2,
          "text": "Page 2 text content", 
          "imagePrompt": "Detailed description for page 2 image"
        },
        {
          "pageNumber": 3,
          "text": "Page 3 text content",
          "imagePrompt": "Detailed description for page 3 image"
        },
        {
          "pageNumber": 4,
          "text": "Page 4 text content",
          "imagePrompt": "Detailed description for page 4 image"
        },
        {
          "pageNumber": 5,
          "text": "Page 5 text content",
          "imagePrompt": "Detailed description for page 5 image"
        }
      ]
    }`;

    const storyResult = await model.generateContent(storyPrompt);
    const storyResponse = await storyResult.response;
    const storyText = storyResponse.text();
    
    console.log('✅ Story generation working');
    console.log('Raw story response length:', storyText.length);
    
    // Try to parse the JSON
    const jsonMatch = storyText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsing successful');
        console.log('Story title:', parsedData.title);
        console.log('Number of pages:', parsedData.pages?.length || 'undefined');
        
        if (parsedData.pages && parsedData.pages.length === 5) {
          console.log('✅ Story structure is correct');
          
          console.log('\n📖 Generated Story Preview:');
          console.log('Title:', parsedData.title);
          console.log('Characters:', parsedData.characters);
          
          parsedData.pages.forEach((page, index) => {
            console.log(`\nPage ${page.pageNumber}:`);
            console.log('Text:', page.text.substring(0, 100) + '...');
            console.log('Image prompt:', page.imagePrompt.substring(0, 80) + '...');
          });
          
        } else {
          console.log('❌ Story structure is incorrect');
        }
        
      } catch (parseError) {
        console.log('❌ JSON parsing failed:', parseError.message);
        console.log('Raw JSON:', jsonMatch[0].substring(0, 200) + '...');
      }
    } else {
      console.log('❌ No JSON found in response');
      console.log('Raw response:', storyText.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('Full error:', error);
  }
}

testStoryGeneration();