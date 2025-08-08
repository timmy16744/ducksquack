# Cloudflare Pages AI Integration Setup

## Problem Solved
The AI functionality wasn't working on Cloudflare Pages because static files don't support environment variable templating. This solution injects the API key during the build process.

## Setup Instructions

### 1. In your Cloudflare Pages dashboard:

1. Go to your site's **Settings** → **Environment variables**
2. Add a new variable:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key (starts with `AIza...`)
   - **Environment**: Production (and Preview if needed)

### 2. Build Configuration

Ensure your Cloudflare Pages build settings are:
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node.js version**: 18 or higher (recommended)

### 3. How It Works

1. **During build**: 
   - Eleventy generates the static files
   - `scripts/inject-env.js` runs after Eleventy
   - The script finds the placeholder in `dist/index.html`
   - Replaces it with the actual API key from `process.env.GEMINI_API_KEY`

2. **In the browser**:
   - `window.ENV.GEMINI_API_KEY` contains the real API key
   - AI commands like `hey tim` will work properly

### 4. Local Development

For local development, the app automatically uses the development API key when running on localhost.

### 5. Testing

After deployment, you can test by:
1. Opening the browser developer console
2. Running an AI command like `hey tim how are you?`
3. Check the console logs for environment debugging info

### 6. Troubleshooting

If AI still doesn't work:

1. **Check the console logs** - look for the environment check output
2. **Verify the API key** - ensure it's set correctly in Cloudflare Pages
3. **Check build logs** - ensure the injection script runs successfully
4. **Test locally** - verify it works on localhost first

### Environment Check Output

When you run an AI command, you should see something like:
```javascript
Environment check: {
  hostname: "your-site.pages.dev",
  ENV_exists: true,
  API_key_exists: true,
  API_key_length: 39,
  API_key_starts_with: "AIzaSyD7JF..."
}
```

If `API_key_exists` is `false`, the environment variable isn't being set properly.