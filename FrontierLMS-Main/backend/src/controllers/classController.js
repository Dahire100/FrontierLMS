// controllers/classController.js
const Class = require('../models/Class');
const Student = require('../models/Student');

// Get all classes for a school
exports.getAllClasses = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { academicYear } = req.query;

    const query = { schoolId };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const classes = await Class.find(query)
      .populate('classTeacher', 'firstName lastName email')
      .sort({ name: 1, section: 1 });

    // Get student count for each class
    const classesWithCount = await Promise.all(
      classes.map(async (classItem) => {
        const studentCount = await Student.countDocuments({
          schoolId,
          class: classItem._id
        });

        return {
          ...classItem.toObject(),
          students: studentCount,
          occupancy: classItem.capacity > 0 ? Math.round((studentCount / classItem.capacity) * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      data: classesWithCount
    });
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const classItem = await Class.findOne({ _id: id, schoolId })
      .populate('classTeacher', 'firstName lastName email phone');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    const studentCount = await Student.countDocuments({
      schoolId,
      class: classItem._id
    });

    res.json({
      success: true,
      data: {
        ...classItem.toObject(),
        students: studentCount
      }
    });
  } catch (err) {
    console.error('Error fetching class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class'
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { name, section, classTeacher, room, capacity, subjects, academicYear } = req.body;

    // Check if class already exists
    const existingClass = await Class.findOne({
      schoolId,
      name,
      section,
      academicYear: academicYear || new Date().getFullYear()
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        error: 'Class with this name and section already exists for this academic year'
      });
    }

    const newClass = new Class({
      schoolId,
      name,
      section,
      classTeacher,
      room,
      capacity: capacity || 50,
      subjects: subjects || [],
      academicYear: academicYear || new Date().getFullYear()
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create class'
    });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    const classItem = await Class.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classItem
    });
  } catch (err) {
    console.error('Error updating class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update class'
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    // Check if any students are assigned to this class
    const studentCount = await Student.countDocuments({
      schoolId,
      class: id
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete class. ${studentCount} students are assigned to this class.`
      });
    }

    const classItem = await Class.findOneAndDelete({ _id: id, schoolId });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete class'
    });
  }
};

// Get class statistics
exports.getClassStats = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const totalClasses = await Class.countDocuments({ schoolId });
    const totalStudents = await Student.countDocuments({ schoolId });

    const classes = await Class.find({ schoolId });
    const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);

    const avgOccupancy = totalCapacity > 0
      ? Math.round((totalStudents / totalCapacity) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalClasses,
        totalStudents,
        totalCapacity,
        avgOccupancy
      }
    });
  } catch (err) {
    console.error('Error fetching class stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// Assign subjects to class
exports.assignSubjects = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        error: 'Subjects must be an array'
      });
    }

    const classItem = await Class.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { subjects } },
      { new: true, runValidators: true }
    ).populate('subjects', 'name code type');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      message: 'Subjects assigned successfully',
      data: classItem
    });
  } catch (err) {
    console.error('Error assigning subjects:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to assign subjects'
    });
  }
};

// Get students in a class
exports.getClassStudents = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    // Find the class first to get its name
    const classObj = await Class.findOne({ _id: id, schoolId });

    // Build query to match either ID or Name (for legacy data support)
    const studentQuery = {
      schoolId,
      $or: [{ class: id }]
    };

    if (classObj) {
      studentQuery.$or.push({ class: classObj.name });
      // Also try matching "Name - Section" or just "Name" if needed, 
      // but let's stick to Name as stored in Class model.
    }

    const students = await Student.find(studentQuery)
      .sort({ rollNumber: 1, firstName: 1 })
      .select('studentId firstName lastName rollNumber email phone section profilePicture');

    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    console.error('Error fetching class students:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
};

// Promote students to next class
exports.promoteClass = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { fromClassId, toClassId, studentIds, academicYear } = req.body;

    if (!fromClassId || !toClassId || !academicYear) {
      return res.status(400).json({
        success: false,
        error: 'From class, to class, and academic year are required'
      });
    }

    // Verify both classes exist
    const [fromClass, toClass] = await Promise.all([
      Class.findOne({ _id: fromClassId, schoolId }),
      Class.findOne({ _id: toClassId, schoolId })
    ]);

    if (!fromClass || !toClass) {
      return res.status(404).json({
        success: false,
        error: 'One or both classes not found'
      });
    }

    // Build student filter
    const studentFilter = { schoolId, class: fromClassId };
    if (studentIds && studentIds.length > 0) {
      studentFilter._id = { $in: studentIds };
    }

    // Update students
    const result = await Student.updateMany(
      studentFilter,
      {
        $set: {
          class: toClassId,
          academicYear
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} students promoted successfully`,
      promotedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error promoting class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to promote students'
    });
  }
};

// Get class by name and section
exports.getClassByName = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { name, section } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required'
      });
    }

    const query = { schoolId, name };
    if (section) query.section = section;

    const classItem = await Class.findOne(query)
      .populate('classTeacher', 'firstName lastName')
      .populate('subjects', 'name code');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classItem
    });
  } catch (err) {
    console.error('Error fetching class:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class'
    });
  }
};
