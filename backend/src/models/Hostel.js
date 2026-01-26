// models/Hostel.js
const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'mixed'],
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  warden: {
    name: String,
    phone: String,
    email: String
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const roomSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 4
  },
  occupiedBeds: {
    type: Number,
    default: 0
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'dormitory'],
    default: 'dormitory'
  },
  facilities: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const hostelAllocationSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  bedNumber: {
    type: String,
    trim: true
  },
  allocationDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  monthlyFee: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'vacated'],
    default: 'active'
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

hostelSchema.index({ schoolId: 1, name: 1 });
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });
hostelAllocationSchema.index({ schoolId: 1, studentId: 1 });

const Hostel = mongoose.model('Hostel', hostelSchema);
const Room = mongoose.model('Room', roomSchema);
const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);

module.exports = { Hostel, Room, HostelAllocation };
