const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { isApproved: true, isActive: true },
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      });

    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

// @route   POST /api/wishlist/:id
// @desc    Add/Remove property from wishlist
// @access  Private
router.post('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
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

    const user = await User.findById(req.user._id);
    const propertyIndex = user.wishlist.indexOf(req.params.id);

    if (propertyIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(propertyIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Property removed from wishlist',
        data: { inWishlist: false }
      });
    } else {
      // Add to wishlist
      user.wishlist.push(req.params.id);
      await user.save();
      
      res.json({
        success: true,
        message: 'Property added to wishlist',
        data: { inWishlist: true }
      });
    }

  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist'
    });
  }
});

module.exports = router;