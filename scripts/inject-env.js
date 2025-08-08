#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the built index.html file
const indexPath = path.join(__dirname, '../dist/index.html');

// Read the file
let content = fs.readFileSync(indexPath, 'utf8');

// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
    // Replace the null assignment with the actual API key
    content = content.replace(
        'window.ENV.GEMINI_API_KEY = null; // Will be set by build process or runtime',
        `window.ENV.GEMINI_API_KEY = '${apiKey}';`
    );
    
    // Write the file back
    fs.writeFileSync(indexPath, content);
    console.log('✅ Environment variables injected successfully');
} else {
    console.log('⚠️  No GEMINI_API_KEY environment variable found');
}