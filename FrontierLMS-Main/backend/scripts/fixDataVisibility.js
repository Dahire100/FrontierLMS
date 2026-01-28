const mongoose = require('mongoose');
const MONGO_URI =your url;
const targetSchool = '6936c0416c9b4dbe30ab579d';

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        const Student = require('../src/models/Student');
        const Teacher = require('../src/models/Teacher');
        const User = require('../src/models/User');

        const studentRes = await Student.updateMany({}, { schoolId: targetSchool });
        const teacherRes = await Teacher.updateMany({}, { schoolId: targetSchool });
        const userRes = await User.updateMany({ role: { $ne: 'super_admin' } }, { schoolId: targetSchool });

        console.log(`Migrated ${studentRes.modifiedCount} students`);
        console.log(`Migrated ${teacherRes.modifiedCount} teachers`);
        console.log(`Migrated ${userRes.modifiedCount} users`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
