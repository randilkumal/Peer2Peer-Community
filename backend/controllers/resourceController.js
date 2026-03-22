// // // controllers/resourceController.js
// // const Resource = require('../models/Resource');
// // const User = require('../models/User');

// // // @desc    Upload a new resource
// // // @route   POST /api/resources
// // // @access  Private (Students, Experts)
// // exports.uploadResource = async (req, res) => {
// //   try {
// //     console.log('=== UPLOAD RESOURCE DEBUG ===');
// //     console.log('User:', req.user ? req.user.id : 'No user');
// //     console.log('Body:', req.body);
// //     console.log('File:', req.file);

// //     // Check if user exists
// //     if (!req.user) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'User not authenticated'
// //       });
// //     }

// //     // Check if file was uploaded
// //     if (!req.file) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'No file uploaded'
// //       });
// //     }

// //     const { title, description, resourceType, moduleCode } = req.body;

// //     // Validate required fields
// //     if (!title) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Please provide a title'
// //       });
// //     }

// //     if (!moduleCode) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Please provide a module code'
// //       });
// //     }

// //     // Create resource object
// //     const resourceData = {
// //       title,
// //       description: description || '',
// //       type: resourceType || 'Other',
// //       moduleCode,
// //       uploadedBy: req.user.id,
// //       fileUrl: `/uploads/resources/${req.file.filename}`,
// //       fileName: req.file.originalname,
// //       fileSize: req.file.size,
// //       fileType: req.file.mimetype,
// //       status: 'pending',
// //       metadata: {
// //         fileSize: req.file.size,
// //         fileType: req.file.mimetype
// //       }
// //     };

// //     console.log('Resource data to save:', resourceData);

// //     const resource = await Resource.create(resourceData);
    
// //     // Populate uploader info
// //     await resource.populate('uploadedBy', 'name email profilePicture role fullName');
    
// //     console.log('Resource created successfully:', resource._id);

// //     // Format response to match frontend expectations
// //     const formattedResource = {
// //       _id: resource._id,
// //       title: resource.title,
// //       description: resource.description,
// //       resourceType: resource.type,
// //       moduleCode: resource.moduleCode,
// //       fileUrl: resource.fileUrl,
// //       fileName: resource.fileName,
// //       fileSize: resource.fileSize,
// //       fileType: resource.fileType,
// //       status: resource.status,
// //       uploader: resource.uploadedBy,
// //       createdAt: resource.createdAt,
// //       updatedAt: resource.updatedAt,
// //       averageRating: resource.averageRating || 0,
// //       totalRatings: resource.ratingCount || 0,
// //       downloadCount: resource.downloads || 0,
// //       viewCount: resource.views || 0
// //     };

// //     res.status(201).json({
// //       success: true,
// //       resource: formattedResource
// //     });
// //   } catch (error) {
// //     console.error('=== UPLOAD RESOURCE ERROR ===');
// //     console.error('Error name:', error.name);
// //     console.error('Error message:', error.message);
// //     console.error('Error stack:', error.stack);
    
// //     if (error.name === 'ValidationError') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Validation error',
// //         errors: Object.keys(error.errors).map(key => ({
// //           field: key,
// //           message: error.errors[key].message
// //         }))
// //       });
// //     }

// //     if (error.code === 11000) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Duplicate resource'
// //       });
// //     }
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error uploading resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Get all resources (with filters)
// // // @route   GET /api/resources
// // // @access  Private
// // exports.getResources = async (req, res) => {
// //   try {
// //     console.log('=== GET RESOURCES DEBUG ===');
// //     console.log('User:', req.user ? req.user.id : 'No user');
// //     console.log('User Role:', req.user?.role);
// //     console.log('Query:', req.query);
    
// //     const { module, type, year, sort, uploader, search, status } = req.query;
    
// //     // Build query
// //     const query = {};
    
// //     // Filter by module
// //     if (module) {
// //       query.moduleCode = module;
// //     }
    
// //     // Filter by type
// //     if (type) {
// //       query.type = type;
// //     }
    
// //     // Filter by uploader
// //     if (uploader) {
// //       query.uploadedBy = uploader;
// //     }
    
// //     // Status filtering logic
// //     if (req.user.role === 'admin') {
// //       if (status) {
// //         query.status = status;
// //       }
// //     } else {
// //       query.$or = [
// //         { status: 'approved' },
// //         { uploadedBy: req.user.id }
// //       ];
// //     }
    
// //     // Search by title/description
// //     if (search) {
// //       query.$text = { $search: search };
// //     }
    
// //     console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    
// //     // Build sort options
// //     let sortOption = { createdAt: -1 };
// //     if (sort === 'oldest') {
// //       sortOption = { createdAt: 1 };
// //     } else if (sort === 'rating') {
// //       sortOption = { averageRating: -1, createdAt: -1 };
// //     } else if (sort === 'downloads') {
// //       sortOption = { downloads: -1, createdAt: -1 };
// //     }
    
// //     const resources = await Resource.find(query)
// //       .populate('uploadedBy', 'name email profilePicture role fullName')
// //       .sort(sortOption);
    
// //     console.log(`Found ${resources.length} resources`);
    
