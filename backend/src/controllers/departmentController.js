const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { name, description } = req.body;

        const department = new Department({
            schoolId,
            name,
            description
        });

        await department.save();
        res.status(201).json({ message: 'Department created successfully', department });
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ error: 'Failed to create department' });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const departments = await Department.find({ schoolId }).sort({ name: 1 });
        res.json(departments);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const updates = req.body;

        const department = await Department.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true }
        );

        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department updated', department });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update department' });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;

        const department = await Department.findOneAndDelete({ _id: id, schoolId });
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
};
