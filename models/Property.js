const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'villa', 'commercial'],
    lowercase: true
  },
  bhk: {
    type: String,
    required: [true, 'BHK is required'],
    enum: ['1', '2', '3', '4', '5']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [1, 'Must have at least 1 bathroom'],
    max: [10, 'Cannot have more than 10 bathrooms']
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [100, 'Area must be at least 100 sq ft'],
    max: [50000, 'Area cannot exceed 50,000 sq ft']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1000, 'Price must be at least ₹1,000'],
    max: [1000000000, 'Price cannot exceed ₹100 crores']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [5, 'Location must be at least 5 characters'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    default: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    required: [true, 'Property status is required'],
    enum: ['sale', 'rent'],
    lowercase: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
    minlength: [2, 'Owner name must be at least 2 characters'],
    maxlength: [50, 'Owner name cannot exceed 50 characters']
  },
  ownerPhone: {
    type: String,
    required: [true, 'Owner phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  ownerEmail: {
    type: String,
    required: [true, 'Owner email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  nearbyPlaces: [{
    type: String,
    trim: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for immediate visibility
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Create text index for search functionality
propertySchema.index({
  title: 'text',
  location: 'text',
  description: 'text'
});

// Add indexes for better query performance
propertySchema.index({ type: 1, status: 1, isApproved: 1, isActive: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);