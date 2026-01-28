// controllers/transportController.js
const TransportRoute = require('../models/TransportRoute');
const Student = require('../models/Student');

// Get all transport routes
exports.getTransportRoutes = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const routes = await TransportRoute.find({ schoolId }).sort({ routeName: 1 });
    res.json(routes);
  } catch (err) {
    console.error('Error fetching transport routes:', err);
    res.status(500).json({ error: 'Failed to fetch transport routes' });
  }
};

// Add transport route
exports.addTransportRoute = async (req, res) => {
  const { schoolId } = req.user;
  const { routeName, busNumber, driverName, driverPhone, fee } = req.body;

  if (!routeName || !busNumber || !driverName || !driverPhone || !fee) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newRoute = new TransportRoute({
      routeName,
      vehicleNumber: busNumber, // Mapping busNumber to vehicleNumber as per schema
      driverName,
      driverPhone,
      routeCharge: fee, // Mapping fee to routeCharge as per schema
      schoolId
    });

    await newRoute.save();

    res.status(201).json({
      message: 'Transport route added successfully',
      routeId: newRoute._id
    });
  } catch (err) {
    console.error('Error adding transport route:', err);
    res.status(500).json({ error: 'Failed to add transport route' });
  }
};

// Update transport route
exports.updateTransportRoute = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;
  const updates = req.body;

  // Map frontend fields to schema fields
  const fieldMapping = {
    'busNumber': 'vehicleNumber',
    'fee': 'routeCharge'
  };

  const allowedFields = ['routeName', 'busNumber', 'driverName', 'driverPhone', 'fee'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      const schemaField = fieldMapping[field] || field;
      updateData[schemaField] = updates[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  try {
    const route = await TransportRoute.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: updateData },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ error: 'Transport route not found' });
    }
    res.json({ message: 'Transport route updated successfully' });
  } catch (err) {
    console.error('Error updating transport route:', err);
    res.status(500).json({ error: 'Failed to update transport route' });
  }
};

// Delete transport route
exports.deleteTransportRoute = async (req, res) => {
  const { schoolId } = req.user;
  const { id } = req.params;

  try {
    const route = await TransportRoute.findOneAndDelete({ _id: id, schoolId });
    if (!route) {
      return res.status(404).json({ error: 'Transport route not found' });
    }
    res.json({ message: 'Transport route deleted successfully' });
  } catch (err) {
    console.error('Error deleting transport route:', err);
    res.status(500).json({ error: 'Failed to delete transport route' });
  }
};

// Get students by transport route
exports.getStudentsByRoute = async (req, res) => {
  const { schoolId } = req.user;
  const { route } = req.params;

  try {
    // Assuming 'transportRoute' in Student model stores the route name or ID
    // The original code used route name matching
    const students = await Student.find({ schoolId, transportRoute: route })
      .select('studentId firstName lastName class section phone parentPhone')
      .sort({ class: 1, section: 1, firstName: 1 });

    res.json(students);
  } catch (err) {
    console.error('Error fetching students by route:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};