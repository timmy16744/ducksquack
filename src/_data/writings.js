const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function() {
    const writingsDir = path.join(__dirname, '../writings');
    const files = fs.readdirSync(writingsDir);
    
    const writings = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.join(writingsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);
            
            return {
                title: data.title || file.replace('.md', ''),
                date: data.date || new Date().toISOString().split('T')[0],
                color: data.color || 'cyan',
                file: file,
                content: content.trim()
            };
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
    
    return writings;
};