const Teacher = require('../models/Teacher');
const Staff = require('../models/Staff');
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcryptjs');

// Create staff member
exports.createStaff = async (req, res) => {
    const { schoolId } = req.user;
    const staffData = { ...req.body, schoolId };

    if (!staffData.staffId || !staffData.firstName || !staffData.lastName || !staffData.email || !staffData.role) {
        return res.status(400).json({ error: 'Required fields: staffId, firstName, lastName, email, role' });
    }

    try {
        // Fetch School to get the name for prefixing
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }
        const schoolNameClean = school.schoolName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
        const schoolNameFull = school.schoolName.replace(/[^a-zA-Z0-9]/g, '');

        // Generate Staff/Teacher ID
        let staffId = staffData.staffId;

        // Auto-generate ID if not provided or to enforce format or if it's just a placeholder
        // Frontend might send a placeholder like "JD123", we can override if needed, but let's trust it or ensure uniqueness
        if (!staffId || staffData.role === 'teacher') {
            const timestamp = Date.now().toString();
            const suffix = Math.floor(Math.random() * 1000);

            if (staffData.role === 'teacher') {
                // Keep the ID if it looks formal, otherwise generate
                if (!staffId.startsWith('T')) {
                    staffId = `T${timestamp}${suffix}`;
                }
            } else {
                if (!staffId.includes(schoolNameClean)) {
                    staffId = `${schoolNameClean}_ST${timestamp.slice(-4)}${suffix}`;
                }
            }
        }

        staffData.staffId = staffId;

        // Check if staff ID already exists for this school
        const existingStaff = await Staff.findOne({ schoolId, staffId: staffData.staffId });
        if (existingStaff) {
            staffData.staffId = `${staffData.staffId}_${Math.floor(Math.random() * 100)}`;
        }

        // Data Mapping for Staff Model
        if (staffData.joiningDate) {
            staffData.dateOfJoining = staffData.joiningDate;
        }

        // Handle Salary - Frontend sends a single value, backend expects object
        if (staffData.salary && typeof staffData.salary !== 'object') {
            const salAmount = Number(staffData.salary) || 0;
            staffData.salary = {
                basicSalary: salAmount,
                allowances: 0,
                deductions: 0,
                netSalary: salAmount
            };
        }

        // Create user account
        const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
            randomPart += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        const tempPassword = `${schoolNameFull}@${randomPart}`;

        const user = new User({
            email: staffData.email,
            username: staffData.staffId,
            passwordHash: await bcrypt.hash(tempPassword, 10),
            role: staffData.role === 'teacher' ? 'teacher' : 'staff', // simplistic mapping
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            schoolId,
            isActive: true
        });
        await user.save();

        staffData.userId = user._id;

        const staff = new Staff(staffData);
        await staff.save();

        // If it's a teacher, also create a Teacher record for backward compatibility
        if (staffData.role === 'teacher') {
            const teacher = new Teacher({
                teacherId: staffData.staffId,
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                email: staffData.email,
                phone: staffData.phone,
                qualification: staffData.qualification,
                subjects: staffData.subjects ? staffData.subjects.split(',').map(s => s.trim()) : [],
                joiningDate: staffData.joiningDate || new Date(),
                address: staffData.address,
                salary: typeof staffData.salary === 'object' ? staffData.salary.netSalary : Number(staffData.salary),
                schoolId: schoolId
            });
            await teacher.save();
        }

        // Send credentials email
        try {
            const emailService = require('../utils/emailService');
            await emailService.sendEmail({
                to: staffData.email,
                subject: 'Your Staff Credentials - Frontier LMS',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #0d6efd;">Welcome to ${school.schoolName || 'Frontier LMS'}</h2>
                        <p>Hello ${staffData.firstName},</p>
                        <p>Your staff account has been created successfully. Here are your login credentials:</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #0d6efd;">
                            <p><strong>Username:</strong> ${staffData.email} or ${staffData.staffId}</p>
                            <p><strong>Password:</strong> ${tempPassword}</p>
                        </div>
                        <p>Please login and change your password immediately.</p>
                        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #0d6efd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Login Now</a>
                    </div>
                `
            });
            console.log(`Credentials email sent to ${staffData.email}`);
        } catch (emailError) {
            console.error('Failed to send credentials email:', emailError);
            // Don't block the response, just log the error
        }

        res.status(201).json({
            message: 'Staff member created successfully',
            staff,
            credentials: {
                email: staffData.email,
                password: tempPassword,
                note: 'Please change password after first login'
            }
        });
    } catch (err) {
        console.error('Error creating staff:', err);
        res.status(500).json({ error: 'Failed to create staff member: ' + err.message });
    }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
    const { schoolId } = req.user;
    const { role, department, isActive, page = 1, limit = 10 } = req.query;

    try {
        const query = { schoolId };
        if (role) query.role = role;
        if (department) query.department = department;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const staff = await Staff.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Staff.countDocuments(query);

        res.json({
            staff,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (err) {
        console.error('Error fetching staff:', err);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const staff = await Staff.findOne({ _id: id, schoolId });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        res.json(staff);
    } catch (err) {
        console.error('Error fetching staff:', err);
        res.status(500).json({ error: 'Failed to fetch staff member' });
    }
};

// Update staff
exports.updateStaff = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    try {
        const staff = await Staff.findOneAndUpdate(
            { _id: id, schoolId },
            updates,
            { new: true, runValidators: true }
        );

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        res.json({ message: 'Staff updated successfully', staff });
    } catch (err) {
        console.error('Error updating staff:', err);
        res.status(500).json({ error: 'Failed to update staff member' });
    }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const staff = await Staff.findOneAndDelete({ _id: id, schoolId });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        // Also delete associated user account
        if (staff.userId) {
            await User.findByIdAndDelete(staff.userId);
        }

        res.json({ message: 'Staff member deleted successfully' });
    } catch (err) {
        console.error('Error deleting staff:', err);
        res.status(500).json({ error: 'Failed to delete staff member' });
    }
};

// Get staff by role
exports.getStaffByRole = async (req, res) => {
    const { schoolId } = req.user;
    const { role } = req.params;

    try {
        const staff = await Staff.find({ schoolId, role, isActive: true })
            .sort({ firstName: 1 });

        res.json(staff);
    } catch (err) {
        console.error('Error fetching staff by role:', err);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

// Get staff by department
exports.getStaffByDepartment = async (req, res) => {
    const { schoolId } = req.user;
    const { department } = req.params;

    try {
        const staff = await Staff.find({ schoolId, department, isActive: true })
            .sort({ firstName: 1 });

        res.json(staff);
    } catch (err) {
        console.error('Error fetching staff by department:', err);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;

    try {
        const staff = await Staff.findOne({ _id: id, schoolId });

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        staff.isActive = !staff.isActive;
        await staff.save();

        // Also update user account status
        if (staff.userId) {
            await User.findByIdAndUpdate(staff.userId, { isActive: staff.isActive });
        }

        res.json({
            message: `Staff member ${staff.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: staff.isActive
        });
    } catch (err) {
        console.error('Error toggling status:', err);
        res.status(500).json({ error: 'Failed to toggle active status' });
    }
};

// Get staff statistics
exports.getStaffStatistics = async (req, res) => {
    const { schoolId } = req.user;

    try {
        const stats = await Staff.aggregate([
            { $match: { schoolId: new require('mongoose').Types.ObjectId(schoolId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: {
                        $sum: { $cond: ['$isActive', 1, 0] }
                    },
                    byRole: {
                        $push: '$role'
                    },
                    byDepartment: {
                        $push: '$department'
                    },
                    byEmploymentType: {
                        $push: '$employmentType'
                    },
                    totalPayroll: {
                        $sum: { $ifNull: ['$salary.netSalary', 0] }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                total: 0,
                active: 0,
                inactive: 0,
                byRole: {},
                byDepartment: {},
                byEmploymentType: {}
            });
        }

        const data = stats[0];

        // Count by role
        const roleCount = {};
        data.byRole.forEach(role => {
            roleCount[role] = (roleCount[role] || 0) + 1;
        });

        // Count by department
        const deptCount = {};
        data.byDepartment.forEach(dept => {
            deptCount[dept] = (deptCount[dept] || 0) + 1;
        });

        // Count by employment type
        const empTypeCount = {};
        data.byEmploymentType.forEach(type => {
            empTypeCount[type] = (empTypeCount[type] || 0) + 1;
        });

        res.json({
            total: data.total,
            active: data.active,
            inactive: data.total - data.active,
            byRole: roleCount,
            byDepartment: deptCount,
            byEmploymentType: empTypeCount,
            totalPayroll: data.totalPayroll
        });
    } catch (err) {
        console.error('Error fetching staff statistics:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Update salary
exports.updateSalary = async (req, res) => {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { basicSalary, allowances, deductions } = req.body;

    try {
        const netSalary = (basicSalary || 0) + (allowances || 0) - (deductions || 0);

        const staff = await Staff.findOneAndUpdate(
            { _id: id, schoolId },
            {
                'salary.basicSalary': basicSalary,
                'salary.allowances': allowances,
                'salary.deductions': deductions,
                'salary.netSalary': netSalary
            },
            { new: true }
        );

        if (!staff) {
            return res.status(404).json({ error: 'Staff member not found' });
        }

        res.json({ message: 'Salary updated successfully', salary: staff.salary });
    } catch (err) {
        console.error('Error updating salary:', err);
        res.status(500).json({ error: 'Failed to update salary' });
    }
};
