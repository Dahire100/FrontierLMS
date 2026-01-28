// controllers/userManagementController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');

exports.getUsersByRole = async (req, res) => {
    const { role, classId, section, searchTerm } = req.query;
    const { schoolId } = req.user;

    console.log(`🔍 User Management Fetch - Role: ${role}, School: ${schoolId}`);

    try {
        if (!schoolId) {
            return res.status(400).json({ message: "School context missing" });
        }

        let users = [];
        const query = { schoolId: new mongoose.Types.ObjectId(schoolId) };
        const searchRegex = searchTerm ? new RegExp(searchTerm, 'i') : null;

        if (role === 'student') {
            const studentQuery = { ...query, isDeleted: { $ne: true } };
            if (classId && classId !== 'all') studentQuery.class = classId;
            if (section && section !== 'all') studentQuery.section = section;
            if (searchRegex) {
                studentQuery.$or = [
                    { firstName: searchRegex },
                    { lastName: searchRegex },
                    { studentId: searchRegex }
                ];
            }

            console.log('📡 Fetching Students with query:', JSON.stringify(studentQuery));
            users = await Student.find(studentQuery).select('studentId firstName lastName class section email phone isActive fatherName').lean();
            console.log(`✅ Found ${users.length} students`);

            const userAccounts = await User.find({ schoolId, role: 'student' }).lean();

            users = users.map(s => {
                const account = userAccounts.find(u => u.username === s.studentId || (s.email && u.email === s.email));
                return {
                    ...s,
                    status: account ? account.isActive : false,
                    userId: account ? account._id : null,
                    userName: account ? account.username : (s.studentId || 'N/A')
                };
            });
        } else if (role === 'staff') {
            const staffQuery = { ...query };
            const teacherQuery = { ...query };

            if (searchRegex) {
                staffQuery.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { staffId: searchRegex }];
                teacherQuery.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { teacherId: searchRegex }];
            }

            console.log('📡 Fetching Staff & Teachers...');
            const [staffList, teacherList] = await Promise.all([
                Staff.find(staffQuery).lean(),
                Teacher.find(teacherQuery).lean()
            ]);
            console.log(`✅ Found ${staffList.length} staff, ${teacherList.length} teachers`);

            const userAccounts = await User.find({
                schoolId,
                role: { $in: ['admin', 'teacher', 'school_admin', 'accountant', 'librarian', 'receptionist'] }
            }).lean();

            const staffMapped = staffList.map(s => {
                const account = userAccounts.find(u => u.email === s.email);
                return {
                    ...s,
                    id: s._id,
                    name: `${s.firstName} ${s.lastName}`,
                    status: account ? account.isActive : false,
                    userId: account ? account._id : null,
                    type: 'Staff'
                };
            });

            const teacherMapped = teacherList.map(t => {
                const account = userAccounts.find(u => u.email === t.email || u.username === t.teacherId);
                return {
                    ...t,
                    id: t._id,
                    staffId: t.teacherId,
                    name: `${t.firstName} ${t.lastName}`,
                    role: 'teacher',
                    status: account ? account.isActive : false,
                    userId: account ? account._id : null,
                    type: 'Teacher'
                };
            });

            users = [...staffMapped, ...teacherMapped];
        } else if (role === 'parent') {
            const studentQuery = { ...query, isDeleted: { $ne: true } };
            const students = await Student.find(studentQuery).lean();
            const userAccounts = await User.find({ schoolId, role: 'parent' }).lean();

            const parentMap = new Map();
            userAccounts.forEach(u => {
                const key = u.email || u.username;
                if (key) {
                    parentMap.set(key, {
                        userId: u._id,
                        guardianName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Parent Account',
                        guardianPhone: u.phone || 'N/A',
                        userName: u.username,
                        status: u.isActive
                    });
                }
            });

            students.forEach(s => {
                const pName = s.guardianName || s.parentName || s.fatherName;
                const pPhone = s.guardianPhone || s.parentPhone || s.phone;
                const pEmail = s.parentEmail || s.email;

                if (pName) {
                    const key = pEmail || pName;
                    if (!parentMap.has(key)) {
                        parentMap.set(key, {
                            userId: null,
                            guardianName: pName,
                            guardianPhone: pPhone || 'N/A',
                            userName: 'No Portal Account',
                            status: false
                        });
                    }
                }
            });

            users = Array.from(parentMap.values());
            if (searchRegex) {
                users = users.filter(u =>
                    searchRegex.test(u.guardianName) ||
                    searchRegex.test(u.guardianPhone) ||
                    searchRegex.test(u.userName)
                );
            }
        }

        res.json(users);
    } catch (error) {
        console.error('❌ Error in User Management:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { _id: userId, schoolId: req.user.schoolId },
            { $set: { isActive: status } },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: 'Account not found' });
        res.json({ message: `Status updated`, user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteUserAccount = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findOne({ _id: userId, schoolId: req.user.schoolId });
        if (!user) return res.status(404).json({ message: 'Account not found' });
        if (user.role === 'super_admin') return res.status(403).json({ message: 'Restricted' });
        await User.deleteOne({ _id: userId });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