// //     // Format resources to match frontend expectations
// //     const formattedResources = resources.map(resource => ({
// //       _id: resource._id,
// //       title: resource.title,
// //       description: resource.description,
// //       resourceType: resource.type,
// //       moduleCode: resource.moduleCode,
// //       fileUrl: resource.fileUrl,
// //       fileName: resource.fileName,
// //       fileSize: resource.fileSize,
// //       fileType: resource.fileType,
// //       status: resource.status,
// //       rejectionReason: resource.rejectionReason,
// //       uploader: resource.uploadedBy,
// //       createdAt: resource.createdAt,
// //       updatedAt: resource.updatedAt,
// //       averageRating: resource.averageRating || 0,
// //       totalRatings: resource.ratingCount || 0,
// //       downloadCount: resource.downloads || 0,
// //       viewCount: resource.views || 0,
// //       userRated: false
// //     }));
    
// //     res.json({
// //       success: true,
// //       resources: formattedResources
// //     });
// //   } catch (error) {
// //     console.error('=== GET RESOURCES ERROR ===');
// //     console.error('Error:', error);
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching resources',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Get single resource
// // // @route   GET /api/resources/:id
// // // @access  Private
// // exports.getResourceById = async (req, res) => {
// //   try {
// //     console.log('=== GET RESOURCE BY ID DEBUG ===');
// //     console.log('Resource ID:', req.params.id);
// //     console.log('User:', req.user ? req.user.id : 'No user');
// //     console.log('User Role:', req.user?.role);

// //     // Validate ID format
// //     if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Invalid resource ID format'
// //       });
// //     }

// //     // Find resource and populate only uploadedBy
// //     const resource = await Resource.findById(req.params.id)
// //       .populate('uploadedBy', 'name email profilePicture role fullName bio');
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }
    
// //     // Check access
// //     const uploadedById = resource.uploadedBy?._id?.toString() || resource.uploadedBy?.toString();
// //     const userId = req.user.id.toString();

// //     if (resource.status !== 'approved' && 
// //         uploadedById !== userId && 
// //         req.user.role !== 'admin') {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Not authorized to view this resource'
// //       });
// //     }
    
// //     // Increment views
// //     resource.views += 1;
// //     await resource.save();
    
// //     // Format resource to match frontend expectations
// //     const formattedResource = {
// //       _id: resource._id,
// //       title: resource.title,
// //       description: resource.description,
// //       resourceType: resource.type,
// //       moduleCode: resource.moduleCode,
// //       fileUrl: resource.fileUrl,
// //       fileName: resource.fileName,
// //       fileSize: resource.fileSize,
// //       fileType: resource.fileType,
// //       status: resource.status,
// //       rejectionReason: resource.rejectionReason,
// //       uploader: resource.uploadedBy,
// //       createdAt: resource.createdAt,
// //       updatedAt: resource.updatedAt,
// //       averageRating: resource.averageRating || 0,
// //       totalRatings: resource.ratingCount || 0,
// //       downloadCount: resource.downloads || 0,
// //       viewCount: resource.views || 0,
// //       savedBy: []
// //     };

// //     res.json({
// //       success: true,
// //       resource: formattedResource
// //     });
// //   } catch (error) {
// //     console.error('=== GET RESOURCE ERROR ===');
// //     console.error('Error name:', error.name);
// //     console.error('Error message:', error.message);
// //     console.error('Error stack:', error.stack);
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Update resource
// // // @route   PUT /api/resources/:id
// // // @access  Private (Owner or Admin)
// // exports.updateResource = async (req, res) => {
// //   try {
// //     console.log('=== UPDATE RESOURCE DEBUG ===');
// //     console.log('Resource ID:', req.params.id);
// //     console.log('User:', req.user.id);

// //     let resource = await Resource.findById(req.params.id);
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }
    
// //     // Check permission
// //     if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Not authorized to update this resource'
// //       });
// //     }
    
// //     resource = await Resource.findByIdAndUpdate(
// //       req.params.id,
// //       req.body,
// //       { new: true, runValidators: true }
// //     ).populate('uploadedBy', 'name email profilePicture role fullName');
    
// //     // Format response
// //     const formattedResource = {
// //       _id: resource._id,
// //       title: resource.title,
// //       description: resource.description,
// //       resourceType: resource.type,
// //       moduleCode: resource.moduleCode,
// //       fileUrl: resource.fileUrl,
// //       fileName: resource.fileName,
// //       fileSize: resource.fileSize,
// //       fileType: resource.fileType,
// //       status: resource.status,
// //       uploader: resource.uploadedBy,
// //       createdAt: resource.createdAt,
// //       updatedAt: resource.updatedAt,
// //       averageRating: resource.averageRating || 0,
// //       totalRatings: resource.ratingCount || 0,
// //       downloadCount: resource.downloads || 0,
// //       viewCount: resource.views || 0
// //     };
    
// //     res.json({
// //       success: true,
// //       resource: formattedResource
// //     });
// //   } catch (error) {
// //     console.error('Update resource error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error updating resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Delete resource
// // // @route   DELETE /api/resources/:id
// // // @access  Private (Owner or Admin)
// // exports.deleteResource = async (req, res) => {
// //   try {
// //     console.log('=== DELETE RESOURCE DEBUG ===');
// //     console.log('Resource ID:', req.params.id);
// //     console.log('User:', req.user.id);

// //     const resource = await Resource.findById(req.params.id);
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }
    
// //     // Check permission
// //     if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Not authorized to delete this resource'
// //       });
// //     }
    
// //     await resource.deleteOne();
    
// //     res.json({
// //       success: true,
// //       message: 'Resource deleted successfully'
// //     });
// //   } catch (error) {
// //     console.error('Delete resource error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error deleting resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Download resource (increment count)
// // // @route   GET /api/resources/:id/download
// // // @access  Private
// // exports.downloadResource = async (req, res) => {
// //   try {
// //     console.log('=== DOWNLOAD RESOURCE DEBUG ===');
// //     console.log('Resource ID:', req.params.id);

