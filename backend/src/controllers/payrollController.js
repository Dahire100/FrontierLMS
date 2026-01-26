const Payroll = require('../models/Payroll');
const Staff = require('../models/Staff');

exports.getStaffForPayroll = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { role, month, year } = req.query;

        const query = { schoolId, isActive: true };
        if (role && role !== 'all') query.role = role;

        const staff = await Staff.find(query).sort({ firstName: 1 });

        // Find existing payroll for these staff for the given month/year
        const existingPayroll = await Payroll.find({
            schoolId,
            month,
            year
        });

        const payrollMap = {};
        existingPayroll.forEach(p => {
            payrollMap[p.staffId.toString()] = p;
        });

        const results = staff.map(s => ({
            _id: s._id,
            staffId: s.staffId,
            name: `${s.firstName} ${s.lastName}`,
            role: s.role,
            department: s.department,
            designation: s.designation,
            basicSalary: s.salary?.basicSalary || 0,
            netSalary: s.salary?.netSalary || 0,
            payrollStatus: payrollMap[s._id.toString()] ? payrollMap[s._id.toString()].status : 'not_generated',
            payrollId: payrollMap[s._id.toString()] ? payrollMap[s._id.toString()]._id : null
        }));

        res.json(results);
    } catch (err) {
        console.error('Error fetching staff for payroll:', err);
        res.status(500).json({ error: 'Failed to fetch payroll data' });
    }
};

exports.generatePayroll = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { staffId, month, year } = req.body;

        const staff = await Staff.findOne({ _id: staffId, schoolId });
        if (!staff) return res.status(404).json({ error: 'Staff not found' });

        const payroll = new Payroll({
            staffId,
            schoolId,
            month,
            year,
            basicSalary: staff.salary?.basicSalary || 0,
            allowances: staff.salary?.allowances || 0,
            deductions: staff.salary?.deductions || 0,
            netSalary: staff.salary?.netSalary || 0,
            status: 'generated'
        });

        await payroll.save();
        res.status(201).json({ message: 'Payroll generated successfully', payroll });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Payroll already generated for this month' });
        res.status(500).json({ error: 'Failed to generate payroll' });
    }
};

exports.markAsPaid = async (req, res) => {
    try {
        const { schoolId } = req.user;
        const { id } = req.params;
        const { paymentMode, remarks } = req.body;

        const payroll = await Payroll.findOneAndUpdate(
            { _id: id, schoolId },
            {
                status: 'paid',
                paymentDate: new Date(),
                paymentMode,
                remarks
            },
            { new: true }
        );

        if (!payroll) return res.status(404).json({ error: 'Payroll record not found' });
        res.json({ message: 'Payroll marked as paid', payroll });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update payroll' });
    }
};
