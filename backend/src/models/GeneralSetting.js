// models/GeneralSetting.js
const mongoose = require('mongoose');

const generalSettingSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    schoolName: {
        type: String,
        required: true
    },
    schoolCode: String,
    address: String,
    phone: String,
    email: String,
    website: String,
    logo: String,
    favicon: String,
    currency: {
        type: String,
        default: 'INR'
    },
    currencySymbol: {
        type: String,
        default: '₹'
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    dateFormat: {
        type: String,
        default: 'DD-MM-YYYY'
    },
    academicYear: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    theme: {
        primaryColor: {
            type: String,
            default: '#0f172a'
        },
        secondaryColor: {
            type: String,
            default: '#475569'
        },
        sidebarColor: {
            type: String,
            default: '#1e293b'
        }
    },
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GeneralSetting', generalSettingSchema);
