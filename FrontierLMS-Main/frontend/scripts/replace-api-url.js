const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_DIRS = ['app', 'components'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const OLD_URL = 'http://localhost:5000';
const API_CONFIG_IMPORT = 'import { API_URL } from "@/lib/api-config"';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!EXTENSIONS.includes(ext)) return;

    // Skip api-config itself
    if (filePath.includes('api-config.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Handle the fallback pattern: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    // We replace strictly this pattern with "API_URL"
    // Regex to catch variances in spacing
    const envPattern = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*(['"])http:\/\/localhost:5000\1/g;

    if (envPattern.test(content)) {
        content = content.replace(envPattern, 'API_URL');
    }

    // 2. Handle direct string usage: 'http://localhost:5000/...'
    // We need to convert single/double quotes to backticks if we are injecting ${API_URL}

    // Strategy: Find strings that start with http://localhost:5000
    // Regex: (['"])http:\/\/localhost:5000(.*?)(\1)
    // \1 matches the opening quote
    // \2 matches the rest of the URL path

    const stringsPattern = /(['"])http:\/\/localhost:5000([^'"]*)\1/g;

    if (stringsPattern.test(content)) {
        content = content.replace(stringsPattern, (match, quote, restOfUrl) => {
            // match: 'http://localhost:5000/api/foo'
            // quote: '
            // restOfUrl: /api/foo
            return `\`\${API_URL}${restOfUrl}\``;
        });
    }

    // 3. Handle template literals that might simply have it embedded (rarer but possible)
    // e.g. `http://localhost:5000${someVar}`
    const templatePattern = /`http:\/\/localhost:5000([^`]*)`/g;
    if (templatePattern.test(content)) {
        content = content.replace(templatePattern, (match, rest) => {
            return `\`\${API_URL}${rest}\``;
        });
    }

    if (content !== originalContent) {
        // Add import if missing
        if (!content.includes('import { API_URL }') && !content.includes("import { API_URL }")) {
            // Add after 'use client' if present, or at the top
            if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                const lines = content.split('\n');
                lines.splice(1, 0, '\n' + API_CONFIG_IMPORT); // Add after line 1
                content = lines.join('\n');
            } else {
                content = API_CONFIG_IMPORT + ';\n' + content;
            }
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

// Run
const rootDir = path.resolve(__dirname, '../');
TARGET_DIRS.forEach(dir => {
    const targetDir = path.join(rootDir, dir);
    if (fs.existsSync(targetDir)) {
        walkDir(targetDir, processFile);
    }
});

console.log('Replacement complete.');
