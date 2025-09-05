const express = require('express');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { auth } = require('../middleware/auth');
const { validateInquiry } = require('../middleware/validation');
const { sendInquiryNotification } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/inquiries/property/:id
// @desc    Send inquiry for a property
// @access  Public
router.post('/property/:id', validateInquiry, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const propertyId = req.params.id;

    // Find the property
    const property = await Property.findById(propertyId)
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
        message: 'Property not available for inquiries'
      });
    }

    // Create inquiry
    const inquiry = new Inquiry({
      property: propertyId,
      name,
      email,
      phone,
      message
    });

    await inquiry.save();

    // Send email notification to property owner (don't fail if email fails)
    try {
      await sendInquiryNotification(
        property,
        property.ownerEmail,
        property.ownerName,
        { name, email, phone, message }
      );
    } catch (emailError) {
      console.error('Inquiry email notification error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully! The property owner will contact you soon.',
      data: { inquiry }
    });

  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending inquiry'
    });
  }
});

// @route   GET /api/inquiries/property/:id
// @desc    Get inquiries for a property (owner only)
// @access  Private
router.get('/property/:id', auth, async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Check if user owns the property
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view inquiries for your own properties.'
      });
    }

    // Get inquiries for the property
    const inquiries = await Inquiry.find({ property: propertyId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { inquiries }
    });

  } catch (error) {
    console.error('Get property inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inquiries'
    });
  }
});

// @route   GET /api/inquiries/my-inquiries
// @desc    Get inquiries sent by current user
// @access  Private
router.get('/my-inquiries', auth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ email: req.user.email })
      .populate('property', 'title location price status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { inquiries }
    });

  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your inquiries'
    });
  }
});

// @route   PUT /api/inquiries/:id/respond
// @desc    Respond to an inquiry (property owner only)
// @access  Private
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const inquiryId = req.params.id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    // Find the inquiry and populate property
    const inquiry = await Inquiry.findById(inquiryId)
      .populate('property');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Check if user owns the property
    if (inquiry.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only respond to inquiries for your own properties.'
      });
    }

    // Update inquiry with response
    inquiry.response = response.trim();
    inquiry.status = 'responded';
    inquiry.respondedAt = new Date();

    await inquiry.save();

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: { inquiry }
    });

  } catch (error) {
    console.error('Respond to inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to inquiry'
    });
  }
});

module.exports = router;