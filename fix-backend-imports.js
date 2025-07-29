const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findJsFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to fix import paths in a file
function fixImportPaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Get the relative path from the file to the src directory
        const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'backend', 'src'));
        const relativePathParts = relativePath.split(path.sep);
        
        // Replace @/ imports with relative paths
        const importRegex = /require\('@\/([^']+)'\)/g;
        const newContent = content.replace(importRegex, (match, importPath) => {
            // Calculate the relative path from current file to the import
            const targetPath = path.join(__dirname, 'backend', 'src', importPath);
            const relativeImportPath = path.relative(path.dirname(filePath), targetPath);
            
            // Convert Windows path separators to forward slashes for require
            const normalizedPath = relativeImportPath.replace(/\\/g, '/');
            
            modified = true;
            return `require('${normalizedPath}')`;
        });
        
        if (modified) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ Fixed imports in: ${path.relative(__dirname, filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Fixing backend import paths...\n');

const backendSrcPath = path.join(__dirname, 'backend', 'src');
const jsFiles = findJsFiles(backendSrcPath);

let fixedCount = 0;

jsFiles.forEach(filePath => {
    if (fixImportPaths(filePath)) {
        fixedCount++;
    }
});

console.log(`\n🎉 Fixed imports in ${fixedCount} files!`);
console.log('\n📋 Next steps:');
console.log('1. Test backend startup: cd backend && npm start');
console.log('2. Check for any remaining import errors');
console.log('3. Run the application to ensure everything works'); 