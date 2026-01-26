const Term = require('../models/Term');

// Get all terms
exports.getAllTerms = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const terms = await Term.find({ schoolId }).sort({ startDate: -1 });
        res.json(terms);
    } catch (err) {
        console.error('Error fetching terms:', err);
        res.status(500).json({ error: 'Failed to fetch terms' });
    }
};

// Add term
exports.addTerm = async (req, res) => {
    const { schoolId } = req.user;
    const { termName, termCode, description, startDate, endDate, status } = req.body;

    if (!termName || !termCode || !startDate || !endDate) {
        return res.status(400).json({ error: 'All required fields are mandatory' });
    }

    try {
        const newTerm = new Term({
            termName,
            termCode,
            description,
            startDate,
            endDate,
            status: status || 'Active',
            schoolId
        });

        await newTerm.save();
        res.status(201).json({ message: 'Term added successfully', term: newTerm });
    } catch (err) {
        console.error('Error adding term:', err);
        res.status(500).json({ error: 'Failed to add term' });
    }
};

// Update term
exports.updateTerm = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const term = await Term.findOneAndUpdate(
            { _id: id, schoolId },
            { $set: updates },
            { new: true }
        );

        if (!term) {
            return res.status(404).json({ error: 'Term not found' });
        }
        res.json({ message: 'Term updated successfully', term });
    } catch (err) {
        console.error('Error updating term:', err);
        res.status(500).json({ error: 'Failed to update term' });
    }
};

// Delete term
exports.deleteTerm = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const term = await Term.findOneAndDelete({ _id: id, schoolId });

        if (!term) {
            return res.status(404).json({ error: 'Term not found' });
        }
        res.json({ message: 'Term deleted successfully' });
    } catch (err) {
        console.error('Error deleting term:', err);
        res.status(500).json({ error: 'Failed to delete term' });
    }
};
