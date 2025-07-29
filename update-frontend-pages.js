const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files in app directory
function findTsxFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findTsxFiles(filePath, fileList);
        } else if (file.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to update a file to use core-2-original components
function updateFileToCore2(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Check if file uses shadcn/ui components
        if (content.includes('@/components/ui/')) {
            console.log(`🔄 Updating: ${path.relative(__dirname, filePath)}`);
            
            // Replace imports
            content = content.replace(
                /import\s*{\s*Card,\s*CardContent,\s*CardDescription,\s*CardHeader,\s*CardTitle\s*}\s*from\s*['"]@\/components\/ui\/card['"];?/g,
                "import Card from '@/components/Card';"
            );
            
            content = content.replace(
                /import\s*{\s*Button\s*}\s*from\s*['"]@\/components\/ui\/button['"];?/g,
                "import Button from '@/components/Button';"
            );
            
            content = content.replace(
                /import\s*{\s*Badge\s*}\s*from\s*['"]@\/components\/ui\/badge['"];?/g,
                "import Badge from '@/components/Badge';"
            );

            // Replace Lucide React icons with Icon component
            content = content.replace(
                /import\s*{[^}]*}\s*from\s*['"]lucide-react['"];?/g,
                "import Icon from '@/components/Icon';"
            );

            // Replace Card component usage
            content = content.replace(
                /<Card\s+className="([^"]*)">\s*<CardHeader>\s*<CardTitle>([^<]*)<\/CardTitle>\s*(?:<CardDescription>([^<]*)<\/CardDescription>)?\s*<\/CardHeader>\s*<CardContent>/g,
                '<Card title="$2" className="$1">'
            );

            // Replace Button component usage
            content = content.replace(
                /<Button\s+variant="([^"]*)"\s+size="([^"]*)"/g,
                '<Button isStroke className="h-8 text-sm"'
            );

            // Replace Lucide icons with Icon component
            content = content.replace(
                /<([A-Z][a-zA-Z]*)\s+className="([^"]*)"/g,
                '<Icon name="$1.toLowerCase()" className="$2"'
            );

            // Update CSS classes to use core-2-original variables
            content = content.replace(/bg-gray-50/g, 'bg-b-surface');
            content = content.replace(/text-gray-900/g, 'text-t-primary');
            content = content.replace(/text-gray-600/g, 'text-t-secondary');
            content = content.replace(/border-gray-200/g, 'border-s-stroke');

            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Updating frontend pages to use core-2-original components...\n');

const appPath = path.join(__dirname, 'frontend', 'app');
const tsxFiles = findTsxFiles(appPath);

let updatedCount = 0;

tsxFiles.forEach(filePath => {
    if (updateFileToCore2(filePath)) {
        updatedCount++;
    }
});

console.log(`\n🎉 Updated ${updatedCount} files to use core-2-original components!`);
console.log('\n📋 Next steps:');
console.log('1. Test the frontend application');
console.log('2. Check for any remaining shadcn/ui imports');
console.log('3. Verify all components are working correctly'); 