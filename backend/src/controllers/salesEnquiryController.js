const SalesEnquiry = require('../models/SalesEnquiry');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createEnquiry = async (req, res) => {
    console.log('📝 Received Sales Enquiry:', req.body);
    try {
        const { fullName, email, phone, institute, solution } = req.body;

        // Basic validation
        if (!fullName || !email || !phone || !institute) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Save Enquiry
        const enquiry = new SalesEnquiry(req.body);
        const savedEnquiry = await enquiry.save();
        console.log('✅ Enquiry saved:', savedEnquiry._id);

        // 2. Respond immediately to the client
        res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: savedEnquiry });

        // 3. Process Notifications Asynchronously
        try {
            const superAdmins = await User.find({ role: 'super_admin' });
            if (superAdmins.length > 0) {
                const notifications = superAdmins.map(admin => {
                    const notif = {
                        recipient: admin._id,
                        recipientModel: 'User',
                        title: 'New Sales Enquiry',
                        message: `New enquiry from ${savedEnquiry.fullName} (${savedEnquiry.institute}). Solution: ${savedEnquiry.solution}`,
                        type: 'info',
                        link: '/dashboard/super-admin/enquiries',
                        isRead: false
                    };
                    // Only add schoolId if it exists to avoid casting errors
                    if (admin.schoolId) {
                        notif.schoolId = admin.schoolId;
                    }
                    return notif;
                });
                await Notification.insertMany(notifications);
                console.log(`🔔 Sent ${notifications.length} notifications to super admins`);
            }
        } catch (notifError) {
            console.error('⚠️ Notification Error (Non-blocking):', notifError.message);
        }

    } catch (error) {
        console.error('❌ Enquiry Critical Error:', error);
        // Only send error response if we haven't sent one yet
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to submit enquiry', error: error.message });
        }
    }
};

exports.getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await SalesEnquiry.find().sort({ createdAt: -1 });
        res.status(200).json(enquiries);
    } catch (error) {
        console.error('❌ Fetch Enquiries Error:', error);
        res.status(500).json({ message: 'Failed to fetch enquiries', error: error.message });
    }
};

exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const enquiry = await SalesEnquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!enquiry) {
            return res.status(404).json({ message: 'Enquiry not found' });
        }

        res.status(200).json(enquiry);
    } catch (error) {
        console.error('❌ Update Enquiry Status Error:', error);
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};