// //     const resource = await Resource.findById(req.params.id);
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }
    
// //     resource.downloads += 1;
// //     await resource.save();
    
// //     res.json({
// //       success: true,
// //       downloadUrl: resource.fileUrl,
// //       downloadCount: resource.downloads
// //     });
// //   } catch (error) {
// //     console.error('Download resource error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error downloading resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Get user's downloaded resources
// // // @route   GET /api/resources/my-downloads
// // // @access  Private
// // exports.getMyDownloads = async (req, res) => {
// //   try {
// //     console.log('=== GET MY DOWNLOADS DEBUG ===');
// //     console.log('User:', req.user.id);

// //     // For now, return empty array
// //     res.json({
// //       success: true,
// //       resources: []
// //     });
// //   } catch (error) {
// //     console.error('Get downloads error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching downloads',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Approve resource (Admin only)
// // // @route   POST /api/resources/:id/approve
// // // @access  Private (Admin)
// // exports.approveResource = async (req, res) => {
// //   try {
// //     console.log('=== APPROVE RESOURCE DEBUG ===');
// //     console.log('Resource ID:', req.params.id);
// //     console.log('Admin:', req.user.id);

// //     const resource = await Resource.findById(req.params.id);
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }

// //     if (resource.status === 'approved') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Resource is already approved'
// //       });
// //     }

// //     resource.status = 'approved';
// //     resource.rejectionReason = undefined;
// //     await resource.save();

// //     await resource.populate('uploadedBy', 'name email profilePicture role fullName');

// //     console.log('Resource approved successfully:', resource._id);

// //     res.json({
// //       success: true,
// //       message: 'Resource approved successfully',
// //       resource: {
// //         _id: resource._id,
// //         title: resource.title,
// //         status: resource.status,
// //         moduleCode: resource.moduleCode,
// //         uploader: resource.uploadedBy
// //       }
// //     });
// //   } catch (error) {
// //     console.error('=== APPROVE RESOURCE ERROR ===');
// //     console.error('Error:', error);
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error approving resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Reject resource (Admin only)
// // // @route   POST /api/resources/:id/reject
// // // @access  Private (Admin)
// // exports.rejectResource = async (req, res) => {
// //   try {
// //     console.log('=== REJECT RESOURCE DEBUG ===');
// //     console.log('Resource ID:', req.params.id);
// //     console.log('Admin:', req.user.id);
// //     console.log('Body:', req.body);

// //     const { reason } = req.body;

// //     if (!reason || !reason.trim()) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Rejection reason is required'
// //       });
// //     }

// //     const resource = await Resource.findById(req.params.id);
    
// //     if (!resource) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Resource not found'
// //       });
// //     }

// //     if (resource.status === 'rejected') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Resource is already rejected'
// //       });
// //     }

// //     resource.status = 'rejected';
// //     resource.rejectionReason = reason.trim();
// //     await resource.save();

// //     await resource.populate('uploadedBy', 'name email profilePicture role fullName');

// //     console.log('Resource rejected successfully:', resource._id);

// //     res.json({
// //       success: true,
// //       message: 'Resource rejected successfully',
// //       resource: {
// //         _id: resource._id,
// //         title: resource.title,
// //         status: resource.status,
// //         rejectionReason: resource.rejectionReason,
// //         moduleCode: resource.moduleCode,
// //         uploader: resource.uploadedBy
// //       }
// //     });
// //   } catch (error) {
// //     console.error('=== REJECT RESOURCE ERROR ===');
// //     console.error('Error:', error);
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error rejecting resource',
// //       error: error.message
// //     });
// //   }
// // };

// // // @desc    Get resources with admin filters (including status)
// // // @route   GET /api/resources/admin
// // // @access  Private (Admin)
// // exports.getAdminResources = async (req, res) => {
// //   try {
// //     console.log('=== GET ADMIN RESOURCES DEBUG ===');
// //     console.log('Admin:', req.user.id);
// //     console.log('Query:', req.query);
    
// //     const { status, module, search, page = 1, limit = 10 } = req.query;
    
// //     // Build query
// //     const query = {};
    
// //     if (status) {
// //       query.status = status;
// //     }
    
// //     if (module) {
// //       query.moduleCode = module;
// //     }
    
// //     if (search) {
// //       query.$or = [
// //         { title: { $regex: search, $options: 'i' } },
// //         { description: { $regex: search, $options: 'i' } },
// //         { moduleCode: { $regex: search, $options: 'i' } }
// //       ];
// //     }
    
// //     console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    
// //     const skip = (parseInt(page) - 1) * parseInt(limit);
    
// //     const resources = await Resource.find(query)
// //       .populate('uploadedBy', 'name email profilePicture role fullName')
// //       .sort('-createdAt')
// //       .skip(skip)
// //       .limit(parseInt(limit));
    
// //     const total = await Resource.countDocuments(query);
    
// //     console.log(`Found ${resources.length} resources out of ${total} total`);
    
// //     const formattedResources = resources.map(resource => ({
// //       _id: resource._id,
// //       title: resource.title,
// //       description: resource.description,
// //       resourceType: resource.type,
// //       moduleCode: resource.moduleCode,
// //       fileUrl: resource.fileUrl,
// //       fileName: resource.fileName,
// //       fileSize: resource.fileSize,
// //       fileType: resource.fileType,
// //       status: resource.status,
// //       rejectionReason: resource.rejectionReason,
// //       uploader: resource.uploadedBy,
// //       createdAt: resource.createdAt,
// //       updatedAt: resource.updatedAt,
// //       averageRating: resource.averageRating || 0,
// //       totalRatings: resource.ratingCount || 0,
// //       downloadCount: resource.downloads || 0,
// //       viewCount: resource.views || 0
// //     }));
    
