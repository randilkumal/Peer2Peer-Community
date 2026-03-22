const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure storage for resources
const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resources';
    createDirIfNotExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|jpg|jpeg|png|gif|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only documents (PDF, DOCX, PPTX), images, and archives (ZIP, RAR) are allowed. Audio and video files are prohibited.'));
  }
};

const upload = multer({
  storage: resourceStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

module.exports = upload;