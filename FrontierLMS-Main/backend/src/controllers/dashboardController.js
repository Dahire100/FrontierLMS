const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const StudentFee = require('../models/StudentFee');
const School = require('../models/School');
const Class = require('../models/Class');
const Notice = require('../models/Notice');
const PDFDocument = require('pdfkit');

// Generate Dashboard Report
exports.generateReport = async (req, res) => {
  try {
    const { schoolId, role } = req.user;

    // Create new PDF document
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Add content
    doc.fontSize(25).text('Dashboard Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    if (role === 'school_admin') {
      const stats = {
        students: await Student.countDocuments({ schoolId }),
        teachers: await Teacher.countDocuments({ schoolId }),
        classes: await Class.countDocuments({ schoolId }),
        pendingFees: await StudentFee.countDocuments({ schoolId, status: 'pending' })
      };

      doc.fontSize(16).text('School Statistics');
      doc.moveDown();
      doc.fontSize(12)
        .text(`Total Students: ${stats.students}`)
        .text(`Total Teachers: ${stats.teachers}`)
        .text(`Total Classes: ${stats.classes}`)
        .text(`Pending Fee Records: ${stats.pendingFees}`);
    } else {
      doc.text('Report details not available for this role.');
    }

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Get dashboard stats for school admin
exports.getSchoolAdminStats = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const totalStudents = await Student.countDocuments({ schoolId });
    const totalTeachers = await Teacher.countDocuments({ schoolId });
    const pendingFees = await StudentFee.countDocuments({ schoolId, status: 'pending' });

    // Calculate monthly revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const revenueResult = await StudentFee.aggregate([
      {
        $match: {
          schoolId: req.user.schoolId, // Ensure schoolId is ObjectId if stored as such
          status: 'paid',
          updatedAt: { $gte: startOfMonth } // Assuming paid date tracks with updatedAt or create a paidDate field
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalStudents,
      totalTeachers,
      pendingFees,
      totalRevenue
    });
  } catch (err) {
    console.error('Error fetching school admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get recent students
exports.getRecentStudents = async (req, res) => {
  const { schoolId } = req.user;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const students = await Student.find({ schoolId })
      .select('studentId firstName lastName class section admissionDate')
      .sort({ admissionDate: -1 })
      .limit(limit);

    res.json(students);
  } catch (err) {
    console.error('Error fetching recent students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get fee summary
exports.getFeeSummary = async (req, res) => {
  const { schoolId } = req.user;

  try {
    const feeSummary = await StudentFee.aggregate([
      { $match: { schoolId: req.user.schoolId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total_amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          total_amount: 1,
          _id: 0
        }
      }
    ]);

    res.json(feeSummary);
  } catch (err) {
    console.error('Error fetching fee summary:', err);
    res.status(500).json({ error: 'Failed to fetch fee summary' });
  }
};

// Get super admin dashboard stats
exports.getSuperAdminStats = async (req, res) => {
  try {
    const totalSchools = await School.countDocuments({ status: 'approved' });
    const pendingRegistrations = await School.countDocuments({ status: 'pending' });
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();

    res.json({
      totalSchools,
      pendingRegistrations,
      totalStudents,
      totalTeachers
    });
  } catch (err) {
    console.error('Error fetching super admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get dashboard data based on user role
exports.getDashboardData = async (req, res) => {
  const userRole = req.user.role;

  try {
    switch (userRole) {
      case 'super_admin':
        const totalSchools = await School.countDocuments({ status: 'approved' });
        const pendingRegistrations = await School.countDocuments({ status: 'pending' });
        const totalSAStudents = await Student.countDocuments();
        const totalSATeachers = await Teacher.countDocuments();

        // Recent Schools
        const recentSchools = await School.find()
          .sort({ createdAt: -1 })
          .limit(5);

        // Recent Activity (New Schools)
        const newSchools = await School.find()
          .sort({ createdAt: -1 })
          .limit(5);

        const saRecentActivity = newSchools.map(s => ({
          type: 'new_school',
          title: 'New School Registration',
          message: `${s.name} registered`,
          time: s.createdAt,
          icon: 'Building2',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        }));

        res.json({
          stats: {
            totalSchools,
            totalStudents: totalSAStudents,
            activeSubscriptions: 0, // Placeholder
            monthlyRevenue: 0 // Placeholder
          },
          schools: recentSchools.map(s => ({
            id: s._id,
            name: s.name,
            logo: "/placeholder.svg",
            students: 0, // Need aggregation for real numbers
            teachers: 0, // Need aggregation
            status: s.status,
            plan: "Standard",
            revenue: "₹0",
            lastActive: "Now",
            growth: "0%"
          })),
          recentActivity: saRecentActivity,
          role: 'super_admin'
        });
        break;

      case 'school_admin':
        // Get multiple data points for school admin
        const schoolId = req.user.schoolId;
        const period = req.query.period || 'month';

        const totalStudents = await Student.countDocuments({ schoolId });
        const totalTeachers = await Teacher.countDocuments({ schoolId });
        const pendingFees = await StudentFee.countDocuments({ schoolId, status: 'pending' });

        const totalClasses = await Class.countDocuments({ schoolId });

        // Revenue based on period
        let startDate = new Date();
        if (period === 'today') {
          startDate.setHours(0, 0, 0, 0);
        } else if (period === 'week') {
          // Start of current week (Monday)
          const day = startDate.getDay();
          const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
        } else if (period === 'month') {
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        } else if (period === 'year') {
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
        }

        const revenueResult = await StudentFee.aggregate([
          {
            $match: {
              schoolId: schoolId,
              status: 'paid',
              updatedAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' }
            }
          }
        ]);

        const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Revenue Trend (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueTrendRaw = await StudentFee.aggregate([
          {
            $match: {
              schoolId: schoolId,
              status: 'paid',
              updatedAt: { $gte: sixMonthsAgo }
            }
          },
          {
            $group: {
              _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
              total: { $sum: '$amount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format trend data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const revenueTrend = revenueTrendRaw.map(item => ({
          month: monthNames[item._id.month - 1],
          revenue: item.total
        }));

        // Recent students
        const recentStudents = await Student.find({ schoolId })
          .select('studentId firstName lastName class section admissionDate')
          .sort({ admissionDate: -1 })
          .limit(5);

        // Recent Activity (Merged)
        // 1. Fee Payments
        const recentFees = await StudentFee.find({ schoolId, status: 'paid' })
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate('studentId', 'firstName lastName class');

        // 2. New Admissions (already have recentStudents, but mapped differently)
        // 3. Notices
        const recentNotices = await Notice.find({ schoolId })
          .sort({ publishedDate: -1 })
          .limit(5)
          .populate('postedBy', 'firstName lastName');

        const activities = [
          ...recentFees.map(f => ({
            type: 'fee',
            user: f.studentId ? `${f.studentId.firstName} ${f.studentId.lastName}` : 'Unknown Student',
            action: 'paid fees',
            target: `₹${f.amount}`,
            time: f.updatedAt,
            avatar: f.studentId ? f.studentId.firstName[0] + f.studentId.lastName[0] : 'ST'
          })),
          ...recentStudents.map(s => ({
            type: 'admission',
            user: 'Admin',
            action: 'admitted',
            target: `${s.firstName} ${s.lastName}`,
            time: s.admissionDate,
            avatar: 'AD'
          })),
          ...recentNotices.map(n => ({
            type: 'notice',
            user: n.postedBy ? `${n.postedBy.firstName} ${n.postedBy.lastName}` : 'Admin',
            action: 'posted notice',
            target: n.title,
            time: n.publishedDate,
            avatar: 'NT'
          }))
        ];

        // Sort by time desc and take top 5
        const recentActivity = activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.json({
          stats: {
            totalStudents,
            totalTeachers,
            totalClasses, // Added
            pendingFees,
            monthlyRevenue
          },
          revenueTrend, // Added
          recentActivity, // Added
          recentStudents,
          notices: recentNotices.map(n => ({
            id: n._id,
            title: n.title,
            date: n.publishedDate,
            type: n.type
          })),
          role: 'school_admin'
        });
        break;

      case 'teacher':
        res.json({
          message: 'Teacher dashboard data',
          role: 'teacher',
          upcomingClasses: [],
          recentAttendance: []
        });
        break;

      case 'student':
        res.json({
          message: 'Student dashboard data',
          role: 'student',
          upcomingExams: [],
          feeStatus: {},
          attendance: {}
        });
        break;

      default:
        res.status(403).json({ error: 'Unknown user role' });
    }
  } catch (err) {
    console.error('Error in getDashboardData:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};