// //     res.json({
// //       success: true,
// //       resources: formattedResources,
// //       pagination: {
// //         page: parseInt(page),
// //         limit: parseInt(limit),
// //         total,
// //         pages: Math.ceil(total / parseInt(limit))
// //       }
// //     });
// //   } catch (error) {
// //     console.error('=== GET ADMIN RESOURCES ERROR ===');
// //     console.error('Error:', error);
    
// //     res.status(500).json({
// //       success: false,
// //       message: 'Error fetching resources',
// //       error: error.message
// //     });
// //   }
// // };

// const Resource = require('../models/Resource');
// const User = require('../models/User');

// // @desc    Upload a new resource
// // @route   POST /api/resources
// // @access  Private (Students, Experts)
// exports.uploadResource = async (req, res) => {
//   try {
//     console.log('=== UPLOAD RESOURCE DEBUG ===');
//     console.log('User:', req.user ? req.user.id : 'No user');
//     console.log('Body:', req.body);
//     console.log('File:', req.file);

//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: 'User not authenticated'
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }

//     const { title, description, resourceType, moduleCode } = req.body;

//     if (!title) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a title'
//       });
//     }

//     if (!moduleCode) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a module code'
//       });
//     }

//     const resourceData = {
//       title,
//       description: description || '',
//       type: resourceType || 'Other',
//       moduleCode,
//       uploadedBy: req.user.id,
//       fileUrl: `/uploads/resources/${req.file.filename}`,
//       fileName: req.file.originalname,
//       fileSize: req.file.size,
//       fileType: req.file.mimetype,
//       status: 'pending',
//       metadata: {
//         fileSize: req.file.size,
//         fileType: req.file.mimetype
//       }
//     };

//     console.log('Resource data to save:', resourceData);

//     const resource = await Resource.create(resourceData);
    
//     await resource.populate('uploadedBy', 'name email profilePicture role fullName');
    
//     console.log('Resource created successfully:', resource._id);

//     const formattedResource = {
//       _id: resource._id,
//       title: resource.title,
//       description: resource.description,
//       resourceType: resource.type,
//       moduleCode: resource.moduleCode,
//       fileUrl: resource.fileUrl,
//       fileName: resource.fileName,
//       fileSize: resource.fileSize,
//       fileType: resource.fileType,
//       status: resource.status,
//       uploader: resource.uploadedBy,
//       createdAt: resource.createdAt,
//       updatedAt: resource.updatedAt,
//       averageRating: resource.averageRating || 0,
//       totalRatings: resource.ratingCount || 0,
//       downloadCount: resource.downloads || 0,
//       viewCount: resource.views || 0
//     };

