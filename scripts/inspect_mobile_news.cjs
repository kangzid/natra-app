const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const newsServicePath = path.join(mobileDir, 'src/features/news/news.service.js');
const newsHtmlPath = path.join(mobileDir, 'pages/news.html');

console.log('=== news.service.js ===');
if (fs.existsSync(newsServicePath)) {
    console.log(fs.readFileSync(newsServicePath, 'utf8'));
} else {
    console.log('news.service.js not found');
}

console.log('=== pages/news.html (first 100 lines) ===');
if (fs.existsSync(newsHtmlPath)) {
    console.log(fs.readFileSync(newsHtmlPath, 'utf8').split('\n').slice(0, 100).join('\n'));
} else {
    console.log('pages/news.html not found');
}
