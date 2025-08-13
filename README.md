# PromptRx - AI-Powered Content Pipeline Builder

A sophisticated visual pipeline builder for creating personalized health and wellness content using AI. Build custom content generation workflows with drag-and-drop components, style personalization, and multi-format output support.

## 🚀 Features

### Visual Pipeline Builder
- **Drag-and-Drop Interface**: Create content pipelines using ReactFlow-powered visual components
- **Modular Architecture**: Combine evidence input, style personalization, visual styling, personal data, and output selection components
- **Real-time Updates**: Live preview and modification of your content generation pipeline

### Content Personalization
- **Style Analysis**: AI-powered analysis of writing styles from uploaded documents or YouTube videos
- **Personal Health Integration**: Incorporate personal health data (Apple Health compatible) for tailored content
- **Visual Customization**: Comprehensive styling options for videos and podcast thumbnails
- **Evidence-Based Content**: Upload documents (PDF, text) to ground content in evidence

### Multi-Format Output
- **Video Generation**: Create health and wellness videos with custom styling
- **Podcast Content**: Generate podcast scripts and thumbnails
- **AI Provider Choice**: Support for OpenAI and Google Gemini models

### Advanced Features
- **YouTube Integration**: Analyze YouTube videos for style extraction and transcription
- **Document Processing**: PDF parsing and content extraction capabilities
- **Authentication System**: Secure API key management with NextAuth
- **Gallery System**: Organize and manage generated content
- **Real-time Collaboration**: Share and collaborate on pipeline configurations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **ReactFlow** - Visual pipeline builder interface
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation and transitions
- **React Hook Form + Zod** - Form management and validation
- **TanStack Query** - Data fetching and caching

### Backend & Integration
- **Next.js API Routes** - Serverless backend functions
- **NextAuth** - Authentication and OAuth
- **Google APIs** - YouTube integration and Gemini AI
- **PDF.js** - Document processing
- **React Query** - State management and caching

### Development & Deployment
- **TypeScript** - Type-safe development
- **ESLint** - Code linting and quality
- **Docker** - Containerized deployment
- **Multi-environment support** - Development and production configurations

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── generate/      # Content generation endpoints
│   │   ├── gallery/       # Content management
│   │   ├── transcribe/    # YouTube transcription
│   │   └── auth/          # Authentication
│   └── pipeline-builder/  # Main application page
├── components/
│   ├── pipeline/          # Pipeline builder components
│   │   ├── custom-nodes.tsx      # ReactFlow node definitions
│   │   ├── canvas-workspace.tsx  # Main canvas
│   │   └── modals/        # Configuration modals
│   ├── gallery/           # Content gallery
│   ├── ui/               # Reusable UI components
│   └── onboarding/       # Setup and configuration
├── lib/
│   ├── backend-client.ts  # API client
│   ├── pipeline-types.ts  # Type definitions
│   └── utils.ts          # Utility functions
└── hooks/                # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (optional, for containerized development)
- Google Cloud Project (for AI services)
- API keys for OpenAI/Gemini

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd summer-school-prompt-builder-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Development

For a complete containerized setup:

```bash
# Start development environment
npm run docker:dev

# View logs
npm run docker:dev:logs

# Stop environment
npm run docker:dev:down
```

## 📋 Environment Configuration

### Required Environment Variables

```env
# Core Application
NODE_ENV=development
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3000

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Authentication (for YouTube features)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Google Cloud (fallback services)
GOOGLE_CLOUD_PROJECT=your_project_id
GCS_BUCKET=your_bucket_name
VERTEX_AI_REGION=us-central1
```

See [SETUP.md](SETUP.md) for detailed environment configuration and deployment instructions.

## 🔧 Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run start:dev` - Start with development environment variables
- `npm run lint` - Run ESLint checks

### Production
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run start:prod` - Build and start production

### Docker
- `npm run docker:dev` - Start development container
- `npm run docker:prod` - Start production container
- `npm run docker:cleanup` - Clean Docker resources

## 🎯 Usage Guide

### Building Your First Pipeline

1. **Start with Evidence Input**
   - Upload PDFs or documents to ground your content
   - Add YouTube videos for style analysis

2. **Configure Style Personalization**
   - Upload sample content to analyze writing style
   - Customize tone, pace, vocabulary, and other dimensions
   - Set target audience and content structure

3. **Add Visual Styling**
   - Configure video or podcast thumbnail styling
   - Set color schemes, themes, and branding options
   - Customize for specific health focus areas

4. **Include Personal Data**
   - Add health metrics and demographics
   - Set fitness goals and preferences
   - Configure Apple Health integration (if available)

5. **Select Output Format**
   - Choose between video or podcast generation
   - Select AI provider (OpenAI or Gemini)

6. **Generate Content**
   - Connect components in your pipeline
   - Review the generated prompt
   - Execute content generation

### Advanced Features

- **Gallery Management**: View and organize all generated content
- **Pipeline Templates**: Save and reuse pipeline configurations
- **Collaborative Workflows**: Share pipelines with team members
- **API Integration**: Use the REST API for programmatic access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use the existing component patterns
- Add tests for new features
- Update documentation as needed
- Follow the established Git commit conventions

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
# Or change the port in package.json
```

**Environment variables not loading**
- Verify `.env.local` file exists and has correct values
- Restart the development server after changes
- Check that variables are prefixed with `NEXT_PUBLIC_` for client-side access

**Docker issues**
```bash
# Rebuild containers
npm run docker:dev:rebuild

# Clean up Docker resources
npm run docker:cleanup
```

**API key validation failing**
- Ensure your API keys are valid and have proper permissions
- Check that the backend service is running
- Verify network connectivity for external API calls

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Related Documentation

- [Setup Guide](SETUP.md) - Detailed setup and deployment instructions
- [API Documentation](src/app/api/) - Backend API endpoints
- [Component Library](src/components/ui/) - Reusable UI components
- [Pipeline Types](src/lib/pipeline-types.ts) - Type definitions and interfaces

---

Built with ❤️ for personalized health and wellness content creation.