//     res.status(201).json({
//       success: true,
//       resource: formattedResource
//     });
//   } catch (error) {
//     console.error('=== UPLOAD RESOURCE ERROR ===');
//     console.error('Error:', error);
    
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         errors: Object.keys(error.errors).map(key => ({
//           field: key,
//           message: error.errors[key].message
//         }))
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Duplicate resource'
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Error uploading resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Get all resources (with filters)
// // @route   GET /api/resources
// // @access  Private
// exports.getResources = async (req, res) => {
//   try {
//     console.log('=== GET RESOURCES DEBUG ===');
//     console.log('User:', req.user ? req.user.id : 'No user');
//     console.log('User Role:', req.user?.role);
//     console.log('Query:', req.query);
    
//     const { module, type, sort, uploader, search, status } = req.query;
    
//     let query = {};
    
//     // Module filter
//     if (module) {
//       query.moduleCode = module;
//     }
    
//     // Type filter
//     if (type) {
//       query.type = type;
//     }
    
//     // Handle uploader filter - IMPORTANT: Check if uploader is valid
//     if (uploader && uploader !== 'undefined' && uploader !== 'null' && uploader !== '') {
//       // If uploader is 'me', use current user's ID
//       if (uploader === 'me') {
//         query.uploadedBy = req.user.id;
//         console.log('Filtering by current user (me):', req.user.id);
//       } 
//       // Otherwise use the provided ID
//       else {
//         // Validate that it's a valid ObjectId
//         const mongoose = require('mongoose');
//         if (mongoose.Types.ObjectId.isValid(uploader)) {
//           query.uploadedBy = uploader;
//           console.log('Filtering by uploader ID:', uploader);
//         } else {
//           console.log('Invalid uploader ID format:', uploader);
//         }
//       }
//     }
    
//     // Status filter
//     if (status) {
//       query.status = status;
//     } else {
//       // Default status filtering based on role and context
//       if (!uploader || uploader === 'undefined' || uploader === 'null' || uploader === '') {
//         // If no uploader filter, only show approved resources to non-admins
//         if (req.user.role !== 'admin') {
//           query.status = 'approved';
//         }
//       }
//       // If uploader filter is active, show all statuses (for "My Uploads" tab)
//     }
    
//     // Search filter
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { moduleCode: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     console.log('Final MongoDB Query:', JSON.stringify(query, null, 2));
    
//     // Sort options
//     let sortOption = { createdAt: -1 };
//     if (sort === 'oldest') {
//       sortOption = { createdAt: 1 };
//     } else if (sort === 'rating') {
//       sortOption = { averageRating: -1, createdAt: -1 };
//     } else if (sort === 'downloads') {
//       sortOption = { downloads: -1, createdAt: -1 };
//     }
    
//     const resources = await Resource.find(query)
//       .populate('uploadedBy', 'name email profilePicture role fullName')
//       .sort(sortOption);
    
//     console.log(`Found ${resources.length} resources`);
    
//     const formattedResources = resources.map(resource => ({
//       _id: resource._id,
//       title: resource.title,
//       description: resource.description,
//       resourceType: resource.type,
//       moduleCode: resource.moduleCode,
//       fileUrl: resource.fileUrl,
//       fileName: resource.fileName,
//       fileSize: resource.fileSize,
//       fileType: resource.fileType,
//       status: resource.status,
//       rejectionReason: resource.rejectionReason,
//       uploader: resource.uploadedBy,
//       createdAt: resource.createdAt,
//       updatedAt: resource.updatedAt,
//       averageRating: resource.averageRating || 0,
//       totalRatings: resource.ratingCount || 0,
//       downloadCount: resource.downloads || 0,
//       viewCount: resource.views || 0,
//       userRated: false
//     }));
    
//     res.json({
//       success: true,
//       resources: formattedResources
//     });
//   } catch (error) {
//     console.error('=== GET RESOURCES ERROR ===');
//     console.error('Error:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching resources',
//       error: error.message
//     });
//   }
// };

// // @desc    Get single resource
// // @route   GET /api/resources/:id
// // @access  Private
// exports.getResourceById = async (req, res) => {
//   try {
//     console.log('=== GET RESOURCE BY ID DEBUG ===');
//     console.log('Resource ID:', req.params.id);
//     console.log('User:', req.user ? req.user.id : 'No user');

//     if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid resource ID format'
//       });
//     }

//     const resource = await Resource.findById(req.params.id)
//       .populate('uploadedBy', 'name email profilePicture role fullName bio');
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }
    
//     const uploadedById = resource.uploadedBy?._id?.toString() || resource.uploadedBy?.toString();
//     const userId = req.user.id.toString();

//     if (resource.status !== 'approved' && 
//         uploadedById !== userId && 
//         req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this resource'
//       });
//     }
    
//     resource.views += 1;
//     await resource.save();
    
//     const formattedResource = {
//       _id: resource._id,
//       title: resource.title,
//       description: resource.description,
//       resourceType: resource.type,
//       moduleCode: resource.moduleCode,
//       fileUrl: resource.fileUrl,
//       fileName: resource.fileName,
//       fileSize: resource.fileSize,
//       fileType: resource.fileType,
//       status: resource.status,
//       rejectionReason: resource.rejectionReason,
//       uploader: resource.uploadedBy,
//       createdAt: resource.createdAt,
//       updatedAt: resource.updatedAt,
//       averageRating: resource.averageRating || 0,
//       totalRatings: resource.ratingCount || 0,
//       downloadCount: resource.downloads || 0,
//       viewCount: resource.views || 0,
//       savedBy: []
//     };

//     res.json({
//       success: true,
//       resource: formattedResource
//     });
//   } catch (error) {
//     console.error('=== GET RESOURCE ERROR ===');
//     console.error('Error:', error);
    
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Update resource
// // @route   PUT /api/resources/:id
// // @access  Private (Owner or Admin)
// exports.updateResource = async (req, res) => {
//   try {
//     console.log('=== UPDATE RESOURCE DEBUG ===');
//     console.log('Resource ID:', req.params.id);

//     let resource = await Resource.findById(req.params.id);
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }
    
//     if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this resource'
//       });
//     }
    
//     resource = await Resource.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     ).populate('uploadedBy', 'name email profilePicture role fullName');
    
//     const formattedResource = {
//       _id: resource._id,
//       title: resource.title,
//       description: resource.description,
//       resourceType: resource.type,
//       moduleCode: resource.moduleCode,
//       fileUrl: resource.fileUrl,
//       fileName: resource.fileName,
//       fileSize: resource.fileSize,
//       fileType: resource.fileType,
//       status: resource.status,
//       uploader: resource.uploadedBy,
//       createdAt: resource.createdAt,
//       updatedAt: resource.updatedAt,
//       averageRating: resource.averageRating || 0,
//       totalRatings: resource.ratingCount || 0,
//       downloadCount: resource.downloads || 0,
//       viewCount: resource.views || 0
//     };
    
//     res.json({
//       success: true,
//       resource: formattedResource
//     });
//   } catch (error) {
//     console.error('Update resource error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete resource
// // @route   DELETE /api/resources/:id
// // @access  Private (Owner or Admin)
// exports.deleteResource = async (req, res) => {
//   try {
//     console.log('=== DELETE RESOURCE DEBUG ===');
//     console.log('Resource ID:', req.params.id);
//     console.log('User:', req.user.id);

//     const resource = await Resource.findById(req.params.id);
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }
    
//     // Check permission - owner can delete their own resources
//     if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to delete this resource'
//       });
//     }
    
//     await resource.deleteOne();
    
//     res.json({
//       success: true,
//       message: 'Resource deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete resource error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Download resource (increment count and track user)
// // @route   GET /api/resources/:id/download
// // @access  Private
// exports.downloadResource = async (req, res) => {
//   try {
//     console.log('=== DOWNLOAD RESOURCE DEBUG ===');
//     console.log('Resource ID:', req.params.id);
//     console.log('User ID:', req.user.id);

//     const resource = await Resource.findById(req.params.id);
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }
    
//     // Check if resource is approved (unless owner or admin)
//     const uploadedById = resource.uploadedBy?.toString();
//     const userId = req.user.id.toString();
    
