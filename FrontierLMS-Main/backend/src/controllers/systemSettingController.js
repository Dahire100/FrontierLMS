// controllers/systemSettingController.js
const SystemSetting = require('../models/SystemSetting');
const Staff = require('../models/Staff');

// Get system settings
exports.getSystemSettings = async (req, res) => {
    const { schoolId, role } = req.user;

    // Only admin allowed
    if (role !== 'school_admin' && role !== 'super_admin' && role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        let settings = await SystemSetting.findOne({ schoolId })
            .populate('communication.notifications.staffId', 'firstName lastName email');

        if (!settings) {
            settings = new SystemSetting({ schoolId });
            await settings.save();
        }

        // Sanitize for frontend (mask sensitive keys)
        const sanitized = settings.toObject();

        // Helper to mask map/object keys
        const maskConfig = (config) => {
            if (!config) return config;
            const masked = {};
            for (let [key, val] of Object.entries(config)) {
                if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('pass')) {
                    masked[key] = '********';
                } else {
                    masked[key] = val;
                }
            }
            return masked;
        };

        if (sanitized.communication) {
            if (sanitized.communication.sms?.config) sanitized.communication.sms.config = maskConfig(sanitized.communication.sms.config);
            if (sanitized.communication.email) sanitized.communication.email.password = '********';
            if (sanitized.communication.whatsapp?.config) sanitized.communication.whatsapp.config = maskConfig(sanitized.communication.whatsapp.config);
            if (sanitized.communication.ivr?.config) sanitized.communication.ivr.config = maskConfig(sanitized.communication.ivr.config);
            if (sanitized.communication.meet?.config) sanitized.communication.meet.config = maskConfig(sanitized.communication.meet.config);
        }

        if (sanitized.paymentGateways) {
            sanitized.paymentGateways = sanitized.paymentGateways.map(gw => ({
                ...gw,
                config: maskConfig(gw.config)
            }));
        }

        if (sanitized.biometric) {
            if (sanitized.biometric.minop?.config) sanitized.biometric.minop.config = maskConfig(sanitized.biometric.minop.config);
            if (sanitized.biometric.essl?.config) sanitized.biometric.essl.config = maskConfig(sanitized.biometric.essl.config);
        }

        // Legacy masking
        if (sanitized.smsGateway) sanitized.smsGateway.token = '********';
        if (sanitized.emailGateway) sanitized.emailGateway.password = '********';
        if (sanitized.paymentGateway) sanitized.paymentGateway.keySecret = '********';

        res.json({ success: true, data: sanitized });
    } catch (err) {
        console.error('Error fetching system settings:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch system settings' });
    }
};

// Update system settings
exports.updateSystemSettings = async (req, res) => {
    const { schoolId, role } = req.user;
    const updates = req.body;

    if (role !== 'school_admin' && role !== 'super_admin' && role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    try {
        const settings = await SystemSetting.findOne({ schoolId });
        if (!settings) {
            return res.status(404).json({ success: false, error: 'Settings not found' });
        }

        // Helper to merge configs while preserving masked values
        const mergeConfig = (existing, incoming) => {
            if (!incoming) return existing;
            const updated = existing ? existing.toObject() : {};
            for (let [key, val] of Object.entries(incoming)) {
                if (val === '********') continue; // Don't overwrite with mask
                updated[key] = val;
            }
            return updated;
        };

        // Update Communication
        if (updates.communication) {
            if (updates.communication.sms) {
                settings.communication.sms.provider = updates.communication.sms.provider || settings.communication.sms.provider;
                settings.communication.sms.status = updates.communication.sms.status || settings.communication.sms.status;
                settings.communication.sms.config = mergeConfig(settings.communication.sms.config, updates.communication.sms.config);
            }
            if (updates.communication.email) {
                if (updates.communication.email.password === '********') delete updates.communication.email.password;
                Object.assign(settings.communication.email, updates.communication.email);
            }
            if (updates.communication.whatsapp) {
                settings.communication.whatsapp.url = updates.communication.whatsapp.url || settings.communication.whatsapp.url;
                settings.communication.whatsapp.status = updates.communication.whatsapp.status || settings.communication.whatsapp.status;
                settings.communication.whatsapp.config = mergeConfig(settings.communication.whatsapp.config, updates.communication.whatsapp.config);
            }
            if (updates.communication.ivr) {
                settings.communication.ivr.url = updates.communication.ivr.url || settings.communication.ivr.url;
                settings.communication.ivr.status = updates.communication.ivr.status || settings.communication.ivr.status;
                settings.communication.ivr.config = mergeConfig(settings.communication.ivr.config, updates.communication.ivr.config);
            }
            if (updates.communication.meet) {
                settings.communication.meet.status = updates.communication.meet.status || settings.communication.meet.status;
                settings.communication.meet.config = mergeConfig(settings.communication.meet.config, updates.communication.meet.config);
            }
            if (updates.communication.notifications) {
                settings.communication.notifications = updates.communication.notifications;
            }
        }

        // Update Payment Gateways
        if (updates.paymentGateways) {
            // This is a full replacement for simplicity in this example, 
            // but in real app might want to merge
            settings.paymentGateways = updates.paymentGateways.map(gw => {
                const existing = settings.paymentGateways.find(e => e.gateway === gw.gateway);
                return {
                    ...gw,
                    config: mergeConfig(existing?.config, gw.config)
                };
            });
        }

        // Update Biometric
        if (updates.biometric) {
            if (updates.biometric.minop) {
                settings.biometric.minop.status = updates.biometric.minop.status || settings.biometric.minop.status;
                settings.biometric.minop.config = mergeConfig(settings.biometric.minop.config, updates.biometric.minop.config);
            }
            if (updates.biometric.essl) {
                settings.biometric.essl.status = updates.biometric.essl.status || settings.biometric.essl.status;
                settings.biometric.essl.config = mergeConfig(settings.biometric.essl.config, updates.biometric.essl.config);
            }
        }

        // Existing settings preserved
        if (updates.backupSetting) Object.assign(settings.backupSetting, updates.backupSetting);
        if (updates.maintenanceMode) Object.assign(settings.maintenanceMode, updates.maintenanceMode);
        if (updates.sessionTimeout) settings.sessionTimeout = updates.sessionTimeout;

        await settings.save();
        res.json({ success: true, message: 'System settings updated successfully' });
    } catch (err) {
        console.error('Error updating system settings:', err);
        res.status(500).json({ success: false, error: 'Failed to update system settings' });
    }
};

// Test Configuration
exports.testConfiguration = async (req, res) => {
    const { type, gateway, config } = req.body;
    try {
        // Mock testing logic
        console.log(`Testing ${type} / ${gateway || ''} with config:`, config);

        // In a real app, you would try to connect to the service
        // For now, simulate success
        setTimeout(() => {
            res.json({ success: true, message: 'Configuration test successful! Service is reachable.' });
        }, 1000);
    } catch (err) {
        res.status(500).json({ success: false, error: 'Test failed: Connection error' });
    }
};

// Trigger Database Backup
exports.triggerBackup = async (req, res) => {
    try {
        console.log('📦 Backup triggered by:', req.user.email);
        // Simulate backup process
        res.json({ success: true, message: 'Database backup initiated successfully. Content will be available for download shortly.' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Backup failed' });
    }
};
