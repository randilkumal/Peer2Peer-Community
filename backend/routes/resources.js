
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