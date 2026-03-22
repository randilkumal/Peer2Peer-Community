// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const {
//   uploadResource,
//   getResources,
//   getResourceById,
//   downloadResource,
//   getMyDownloads
// } = require('../controllers/resourceController');

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`[Resources Route] ${req.method} ${req.url}`);
//   next();
// });

// // All routes are protected
// router.use(protect);

// // Get user's downloads
// router.get('/my-downloads', getMyDownloads);

// // Upload resource - with file upload
// router.post('/', upload.single('file'), uploadResource);

// // Get all resources (with filters)
// router.get('/', getResources);

// // Download resource
// router.get('/:id/download', downloadResource);

// // Get single resource
// router.get('/:id', getResourceById);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { protect, authorize } = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const {
//   uploadResource,
//   getResources,
//   getResourceById,
//   downloadResource,
//   getMyDownloads,
//   approveResource,
//   rejectResource,
//   getAdminResources
// } = require('../controllers/resourceController');

// // Debug middleware
// router.use((req, res, next) => {
//   console.log(`[Resources Route] ${req.method} ${req.url}`);
//   next();
// });

// // All routes are protected
// router.use(protect);

// // Admin routes (must come before /:id routes to avoid conflicts)
// router.get('/admin', authorize('admin'), getAdminResources);
// router.post('/:id/approve', authorize('admin'), approveResource);
// router.post('/:id/reject', authorize('admin'), rejectResource);

// // Get user's downloads
// router.get('/my-downloads', getMyDownloads);

// // Upload resource - with file upload
// router.post('/', upload.single('file'), uploadResource);

// // Get all resources (with filters)
// router.get('/', getResources);

// // Download resource
// router.get('/:id/download', downloadResource);

// // Get single resource
// router.get('/:id', getResourceById);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Your multer config
const {
  uploadResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
  viewResource,
  getMyDownloads,  // ADD THIS
  approveResource,
  rejectResource
} = require('../controllers/resourceController');

// Public/Student routes
router.post('/', protect, upload.single('file'), uploadResource);
router.get('/', protect, getResources);
router.get('/my-downloads', protect, getMyDownloads);  // ADD THIS
router.get('/:id', protect, getResourceById);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.get('/:id/download', protect, downloadResource);
router.get('/:id/view', protect, viewResource);

// Admin routes
router.post('/:id/approve', protect, authorize('admin'), approveResource);
router.post('/:id/reject', protect, authorize('admin'), rejectResource);

module.exports = router;