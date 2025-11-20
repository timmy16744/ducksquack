// Mock File System
window.FileSystem = {
    structure: {
        'root': {
            type: 'dir',
            children: {
                'about.md': { 
                    type: 'file', 
                    content: 'My name is Tim, a designer and developer from Adelaide, Australia. I have a Master\'s in Computer Science and a Bachelor\'s in Design. I love creating things, from web apps to logos. When I\'m not coding, you can find me at the gym, painting, or spending time with my wife Chiara and our dog Luna.',
                    meta: { title: 'About Me', date: '2025', file: 'about.md' }
                },
                'contact.md': { 
                    type: 'file', 
                    content: 'Email: hello@example.com\nTwitter: @timmy16744',
                    meta: { title: 'Contact', date: '2025', file: 'contact.md' }
                },
                'projects': {
                    type: 'dir',
                    children: {
                        'stormcaddie.link': { type: 'link', url: 'https://stormcaddie.com', description: 'A compact leaf blower for golfers.' },
                        'pawfectmatch.link': { type: 'link', url: 'https://pawfectmatch.app', description: 'Tinder for animal shelters.' }
                    }
                },
                'writings': {
                    type: 'dir',
                    children: {} // Populated from window.writingsData
                }
            }
        }
    },
    
    currentPath: [], // [] = root, ['writings'] = /writings
    
    init: () => {
        // Populate writings from global data
        if (window.writingsData) {
            const writingsDir = window.FileSystem.structure.root.children.writings.children;
            window.writingsData.forEach(post => {
                writingsDir[post.file] = {
                    type: 'file',
                    content: post.content,
                    meta: post // Store full metadata
                };
            });
        }
    },

    resolve: (pathStr) => {
        // Returns the node at path or null
        let parts = pathStr.split('/').filter(p => p);
        let current = window.FileSystem.structure.root;
        
        // Handle absolute path
        if (pathStr.startsWith('/')) {
             // already at root
        } else {
            // Relative path: prepend currentPath
            parts = [...window.FileSystem.currentPath, ...parts];
        }

        // Resolve '..' and '.'
        const resolvedParts = [];
        for (const p of parts) {
            if (p === '.') continue;
            if (p === '..') {
                resolvedParts.pop();
            } else {
                resolvedParts.push(p);
            }
        }

        // Traverse
        for (const p of resolvedParts) {
            if (current.type === 'dir' && current.children[p]) {
                current = current.children[p];
            } else {
                return null;
            }
        }
        return current;
    },
    
    ls: (pathStr = '.') => {
        const node = window.FileSystem.resolve(pathStr);
        if (node && node.type === 'dir') {
            return Object.keys(node.children).map(name => {
                const child = node.children[name];
                return {
                    name: name + (child.type === 'dir' ? '/' : ''),
                    type: child.type,
                    meta: child.meta
                };
            });
        }
        return null;
    },
    
    readFile: (pathStr) => {
        const node = window.FileSystem.resolve(pathStr);
        if (node && node.type === 'file') {
            return node;
        }
        return null;
    }
};