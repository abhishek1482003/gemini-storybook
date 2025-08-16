/*
 * Gemini Storybook Creator - Backend Server
 * 
 * IMPORTANT: IMAGE GENERATION IMPLEMENTATION
 * ===========================================
 * 
 * Current Implementation:
 * - Using Picsum Photos for placeholder images based on story content
 * - Images are consistent but not AI-generated illustrations
 * 
 * For Production AI Image Generation, integrate one of:
 * 
 * 1. OpenAI DALL-E API:
 *    - Add openai package: npm install openai
 *    - Replace generateStoryImage() with DALL-E API calls
 *    - Cost: ~$0.016-0.020 per image
 * 
 * 2. Stability AI (Stable Diffusion):
 *    - Use stability-ai/api
 *    - Better for consistent character generation
 *    - Cost: ~$0.002-0.01 per image
 * 
 * 3. Midjourney API (when available):
 *    - Best quality for illustrations
 *    - Currently requires Discord bot integration
 * 
 * 4. Google's Imagen (when available via Gemini):
 *    - Wait for Google to release image generation in Gemini API
 *    - Would be the most integrated solution
 * 
 * Implementation Example for DALL-E:
 * 
 * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 * 
 * async function generateStoryImage(imagePrompt, pageNumber) {
 *   const response = await openai.images.generate({
 *     model: "dall-e-3",
 *     prompt: `Children's book illustration: ${imagePrompt}`,
 *     size: "1024x1024",
 *     quality: "standard",
 *     n: 1,
 *   });
 *   return response.data[0].url;
 * }
 */

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

    IMPORTANT GUIDELINES:
    1. Maintain consistent main characters throughout all 5 pages
    2. Create a clear story arc with beginning, middle, and end
    3. Use age-appropriate language for children aged 3-8
    4. Each page should have 2-4 sentences maximum
    5. Include descriptive image prompts that maintain character appearance consistency
    6. Make the story educational and positive with a good moral lesson

    Return the response in this exact JSON format:
    {
      "title": "Story Title (should be catchy and child-friendly)",
      "characters": "Brief description of main characters for consistency",
      "pages": [
        {
          "pageNumber": 1,
          "text": "Page 1 text content (introduction of characters and setting)",
          "imagePrompt": "Detailed visual description including character appearance, setting, and scene. Be specific about character features, colors, and style for consistency."
        },
        {
          "pageNumber": 2,
          "text": "Page 2 text content (conflict or adventure begins)", 
          "imagePrompt": "Detailed visual description maintaining same character appearance from page 1. Describe the new scene while keeping character consistency."
        },
        {
          "pageNumber": 3,
          "text": "Page 3 text content (middle of story, building tension)",
          "imagePrompt": "Detailed visual description with consistent characters. Show progression of the story while maintaining visual continuity."
        },
        {
          "pageNumber": 4,
          "text": "Page 4 text content (climax or problem resolution)",
          "imagePrompt": "Detailed visual description showing the climax scene with same consistent character designs throughout."
        },
        {
          "pageNumber": 5,
          "text": "Page 5 text content (happy ending and moral lesson)",
          "imagePrompt": "Detailed visual description of the resolution with consistent characters, showing a happy ending scene."
        }
      ]
    }
    
    Example character consistency: If you create a character like "a small brown rabbit with blue overalls and floppy ears", mention these specific details in ALL image prompts to maintain visual consistency.
    
    Make sure the story flows naturally from page to page, has educational value, and ends with a positive message.`;

    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Extract JSON from the response with better parsing
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON with markdown code blocks
      jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate the parsed data structure
        if (!parsedData.title || !parsedData.pages || !Array.isArray(parsedData.pages)) {
          throw new Error('Invalid story structure - missing required fields');
        }
        
        if (parsedData.pages.length !== 5) {
          throw new Error(`Expected 5 pages, got ${parsedData.pages.length}`);
        }
        
        // Validate each page has required fields
        for (const page of parsedData.pages) {
          if (!page.pageNumber || !page.text || !page.imagePrompt) {
            throw new Error('Invalid page structure - missing required fields');
          }
        }
        
        console.log('Successfully parsed story:', parsedData.title);
        return parsedData;
        
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse story data: ${parseError.message}`);
      }
    } else {
      console.error('No JSON found in response:', text);
      throw new Error('Invalid response format from Gemini - no JSON found');
    }
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

