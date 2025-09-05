const express = require('express');
const Property = require('../models/Property');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');
const { sendPropertyListedEmail, sendAdminNotification } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all approved properties with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      type,
      bhk,
      status,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isApproved: true, isActive: true };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (bhk && bhk !== 'all') {
      filter.bhk = bhk;
    }

    if (status) {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProperties: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!property.isApproved || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Property not available'
      });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json({
      success: true,
      data: { property }
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, validateProperty, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id,
      isApproved: true, // Auto-approve properties for immediate visibility
      isActive: true,   // Ensure property is active
      images: [req.body.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800']
    };

    const property = new Property(propertyData);
    await property.save();

    // Populate owner details
    await property.populate('owner', 'name email phone');

    // Send email notifications (don't fail the request if emails fail)
    try {
      // Send confirmation email to property owner
      if (property.ownerEmail) {
        await sendPropertyListedEmail(property, property.ownerEmail, property.ownerName);
      }
      
      // Send notification to admin
      await sendAdminNotification(property, property.ownerName, property.ownerEmail);
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Property listed successfully and is now live on the website!',
      data: { property }
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating property listing'
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property (Admin only)
// @access  Private (Admin)
router.put('/:id', adminAuth, validateProperty, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Update property
    Object.assign(property, req.body);
    property.isApproved = true; // Keep approved for immediate visibility
    
    await property.save();
    await property.populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Property updated successfully!',
      data: { property }
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating property'
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property (Admin only)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property'
    });
  }
});

// @route   GET /api/properties/admin/all-properties
// @desc    Get all properties (Admin only)
// @access  Private (Admin)
router.get('/admin/all-properties', adminAuth, async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { properties }
    });

  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all properties'
    });
  }
});

module.exports = router;