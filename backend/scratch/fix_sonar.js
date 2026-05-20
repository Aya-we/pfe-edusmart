const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function processDirectory(dir, extension, replacements) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath, extension, replacements);
        } else if (fullPath.endsWith(extension)) {
            replaceInFile(fullPath, replacements);
        }
    }
}

// 1. Backend: readonly PrismaService
const backendServicesDir = path.join(__dirname, '..', 'src');
processDirectory(backendServicesDir, '.service.ts', [
    { search: /private prisma: PrismaService/g, replace: 'private readonly prisma: PrismaService' },
    { search: /private jwtService: JwtService/g, replace: 'private readonly jwtService: JwtService' },
    { search: /private notificationsGateway: NotificationsGateway/g, replace: 'private readonly notificationsGateway: NotificationsGateway' },
    { search: /private genAI: GoogleGenerativeAI;/g, replace: 'private readonly genAI: GoogleGenerativeAI;' },
    { search: /private model: any;/g, replace: 'private readonly model: any;' },
]);

// 2. Backend controllers: readonly AuthService
processDirectory(backendServicesDir, '.controller.ts', [
    { search: /private authService: AuthService/g, replace: 'private readonly authService: AuthService' }
]);

// 3. Backend node:path and node:fs
processDirectory(backendServicesDir, '.ts', [
    { search: /from 'path'/g, replace: "from 'node:path'" },
    { search: /from 'fs'/g, replace: "from 'node:fs'" },
]);

// 4. Backend string replaceAll
replaceInFile(path.join(backendServicesDir, 'resources', 'resources.controller.ts'), [
    { search: /\.replace\(/g, replace: '.replaceAll(' }
]);

// 5. Backend main.ts IIFE
replaceInFile(path.join(backendServicesDir, 'main.ts'), [
    { search: /bootstrap\(\);\s*$/, replace: '(async () => {\n  await bootstrap();\n})();\n' }
]);

// 6. Frontend deprecations
const frontendDir = path.join(__dirname, '..', '..', 'frontend', 'src', 'app');
processDirectory(frontendDir, '.tsx', [
    { search: /, FormEvent /g, replace: ' ' },
    { search: /import { FormEvent } from 'react';\n/g, replace: '' },
    { search: /import { FormEvent, /g, replace: 'import { ' },
    { search: /e: FormEvent/g, replace: 'e: React.FormEvent' },
    { search: /window\./g, replace: 'globalThis.' },
    { search: /parseFloat\(/g, replace: 'Number.parseFloat(' },
    { search: /\b\.5\b/g, replace: '0.5' } // simple fix for zero fractions
]);

// Let's add empty catch blocks fix in frontend:
processDirectory(frontendDir, '.tsx', [
    { search: /catch \(error\) {\n\s*}\n/g, replace: 'catch (error) {\n      console.error(error);\n    }\n' },
    { search: /catch \(err\) {\n\s*}\n/g, replace: 'catch (err) {\n      console.error(err);\n    }\n' }
]);

console.log("Fixes applied successfully.");
