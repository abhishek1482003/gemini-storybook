const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyB9KSN5Tsn-wZua99GtnxnjCstAITw3L-U');

// Generate story content
async function generateStory(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const storyPrompt = `Create a 5-page children's storybook based on this prompt: "${prompt}". 
    
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

    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (jsonMatch) {
      const parsedData = JSON.parse(jsonMatch[0]);
      return parsedData;
    } else {
      throw new Error('Invalid response format from Gemini');
    }
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Generate images for each page (using placeholders)
async function generateImages(storyData) {
  const images = [];
  
  for (let i = 0; i < storyData.pages.length; i++) {
    const page = storyData.pages[i];
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'];
    const color = colors[page.pageNumber % colors.length];
    const seed = Math.abs(hashCode(page.imagePrompt)) % 1000;
    
    // Use Picsum with seed for consistent but varied images
    const imageUrl = `https://picsum.photos/seed/${seed}/400/300`;
    images.push(imageUrl);
  }
  
  return images;
}

// Simple hash function
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Generate PDF from story data
async function generatePDF(storyData, images) {
  try {
    console.log('Starting PDF generation...');
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Create HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${storyData.title}</title>
        <style>
          body { 
            font-family: 'Comic Sans MS', 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
          }
          .page { 
            background: white; 
            margin: 0; 
            padding: 30px; 
            min-height: calc(100vh - 60px);
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .title { 
            text-align: center; 
            font-size: 36px; 
            color: #333; 
            margin-bottom: 20px;
            font-weight: bold;
          }
          .story-text { 
            font-size: 18px; 
            line-height: 1.8; 
            color: #333; 
            margin: 20px 0;
            text-align: center;
            max-width: 500px;
          }
          .story-image { 
            width: 100%; 
            max-width: 450px; 
            height: 350px; 
            object-fit: cover; 
            border-radius: 15px; 
            margin: 20px 0; 
            border: 3px solid #fff;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="title">${storyData.title}</div>
        </div>
    `;
    
    storyData.pages.forEach((pageData, index) => {
      htmlContent += `
        <div class="page">
          <div class="story-text">${pageData.text}</div>
          <img src="${images[index]}" alt="Page ${pageData.pageNumber}" class="story-image">
        </div>
      `;
    });
    
    htmlContent += '</body></html>';
    
    console.log('Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfPath = path.join(__dirname, `test_storybook_${Date.now()}.pdf`);
    console.log('Generating PDF to:', pdfPath);
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    console.log('PDF generated successfully!');
    return pdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function testFullPipeline() {
  try {
    console.log('🧪 Testing full storybook pipeline...\n');
    
    const prompt = "A brave little mouse named Pip who discovers a magical garden";
    
    console.log('Step 1: Generating story...');
    const storyData = await generateStory(prompt);
    console.log('✅ Story generated:', storyData.title);
    
    console.log('\nStep 2: Generating images...');
    const images = await generateImages(storyData);
    console.log('✅ Images generated:', images.length, 'images');
    
    console.log('\nStep 3: Creating PDF...');
    const pdfPath = await generatePDF(storyData, images);
    console.log('✅ PDF created:', pdfPath);
    
    // Check file size
    const stats = fs.statSync(pdfPath);
    console.log('📄 PDF size:', (stats.size / 1024).toFixed(2), 'KB');
    
    console.log('\n🎉 Success! Full pipeline working!');
    
  } catch (error) {
    console.log('❌ Pipeline failed:', error.message);
    console.log('Full error:', error);
  }
}

testFullPipeline();