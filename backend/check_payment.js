const mongoose = require('mongoose');
const WorkOrder = require('./src/models/WorkOrder');
const WorkOrderPayment = require('./src/models/WorkOrderPayment');
const Vendor = require('./src/models/Vendor');
const School = require('./src/models/School');
const User = require('./src/models/User');

const MONGO_URI = "mongodb+srv://devendrarahire20_db_user:ISRA1bTsSF8qjd3i@cluster0.scigfb2.mongodb.net/";

async function runCheck() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        // 1. Find ANY User first
        const user = await User.findOne();
        if (!user) throw new Error("No user found in DB");
        console.log("User found:", user.firstName, "ID:", user._id);

        let schoolId = user.schoolId;
        if (!schoolId) {
            // Fallback find a school
            const school = await School.findOne();
            if (school) schoolId = school._id;
        }
        if (!schoolId) throw new Error("No school ID found for user or in DB");
        console.log("School ID:", schoolId);

        // 2. Find or Create Vendor
        let vendor = await Vendor.findOne({ schoolId: schoolId });
        if (!vendor) {
            console.log("No vendor found, creating mock vendor...");
            vendor = new Vendor({
                schoolId,
                vendorName: "Mock Vendor",
                vendorCode: "MOCK-001",
                phone: "1234567890",
                email: "mock@vendor.com",
                address: "123 Mock St",
                active: true
            });
            await vendor.save();
        }
        console.log("Vendor found:", vendor.vendorName, "ID:", vendor._id);

        // 3. Create a Dummy Work Order with items
        console.log("Creating Test Work Order...");
        const wo = new WorkOrder({
            schoolId: schoolId,
            workOrderNumber: `TEST-WO-${Date.now()}`,
            title: "Test Order for Payment Check",
            vendor: vendor._id,
            workType: "supply",
            grandTotal: 1000,
            subtotal: 1000,
            createdBy: user._id,
            items: [{
                description: "Test Item",
                rate: 1000,
                amount: 1000
            }]
        });

        try {
            await wo.save();
            console.log("Work Order Created:", wo.workOrderNumber, "ID:", wo._id);
        } catch (e) {
            console.error("Work Order Save Failed:", e.message);
            // If validation fails here, we can't proceed
            return;
        }

        // 4. Simulate Payment Creation Payload
        const payload = {
            workOrder: wo._id,
            amount: 500,
            paymentNumber: `PAY-TEST-${Date.now()}`, // My backend controller fix should assume this is passed
            vendor: vendor._id,
            paymentType: 'partial',
            paymentMethod: 'cash',
            netAmount: 500,
            paymentDate: new Date(),
            notes: "Test Payment Script",
            status: 'completed'
        };

        console.log("Attempting to create Payment...");

        const payment = new WorkOrderPayment({
            ...payload,
            schoolId: schoolId,
            processedBy: user._id
        });

        await payment.save();
        console.log("✅ Payment Saved Successfully:", payment.paymentNumber);

        // 5. Verify Work Order Updated (Manual logic simulation since controller does this)
        // Note: The script implies simply saving the Payment model doesn't trigger Controller logic.
        // The Controller logic manually updates the WorkOrder. 
        // So checking the DB state here won't show the update unless I basically Run the controller code.
        // BUT, the goal is to see if `WorkOrderPayment.save()` throws an error (e.g. strict schema validation).

    } catch (error) {
        console.error("❌ CHECK FAILED:", error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error [${key}]:`, error.errors[key].message);
            });
        }
    } finally {
        await mongoose.disconnect();
    }
}

runCheck();