//     if (resource.status !== 'approved' && 
//         uploadedById !== userId && 
//         req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Resource not approved for download'
//       });
//     }
    
//     // Increment download count
//     resource.downloads += 1;
    
//     // Track download history (avoid duplicates in same session)
//     const alreadyDownloaded = resource.downloadedBy.some(
//       d => d.user.toString() === req.user.id
//     );
    
//     if (!alreadyDownloaded) {
//       resource.downloadedBy.push({
//         user: req.user.id,
//         downloadedAt: new Date()
//       });
//     }
    
//     await resource.save();
    
//     console.log('Download tracked successfully');
//     console.log('File URL:', resource.fileUrl);
//     console.log('File Name:', resource.fileName);
    
//     // IMPORTANT: Return the file metadata, not blob
//     // Frontend will use this to trigger actual file download
//     res.json({
//       success: true,
//       downloadUrl: resource.fileUrl,
//       fileName: resource.fileName,
//       fileType: resource.fileType,
//       fileSize: resource.fileSize,
//       downloadCount: resource.downloads
//     });
//   } catch (error) {
//     console.error('Download resource error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error downloading resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Get user's downloaded resources (download history)
// // @route   GET /api/resources/my-downloads
// // @access  Private
// exports.getMyDownloads = async (req, res) => {
//   try {
//     console.log('=== GET MY DOWNLOADS DEBUG ===');
//     console.log('User:', req.user.id);

//     // Find all resources where user is in downloadedBy array
//     const resources = await Resource.find({
//       'downloadedBy.user': req.user.id,
//       status: 'approved' // Only show approved resources
//     })
//     .populate('uploadedBy', 'name email profilePicture role fullName')
//     .sort({ 'downloadedBy.downloadedAt': -1 });

//     console.log(`Found ${resources.length} downloaded resources`);

//     const formattedResources = resources.map(resource => {
//       // Find when this user downloaded it
//       const downloadRecord = resource.downloadedBy.find(
//         d => d.user.toString() === req.user.id
//       );

//       return {
//         _id: resource._id,
//         title: resource.title,
//         description: resource.description,
//         resourceType: resource.type,
//         moduleCode: resource.moduleCode,
//         fileUrl: resource.fileUrl,
//         fileName: resource.fileName,
//         fileSize: resource.fileSize,
//         fileType: resource.fileType,
//         status: resource.status,
//         uploader: resource.uploadedBy,
//         createdAt: resource.createdAt,
//         updatedAt: resource.updatedAt,
//         downloadedAt: downloadRecord?.downloadedAt,
//         averageRating: resource.averageRating || 0,
//         totalRatings: resource.ratingCount || 0,
//         downloadCount: resource.downloads || 0,
//         viewCount: resource.views || 0,
//         userRated: false
//       };
//     });

//     res.json({
//       success: true,
//       resources: formattedResources
//     });
//   } catch (error) {
//     console.error('Get downloads error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching downloads',
//       error: error.message
//     });
//   }
// };

// // @desc    Approve resource (Admin only)
// // @route   POST /api/resources/:id/approve
// // @access  Private (Admin)
// exports.approveResource = async (req, res) => {
//   try {
//     console.log('=== APPROVE RESOURCE DEBUG ===');
//     console.log('Resource ID:', req.params.id);

//     const resource = await Resource.findById(req.params.id);
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }

//     if (resource.status === 'approved') {
//       return res.status(400).json({
//         success: false,
//         message: 'Resource is already approved'
//       });
//     }

//     resource.status = 'approved';
//     resource.rejectionReason = undefined;
//     await resource.save();

//     await resource.populate('uploadedBy', 'name email profilePicture role fullName');

//     res.json({
//       success: true,
//       message: 'Resource approved successfully',
//       resource: {
//         _id: resource._id,
//         title: resource.title,
//         status: resource.status,
//         moduleCode: resource.moduleCode,
//         uploader: resource.uploadedBy
//       }
//     });
//   } catch (error) {
//     console.error('Approve resource error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error approving resource',
//       error: error.message
//     });
//   }
// };

// // @desc    Reject resource (Admin only)
// // @route   POST /api/resources/:id/reject
// // @access  Private (Admin)
// exports.rejectResource = async (req, res) => {
//   try {
//     console.log('=== REJECT RESOURCE DEBUG ===');
//     console.log('Resource ID:', req.params.id);

//     const { reason } = req.body;

//     if (!reason || !reason.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Rejection reason is required'
//       });
//     }

//     const resource = await Resource.findById(req.params.id);
    
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }

//     if (resource.status === 'rejected') {
//       return res.status(400).json({
//         success: false,
//         message: 'Resource is already rejected'
//       });
//     }

//     resource.status = 'rejected';
//     resource.rejectionReason = reason.trim();
//     await resource.save();

//     await resource.populate('uploadedBy', 'name email profilePicture role fullName');

//     res.json({
//       success: true,
//       message: 'Resource rejected successfully',
//       resource: {
//         _id: resource._id,
//         title: resource.title,
//         status: resource.status,
//         rejectionReason: resource.rejectionReason,
//         moduleCode: resource.moduleCode,
//         uploader: resource.uploadedBy
//       }
//     });
//   } catch (error) {
//     console.error('Reject resource error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error rejecting resource',
//       error: error.message
//     });
//   }
// };



