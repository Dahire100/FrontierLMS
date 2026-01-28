// controllers/timetableController.js
const Timetable = require('../models/Timetable');
const Class = require('../models/Class');

// Get timetable for a class
exports.getTimetableByClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId } = req.params;
    const { academicYear } = req.query;

    const query = { 
      schoolId, 
      classId,
      isActive: true
    };
    
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const timetable = await Timetable.find(query)
      .populate('classId', 'name section')
      .populate('periods.teacher', 'firstName lastName')
      .sort({ dayOfWeek: 1 });

    res.json({
      success: true,
      data: timetable
    });
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timetable'
    });
  }
};

// Get all timetables
exports.getAllTimetables = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYear } = req.query;

    const query = { schoolId, isActive: true };
    if (academicYear) query.academicYear = academicYear;

    const timetables = await Timetable.find(query)
      .populate('classId', 'name section')
      .sort({ dayOfWeek: 1 });

    res.json({
      success: true,
      data: timetables
    });
  } catch (err) {
    console.error('Error fetching timetables:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timetables'
    });
  }
};

// Create or update timetable
exports.upsertTimetable = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { classId, dayOfWeek, periods, academicYear } = req.body;

    // Check if class exists
    const classExists = await Class.findOne({ _id: classId, schoolId });
    if (!classExists) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Find existing timetable
    const existingTimetable = await Timetable.findOne({
      schoolId,
      classId,
      dayOfWeek,
      academicYear: academicYear || new Date().getFullYear()
    });

    if (existingTimetable) {
      // Update existing
      existingTimetable.periods = periods;
      await existingTimetable.save();

      res.json({
        success: true,
        message: 'Timetable updated successfully',
        data: existingTimetable
      });
    } else {
      // Create new
      const newTimetable = new Timetable({
        schoolId,
        classId,
        dayOfWeek,
        periods,
        academicYear: academicYear || new Date().getFullYear()
      });

      await newTimetable.save();

      res.status(201).json({
        success: true,
        message: 'Timetable created successfully',
        data: newTimetable
      });
    }
  } catch (err) {
    console.error('Error creating/updating timetable:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save timetable'
    });
  }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const timetable = await Timetable.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        error: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting timetable:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete timetable'
    });
  }
};

// Get teacher schedule
exports.getTeacherSchedule = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { teacherId } = req.params;
    const { academicYear } = req.query;

    const query = { 
      schoolId,
      'periods.teacher': teacherId,
      isActive: true
    };
    
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const schedule = await Timetable.find(query)
      .populate('classId', 'name section')
      .sort({ dayOfWeek: 1 });

    res.json({
      success: true,
      data: schedule
    });
  } catch (err) {
    console.error('Error fetching teacher schedule:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teacher schedule'
    });
  }
};
