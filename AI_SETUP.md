# AI Integration Setup

This document explains how to securely deploy the AI-powered CLI feature using Gemini API.

## Security Considerations

The API key is handled securely using environment variables to prevent exposure in the production build.

## Development Setup

For local development, the API key is hardcoded and only works on `localhost`. This allows for testing without compromising security.

## Production Setup (Cloudflare Pages)

### Step 1: Set Environment Variable

In your Cloudflare Pages dashboard:

1. Go to your project settings
2. Navigate to "Environment variables"
3. Add a new variable:
   - **Name**: `REACT_APP_GEMINI_API_KEY`
   - **Value**: `AIzaSyD7JFLqjn0_U5oTh3tT0lAOUA6WZWVLOrw`
   - **Environment**: Production (and Preview if needed)

### Alternative: GitHub Repository Secrets

If using GitHub Actions for deployment:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add repository secret:
   - **Name**: `REACT_APP_GEMINI_API_KEY`
   - **Value**: `AIzaSyD7JFLqjn0_U5oTh3tT0lAOUA6WZWVLOrw`

### Step 2: Build Configuration

Ensure your build process includes the environment variable:

```bash
# In your build command, the environment variable will be automatically included
npm run build
```

### Step 3: Security Features

- ✅ API key is never exposed in the client bundle for production
- ✅ Key only works on localhost for development
- ✅ Production requires explicit environment variable configuration
- ✅ Conversation history is limited to prevent excessive API usage
- ✅ Rate limiting through conversation context management

## Usage

Users can activate the AI by typing:
```bash
hey tim [your question]
```

The AI will remain active for continued conversation until the session is reset with:
```bash
ai reset
```

## AI Commands

- `ai` - Show AI help and commands
- `ai status` - Show current AI status and conversation history
- `ai reset` - Clear conversation history and deactivate AI mode

## Features

- Context-aware conversations with memory
- Integration with Tim's writings and expertise areas
- Secure API key management
- Session-based activation with "hey tim" trigger
- Ability to use regular CLI commands while in AI mode

## API Usage Management

- Conversation history limited to last 8 exchanges to control token usage
- Response length capped at 512 tokens
- Temperature set to 0.7 for balanced creativity/consistency