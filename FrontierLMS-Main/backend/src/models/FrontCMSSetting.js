// models/FrontCMSSetting.js
const mongoose = require('mongoose');

const frontCMSSettingSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    // School Details
    logo: String,
    favicon: String,
    contactEmail: String,
    complainEmail: String,
    footerText: { type: String, default: 'Copyright © 2024 NLET School' },

    // Feature Toggles
    isAppEnabled: { type: Boolean, default: true },
    isWebsiteEnabled: { type: Boolean, default: true },

    // Links
    tourVideoUrl: String,
    androidAppLink: String,
    iosAppLink: String,

    // Theme & Popup
    themePrimary: { type: String, default: '#1e1b4b' },
    themeStandard: { type: String, default: '#3b82f6' },
    selectedTheme: { type: String, default: 'Default' },

    welcomePopup: {
        title: String,
        image: String,
        link: String,
        isEnabled: { type: Boolean, default: false }
    },

    googleAnalytics: String,

    // Social Links
    socialLinks: {
        facebook: String,
        instagram: String,
        whatsapp: String,
        twitter: String,
        linkedin: String,
        youtube: String
    },

    // Section Contents
    about: {
        title: { type: String, default: 'Empowering Generations: Our Legacy' },
        description: String,
        image: String
    },
    mission: {
        title: { type: String, default: 'Our Mission' },
        description: String,
        image: String
    },
    vision: {
        title: { type: String, default: 'Our Vision' },
        description: String,
        image: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FrontCMSSetting', frontCMSSettingSchema);