const Resource = require('../models/Resource');
const User = require('../models/User');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (Students, Experts)
exports.uploadResource = async (req, res) => {
  try {
    console.log('=== UPLOAD RESOURCE DEBUG ===');
    console.log('User:', req.user ? req.user.id : 'No user');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, resourceType, moduleCode } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    if (!moduleCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a module code'
      });
    }

    const resourceData = {
      title,
      description: description || '',
      type: resourceType || 'Other',
      moduleCode,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/resources/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      status: 'pending',
      metadata: {
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    };

    console.log('Resource data to save:', resourceData);

    const resource = await Resource.create(resourceData);
    
    await resource.populate('uploadedBy', 'name email profilePicture role fullName');
    
    console.log('Resource created successfully:', resource._id);

    const formattedResource = {
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.type,
      moduleCode: resource.moduleCode,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      fileType: resource.fileType,
      status: resource.status,
      uploader: resource.uploadedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      averageRating: resource.averageRating || 0,
      totalRatings: resource.ratingCount || 0,
      downloadCount: resource.downloads || 0,
      viewCount: resource.views || 0
    };

    res.status(201).json({
      success: true,
      resource: formattedResource
    });
  } catch (error) {
    console.error('=== UPLOAD RESOURCE ERROR ===');
    console.error('Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate resource'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading resource',
      error: error.message
    });
  }
};

// @desc    Get all resources (with filters)
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    console.log('=== GET RESOURCES DEBUG ===');
    console.log('User:', req.user ? req.user.id : 'No user');
    console.log('User Role:', req.user?.role);
    console.log('Query:', req.query);
    
    const { module, type, sort, uploader, search, status } = req.query;
    
    let query = {};
    
    // Module filter
    if (module) {
      query.moduleCode = module;
    }
    
    // Type filter
    if (type) {
      query.type = type;
    }
    
    // Status & tab handling
    if (uploader) {
      // "My Uploads" tab or explicit uploader filter - show all statuses for that user
      query.uploadedBy = uploader;
      console.log('📤 Filtering by uploader:', uploader);
    } else if (status) {
      // Any explicit status filter (admin or other views)
      query.status = status;
      console.log('🔎 Filtering by status:', status);
    } else {
      // Default behaviour:
      // - Admins see all resources
      // - Non-admins see only approved resources
      if (req.user.role !== 'admin') {
        query.status = 'approved';
      }
      console.log(
        '✨ Default resource query for role:',
        req.user.role,
        '->',
        query.status ? `status=${query.status}` : 'no status filter'
      );
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { moduleCode: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Final MongoDB Query:', JSON.stringify(query, null, 2));
    
    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1, createdAt: -1 };
    } else if (sort === 'downloads') {
      sortOption = { downloads: -1, createdAt: -1 };
    }
    
    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email profilePicture role fullName yearLevel specialization')
      .sort(sortOption);
    
    console.log(`✅ Found ${resources.length} resources`);
    
    const formattedResources = resources.map(resource => ({
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.type,
      moduleCode: resource.moduleCode,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      fileType: resource.fileType,
      status: resource.status,
      rejectionReason: resource.rejectionReason,
      uploader: resource.uploadedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      averageRating: resource.averageRating || 0,
      totalRatings: resource.ratingCount || 0,
      downloadCount: resource.downloads || 0,
      viewCount: resource.views || 0,
      userRated: false
    }));
    
    res.json({
      success: true,
      resources: formattedResources
    });
  } catch (error) {
    console.error('=== GET RESOURCES ERROR ===');
    console.error('Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching resources',
      error: error.message,
      resources: [] // Always return empty array on error
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResourceById = async (req, res) => {
  try {
    console.log('=== GET RESOURCE BY ID DEBUG ===');
    console.log('Resource ID:', req.params.id);
    console.log('User:', req.user ? req.user.id : 'No user');

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource ID format'
      });
    }

    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email profilePicture role fullName bio yearLevel specialization');
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    // Check access
    const uploadedById = resource.uploadedBy?._id?.toString() || resource.uploadedBy?.toString();
    const userId = (req.user._id || req.user.id).toString();

    if (resource.status !== 'approved' && 
        uploadedById !== userId && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this resource'
      });
    }

    // Check if user has already rated this resource
    const Review = require('../models/Review');
    const existingReview = await Review.findOne({
      reviewer: req.user._id || req.user.id,
      $or: [
        { reviewType: 'resource', resource: resource._id },
        { type: 'resource', resourceId: resource._id }
      ]
    });
    
    // Increment views
    resource.views += 1;
    await resource.save();
    
    const formattedResource = {
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.type,
      moduleCode: resource.moduleCode,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      fileType: resource.fileType,
      status: resource.status,
      rejectionReason: resource.rejectionReason,
      uploader: resource.uploadedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      averageRating: resource.averageRating || 0,
      totalRatings: resource.ratingCount || 0,
      downloadCount: resource.downloads || 0,
      viewCount: resource.views || 0,
      userRated: !!existingReview
    };

    res.json({
      success: true,
      resource: formattedResource
    });
  } catch (error) {
    console.error('=== GET RESOURCE ERROR ===');
    console.error('Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching resource',
      error: error.message
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin)
exports.updateResource = async (req, res) => {
  try {
    console.log('=== UPDATE RESOURCE DEBUG ===');
    console.log('Resource ID:', req.params.id);

    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }
    
    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email profilePicture role fullName');
    
    const formattedResource = {
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.type,
      moduleCode: resource.moduleCode,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      fileSize: resource.fileSize,
      fileType: resource.fileType,
      status: resource.status,
      uploader: resource.uploadedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      averageRating: resource.averageRating || 0,
      totalRatings: resource.ratingCount || 0,
      downloadCount: resource.downloads || 0,
      viewCount: resource.views || 0,
      userRated: !!existingReview
    };
    
    res.json({
      success: true,
      resource: formattedResource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: error.message
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
exports.deleteResource = async (req, res) => {
  try {
    console.log('=== DELETE RESOURCE DEBUG ===');
    console.log('Resource ID:', req.params.id);
    console.log('User:', req.user.id);

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check permission - owner can delete their own resources
    if (resource.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }
    
    await resource.deleteOne();
    
    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: error.message
    });
  }
};

// @desc    Download resource (increment count and track user)
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  try {
    console.log('=== DOWNLOAD RESOURCE DEBUG ===');
    console.log('Resource ID:', req.params.id);
    console.log('User ID:', req.user.id);

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if resource is approved (unless owner or admin)
    const uploadedById = resource.uploadedBy?.toString();
    const userId = req.user.id.toString();
    
    if (resource.status !== 'approved' && 
        uploadedById !== userId && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Resource not approved for download'
      });
    }
    
    // Increment download count
    resource.downloads += 1;
    
    // Track download history (avoid duplicates)
    const alreadyDownloaded = resource.downloadedBy.some(
      d => d.user.toString() === req.user.id
    );
    
    if (!alreadyDownloaded) {
      resource.downloadedBy.push({
        user: req.user.id,
        downloadedAt: new Date()
      });
    }
    
    await resource.save();
    
    console.log('Download tracked successfully');
    console.log('File URL:', resource.fileUrl);
    console.log('File Name:', resource.fileName);
    
    // Send the file as an attachment
    const path = require('path');
    // resource.fileUrl is formatted like "/uploads/resources/xxx.pdf"
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    res.download(filePath, resource.fileName || 'download-file');
    
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading resource',
      error: error.message
    });
  }
};

