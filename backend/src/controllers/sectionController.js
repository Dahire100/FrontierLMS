const Section = require('../models/Section');

// Get all sections for a school
exports.getAllSections = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const sections = await Section.find({ schoolId }).sort({ name: 1 });
        res.json({ success: true, data: sections });
    } catch (err) {
        console.error('Error fetching sections:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch sections' });
    }
};

// Create a new section
exports.createSection = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name } = req.body;

        const existingSection = await Section.findOne({ schoolId, name });
        if (existingSection) {
            return res.status(400).json({ success: false, error: 'Section already exists' });
        }

        const newSection = new Section({ schoolId, name });
        await newSection.save();

        res.status(201).json({ success: true, message: 'Section created successfully', data: newSection });
    } catch (err) {
        console.error('Error creating section:', err);
        res.status(500).json({ success: false, error: 'Failed to create section' });
    }
};

// Update a section
exports.updateSection = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const { name } = req.body;

        const section = await Section.findOneAndUpdate(
            { _id: id, schoolId },
            { name },
            { new: true, runValidators: true }
        );

        if (!section) {
            return res.status(404).json({ success: false, error: 'Section not found' });
        }

        res.json({ success: true, message: 'Section updated successfully', data: section });
    } catch (err) {
        console.error('Error updating section:', err);
        res.status(500).json({ success: false, error: 'Failed to update section' });
    }
};

// Delete a section
exports.deleteSection = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const section = await Section.findOneAndDelete({ _id: id, schoolId });
        if (!section) {
            return res.status(404).json({ success: false, error: 'Section not found' });
        }

        res.json({ success: true, message: 'Section deleted successfully' });
    } catch (err) {
        console.error('Error deleting section:', err);
        res.status(500).json({ success: false, error: 'Failed to delete section' });
    }
};
