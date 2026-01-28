// controllers/hostelController.js
const { Hostel, Room, HostelAllocation } = require('../models/Hostel');
const Student = require('../models/Student');

// ===== HOSTEL MANAGEMENT =====

// Get all hostels
exports.getAllHostels = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const hostels = await Hostel.find({ schoolId, isActive: true });

    // Get room count and occupancy for each hostel
    const hostelsWithStats = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostelId: hostel._id, isActive: true });
        const totalRooms = rooms.length;
        const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);

        return {
          ...hostel.toObject(),
          totalRooms,
          totalCapacity,
          totalOccupied,
          occupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      data: hostelsWithStats
    });
  } catch (err) {
    console.error('Error fetching hostels:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hostels'
    });
  }
};

// Create hostel
exports.createHostel = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { name, type, address, warden } = req.body;

    const newHostel = new Hostel({
      schoolId,
      name,
      type,
      address,
      warden
    });

    await newHostel.save();

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      data: newHostel
    });
  } catch (err) {
    console.error('Error creating hostel:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create hostel'
    });
  }
};

// Update hostel
exports.updateHostel = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const hostel = await Hostel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hostel updated successfully',
      data: hostel
    });
  } catch (err) {
    console.error('Error updating hostel:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update hostel'
    });
  }
};

