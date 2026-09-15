import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('// @ts-nocheck')) {
        content = content.replace(/\/\/\s*@ts-nocheck\r?\n?/g, '');
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Cleaned: ${fullPath}`);
      }
    }
  }
}

const apiDir = path.resolve('app/api');
console.log(`Processing API directory: ${apiDir}`);
walkDir(apiDir);
console.log('✅ Removed @ts-nocheck from all API routes!');
