const Event = require('../models/Event');

const mongoose = require('mongoose');

// Get all events for a school
exports.getEvents = async (req, res) => {
    try {
        console.log('Fetching events for School ID:', req.user.schoolId);

        let schoolId = req.user.schoolId;
        // Ensure schoolId is an ObjectId if it's a string
        if (typeof schoolId === 'string' && mongoose.Types.ObjectId.isValid(schoolId)) {
            schoolId = new mongoose.Types.ObjectId(schoolId);
        }

        const events = await Event.find({
            $or: [
                { schoolId: schoolId },
                { schoolId: req.user.schoolId.toString() }
            ]
        })
            .sort({ eventDate: -1 });

        console.log(`Found ${events.length} events.`);
        res.json({ success: true, data: events });
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single event
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create event
exports.createEvent = async (req, res) => {
    try {
        console.log('Creating event. User:', req.user._id, 'School:', req.user.schoolId);
        console.log('Event Data:', req.body);

        if (!req.user.schoolId) {
            return res.status(400).json({ success: false, message: 'User not associated with a school.' });
        }

        const event = new Event({ ...req.body, schoolId: req.user.schoolId });
        await event.save();
        console.log('Event created:', event._id);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
