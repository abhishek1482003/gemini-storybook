# Gemini Storybook Creator

A minimalistic AI-powered children's storybook generator built with React, Node.js, and Google's Gemini AI. Create beautiful 5-page storybooks with AI-generated text and illustrations, downloadable as PDFs.

## Features

- 🤖 **AI-Generated Stories**: Powered by Google's Gemini AI for creative story generation
- 🎨 **Automatic Illustrations**: AI-generated images for each page
- 📚 **5-Page Storybooks**: Complete children's stories with consistent characters
- 📄 **PDF Download**: Instant download of beautifully formatted PDFs
- 🎯 **Character Consistency**: Maintains character consistency across all pages
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Lucide React (Icons)
- Vite (Build tool)

### Backend
- Node.js
- Express.js
- Google Generative AI (Gemini)
- Puppeteer (PDF generation)
- CORS enabled

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (already configured)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gemini-storybook
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the server:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Start the Frontend Development Server

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Usage

1. **Open the application** in your browser at `http://localhost:5173`

2. **Enter a story prompt** in the text area. You can:
   - Write your own story idea
   - Use one of the example prompts provided
   - Be creative with your descriptions

3. **Click "Generate Storybook"** to create your story

4. **Wait for generation** - The AI will:
   - Generate a 5-page story with consistent characters
   - Create illustrations for each page
   - Format everything into a beautiful PDF

5. **Download your storybook** - The PDF will automatically download to your device

## Example Prompts

- "A brave little mouse who discovers a magical garden"
- "A friendly dragon who learns to share his treasure"
- "A curious cat who goes on a space adventure"
- "A wise owl who helps forest animals solve problems"
- "A magical rainbow that grants wishes to children"

## API Endpoints

- `POST /api/generate-storybook` - Generate and download a storybook PDF
- `GET /api/health` - Health check endpoint

## Project Structure

```
gemini-storybook/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── uploads/           # Temporary PDF storage
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── App.css        # Custom styles
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── index.html         # HTML template
└── README.md              # This file
```

## Configuration

The application is pre-configured with:
- Google Gemini API key: `AIzaSyB9KSN5Tsn-wZua99GtnxnjCstAITw3L-U`
- Backend port: 5000
- Frontend port: 5173
- CORS enabled for local development

## Features in Detail

### Story Generation
- Uses Gemini Pro model for text generation
- Ensures consistent character development
- Creates engaging, child-friendly narratives
- Maintains story flow across 5 pages

### Image Generation
- Generates illustrations for each page
- Uses child-friendly, colorful art style
- Maintains visual consistency
- Optimized for PDF formatting

### PDF Creation
- Beautiful, print-ready PDFs
- Professional layout and typography
- Optimized for A4 paper size
- Includes title page and page numbers

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Node.js is installed (v16+)
   - Check if port 5000 is available
   - Verify all dependencies are installed

2. **Frontend can't connect to backend**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify network connectivity

3. **PDF generation fails**
   - Check if Puppeteer dependencies are installed
   - Ensure sufficient disk space for temporary files
   - Verify Gemini API key is valid

4. **Story generation errors**
   - Check internet connectivity
   - Verify Gemini API quota
   - Ensure prompt is appropriate and not too long

### Error Messages

- **"Failed to generate storybook"**: Usually indicates API or network issues
- **"Invalid response format"**: Gemini API returned unexpected format
- **"PDF generation failed"**: Puppeteer or file system issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Google Gemini AI for providing the AI capabilities
- React and Vite teams for the excellent development tools
- Tailwind CSS for the beautiful styling framework

---

**Happy Storytelling! 📚✨**
