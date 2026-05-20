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

// Backend Auth Controller
replaceInFile(path.join(__dirname, '..', 'src', 'auth', 'auth.controller.ts'), [
    { search: /, Request, UseGuards /g, replace: ' ' }
]);

// Backend Auth Service
replaceInFile(path.join(__dirname, '..', 'src', 'auth', 'auth.service.ts'), [
    { search: /, UnauthorizedException /g, replace: ' ' },
    { search: /UnauthorizedException, /g, replace: '' }
]);

// Backend Classes Controller
replaceInFile(path.join(__dirname, '..', 'src', 'classes', 'classes.controller.ts'), [
    { search: /, Request, UseGuards /g, replace: ' ' },
    { search: /, UseGuards, Request /g, replace: ' ' },
    { search: /UseGuards, Request, /g, replace: '' },
    { search: /, Request/g, replace: '' },
    { search: /, UseGuards/g, replace: '' }
]);

// Backend Grades Controller
replaceInFile(path.join(__dirname, '..', 'src', 'grades', 'grades.controller.ts'), [
    { search: /, Query/g, replace: '' },
    { search: /Query, /g, replace: '' }
]);

// Backend Timetable Upload Controller
replaceInFile(path.join(__dirname, '..', 'src', 'timetable-upload', 'timetable-upload.controller.ts'), [
    { search: / as string/g, replace: '' },
    { search: / as Express.Multer.File/g, replace: '' },
    { search: / as any/g, replace: '' }
]);

const frontendApp = path.join(__dirname, '..', '..', 'frontend', 'src', 'app');

// Frontend Admin Absences
replaceInFile(path.join(frontendApp, 'dashboard', 'admin', 'absences', 'page.tsx'), [
    { search: /import { motion } from 'framer-motion';\n/g, replace: '' },
    { search: /FileText, /g, replace: '' },
    { search: /User, /g, replace: '' },
    { search: /Calendar, /g, replace: '' },
    { search: /, FileText/g, replace: '' },
    { search: /, User/g, replace: '' },
    { search: /, Calendar/g, replace: '' }
]);

// Frontend Admin Page
replaceInFile(path.join(frontendApp, 'dashboard', 'admin', 'page.tsx'), [
    { search: /TrendingUp, /g, replace: '' },
    { search: /UserPlus, /g, replace: '' },
    { search: /AlertCircle, /g, replace: '' },
    { search: /, TrendingUp/g, replace: '' },
    { search: /, UserPlus/g, replace: '' },
    { search: /, AlertCircle/g, replace: '' }
]);

// Frontend Admin School
replaceInFile(path.join(frontendApp, 'dashboard', 'admin', 'school', 'page.tsx'), [
    { search: /import { motion } from 'framer-motion';\n/g, replace: '' },
    { search: /Search, /g, replace: '' },
    { search: /Check, /g, replace: '' },
    { search: /, Search/g, replace: '' },
    { search: /, Check/g, replace: '' }
]);

// Frontend Admin Settings
replaceInFile(path.join(frontendApp, 'dashboard', 'admin', 'settings', 'page.tsx'), [
    { search: /Settings, /g, replace: '' },
    { search: /Globe, /g, replace: '' },
    { search: /Phone, /g, replace: '' },
    { search: /MapPin, /g, replace: '' },
    { search: /ShieldCheck, /g, replace: '' },
    { search: /, Settings/g, replace: '' },
    { search: /, Globe/g, replace: '' },
    { search: /, Phone/g, replace: '' },
    { search: /, MapPin/g, replace: '' },
    { search: /, ShieldCheck/g, replace: '' }
]);

// Frontend Admin Users
replaceInFile(path.join(frontendApp, 'dashboard', 'admin', 'users', 'page.tsx'), [
    { search: /Users, /g, replace: '' },
    { search: /, Users/g, replace: '' }
]);

// Frontend Attendance
replaceInFile(path.join(frontendApp, 'dashboard', 'attendance', 'page.tsx'), [
    { search: /import { motion } from 'framer-motion';\n/g, replace: '' },
    { search: /ClipboardCheck, /g, replace: '' },
    { search: /CalendarIcon, /g, replace: '' },
    { search: /Clock, /g, replace: '' },
    { search: /ArrowRight, /g, replace: '' },
    { search: /, ClipboardCheck/g, replace: '' },
    { search: /, CalendarIcon/g, replace: '' },
    { search: /, Clock/g, replace: '' },
    { search: /, ArrowRight/g, replace: '' },
    { search: /, Calendar as CalendarIcon /g, replace: '' }
]);

// Frontend Grades
replaceInFile(path.join(frontendApp, 'dashboard', 'grades', 'page.tsx'), [
    { search: /import { motion } from 'framer-motion';\n/g, replace: '' },
    { search: /GraduationCap, /g, replace: '' },
    { search: /TrendingUp, /g, replace: '' },
    { search: /AlertCircle, /g, replace: '' },
    { search: /CheckCircle2, /g, replace: '' },
    { search: /, GraduationCap/g, replace: '' },
    { search: /, TrendingUp/g, replace: '' },
    { search: /, AlertCircle/g, replace: '' },
    { search: /, CheckCircle2/g, replace: '' }
]);

// Frontend Layout
replaceInFile(path.join(frontendApp, 'dashboard', 'layout.tsx'), [
    { search: /UserCircle, /g, replace: '' },
    { search: /, UserCircle/g, replace: '' },
    { search: /const router = useRouter\(\);\n/g, replace: '' }
]);

console.log("Cleanup script completed.");
