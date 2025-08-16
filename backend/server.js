const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyB9KSN5Tsn-wZua99GtnxnjCstAITw3L-U');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate story content
async function generateStory(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const storyPrompt = `Create a 5-page children's storybook based on this prompt: "${prompt}". 
    
    Return the response in this exact JSON format:
    {
      "title": "Story Title",
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
    }
    
    Make sure the story is engaging for children, has consistent characters throughout, and each page flows naturally to the next. Keep the text concise but engaging.`;

    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format from Gemini');
    }
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Generate images for each page
async function generateImages(storyData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const images = [];
    
    for (let i = 0; i < storyData.pages.length; i++) {
      const page = storyData.pages[i];
      const imagePrompt = `Create a colorful, child-friendly illustration for a children's storybook page. ${page.imagePrompt}. 
      Style: Bright, cheerful, cartoon-like, suitable for children aged 3-8. 
      Make it colorful and engaging with clear, simple shapes and friendly characters.`;
      
      // For now, we'll use a placeholder image generation approach
      // In a real implementation, you'd use Gemini's image generation capabilities
      const placeholderImage = `https://via.placeholder.com/400x300/FFE5B4/000000?text=Page+${page.pageNumber}`;
      images.push(placeholderImage);
    }
    
    return images;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

// Generate PDF from story data
async function generatePDF(storyData, images) {
  try {
    const browser = await puppeteer.launch({ headless: true });
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
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f0f8ff;
          }
          .page { 
            background: white; 
            margin: 20px 0; 
            padding: 40px; 
            border-radius: 10px; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            page-break-after: always;
          }
          .page:last-child { page-break-after: avoid; }
          .title { 
            text-align: center; 
            font-size: 24px; 
            color: #333; 
            margin-bottom: 30px;
            font-weight: bold;
          }
          .page-number { 
            text-align: center; 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 20px;
          }
          .story-text { 
            font-size: 16px; 
            line-height: 1.6; 
            color: #333; 
            margin-bottom: 20px;
            text-align: justify;
          }
          .story-image { 
            width: 100%; 
            max-width: 400px; 
            height: 300px; 
            object-fit: cover; 
            border-radius: 8px; 
            margin: 20px auto; 
            display: block;
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
          <div class="page-number">Page ${pageData.pageNumber}</div>
          <div class="story-text">${pageData.text}</div>
          <img src="${images[index]}" alt="Page ${pageData.pageNumber}" class="story-image">
        </div>
      `;
    });
    
    htmlContent += '</body></html>';
    
    await page.setContent(htmlContent);
    
    const pdfPath = path.join(uploadsDir, `storybook_${Date.now()}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });
    
    await browser.close();
    return pdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// API Routes
app.post('/api/generate-storybook', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log('Generating story for prompt:', prompt);
    
    // Generate story content
    const storyData = await generateStory(prompt);
    console.log('Story generated:', storyData.title);
    
    // Generate images
    const images = await generateImages(storyData);
    console.log('Images generated');
    
    // Generate PDF
    const pdfPath = await generatePDF(storyData, images);
    console.log('PDF generated:', pdfPath);
    
    // Read the PDF file and send it
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Clean up the file
    fs.unlinkSync(pdfPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${storyData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error in generate-storybook:', error);
    res.status(500).json({ error: 'Failed to generate storybook', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gemini Storybook API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
