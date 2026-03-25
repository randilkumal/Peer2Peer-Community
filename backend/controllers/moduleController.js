const Module = require('../models/Module');
const { MODULES_DATA } = require('../utils/seedModules');

// @desc    Get all modules
// @route   GET /api/modules
// @access  Private
exports.getModules = async (req, res) => {
  try {
    console.log('=== GET MODULES DEBUG ===');
    
    const modules = await Module.find().sort('code');
    
    console.log(`Found ${modules.length} modules`);
    
    if (modules.length === 0) {
      console.log('No modules found in database, falling back to static MODULES_DATA');
      return res.json({
        success: true,
        modules: MODULES_DATA
      });
    }

    res.json({
      success: true,
      modules: modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
};

// @desc    Get single module by code
// @route   GET /api/modules/:code
// @access  Private
exports.getModuleByCode = async (req, res) => {
  try {
    const module = await Module.findOne({ code: req.params.code });
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module',
      error: error.message
    });
  }
};

// @desc    Get modules by year and semester
// @route   GET /api/modules/year/:year/semester/:semester
// @access  Private
exports.getModulesByYearAndSemester = async (req, res) => {
  try {
    const { year, semester } = req.params;
    
    const modules = await Module.find({ 
      year: parseInt(year), 
      semester: parseInt(semester) 
    }).sort('code');

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Get modules by year/semester error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
};

// Map year (1-4) to module level
const yearToLevel = { 1: '4', 2: '5', 3: '6', 4: '7' };

// @desc    Get modules by student year (year 1->level 4, year 2->level 5, year 3->level 6, year 4->level 7)
// @route   GET /api/modules/by-year/:year
// @access  Private
exports.getModulesByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    if (year < 1 || year > 4) {
      return res.json({ success: true, modules: [] });
    }
    const level = yearToLevel[year];
    let modules = await Module.find({ level }).sort('code');

    // Fallback to static MODULES_DATA if DB has no matching entries
    if (!modules.length) {
      modules = MODULES_DATA.filter(m => m.level === level);
    }

    res.json({ success: true, modules });
  } catch (error) {
    console.error('Get modules by year error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
};

// @desc    Get modules by specialization
// @route   GET /api/modules/specialization/:specialization
// @access  Private
exports.getModulesBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    
    let modules = await Module.find({ 
      specializations: specialization 
    }).sort('code');

    if (!modules.length) {
      modules = MODULES_DATA.filter(m => 
        Array.isArray(m.specializations) && m.specializations.includes(specialization)
      );
    }

    res.json({
      success: true,
      modules
    });
  } catch (error) {
    console.error('Get modules by specialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules',
      error: error.message
    });
  }
};