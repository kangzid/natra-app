const fs = require('fs');
const path = require('path');

const newsHtmlPath = path.resolve('pages/news.html');
console.log(fs.readFileSync(newsHtmlPath, 'utf8'));
