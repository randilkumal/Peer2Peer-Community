const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'backend', 'uploads', 'resources');
if (fs.existsSync(uploadDir)) {
  const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDFs`);
  
  files.slice(0, 3).forEach(f => {
    const filePath = path.join(uploadDir, f);
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(10);
    fs.readSync(fd, buffer, 0, 10, 0);
    console.log(f, buffer.toString('utf8'), buffer.toString('hex'));
    fs.closeSync(fd);
  });
} else {
  console.log('Uploads directory does not exist:', uploadDir);
}
