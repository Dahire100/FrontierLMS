const StaffAttendance = require('../models/StaffAttendance');
const Staff = require('../models/Staff');
const mongoose = require('mongoose');

exports.markStaffAttendance = async (req, res) => {
    try {
        const { schoolId, _id: userId } = req.user;
        const { date, attendanceRecords } = req.body;

        if (!date || !attendanceRecords) {
            return res.status(400).json({ error: 'Date and attendance records are required' });
        }

        const attendanceDate = new Date(date);
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

        // Delete existing attendance for these staff members on this date
        const staffIds = attendanceRecords.map(r => r.staffId);
        await StaffAttendance.deleteMany({
            schoolId,
            date: { $gte: startOfDay, $lte: endOfDay },
            staffId: { $in: staffIds }
        });

        const bulkOps = attendanceRecords.map(record => ({
            insertOne: {
                document: {
                    staffId: record.staffId,
                    date: new Date(date),
                    status: record.status,
                    remarks: record.remarks,
                    schoolId,
                    markedBy: userId
                }
            }
        }));

        if (bulkOps.length > 0) {
            await StaffAttendance.bulkWrite(bulkOps);
        }

        res.json({ message: 'Staff attendance marked successfully' });
    } catch (err) {
        console.error('Error marking staff attendance:', err);
        res.status(500).json({ error: 'Failed to mark staff attendance' });
    }
};

exports.getStaffAttendanceByDate = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { date, role, department } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const attendanceDate = new Date(date);
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

        // Get staff based on filters
        const staffQuery = { schoolId };
        if (role) staffQuery.role = role;
        if (department) staffQuery.department = department;

        const staffList = await Staff.find(staffQuery).sort({ firstName: 1 });

        const attendanceRecords = await StaffAttendance.find({
            schoolId,
            date: { $gte: startOfDay, $lte: endOfDay },
            staffId: { $in: staffList.map(s => s._id) }
        });

        const result = staffList.map(staff => {
            const record = attendanceRecords.find(a => a.staffId.toString() === staff._id.toString());
            return {
                _id: staff._id,
                staffId: staff.staffId,
                firstName: staff.firstName,
                lastName: staff.lastName,
                role: staff.role,
                department: staff.department,
                status: record ? record.status : null,
                remarks: record ? record.remarks : null
            };
        });

        res.json(result);
    } catch (err) {
        console.error('Error fetching staff attendance:', err);
        res.status(500).json({ error: 'Failed to fetch staff attendance' });
    }
};
