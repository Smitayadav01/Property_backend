const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists by phone
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number'
      });
    }

    // Check email uniqueness if provided
    if (email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address'
        });
      }
    }

    // Create new user
    const user = new User({
      name,
      email: email || null,
      phone,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email (don't fail registration if email fails)
    if (email) {
      try {
        await sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Vasai Properties.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email || null,
          phone: user.phone,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or email is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email || null,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

console.log("📢 Admin login route hit");

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', validateUserLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find admin user by phone
    const user = await User.findOne({ phone });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email || null,
          role: user.role,
          phone: user.phone,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});


// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

module.exports = router;