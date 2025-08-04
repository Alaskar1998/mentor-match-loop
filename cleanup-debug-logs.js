#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and .git
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Function to clean up console.log statements
function cleanupConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace console.log with logger.debug
    const consoleLogRegex = /console\.log\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*(.+))?\)/g;
    content = content.replace(consoleLogRegex, (match, message, args) => {
      modified = true;
      if (args) {
        return `logger.debug('${message}', ${args})`;
      } else {
        return `logger.debug('${message}')`;
      }
    });
    
    // Replace console.error with logger.error
    const consoleErrorRegex = /console\.error\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*(.+))?\)/g;
    content = content.replace(consoleErrorRegex, (match, message, args) => {
      modified = true;
      if (args) {
        return `logger.error('${message}', ${args})`;
      } else {
        return `logger.error('${message}')`;
      }
    });
    
    // Replace console.warn with logger.warn
    const consoleWarnRegex = /console\.warn\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*(.+))?\)/g;
    content = content.replace(consoleWarnRegex, (match, message, args) => {
      modified = true;
      if (args) {
        return `logger.warn('${message}', ${args})`;
      } else {
        return `logger.warn('${message}')`;
      }
    });
    
    // Add logger import if needed
    if (modified && !content.includes("import { logger }")) {
      const importRegex = /import\s+.*?from\s+['"`]@\/utils\/logger['"`];/;
      if (!importRegex.test(content)) {
        // Find the last import statement
        const lastImportIndex = content.lastIndexOf('import');
        if (lastImportIndex !== -1) {
          const nextLineIndex = content.indexOf('\n', lastImportIndex);
          const importStatement = "import { logger } from '@/utils/logger';";
          content = content.slice(0, nextLineIndex + 1) + importStatement + '\n' + content.slice(nextLineIndex + 1);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned up: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🧹 Starting debug log cleanup...');

const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir);

let cleanedFiles = 0;
let totalFiles = files.length;

files.forEach(file => {
  if (cleanupConsoleLogs(file)) {
    cleanedFiles++;
  }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`📁 Total files processed: ${totalFiles}`);
console.log(`✅ Files cleaned: ${cleanedFiles}`);
console.log(`📈 Cleanup rate: ${((cleanedFiles / totalFiles) * 100).toFixed(1)}%`);

if (cleanedFiles > 0) {
  console.log('\n🎉 Debug log cleanup completed!');
  console.log('💡 Remember to:');
  console.log('   1. Test the application thoroughly');
  console.log('   2. Check that all logging still works');
  console.log('   3. Update any remaining console.log statements manually');
} else {
  console.log('\n✨ No debug logs found to clean up!');
} 