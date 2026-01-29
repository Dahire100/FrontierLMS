// models/SystemSetting.js
const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        unique: true
    },
    // Communication Settings
    communication: {
        sms: {
            provider: String,
            status: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' },
            config: { type: Map, of: String }
        },
        email: {
            host: String,
            port: Number,
            username: String,
            password: { type: String, select: false }, // Use select: false for security if needed, but here we might need it for sending
            fromEmail: String,
            fromName: String,
            security: String,
            status: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' }
        },
        whatsapp: {
            url: String,
            status: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' },
            config: { type: Map, of: String }
        },
        ivr: {
            url: String,
            status: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' },
            config: { type: Map, of: String }
        },
        meet: {
            status: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' },
            config: { type: Map, of: String }
        },
        notifications: [{
            module: String,
            staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
            notifyClassTeacher: { type: Boolean, default: false }
        }]
    },
    // Payment Settings
    paymentGateways: [{
        gateway: { type: String, required: true }, // razorpay, ccavenue, etc.
        config: { type: Map, of: String },
        mode: { type: String, enum: ['test', 'live'], default: 'test' },
        isActive: { type: Boolean, default: false }
    }],
    // Biometric Settings
    biometric: {
        minop: {
            config: { type: Map, of: String },
            status: { type: String, enum: ['connected', 'disconnected'], default: 'disconnected' },
            lastSync: Date
        },
        essl: {
            config: { type: Map, of: String },
            status: { type: String, enum: ['connected', 'disconnected'], default: 'disconnected' },
            lastSync: Date
        }
    },
    // Existing settings preserved for backward compatibility if needed, 
    // but better to migrate them in controller logic
    smsGateway: {
        provider: String,
        sid: String,
        token: String,
        senderId: String,
        isActive: { type: Boolean, default: false }
    },
    emailGateway: {
        provider: String,
        host: String,
        port: Number,
        username: String,
        password: { type: String },
        fromEmail: String,
        fromName: String,
        isActive: { type: Boolean, default: false }
    },
    paymentGateway: {
        provider: String,
        keyId: String,
        keySecret: String,
        currency: { type: String, default: 'INR' },
        isActive: { type: Boolean, default: false }
    },
    backupSetting: {
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'never'], default: 'never' },
        lastBackup: Date,
        nextBackup: Date,
        destination: { type: String, enum: ['local', 's3', 'drive'], default: 'local' }
    },
    maintenanceMode: {
        isEnabled: { type: Boolean, default: false },
        message: String
    },
    sessionTimeout: {
        type: Number,
        default: 60
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
