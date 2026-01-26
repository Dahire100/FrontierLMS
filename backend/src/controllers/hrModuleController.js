const HRTask = require('../models/HRTask');
const StaffAdvance = require('../models/StaffAdvance');
const Recruitment = require('../models/Recruitment');
const Staff = require('../models/Staff');

// TASK CONTROLLERS
exports.getTasks = async (req, res) => {
    try {
        const tasks = await HRTask.find({ schoolId: req.user.schoolId }).populate('assignedTo');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const task = new HRTask({ ...req.body, schoolId: req.user.schoolId });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// ADVANCE CONTROLLERS
exports.getAdvances = async (req, res) => {
    try {
        const advances = await StaffAdvance.find({ schoolId: req.user.schoolId }).populate('staffId');
        res.json(advances);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch advances' });
    }
};

exports.createAdvance = async (req, res) => {
    try {
        const advance = new StaffAdvance({ ...req.body, schoolId: req.user.schoolId });
        await advance.save();
        res.status(201).json(advance);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create advance' });
    }
};

// RECRUITMENT CONTROLLERS
exports.getRecruitments = async (req, res) => {
    try {
        const recruitments = await Recruitment.find({ schoolId: req.user.schoolId });
        res.json(recruitments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recruitments' });
    }
};

exports.createRecruitment = async (req, res) => {
    try {
        const recruitment = new Recruitment({ ...req.body, schoolId: req.user.schoolId });
        await recruitment.save();
        res.status(201).json(recruitment);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create recruitment' });
    }
};
