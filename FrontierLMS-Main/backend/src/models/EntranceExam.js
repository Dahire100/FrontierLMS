const mongoose = require('mongoose');

const entranceExamSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    fatherName: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    dob: {
        type: Date,
        required: true
    },
    examName: {
        type: String
    },
    formNo: {
        type: String
    },
    centerName: {
        type: String
    },
    image: {
        type: String
    }
}, {
    timestamps: true
});

entranceExamSchema.index({ schoolId: 1, phone: 1 });

module.exports = mongoose.model('EntranceExam', entranceExamSchema);
