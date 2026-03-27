const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'backend', 'uploads', 'resources');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));

if (files.length > 0) {
  const fileUrl = '/uploads/resources/' + files[0];
  const url = 'http://localhost:5000' + fileUrl;
  
  console.log('Testing GET', url);
  http.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    let chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      const buffer = Buffer.concat(chunks);
      console.log('Body length:', buffer.length);
      console.log('First 10 bytes:', buffer.slice(0, 10).toString('utf8'));
    });
  }).on('error', err => {
    console.error('Request Error:', err.message);
  });
} else {
  console.log('No PDF files found');
}
