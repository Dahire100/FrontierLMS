const StudentHouse = require('../models/StudentHouse');

exports.getAllHouses = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const houses = await StudentHouse.find({ schoolId, isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: houses });
    } catch (error) {
        console.error('Error fetching houses:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch houses' });
    }
};

exports.createHouse = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, master, description } = req.body;

        if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

        const newHouse = new StudentHouse({
            schoolId,
            name,
            master,
            description
        });

        await newHouse.save();
        res.status(201).json({ success: true, data: newHouse });
    } catch (error) {
        console.error('Error creating house:', error);
        if (error.code === 11000) return res.status(400).json({ success: false, error: 'House already exists' });
        res.status(500).json({ success: false, error: 'Failed to create house' });
    }
};

exports.updateHouse = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const { name, master, description } = req.body;

        const updatedHouse = await StudentHouse.findOneAndUpdate(
            { _id: id, schoolId },
            { name, master, description },
            { new: true }
        );

        if (!updatedHouse) return res.status(404).json({ success: false, error: 'House not found' });

        res.json({ success: true, data: updatedHouse });
    } catch (error) {
        console.error('Error updating house:', error);
        res.status(500).json({ success: false, error: 'Failed to update house' });
    }
};

exports.deleteHouse = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const deletedHouse = await StudentHouse.findOneAndUpdate(
            { _id: id, schoolId },
            { isActive: false },
            { new: true }
        );

        if (!deletedHouse) return res.status(404).json({ success: false, error: 'House not found' });

        res.json({ success: true, message: 'House deleted successfully' });
    } catch (error) {
        console.error('Error deleting house:', error);
        res.status(500).json({ success: false, error: 'Failed to delete house' });
    }
};
