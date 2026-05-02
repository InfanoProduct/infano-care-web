const fs = require('fs');
const content = fs.readFileSync('d:/Khushi/infano-v2/infano-care-web/node_modules/lucide-react/dist/lucide-react.d.ts', 'utf8');
const icons = ['Linkedin', 'Twitter', 'LinkedIn'];
icons.forEach(icon => {
    const regex = new RegExp(`\\b${icon}\\b`, 'g');
    if (regex.test(content)) {
        console.log(`${icon} found`);
    } else {
        console.log(`${icon} NOT found`);
    }
});

// Also search for any icon with "Social" or "Link"
const allMatches = content.match(/\b\w*(Linkedin|Twitter|LinkedIn|Social)\w*\b/gi);
if (allMatches) {
    console.log('Similar icons found:', [...new Set(allMatches)]);
}