// @desc    View/Stream resource directly bypassing blobs
// @route   GET /api/resources/:id/view
// @access  Private
exports.viewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).send('Resource not found');
    }
    
    const uploadedById = resource.uploadedBy?.toString();
    const userId = req.user.id.toString();
    
    if (resource.status !== 'approved' && 
        uploadedById !== userId && 
        req.user.role !== 'admin') {
      return res.status(403).send('Resource not approved for viewing');
    }
    
    const path = require('path');
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    res.sendFile(filePath);
  } catch (error) {
    console.error('View resource error:', error);
    res.status(500).send('Error viewing resource');
  }
};

// @desc    Get user's downloaded resources (download history)
// @route   GET /api/resources/my-downloads
// @access  Private
exports.getMyDownloads = async (req, res) => {
  try {
    console.log('=== GET MY DOWNLOADS DEBUG ===');
    console.log('User:', req.user.id);

    // Find all resources where user is in downloadedBy array
    const resources = await Resource.find({
      'downloadedBy.user': req.user.id,
      status: 'approved' // Only show approved resources
    })
    .populate('uploadedBy', 'name email profilePicture role fullName')
    .sort({ 'downloadedBy.downloadedAt': -1 });

    console.log(`Found ${resources.length} downloaded resources`);

    const formattedResources = resources.map(resource => {
      // Find when this user downloaded it
      const downloadRecord = resource.downloadedBy.find(
        d => d.user.toString() === req.user.id
      );

      return {
        _id: resource._id,
        title: resource.title,
        description: resource.description,
        resourceType: resource.type,
        moduleCode: resource.moduleCode,
        fileUrl: resource.fileUrl,
        fileName: resource.fileName,
        fileSize: resource.fileSize,
        fileType: resource.fileType,
        status: resource.status,
        uploader: resource.uploadedBy,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
        downloadedAt: downloadRecord?.downloadedAt,
        averageRating: resource.averageRating || 0,
        totalRatings: resource.ratingCount || 0,
        downloadCount: resource.downloads || 0,
        viewCount: resource.views || 0,
        userRated: false
      };
    });

    res.json({
      success: true,
      resources: formattedResources
    });
  } catch (error) {
    console.error('Get downloads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching downloads',
      error: error.message
    });
  }
};

// @desc    Approve resource (Admin only)
// @route   POST /api/resources/:id/approve
// @access  Private (Admin)
exports.approveResource = async (req, res) => {
  try {
    console.log('=== APPROVE RESOURCE DEBUG ===');
    console.log('Resource ID:', req.params.id);

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Resource is already approved'
      });
    }

    resource.status = 'approved';
    resource.rejectionReason = undefined;
    await resource.save();

    await resource.populate('uploadedBy', 'name email profilePicture role fullName');

    res.json({
      success: true,
      message: 'Resource approved successfully',
      resource: {
        _id: resource._id,
        title: resource.title,
        status: resource.status,
        moduleCode: resource.moduleCode,
        uploader: resource.uploadedBy
      }
    });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving resource',
      error: error.message
    });
  }
};

// @desc    Reject resource (Admin only)
// @route   POST /api/resources/:id/reject
// @access  Private (Admin)
exports.rejectResource = async (req, res) => {
  try {
    console.log('=== REJECT RESOURCE DEBUG ===');
    console.log('Resource ID:', req.params.id);

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Resource is already rejected'
      });
    }

    resource.status = 'rejected';
    resource.rejectionReason = reason.trim();
    await resource.save();

    await resource.populate('uploadedBy', 'name email profilePicture role fullName');

    res.json({
      success: true,
      message: 'Resource rejected successfully',
      resource: {
        _id: resource._id,
        title: resource.title,
        status: resource.status,
        rejectionReason: resource.rejectionReason,
        moduleCode: resource.moduleCode,
        uploader: resource.uploadedBy
      }
    });
  } catch (error) {
    console.error('Reject resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting resource',
      error: error.message
    });
  }
};