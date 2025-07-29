const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in routes directory
function findRouteFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findRouteFiles(filePath, fileList);
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

        // Fix common import path patterns
        const patterns = [
            // Fix relative paths that are too shallow
            { from: /require\('\.\.\/controllers\//g, to: "require('../../controllers/" },
            { from: /require\('\.\.\/middlewares\//g, to: "require('../../middlewares/" },
            { from: /require\('\.\.\/models\//g, to: "require('../../models/" },
            { from: /require\('\.\.\/utils\//g, to: "require('../../utils/" },
            { from: /require\('\.\.\/handlers\//g, to: "require('../../handlers/" },
            { from: /require\('\.\.\/locale\//g, to: "require('../../locale/" },
            { from: /require\('\.\.\/settings\//g, to: "require('../../settings/" },
            { from: /require\('\.\.\/emailTemplate\//g, to: "require('../../emailTemplate/" },
            { from: /require\('\.\.\/pdf\//g, to: "require('../../pdf/" },
            { from: /require\('\.\.\/scripts\//g, to: "require('../../scripts/" },
            { from: /require\('\.\.\/public\//g, to: "require('../../public/" },
        ];

        patterns.forEach(pattern => {
            if (pattern.from.test(content)) {
                content = content.replace(pattern.from, pattern.to);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
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
console.log('🔧 Fixing all route import paths...\n');

const routesPath = path.join(__dirname, 'backend', 'src', 'routes');
const routeFiles = findRouteFiles(routesPath);

let fixedCount = 0;

routeFiles.forEach(filePath => {
    if (fixImportPaths(filePath)) {
        fixedCount++;
    }
});

console.log(`\n🎉 Fixed imports in ${fixedCount} route files!`);
console.log('\n📋 Next steps:');
console.log('1. Test backend startup: cd backend && npm start');
console.log('2. Check for any remaining import errors');
console.log('3. Run the application to ensure everything works'); 