// Delete hostel
exports.deleteHostel = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    // Check if hostel has rooms
    const roomCount = await Room.countDocuments({ hostelId: id });
    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete hostel. It has ${roomCount} rooms.`
      });
    }

    const hostel = await Hostel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!hostel) {
      return res.status(404).json({
        success: false,
        error: 'Hostel not found'
      });
    }

    res.json({
      success: true,
      message: 'Hostel deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting hostel:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete hostel'
    });
  }
};

// ===== ROOM MANAGEMENT =====

// Get rooms by hostel
exports.getRoomsByHostel = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { hostelId } = req.params;

    const rooms = await Room.find({ hostelId, schoolId, isActive: true })
      .sort({ roomNumber: 1 });

    res.json({
      success: true,
      data: rooms
    });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms'
    });
  }
};

// Create room
exports.createRoom = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { hostelId, roomNumber, floor, capacity, roomType, facilities } = req.body;

    // Check if room number already exists in this hostel
    const existingRoom = await Room.findOne({ hostelId, roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        error: 'Room number already exists in this hostel'
      });
    }

    const newRoom = new Room({
      hostelId,
      schoolId,
      roomNumber,
      floor,
      capacity: capacity || 4,
      roomType: roomType || 'dormitory',
      facilities: facilities || []
    });

    await newRoom.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom
    });
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const room = await Room.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update room'
    });
  }
};

// ===== ALLOCATION MANAGEMENT =====

// Get all allocations
exports.getAllAllocations = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { status, hostelId } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (hostelId) query.hostelId = hostelId;

    const allocations = await HostelAllocation.find(query)
      .populate('hostelId', 'name type')
      .populate('roomId', 'roomNumber floor')
      .populate('studentId', 'firstName lastName rollNumber class')
      .sort({ allocationDate: -1 });

    res.json({
      success: true,
      data: allocations
    });
  } catch (err) {
    console.error('Error fetching allocations:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch allocations'
    });
  }
};

// Allocate student to room
exports.allocateStudent = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { hostelId, roomId, studentId, bedNumber, expiryDate, monthlyFee, remarks } = req.body;

    // Check if room has capacity
    const room = await Room.findOne({ _id: roomId, schoolId });
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({
        success: false,
        error: 'Room is full'
      });
    }

    // Check if student is already allocated
    const existingAllocation = await HostelAllocation.findOne({
      schoolId,
      studentId,
      status: 'active'
    });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        error: 'Student already has an active hostel allocation'
      });
    }

    const newAllocation = new HostelAllocation({
      schoolId,
      hostelId,
      roomId,
      studentId,
      bedNumber,
      expiryDate,
      monthlyFee,
      remarks,
      status: 'active'
    });

    await newAllocation.save();

    // Update room occupancy
    room.occupiedBeds += 1;
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Student allocated successfully',
      data: newAllocation
    });
  } catch (err) {
    console.error('Error allocating student:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to allocate student'
    });
  }
};

// Vacate student from room
exports.vacateStudent = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { remarks } = req.body;

    const allocation = await HostelAllocation.findOne({ _id: id, schoolId });

    if (!allocation) {
      return res.status(404).json({
        success: false,
        error: 'Allocation not found'
      });
    }

    if (allocation.status === 'vacated') {
      return res.status(400).json({
        success: false,
        error: 'Student already vacated'
      });
    }

    allocation.status = 'vacated';
    allocation.remarks = remarks;
    await allocation.save();

    // Update room occupancy
    const room = await Room.findById(allocation.roomId);
    if (room && room.occupiedBeds > 0) {
      room.occupiedBeds -= 1;
      await room.save();
    }

    res.json({
      success: true,
      message: 'Student vacated successfully'
    });
  } catch (err) {
    console.error('Error vacating student:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to vacate student'
    });
  }
};

// ===== ATTENDANCE MANAGEMENT =====

const HostelAttendance = require('../models/HostelAttendance');

// Get attendance records
exports.getAttendance = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { hostelId, roomId, date, startDate, endDate } = req.query;

    const query = { schoolId };
    if (hostelId) query.hostelId = hostelId;
    if (roomId) query.roomId = roomId;

    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999))
      };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await HostelAttendance.find(query)
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber')
      .populate('studentId', 'firstName lastName rollNumber class')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendance
    });
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance'
    });
  }
};

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { hostelId, roomId, studentId, date, status, remarks } = req.body;

    // Check if attendance already exists for this student on this date
    const existingAttendance = await HostelAttendance.findOne({
      schoolId,
      studentId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      existingAttendance.remarks = remarks;
      existingAttendance.markedBy = userId;
      await existingAttendance.save();

      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance
      });
    } else {
      // Create new attendance record
      const newAttendance = new HostelAttendance({
        schoolId,
        hostelId,
        roomId,
        studentId,
        date,
        status,
        remarks,
        markedBy: userId
      });

      await newAttendance.save();

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: newAttendance
      });
    }
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance'
    });
  }
};

// Bulk mark attendance
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { attendanceRecords } = req.body; // Array of { studentId, hostelId, roomId, date, status, remarks }

    const results = [];

    for (const record of attendanceRecords) {
      const { studentId, hostelId, roomId, date, status, remarks } = record;

      const existingAttendance = await HostelAttendance.findOne({
        schoolId,
        studentId,
        date: {
          $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
        }
      });

      if (existingAttendance) {
        existingAttendance.status = status;
        existingAttendance.remarks = remarks;
        existingAttendance.markedBy = userId;
        await existingAttendance.save();
        results.push(existingAttendance);
      } else {
        const newAttendance = new HostelAttendance({
          schoolId,
          hostelId,
          roomId,
          studentId,
          date,
          status,
          remarks,
          markedBy: userId
        });
        await newAttendance.save();
        results.push(newAttendance);
      }
    }

    res.json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      data: results
    });
  } catch (err) {
    console.error('Error bulk marking attendance:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance'
    });
  }
};

// ===== FEES MANAGEMENT =====

// Note: Hostel fees are tracked through the HostelAllocation model's monthlyFee field
// This section provides helper functions to get fee-related data

// Get hostel fee summary
exports.getHostelFees = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { hostelId, status } = req.query;

    const query = { schoolId };
    if (hostelId) query.hostelId = hostelId;
    if (status) query.status = status;

    const allocations = await HostelAllocation.find(query)
      .populate('hostelId', 'name')
      .populate('roomId', 'roomNumber')
      .populate('studentId', 'firstName lastName rollNumber class')
      .sort({ allocationDate: -1 });

    res.json({
      success: true,
      data: allocations
    });
  } catch (err) {
    console.error('Error fetching hostel fees:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hostel fees'
    });
  }
};

// Update hostel fee for an allocation
exports.updateHostelFee = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { monthlyFee } = req.body;

    const allocation = await HostelAllocation.findOne({ _id: id, schoolId });

    if (!allocation) {
      return res.status(404).json({
        success: false,
        error: 'Allocation not found'
      });
    }

    allocation.monthlyFee = monthlyFee;
    await allocation.save();

    res.json({
      success: true,
      message: 'Hostel fee updated successfully',
      data: allocation
    });
  } catch (err) {
    console.error('Error updating hostel fee:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update hostel fee'
    });
  }
};
