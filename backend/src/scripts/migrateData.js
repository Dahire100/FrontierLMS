const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentFee = require('../models/StudentFee');
const TransportRoute = require('../models/TransportRoute');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');

const dbPath = path.join(__dirname, '../../database.sqlite');
const sqliteDb = new sqlite3.Database(dbPath);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/frontier_erp');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

const getSqliteData = (query) => {
    return new Promise((resolve, reject) => {
        sqliteDb.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const migrate = async () => {
    await connectDB();

    console.log('🚀 Starting Migration...');

    // Maps to store SQLite ID -> MongoDB ID mappings
    const schoolIdMap = {};
    const studentIdMap = {};
    const examIdMap = {};

    try {
        // Clear existing data
        console.log('🧹 Clearing existing MongoDB data...');
        await School.deleteMany({});
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await StudentFee.deleteMany({});
        await TransportRoute.deleteMany({});
        await Attendance.deleteMany({});
        await Exam.deleteMany({});
        await ExamResult.deleteMany({});
        console.log('✅ Data cleared');

        // 1. Migrate Schools
        console.log('🏫 Migrating Schools...');
        const schools = await getSqliteData('SELECT * FROM schools');
        for (const s of schools) {
            const newSchool = new School({
                schoolName: s.schoolName,
                email: s.email,
                contactNumber: s.contactNumber,
                schoolType: s.schoolType,
                boardType: s.boardType,
                establishmentYear: s.establishmentYear,
                address: s.address,
                city: s.city,
                state: s.state,
                country: s.country,
                pinCode: s.pinCode,
                principalName: s.principalName,
                principalEmail: s.principalEmail,
                principalPhone: s.principalPhone,
                description: s.description,
                status: s.status,
                adminEmail: s.adminEmail,
                adminPassword: s.adminPassword,
                createdAt: s.registrationDate
            });
            await newSchool.save();
            schoolIdMap[s.id] = newSchool._id;
        }
        console.log(`✅ Migrated ${schools.length} schools`);

        // 2. Migrate Users
        console.log('👤 Migrating Users...');
        const users = await getSqliteData('SELECT * FROM users');
        for (const u of users) {
            const newUser = new User({
                email: u.email,
                passwordHash: u.passwordHash,
                role: u.role,
                firstName: u.firstName,
                lastName: u.lastName,
                schoolId: u.schoolId ? schoolIdMap[u.schoolId] : undefined,
                isActive: u.isActive === 1,
                phone: u.phone,
                lastLogin: u.lastLogin
            });
            await newUser.save();
        }
        console.log(`✅ Migrated ${users.length} users`);

        // 3. Migrate Teachers
        try {
            console.log('👨‍🏫 Migrating Teachers...');
            const teachers = await getSqliteData('SELECT * FROM teachers');
            for (const t of teachers) {
                if (!schoolIdMap[t.schoolId]) continue; // Skip if school not found
                const newTeacher = new Teacher({
                    teacherId: t.teacherId || `T-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Ensure ID
                    firstName: t.firstName,
                    lastName: t.lastName,
                    email: t.email,
                    phone: t.phone,
                    qualification: t.qualification,
                    subjects: t.subjects,
                    joiningDate: t.joiningDate,
                    address: t.address,
                    salary: t.salary,
                    schoolId: schoolIdMap[t.schoolId]
                });
                await newTeacher.save();
            }
            console.log(`✅ Migrated ${teachers.length} teachers`);
        } catch (err) {
            console.log('⚠️ Skipping Teachers migration (Table not found or empty)');
        }

        // 4. Migrate Transport Routes
        try {
            console.log('🚌 Migrating Transport Routes...');
            const routes = await getSqliteData('SELECT * FROM transport_routes');
            for (const r of routes) {
                if (!schoolIdMap[r.schoolId]) continue;
                const newRoute = new TransportRoute({
                    routeName: r.routeName,
                    vehicleNumber: r.vehicleNumber,
                    driverName: r.driverName,
                    driverPhone: r.driverPhone,
                    routeCharges: r.routeCharges,
                    schoolId: schoolIdMap[r.schoolId]
                });
                await newRoute.save();
            }
            console.log(`✅ Migrated ${routes.length} transport routes`);
        } catch (err) {
            console.log('⚠️ Skipping Transport Routes migration (Table not found or empty)');
        }

        // 5. Migrate Students
        try {
            console.log('🎓 Migrating Students...');
            const students = await getSqliteData('SELECT * FROM students');
            for (const s of students) {
                if (!schoolIdMap[s.schoolId]) continue;
                const newStudent = new Student({
                    studentId: s.studentId || `S-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    class: s.class,
                    section: s.section,
                    rollNumber: s.rollNumber,
                    admissionDate: s.admissionDate,
                    dateOfBirth: s.dateOfBirth,
                    gender: s.gender,
                    address: s.address,
                    phone: s.phone,
                    email: s.email,
                    parentName: s.parentName,
                    parentPhone: s.parentPhone,
                    bloodGroup: s.bloodGroup,
                    transportRoute: s.transportRoute, // Assuming string name or ID
                    schoolId: schoolIdMap[s.schoolId]
                });
                await newStudent.save();
                studentIdMap[s.id] = newStudent._id;
            }
            console.log(`✅ Migrated ${students.length} students`);
        } catch (err) {
            console.log('⚠️ Skipping Students migration (Table not found or empty)');
        }

        // 6. Migrate Student Fees
        try {
            console.log('💰 Migrating Student Fees...');
            const fees = await getSqliteData('SELECT * FROM student_fees');
            for (const f of fees) {
                if (!schoolIdMap[f.schoolId] || !studentIdMap[f.studentId]) continue;
                const newFee = new StudentFee({
                    studentId: studentIdMap[f.studentId],
                    feeType: f.feeType,
                    amount: f.amount,
                    dueDate: f.dueDate,
                    status: f.status,
                    paidDate: f.paidDate,
                    transactionId: f.transactionId,
                    schoolId: schoolIdMap[f.schoolId]
                });
                await newFee.save();
            }
            console.log(`✅ Migrated ${fees.length} fee records`);
        } catch (err) {
            console.log('⚠️ Skipping Student Fees migration (Table not found or empty)');
        }

        // 7. Migrate Attendance
        try {
            console.log('📅 Migrating Attendance...');
            const attendance = await getSqliteData('SELECT * FROM attendance');
            for (const a of attendance) {
                if (!schoolIdMap[a.schoolId] || !studentIdMap[a.studentId]) continue;
                const newAttendance = new Attendance({
                    studentId: studentIdMap[a.studentId],
                    date: a.date,
                    status: a.status,
                    schoolId: schoolIdMap[a.schoolId]
                });
                await newAttendance.save();
            }
            console.log(`✅ Migrated ${attendance.length} attendance records`);
        } catch (err) {
            console.log('⚠️ Skipping Attendance migration (Table not found or empty)');
        }

        // 8. Migrate Exams
        try {
            console.log('📝 Migrating Exams...');
            const exams = await getSqliteData('SELECT * FROM exams');
            for (const e of exams) {
                if (!schoolIdMap[e.schoolId]) continue;
                const newExam = new Exam({
                    examName: e.examName,
                    class: e.class,
                    subject: e.subject,
                    date: e.date,
                    time: e.time,
                    totalMarks: e.totalMarks,
                    schoolId: schoolIdMap[e.schoolId]
                });
                await newExam.save();
                examIdMap[e.id] = newExam._id;
            }
            console.log(`✅ Migrated ${exams.length} exams`);
        } catch (err) {
            console.log('⚠️ Skipping Exams migration (Table not found or empty)');
        }

        // 9. Migrate Exam Results
        try {
            console.log('📊 Migrating Exam Results...');
            const results = await getSqliteData('SELECT * FROM exam_results');
            for (const r of results) {
                if (!schoolIdMap[r.schoolId] || !studentIdMap[r.studentId] || !examIdMap[r.examId]) continue;
                const newResult = new ExamResult({
                    examId: examIdMap[r.examId],
                    studentId: studentIdMap[r.studentId],
                    marks: r.marks,
                    grade: r.grade,
                    remarks: r.remarks,
                    schoolId: schoolIdMap[r.schoolId]
                });
                await newResult.save();
            }
            console.log(`✅ Migrated ${results.length} exam results`);
        } catch (err) {
            console.log('⚠️ Skipping Exam Results migration (Table not found or empty)');
        }

        console.log('✨ Migration Completed Successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    }
};

migrate();
