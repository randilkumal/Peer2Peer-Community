
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getModules,
  getModuleByCode,
  getModulesByYearAndSemester,
  getModulesByYear,
  getModulesBySpecialization
} = require('../controllers/moduleController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Modules Route] ${req.method} ${req.url}`);
  next();
});

// All routes are protected
router.use(protect);

// Get all modules
router.get('/', getModules);

// Get modules by year and semester
router.get('/year/:year/semester/:semester', getModulesByYearAndSemester);
// Get modules by student year only (1-4)
router.get('/by-year/:year', getModulesByYear);

// Get modules by specialization
router.get('/specialization/:specialization', getModulesBySpecialization);

// Get single module by code
router.get('/:code', getModuleByCode);

module.exports = router;