// Generate images for each page using a free image generation service
async function generateImages(storyData) {
  try {
    const images = [];
    
    for (let i = 0; i < storyData.pages.length; i++) {
      const page = storyData.pages[i];
      
      // Use a more realistic approach with actual image generation
      // Using Picsum for now as a placeholder, but in production you'd use:
      // - DALL-E API, Midjourney API, or Stable Diffusion
      // - Or implement actual image generation with Gemini when available
      
      // Create a more dynamic placeholder that represents the story content
      const imageUrl = await generateStoryImage(page.imagePrompt, page.pageNumber);
      images.push(imageUrl);
    }
    
    return images;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

// Helper function to generate story images
async function generateStoryImage(imagePrompt, pageNumber) {
  try {
    // For demonstration, we'll use a service that can generate themed images
    // In production, replace this with actual AI image generation
    
    // Create a color-coded image based on the story theme
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'];
    const color = colors[pageNumber % colors.length];
    
    // Use a more sophisticated placeholder service
    const width = 400;
    const height = 300;
    const seed = Math.abs(hashCode(imagePrompt)) % 1000;
    
    // Use Picsum with seed for consistent but varied images
    return `https://picsum.photos/seed/${seed}/${width}/${height}`;
    
  } catch (error) {
    console.error('Error generating individual image:', error);
    // Fallback to a simple colored placeholder
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'];
    const color = colors[pageNumber % colors.length];
    return `https://via.placeholder.com/400x300/${color}/FFFFFF?text=Page+${pageNumber}`;
  }
}

// Simple hash function for consistent image generation
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
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
            font-family: 'Comic Sans MS', 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          .page:last-child { page-break-after: avoid; }
          .title-page {
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
            color: #333;
            text-align: center;
          }
          .title { 
            text-align: center; 
            font-size: 36px; 
            color: #333; 
            margin-bottom: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .subtitle {
            text-align: center;
            font-size: 18px;
            color: #666;
            font-style: italic;
            margin-bottom: 40px;
          }
          .page-number { 
            position: absolute;
            bottom: 20px;
            right: 30px;
            font-size: 14px; 
            color: #999; 
            font-weight: bold;
          }
          .story-text { 
            font-size: 18px; 
            line-height: 1.8; 
            color: #333; 
            margin: 20px 0;
            text-align: center;
            max-width: 500px;
            font-weight: 500;
          }
          .story-image { 
            width: 100%; 
            max-width: 450px; 
            height: 350px; 
            object-fit: cover; 
            border-radius: 15px; 
            margin: 20px 0; 
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            border: 3px solid #fff;
          }
          .characters-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
            border-left: 4px solid #667eea;
          }
        </style>
      </head>
      <body>
        <div class="page title-page">
          <div class="title">${storyData.title}</div>
          <div class="subtitle">A Magical Story Created with AI</div>
          ${storyData.characters ? `<div class="characters-info"><strong>Characters:</strong> ${storyData.characters}</div>` : ''}
        </div>
    `;
    
    storyData.pages.forEach((pageData, index) => {
      htmlContent += `
        <div class="page">
          <div class="story-text">${pageData.text}</div>
          <img src="${images[index]}" alt="Page ${pageData.pageNumber}" class="story-image" onerror="this.style.display='none'">
          <div class="page-number">${pageData.pageNumber}</div>
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
    
    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt is too long. Please keep it under 500 characters.' });
    }
    
    console.log('Generating story for prompt:', prompt);
    
    // Generate story content
    console.log('Step 1: Generating story content...');
    const storyData = await generateStory(prompt);
    console.log('Story generated successfully:', storyData.title);
    
    // Generate images
    console.log('Step 2: Generating images...');
    const images = await generateImages(storyData);
    console.log('Images generated successfully');
    
    // Generate PDF
    console.log('Step 3: Creating PDF...');
    const pdfPath = await generatePDF(storyData, images);
    console.log('PDF generated successfully:', pdfPath);
    
    // Read the PDF file and send it
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Clean up the file
    fs.unlinkSync(pdfPath);
    
    // Create a safe filename
    const safeTitle = storyData.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${safeTitle || 'storybook'}_${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error in generate-storybook:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate storybook';
    if (error.message.includes('Invalid response format')) {
      errorMessage = 'AI service returned invalid response. Please try again.';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Failed to parse story content. Please try with a different prompt.';
    } else if (error.message.includes('PDF')) {
      errorMessage = 'Failed to create PDF. Please try again.';
    } else if (error.message.includes('image')) {
      errorMessage = 'Failed to generate images. Please try again.';
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
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
