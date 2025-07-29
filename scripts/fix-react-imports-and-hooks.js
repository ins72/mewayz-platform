const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React imports, useState hooks, and icon imports...');

// Function to fix React imports and hooks in a file
function fixReactImports(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Check if file is a TypeScript/TSX file
        const isTSX = filePath.endsWith('.tsx');
        const isTS = filePath.endsWith('.ts');

        // Fix 1: Add missing React import
        if (!content.includes('import React') && !content.includes('import {') && !content.includes('import * as React')) {
            if (isTSX || isTS) {
                content = 'import React from "react";\n' + content;
            } else {
                content = 'import React from "react";\n' + content;
            }
            modified = true;
        }

        // Fix 2: Add useState import if component uses useState but doesn't import it
        if (content.includes('useState') && !content.includes('import { useState }') && !content.includes('import React, { useState }')) {
            // Check if there's already a React import
            if (content.includes('import React from "react"')) {
                content = content.replace(
                    'import React from "react"',
                    'import React, { useState } from "react"'
                );
            } else if (content.includes('import {') && content.includes('} from "react"')) {
                // Add useState to existing named imports
                const reactImportMatch = content.match(/import \{([^}]+)\} from "react"/);
                if (reactImportMatch && !reactImportMatch[1].includes('useState')) {
                    const newImport = `import { ${reactImportMatch[1]}, useState } from "react"`;
                    content = content.replace(reactImportMatch[0], newImport);
                }
            } else {
                // Add new useState import
                content = 'import { useState } from "react";\n' + content;
            }
            modified = true;
        }

        // Fix 3: Add useEffect import if component uses useEffect but doesn't import it
        if (content.includes('useEffect') && !content.includes('import { useEffect }') && !content.includes('import React, { useEffect }')) {
            if (content.includes('import React from "react"')) {
                content = content.replace(
                    'import React from "react"',
                    'import React, { useEffect } from "react"'
                );
            } else if (content.includes('import {') && content.includes('} from "react"')) {
                const reactImportMatch = content.match(/import \{([^}]+)\} from "react"/);
                if (reactImportMatch && !reactImportMatch[1].includes('useEffect')) {
                    const newImport = `import { ${reactImportMatch[1]}, useEffect } from "react"`;
                    content = content.replace(reactImportMatch[0], newImport);
                }
            } else {
                content = 'import { useEffect } from "react";\n' + content;
            }
            modified = true;
        }

        // Fix 4: Add missing icon imports
        const missingIcons = [];
        if (content.includes('Search') && !content.includes('import { Search }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('Search');
        }
        if (content.includes('ChevronUp') && !content.includes('import { ChevronUp }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('ChevronUp');
        }
        if (content.includes('ChevronDown') && !content.includes('import { ChevronDown }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('ChevronDown');
        }
        if (content.includes('Mail') && !content.includes('import { Mail }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('Mail');
        }
        if (content.includes('MessageSquare') && !content.includes('import { MessageSquare }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('MessageSquare');
        }
        if (content.includes('Phone') && !content.includes('import { Phone }') && !content.includes('from "lucide-react"')) {
            missingIcons.push('Phone');
        }

        if (missingIcons.length > 0) {
            const iconImport = `import { ${missingIcons.join(', ')} } from "lucide-react";\n`;
            content = iconImport + content;
            modified = true;
        }

        // Fix 5: Add "use client" directive for client components that use hooks
        if ((content.includes('useState') || content.includes('useEffect')) && !content.includes('"use client"') && !content.includes('"use server"')) {
            content = '"use client";\n\n' + content;
            modified = true;
        }

        // Fix 6: Remove static export conflicts with useState
        if (content.includes('export const dynamic = "force-static"') && content.includes('useState')) {
            content = content.replace(
                'export const dynamic = "force-static"',
                'export const dynamic = "force-dynamic"'
            );
            modified = true;
        }

        // Fix 7: Add dynamic export for components using hooks
        if ((content.includes('useState') || content.includes('useEffect')) && !content.includes('export const dynamic')) {
            const exportMatch = content.match(/export default function (\w+)/);
            if (exportMatch) {
                const dynamicExport = 'export const dynamic = "force-dynamic";\n\n';
                content = dynamicExport + content;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to recursively find and fix all TypeScript/TSX files
function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    let fixedCount = 0;
    let errorCount = 0;

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            const result = processDirectory(filePath);
            fixedCount += result.fixed;
            errorCount += result.errors;
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            try {
                if (fixReactImports(filePath)) {
                    fixedCount++;
                }
            } catch (error) {
                console.error(`❌ Error processing ${filePath}:`, error.message);
                errorCount++;
            }
        }
    });

    return { fixed: fixedCount, errors: errorCount };
}

// Start processing from the current directory
const startDir = process.cwd();
console.log(`\n🔍 Scanning directory: ${startDir}`);

const result = processDirectory(startDir);

console.log(`\n📊 Fix Summary:`);
console.log(`✅ Successfully fixed: ${result.fixed} files`);
console.log(`❌ Errors: ${result.errors} files`);

// Additional fixes for specific common patterns
console.log('\n🔧 Applying additional fixes...');

// Fix common patterns in specific directories
const specificFixes = [
    'core-2-original/ui',
    'frontend',
    'frontend-backup'
];

specificFixes.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`\n📁 Processing ${dir}...`);
        const dirResult = processDirectory(dir);
        console.log(`✅ Fixed ${dirResult.fixed} files in ${dir}`);
    }
});

console.log('\n🎉 React import and hook fixes completed!');
console.log('\n📋 Next steps:');
console.log('1. Run your development server to test the fixes');
console.log('2. Check for any remaining import errors');
console.log('3. Verify that all components are properly importing React and hooks');
console.log('4. Test that dynamic rendering is working correctly'); 