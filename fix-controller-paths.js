const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in controllers directory
function findControllerFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findControllerFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to fix relative paths in a file
function fixRelativePaths(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Get the depth of the file from the controllers directory
        const relativePath = path.relative(path.join(__dirname, 'backend', 'src', 'controllers'), path.dirname(filePath));
        const depth = relativePath.split(path.sep).length;
        
        // Create the correct prefix for relative paths
        const prefix = '../'.repeat(depth + 1); // +1 to go up from controllers to src
        
        // Fix common relative path patterns
        const patterns = [
            { from: /require\('\.\.\/\.\.\/models\//g, to: `require('${prefix}models/` },
            { from: /require\('\.\.\/\.\.\/utils\//g, to: `require('${prefix}utils/` },
            { from: /require\('\.\.\/\.\.\/middlewares\//g, to: `require('${prefix}middlewares/` },
            { from: /require\('\.\.\/\.\.\/handlers\//g, to: `require('${prefix}handlers/` },
            { from: /require\('\.\.\/\.\.\/controllers\//g, to: `require('${prefix}controllers/` },
            { from: /require\('\.\.\/\.\.\/locale\//g, to: `require('${prefix}locale/` },
            { from: /require\('\.\.\/\.\.\/settings\//g, to: `require('${prefix}settings/` },
            { from: /require\('\.\.\/\.\.\/emailTemplate\//g, to: `require('${prefix}emailTemplate/` },
            { from: /require\('\.\.\/\.\.\/pdf\//g, to: `require('${prefix}pdf/` },
            { from: /require\('\.\.\/\.\.\/scripts\//g, to: `require('${prefix}scripts/` },
            { from: /require\('\.\.\/\.\.\/public\//g, to: `require('${prefix}public/` },
        ];
        
        patterns.forEach(pattern => {
            if (pattern.from.test(content)) {
                content = content.replace(pattern.from, pattern.to);
                modified = true;
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed paths in: ${path.relative(__dirname, filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Fixing controller relative paths...\n');

const controllersPath = path.join(__dirname, 'backend', 'src', 'controllers');
const controllerFiles = findControllerFiles(controllersPath);

let fixedCount = 0;

controllerFiles.forEach(filePath => {
    if (fixRelativePaths(filePath)) {
        fixedCount++;
    }
});

console.log(`\n🎉 Fixed paths in ${fixedCount} controller files!`);
console.log('\n📋 Next steps:');
console.log('1. Test backend startup: cd backend && npm start');
console.log('2. Check for any remaining path errors');
console.log('3. Run the application to ensure everything works'); 