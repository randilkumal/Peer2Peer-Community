

const Resource = require('../models/Resource');
const User = require('../models/User');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (Students, Experts)
exports.uploadResource = async (req, res) => {
  try {
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

    const resource = await Resource.create(resourceData);
    
    await resource.populate('uploadedBy', 'name email profilePicture role fullName');
    
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
    } else if (status) {
      // Any explicit status filter (admin or other views)
      if (status === 'pending') {
        query.$or = [
          { status: 'pending' },
          { 'pendingUpdate.status': 'pending' }
        ];
      } else {
        query.status = status;
      }
    } else {
      // Default behaviour:
      // - Admins see all resources
      // - Non-admins see only approved resources
      if (req.user.role !== 'admin') {
        query.status = 'approved';
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { moduleCode: { $regex: search, $options: 'i' } }
      ];
    }
    
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
      pendingUpdate: resource.pendingUpdate,
      userRated: false
    }));
    
    res.json({
      success: true,
      resources: formattedResources
    });
  } catch (error) {
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
      pendingUpdate: resource.pendingUpdate,
      userRated: !!existingReview
    };

    res.json({
      success: true,
      resource: formattedResource
    });
  } catch (error) {
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
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    const userId = (req.user?._id || req.user?.id)?.toString();
    const isOwner = userId && resource.uploadedBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }

    // Accept both `type` and `resourceType` from clients (frontend uses `type` today)
    const { title, description, type, resourceType, moduleCode } = req.body;
    const resolvedType = type || resourceType;
    let fileUrl = resource.fileUrl; // Keep old initially
    let fileName = resource.fileName;
    let fileSize = resource.fileSize;
    let fileType = resource.fileType;

    if (req.file) {
      fileUrl = `/uploads/resources/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    if (isAdmin) {
      // Admins bypass pending queue
      if (title !== undefined) resource.title = String(title).trim();
      if (description !== undefined) resource.description = String(description);
      if (resolvedType) resource.type = resolvedType;
      if (moduleCode !== undefined) resource.moduleCode = String(moduleCode).trim().toUpperCase();
      
      if (req.file) {
        resource.fileUrl = fileUrl;
        resource.fileName = fileName;
        resource.fileSize = fileSize;
        resource.fileType = fileType;
        resource.metadata = { fileSize, fileType };
      }

      await resource.save();
    } else {
      // Owners (students/experts) -> goes to pending Update
      resource.pendingUpdate = {
        title: title !== undefined ? String(title).trim() : resource.title,
        description: description !== undefined ? String(description) : resource.description,
        type: resolvedType || resource.type,
        moduleCode: moduleCode !== undefined ? String(moduleCode).trim().toUpperCase() : resource.moduleCode,
        status: 'pending',
        requestedAt: new Date()
      };
      
      // Since file uploads aren't explicitly structured to move from temp to current on approval yet without complex storage logic
      // Assuming for now metadata updates only unless we implement a comprehensive file staging system
      
      await resource.save();
    }
    
    resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email profilePicture role fullName');
    
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
      pendingUpdate: resource.pendingUpdate,
      uploader: resource.uploadedBy,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
      averageRating: resource.averageRating || 0,
      totalRatings: resource.ratingCount || 0,
      downloadCount: resource.downloads || 0,
      viewCount: resource.views || 0
    };
    
    res.json({
      success: true,
      message: isAdmin ? 'Resource updated successfully' : 'Update submitted for admin approval',
      resource: formattedResource
    });
  } catch (error) {
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
    
    // Send the file as an attachment
    const path = require('path');
    // Remove leading slash to prevent absolute path resolution issues on Windows
    const relativeUrl = resource.fileUrl.startsWith('/') ? resource.fileUrl.substring(1) : resource.fileUrl;
    const filePath = path.join(__dirname, '..', relativeUrl);
    res.download(filePath, resource.fileName || 'download-file');
    
  } catch (error) {
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
    const fs = require('fs');
    
    const relativeUrl = resource.fileUrl.startsWith('/') ? resource.fileUrl.substring(1) : resource.fileUrl;
    const filePath = path.join(__dirname, '..', relativeUrl);
    
    if (!fs.existsSync(filePath)) {
         return res.status(404).send('File not found on server');
    }

    res.setHeader('Content-Type', resource.fileType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resource.fileName}"`);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).send('Error viewing resource');
  }
};

// @desc    Get user's downloaded resources (download history)
// @route   GET /api/resources/my-downloads
// @access  Private
exports.getMyDownloads = async (req, res) => {
  try {
    // Find all resources where user is in downloadedBy array
    const resources = await Resource.find({
      'downloadedBy.user': req.user.id,
      status: 'approved' // Only show approved resources
    })
    .populate('uploadedBy', 'name email profilePicture role fullName')
    .sort({ 'downloadedBy.downloadedAt': -1 });
    
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
    res.status(500).json({
      success: false,
      message: 'Error fetching downloads',
      error: error.message
    });
  }
};

// @desc    Approve resource
// @route   POST /api/resources/:id/approve
// @access  Private (Admin)
exports.approveResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // If it is an update to an already approved resource
    if (resource.status === 'approved' && resource.pendingUpdate && resource.pendingUpdate.status === 'pending') {
      // Archive current version to history
      resource.versionHistory.push({
        version: resource.currentVersion,
        title: resource.title,
        description: resource.description,
        moduleCode: resource.moduleCode,
        type: resource.type,
        approvedAt: new Date(),
        approvedBy: req.user.id
      });
      resource.currentVersion += 1;

      // Apply pending updates to current
      resource.title = resource.pendingUpdate.title;
      resource.description = resource.pendingUpdate.description;
      resource.moduleCode = resource.pendingUpdate.moduleCode;
      if (resource.pendingUpdate.type) resource.type = resource.pendingUpdate.type;
      
      // Clear pending update
      resource.pendingUpdate = undefined;
      await resource.save();

      await resource.populate('uploadedBy', 'name email profilePicture role fullName');

      return res.json({
        success: true,
        message: 'Resource update approved successfully',
        resource: {
          _id: resource._id,
          title: resource.title,
          status: resource.status,
          moduleCode: resource.moduleCode,
          uploader: resource.uploadedBy,
          pendingUpdate: resource.pendingUpdate
        }
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
    resource.pendingUpdate = undefined;
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
    res.status(500).json({
      success: false,
      message: 'Error approving resource',
      error: error.message
    });
  }
};

// @desc    Reject resource
// @route   POST /api/resources/:id/reject
// @access  Private (Admin)
exports.rejectResource = async (req, res) => {
  try {
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

    // Checking if rejecting a pending update vs rejecting original upload
    if (resource.status === 'approved' && resource.pendingUpdate && resource.pendingUpdate.status === 'pending') {
      resource.pendingUpdate.status = 'rejected';
      resource.pendingUpdate.rejectionReason = reason.trim();
      await resource.save();
      
      return res.json({
        success: true,
        message: 'Resource update rejected successfully',
        resource: {
          _id: resource._id,
          title: resource.title,
          status: resource.status,
          pendingUpdate: resource.pendingUpdate
        }
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
    resource.pendingUpdate = undefined;
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
    res.status(500).json({
      success: false,
      message: 'Error rejecting resource',
      error: error.message
    });
  }
};