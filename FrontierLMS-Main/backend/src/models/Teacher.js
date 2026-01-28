const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    department: String,
    qualification: String,
    subjects: [String],
    joiningDate: Date,
    address: String,
    profilePicture: String,
    salary: Number,
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
