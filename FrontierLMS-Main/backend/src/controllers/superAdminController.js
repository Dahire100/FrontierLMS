const Invoice = require('../models/Invoice');
const Plan = require('../models/Plan');
const School = require('../models/School');

// ==================== INVOICES ====================

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('schoolId', 'schoolName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch invoices'
        });
    }
};

// Create invoice
exports.createInvoice = async (req, res) => {
    try {
        const { institute, amount, dueDate, status, plan } = req.body;

        // Generate invoice number
        const count = await Invoice.countDocuments();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

        const invoice = new Invoice({
            institute,
            amount,
            dueDate,
            status,
            plan,
            invoiceNumber,
            issuedDate: new Date()
        });

        await invoice.save();

        res.json({
            success: true,
            data: invoice,
            message: 'Invoice created successfully'
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create invoice'
        });
    }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const invoice = await Invoice.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            data: invoice,
            message: 'Invoice updated successfully'
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update invoice'
        });
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findByIdAndDelete(id);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete invoice'
        });
    }
};

// ==================== SAAS PLANS ====================

// Get all plans
exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch plans'
        });
    }
};

// Create plan
exports.createPlan = async (req, res) => {
    try {
        const { name, price, description, features, status, maxStudents, maxTeachers } = req.body;

        const plan = new Plan({
            name,
            price,
            description,
            features,
            status,
            maxStudents,
            maxTeachers,
            subscribers: 0,
            revenue: 0
        });

        await plan.save();

        res.json({
            success: true,
            data: plan,
            message: 'Plan created successfully'
        });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create plan'
        });
    }
};

// Update plan
exports.updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const plan = await Plan.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        res.json({
            success: true,
            data: plan,
            message: 'Plan updated successfully'
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update plan'
        });
    }
};

// Delete plan
exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await Plan.findByIdAndDelete(id);

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: 'Plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete plan'
        });
    }
};

// ==================== PLATFORM SETTINGS ====================

// Get platform settings
exports.getSettings = async (req, res) => {
    try {
        // For now, return default settings
        // In production, this would fetch from a Settings model
        const settings = {
            company: {
                name: 'ERP System',
                email: 'admin@erpsystem.com',
                phone: '+91 1234567890',
                address: 'Mumbai, India'
            },
            email: {
                smtp_host: 'smtp.gmail.com',
                smtp_port: 587,
                smtp_user: '',
                smtp_password: '',
                from_email: 'noreply@erpsystem.com'
            },
            sms: {
                provider: 'twilio',
                api_key: '',
                api_secret: '',
                sender_id: 'ERPSYS'
            },
            security: {
                session_timeout: 30,
                password_expiry: 90,
                max_login_attempts: 5
            }
        };

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
};

// Update platform settings
exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body;

        // In production, save to Settings model
        // For now, just return success

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
};

// ==================== SUPPORT TICKETS ====================

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        // For now, return empty array
        // In production, fetch from Ticket model
        const tickets = [];

        res.json({
            success: true,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tickets'
        });
    }
};

// Create ticket
exports.createTicket = async (req, res) => {
    try {
        const ticketData = req.body;

        // In production, save to Ticket model

        res.json({
            success: true,
            message: 'Ticket created successfully',
            data: ticketData
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create ticket'
        });
    }
};

// Update ticket
exports.updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // In production, update Ticket model

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            data: updateData
        });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update ticket'
        });
    }
};
