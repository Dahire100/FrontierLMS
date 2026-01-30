import type { UserRole } from "./auth-context"

export interface NavItem {
  label: string
  href: string
  icon?: string
  subItems?: NavItem[]
}

export const navigationByRole: Record<UserRole, NavItem[]> = {
  school_admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "My Profile", href: "/dashboard/admin/profile" },
    {
      label: "System Setting",
      href: "/dashboard/admin/system-setting",
      subItems: [
        { label: "Custom Columns", href: "/dashboard/admin/system-setting/custom-columns" },
        { label: "Document Master", href: "/dashboard/admin/system-setting/document-master" },
        { label: "Session Setting", href: "/dashboard/admin/system-setting/session-setting" },
        { label: "School Times", href: "/dashboard/admin/system-setting/school-times" },
        { label: "Referral Setting", href: "/dashboard/admin/system-setting/referral-setting" },
        { label: "Template Setting", href: "/dashboard/admin/system-setting/template-setting" },
        { label: "Staff Time Slots", href: "/dashboard/admin/system-setting/staff-time-slots" },
        { label: "Communication Setting", href: "/dashboard/admin/system-setting/communication-setting" },
        { label: "Biometric Setup", href: "/dashboard/admin/system-setting/biometric-setup" },
        { label: "Payment Setting", href: "/dashboard/admin/system-setting/payment-setting" },
        { label: "Front CMS Setting", href: "/dashboard/admin/system-setting/front-cms-setting" },
        { label: "Student Delete", href: "/dashboard/admin/system-setting/student-delete" },
        { label: "Users", href: "/dashboard/admin/system-setting/users" },
      ],
    },
    {
      label: "Human Resource",
      href: "/dashboard/admin/human-resource",
      subItems: [
        { label: "Staff Directory", href: "/dashboard/admin/human-resource/staff-directory" },
        { label: "Recruitment", href: "/dashboard/admin/human-resource/recruitment" },
        { label: "Staff Attendance", href: "/dashboard/admin/human-resource/staff-attendance" },
        { label: "Apply Leave", href: "/dashboard/admin/human-resource/apply-leave" },
        { label: "Approve Leave Request", href: "/dashboard/admin/human-resource/approve-leave-request" },
        { label: "Leave Type", href: "/dashboard/admin/human-resource/leave-type" },
        { label: "Leave Balance", href: "/dashboard/admin/human-resource/leave-balance" },
        { label: "Payroll", href: "/dashboard/admin/human-resource/payroll" },
        { label: "Staff Advance", href: "/dashboard/admin/human-resource/staff-advance" },
        { label: "Department", href: "/dashboard/admin/human-resource/department" },
        { label: "Designation", href: "/dashboard/admin/human-resource/designation" },
        { label: "Inactive Staff", href: "/dashboard/admin/human-resource/inactive-staff" },
        { label: "Task", href: "/dashboard/admin/human-resource/task" },
        { label: "Human Resource Reports", href: "/dashboard/admin/human-resource/human-resource-reports" },
      ],
    },
    {
      label: "Disciplinary",
      href: "/dashboard/admin/disciplinary",
      subItems: [
        { label: "Parameter", href: "/dashboard/admin/disciplinary/parameter" },
        { label: "Assessment", href: "/dashboard/admin/disciplinary/assessment" },
        { label: "Actions Taken", href: "/dashboard/admin/disciplinary/actions-taken" },
        { label: "Behaviour Log", href: "/dashboard/admin/disciplinary/behaviour-log" },
        { label: "Remarks", href: "/dashboard/admin/disciplinary/remarks" },
        { label: "Student Complaints", href: "/dashboard/admin/disciplinary/student-complaints" },
        { label: "Disciplinary Report", href: "/dashboard/admin/disciplinary/disciplinary-report" },
      ],
    },
    {
      label: "Academics",
      href: "/dashboard/admin/academics",
      subItems: [
        { label: "Class Time Table", href: "/dashboard/admin/academics/class-time-table" },
        { label: "Teacher Timetable", href: "/dashboard/admin/academics/teacher-timetable" },
        { label: "Daily Time Table", href: "/dashboard/admin/academics/daily-time-table" },
        { label: "Co-Curricular Subject", href: "/dashboard/admin/academics/co-curricular-subject" },
        { label: "Subject", href: "/dashboard/admin/academics/subject" },
        { label: "Assign Subjects", href: "/dashboard/admin/academics/assign-subjects" },
        { label: "Student Subjects", href: "/dashboard/admin/academics/student-subjects" },
        { label: "Assign Class Teacher", href: "/dashboard/admin/academics/assign-class-teacher" },
        { label: "Class", href: "/dashboard/admin/academics/class" },
        { label: "Section", href: "/dashboard/admin/academics/section" },
        { label: "Promote Students", href: "/dashboard/admin/academics/promote-students" },
        { label: "Academic Report", href: "/dashboard/admin/academics/academic-report" },
      ],
    },
    {
      label: "Lesson Planner",
      href: "/dashboard/admin/lesson-planner/lesson",
      subItems: [
        { label: "Lesson", href: "/dashboard/admin/lesson-planner/lesson" },
        { label: "Topic", href: "/dashboard/admin/lesson-planner/topic" },
        { label: "Manage Lesson Planner", href: "/dashboard/admin/lesson-planner/manage" },
        { label: "Lesson Planner Report", href: "/dashboard/admin/lesson-planner/report" },
        { label: "Topic Report", href: "/dashboard/admin/lesson-planner/topic-report" },
      ],
    },
    {
      label: "Attendance",
      href: "/dashboard/admin/attendance",
      subItems: [
        { label: "Student Attendance", href: "/dashboard/admin/attendance/student-attendance" },
        { label: "Daily Attendance", href: "/dashboard/admin/attendance/daily-attendance" },
        { label: "Monthly Attendance", href: "/dashboard/admin/attendance/monthly-attendance" },
        { label: "Class Attendance", href: "/dashboard/admin/attendance/class-attendance" },
        { label: "Consolidated Report", href: "/dashboard/admin/attendance/consolidated-report" },
        { label: "Attendance Register", href: "/dashboard/admin/attendance/attendance-register" },
        { label: "Student Leave", href: "/dashboard/admin/attendance/student-leave" },
        { label: "Leave Apply", href: "/dashboard/admin/attendance/leave-apply" },
        { label: "Leave Approve", href: "/dashboard/admin/attendance/leave-approve" },
        { label: "Leave Summary", href: "/dashboard/admin/attendance/leave-summary" },
        { label: "Attendance Report", href: "/dashboard/admin/attendance/attendance-report" },
        { label: "Export", href: "/dashboard/admin/attendance/export" },
      ],
    },
    {
      label: "Student Info",
      href: "/dashboard/admin/student-info",
      subItems: [
        { label: "Student Admission", href: "/dashboard/admin/student-info/student-admission" },
        { label: "Online Admission", href: "/dashboard/admin/student-info/online-admission" },
        { label: "Student Details", href: "/dashboard/admin/student-info/student-details" },
        { label: "Student Category", href: "/dashboard/admin/student-info/student-category" },
        { label: "House", href: "/dashboard/admin/student-info/house" },
        { label: "Student Referral", href: "/dashboard/admin/student-info/student-referral" },
        { label: "Inactive Students", href: "/dashboard/admin/student-info/inactive-students" },
        { label: "Link Siblings", href: "/dashboard/admin/student-info/link-siblings" },
        { label: "Student Update", href: "/dashboard/admin/student-info/student-update" },
        { label: "Student Reports", href: "/dashboard/admin/student-info/student-reports" },
        { label: "Student Promotion", href: "/dashboard/admin/student-info/student-promotion" },
      ]
    },
    {
      label: "Examinations",
      href: "/dashboard/admin/examinations",
      subItems: [
        { label: "Term List", href: "/dashboard/admin/examinations/term-list" },
        { label: "Exam List", href: "/dashboard/admin/examinations/exam-list" },
        { label: "Exam Schedule", href: "/dashboard/admin/examinations/exam-schedule" },
        { label: "Admit card", href: "/dashboard/admin/examinations/admit-card" },
        { label: "Marks Register", href: "/dashboard/admin/examinations/marks-register" },
        { label: "Co-Curricular Grade", href: "/dashboard/admin/examinations/co-curricular-grade" },
        { label: "Teacher Comment", href: "/dashboard/admin/examinations/teacher-remark" },
        { label: "Grade List", href: "/dashboard/admin/examinations/grade-list" },
        { label: "Division", href: "/dashboard/admin/examinations/division" },
        { label: "Attendance", href: "/dashboard/admin/examinations/attendance" },
        { label: "Report Card", href: "/dashboard/admin/examinations/report-card" },
        { label: "Examination Report", href: "/dashboard/admin/examinations/examination-report" },
      ],
    },
    {
      label: "Online Exam",
      href: "/dashboard/admin/online-exam",
      subItems: [
        { label: "Create Exam", href: "/dashboard/admin/online-exam/create-exam" },
        { label: "Conduct Exam", href: "/dashboard/admin/online-exam/conduct-exam" },
        { label: "Assign Exam", href: "/dashboard/admin/online-exam/assign-exam" },
        { label: "Question Bank", href: "/dashboard/admin/online-exam/question-bank" },
        { label: "Attempt Log", href: "/dashboard/admin/online-exam/attempt-log" },
        { label: "Auto Grading", href: "/dashboard/admin/online-exam/auto-grading" },
        { label: "Exam Report", href: "/dashboard/admin/online-exam/exam-reports" },
        { label: "Students Exam Report", href: "/dashboard/admin/online-exam/student-result" },
      ],
    },
    {
      label: "Online Class",
      href: "/dashboard/admin/online-class",
      subItems: [
        { label: "Class Schedule", href: "/dashboard/admin/online-class/class-schedule" },
        { label: "Class Join Link", href: "/dashboard/admin/online-class/class-join-link" },
        { label: "Teacher Timetable", href: "/dashboard/admin/online-class/teacher-timetable" },
        { label: "Attendee Tracking", href: "/dashboard/admin/online-class/attendee-tracking" },
        { label: "Attendees Report", href: "/dashboard/admin/online-class/attendees-report" },
        { label: "Past Class Logs", href: "/dashboard/admin/online-class/past-class-logs" },
      ],
    },
    {
      label: "Primary Evaluation",
      href: "/dashboard/admin/primary-evaluation/activity",
      subItems: [
        { label: "Activity", href: "/dashboard/admin/primary-evaluation/activity" },
        { label: "Assessment", href: "/dashboard/admin/primary-evaluation/assessment" },
        { label: "Evaluation Remark", href: "/dashboard/admin/primary-evaluation/evaluation-remark" },
        { label: "Primary Class Report", href: "/dashboard/admin/primary-evaluation/primary-class-report" },
      ],
    },
    {
      label: "Question Paper",
      href: "/dashboard/admin/question-paper/type",
      subItems: [
        { label: "Type", href: "/dashboard/admin/question-paper/type" },
        { label: "Question", href: "/dashboard/admin/question-paper/question" },
        { label: "Generate", href: "/dashboard/admin/question-paper/generate" },
      ],
    },
    {
      label: "Download Center",
      href: "/dashboard/admin/download-center/upload-content",
      subItems: [
        { label: "Upload Content", href: "/dashboard/admin/download-center/upload-content" },
        { label: "Assignments", href: "/dashboard/admin/download-center/assignments" },
        { label: "Study Material", href: "/dashboard/admin/download-center/study-material" },
        { label: "Syllabus", href: "/dashboard/admin/download-center/syllabus" },
        { label: "Other Downloads", href: "/dashboard/admin/download-center/other-downloads" },
        { label: "Videos", href: "/dashboard/admin/download-center/videos" },
        { label: "File Categories", href: "/dashboard/admin/download-center/file-categories" },
        { label: "Role Visibility", href: "/dashboard/admin/download-center/role-visibility" },
      ]
    },
    {
      label: "Report",
      href: "/dashboard/admin/report",
      subItems: [
        { label: "Manage Reports", href: "/dashboard/admin/report" },
        { label: "Transaction Report", href: "/dashboard/admin/report/transaction-report" },
        { label: "Activity Log", href: "/dashboard/admin/report/activity-log" },
        { label: "Document Availability", href: "/dashboard/admin/report/document-availability" },
        { label: "Lesson Planner Report", href: "/dashboard/admin/report/lesson-planner-report" },
        { label: "App Login Status", href: "/dashboard/admin/report/app-login-status" },
      ],
    },
    {
      label: "Front Office",
      href: "/dashboard/admin/front-office",
      subItems: [
        { label: "Admission Enquiry", href: "/dashboard/admin/front-office/admission-enquiry" },
        { label: "Enquiry Management", href: "/dashboard/admin/front-office/enquiry-management" },
        { label: "Visitors Book", href: "/dashboard/admin/front-office/visitors-book" },
        { label: "Visitor Log", href: "/dashboard/admin/front-office/visitor-log" },
        { label: "Phone Call Log", href: "/dashboard/admin/front-office/phone-call-log" },
        { label: "Postal Exchange", href: "/dashboard/admin/front-office/postal-exchange" },
        { label: "Postal Receive Dispatch", href: "/dashboard/admin/front-office/postal-receive-dispatch" },
        { label: "Complain", href: "/dashboard/admin/front-office/complain" },
        { label: "Complaint Register", href: "/dashboard/admin/front-office/complaint-register" },
        { label: "Setup Front Office", href: "/dashboard/admin/front-office/setup" },
        { label: "Gate Pass", href: "/dashboard/admin/front-office/gate-pass" },
        { label: "Entrance Examination Form", href: "/dashboard/admin/front-office/entrance-exam" },
      ]
    },
    {
      label: "Fees Collection",
      href: "/dashboard/admin/fees-collection",
      subItems: [
        { label: "Collect Fee", href: "/dashboard/admin/fees-collection/collect-fee" },
        { label: "Payment Receipt", href: "/dashboard/admin/fees-collection/payment-receipt" },
        { label: "Online Admission Fee", href: "/dashboard/admin/fees-collection/online-admission-fee" },
        { label: "Demand Notice", href: "/dashboard/admin/fees-collection/demand-notice" },
        { label: "Fees Carry Forward", href: "/dashboard/admin/fees-collection/fees-carry-forward" },
        { label: "Fee Discount", href: "/dashboard/admin/fees-collection/fee-discount" },
        { label: "Concessions & Waivers", href: "/dashboard/admin/fees-collection/concessions-waivers" },
        { label: "Fee Master", href: "/dashboard/admin/fees-collection/fee-master" },
        { label: "Fee Installments", href: "/dashboard/admin/fees-collection/fee-installments" },
        { label: "Fees Group", href: "/dashboard/admin/fees-collection/fees-group" },
        { label: "Fees Types", href: "/dashboard/admin/fees-collection/fees-types" },
        { label: "Fee Follow Up", href: "/dashboard/admin/fees-collection/fee-follow-up" },
        { label: "Defaulters List", href: "/dashboard/admin/fees-collection/defaulters-list" },
        { label: "Due Fee Report", href: "/dashboard/admin/fees-collection/due-fee-report" },
        { label: "Student Wise Fees", href: "/dashboard/admin/fees-collection/student-wise-fees" },
        { label: "Previous Year Balance", href: "/dashboard/admin/fees-collection/previous-year-balance" },
        { label: "Hostel Fees", href: "/dashboard/admin/fees-collection/hostel-fees" },
        { label: "Transport Fees", href: "/dashboard/admin/fees-collection/transport-fees" },
        { label: "Cheques", href: "/dashboard/admin/fees-collection/cheques" },
        { label: "Cheque Bounce", href: "/dashboard/admin/fees-collection/cheque-bounce" },
        { label: "Fees Reports", href: "/dashboard/admin/fees-collection/fees-reports" },
      ]
    },
    {
      label: "Income",
      href: "/dashboard/admin/income",
      subItems: [
        { label: "Add Income", href: "/dashboard/admin/income/add-income" },
        { label: "Search Income", href: "/dashboard/admin/income/search-income" },
        { label: "Income List", href: "/dashboard/admin/income/income-list" },
        { label: "Income Head", href: "/dashboard/admin/income/income-head" },
        { label: "Income Report", href: "/dashboard/admin/income/income-report" },
      ]
    },
    {
      label: "Expense",
      href: "/dashboard/admin/expense",
      subItems: [
        { label: "Add Expense", href: "/dashboard/admin/expense/add-expense" },
        { label: "Expense Search", href: "/dashboard/admin/expense/search-expense" },
        { label: "Expense List", href: "/dashboard/admin/expense/expense-list" },
        { label: "Expense Head", href: "/dashboard/admin/expense/expense-head" },
        { label: "Expense Report", href: "/dashboard/admin/expense/expense-report" },
        { label: "Voucher Tracking", href: "/dashboard/admin/expense/voucher-tracking" },
      ]
    },
    {
      label: "Inventory",
      href: "/dashboard/admin/inventory",
      subItems: [
        { label: "Item Master", href: "/dashboard/admin/inventory/item-master" },
        { label: "Item Store", href: "/dashboard/admin/inventory/item-store" },
        { label: "Item Supplier", href: "/dashboard/admin/inventory/item-supplier" },
        { label: "Item Set", href: "/dashboard/admin/inventory/item-set" },
        { label: "Add Item Stock", href: "/dashboard/admin/inventory/add-item-stock" },
        { label: "Issue Item", href: "/dashboard/admin/inventory/issue-item" },
        { label: "Sell Item", href: "/dashboard/admin/inventory/sell-item" },
        { label: "Sold Item Payment", href: "/dashboard/admin/inventory/sold-item-payment" },
        { label: "Stock In Out", href: "/dashboard/admin/inventory/stock-in-out" },
        { label: "Stock Reports", href: "/dashboard/admin/inventory/stock-reports" },
        { label: "Inventory Sales Report", href: "/dashboard/admin/inventory/inventory-sales-report" },
        { label: "Vendor Management", href: "/dashboard/admin/inventory/vendor-management" },
        { label: "Work Order", href: "/dashboard/admin/inventory/workorder" },
        { label: "Work Order Payment", href: "/dashboard/admin/inventory/workorder-payment" },
      ]
    },
    {
      label: "Library",
      href: "/dashboard/admin/library",
      subItems: [
        { label: "Book Catalog", href: "/dashboard/admin/library/book-catalog" },
        { label: "Book Issue", href: "/dashboard/admin/library/book-issue" },
        { label: "Book Return", href: "/dashboard/admin/library/book-return" },
        { label: "Book Reservation", href: "/dashboard/admin/library/book-reservation" },
        { label: "Book Availability", href: "/dashboard/admin/library/book-availability" },
        { label: "Student History", href: "/dashboard/admin/library/student-history" },
      ]
    },
    {
      label: "Transport",
      href: "/dashboard/admin/transport",
      subItems: [
        { label: "Routes", href: "/dashboard/admin/transport/routes" },
        { label: "Vehicles", href: "/dashboard/admin/transport/vehicles" },
        { label: "Drivers", href: "/dashboard/admin/transport/drivers" },
        { label: "Student Route Mapping", href: "/dashboard/admin/transport/student-route-mapping" },
        { label: "Fees", href: "/dashboard/admin/transport/fees" },
      ]
    },
    {
      label: "Hostel",
      href: "/dashboard/admin/hostel",
      subItems: [
        { label: "Hostel List", href: "/dashboard/admin/hostel/hostel-list" },
        { label: "Rooms", href: "/dashboard/admin/hostel/rooms" },
        { label: "Bed Allocation", href: "/dashboard/admin/hostel/bed-allocation" },
        { label: "Attendance", href: "/dashboard/admin/hostel/attendance" },
        { label: "Fees", href: "/dashboard/admin/hostel/fees" },
      ]
    },
    {
      label: "Certificate",
      href: "/dashboard/admin/certificate",
      subItems: [
        { label: "Templates", href: "/dashboard/admin/certificate/templates" },
        { label: "Bonafide", href: "/dashboard/admin/certificate/bonafide" },
        { label: "Character Certificate", href: "/dashboard/admin/certificate/character-certificate" },
        { label: "Transfer Certificate", href: "/dashboard/admin/certificate/transfer-certificate" },
        { label: "Issued", href: "/dashboard/admin/certificate/issued" },
        { label: "Verify", href: "/dashboard/admin/certificate/verify" },
      ]
    },
    { label: "Consent Letter", href: "/dashboard/admin/consent-letter" },
    {
      label: "Bank Info",
      href: "/dashboard/admin/bank-info",
      subItems: [
        { label: "Bank List", href: "/dashboard/admin/bank-info/bank-list" },
        { label: "Add Bank", href: "/dashboard/admin/bank-info/add-bank" },
        { label: "Passbook View", href: "/dashboard/admin/bank-info/passbook-view" },
      ]
    },
    {
      label: "Student Wallet",
      href: "/dashboard/admin/wallet",
      subItems: [
        { label: "Wallet Recharge", href: "/dashboard/admin/wallet/wallet-recharge" },
        { label: "Recharge History", href: "/dashboard/admin/wallet/recharge-history" },
        { label: "Wallet Transactions", href: "/dashboard/admin/wallet/wallet-transactions" },
      ]
    },
    {
      label: "Homework",
      href: "/dashboard/admin/homework",
      subItems: [
        { label: "Add Homework", href: "/dashboard/admin/homework/add-homework" },
        { label: "Homework Evaluation", href: "/dashboard/admin/homework/homework-evaluation" },
        { label: "Homework Report", href: "/dashboard/admin/homework/homework-report" },
        { label: "Teacher Remarks", href: "/dashboard/admin/homework/teacher-remarks" },
        { label: "Attachments", href: "/dashboard/admin/homework/attachments" },
      ]
    },
    {
      label: "Classwork",
      href: "/dashboard/admin/classwork",
      subItems: [
        { label: "Add Classwork", href: "/dashboard/admin/classwork/add-classwork" },
        { label: "Classwork Report", href: "/dashboard/admin/classwork/classwork-report" },
      ]
    },

    {
      label: "Communicate",
      href: "/dashboard/admin/communicate/notice-board",
      subItems: [
        { label: "Notice Board", href: "/dashboard/admin/communicate/notice-board" },
        { label: "School Diary", href: "/dashboard/admin/communicate/school-diary" },
        { label: "Send Email / SMS", href: "/dashboard/admin/communicate/send-email-sms" },
        { label: "Messages", href: "/dashboard/admin/communication" },
        { label: "Inbox", href: "/dashboard/admin/communication/inbox" },
        { label: "Sent Messages", href: "/dashboard/admin/communication/sent" },
        { label: "Compose Message", href: "/dashboard/admin/communication/compose" },
      ],
    },
    { label: "Settings", href: "/dashboard/admin/settings" },
    { label: "Notifications", href: "/dashboard/admin/notifications" },
    {
      label: "Front CMS",
      href: "/dashboard/admin/front-cms",
      subItems: [
        { label: "Events", href: "/dashboard/admin/front-cms/events" },
        { label: "Gallery", href: "/dashboard/admin/front-cms/gallery" },
        { label: "Notice", href: "/dashboard/admin/front-cms/notice" },
        { label: "Media Manager", href: "/dashboard/admin/front-cms/media-manager" },
        { label: "Pages", href: "/dashboard/admin/front-cms/pages" },
        { label: "Menus", href: "/dashboard/admin/front-cms/menus" },
        { label: "Banner Image", href: "/dashboard/admin/front-cms/banner-image" },
        { label: "Testimonials", href: "/dashboard/admin/front-cms/testimonials" },
      ]
    },
    {
      label: "Subscription",
      href: "/dashboard/admin/subscription",
      subItems: [
        { label: "Subscription Installment Report", href: "/dashboard/admin/subscription/installment-report" },
      ]
    },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard/teacher" },
    { label: "My Profile", href: "/dashboard/teacher/profile" },
    { label: "Front Office", href: "/dashboard/teacher/front-office" },
    { label: "Fee Collection", href: "/dashboard/teacher/fees" },
    { label: "Student Info", href: "/dashboard/teacher/student-info" },
    { label: "Attendance", href: "/dashboard/teacher/attendance" },
    { label: "Academics", href: "/dashboard/teacher/academics" },
    { label: "Examinations", href: "/dashboard/teacher/examinations" },
    { label: "Primary Evaluation", href: "/dashboard/teacher/evaluation" },
    { label: "Disciplinary", href: "/dashboard/teacher/disciplinary" },
    { label: "Lesson Planner", href: "/dashboard/teacher/lesson-planner" },
    { label: "H.W. / C.W.", href: "/dashboard/teacher/homework" },
    {
      label: "Communicate",
      href: "/dashboard/teacher/communicate",
      subItems: [
        { label: "Messages", href: "/dashboard/teacher/communication" },
        { label: "Compose Message", href: "/dashboard/teacher/communication/compose" },
      ]
    },
    {
      label: "Human Resource",
      href: "/dashboard/teacher/human-resource",
      subItems: [
        { label: "Apply Leave", href: "/dashboard/teacher/human-resource/apply-leave" },
        { label: "My Payroll", href: "/dashboard/teacher/human-resource/payroll" },
      ]
    },
    { label: "Event Management", href: "/dashboard/teacher/events" },
    { label: "Certificate", href: "/dashboard/teacher/certificate" },
    { label: "Consent Letter", href: "/dashboard/teacher/consent-letter" },
    { label: "Library", href: "/dashboard/teacher/library" },
    { label: "Inventory", href: "/dashboard/teacher/inventory" },
    { label: "Settings", href: "/dashboard/teacher/settings" },
    { label: "Notifications", href: "/dashboard/teacher/notifications" },
    { label: "Download Center", href: "/dashboard/teacher/download-center" },
    { label: "Online Exam", href: "/dashboard/teacher/online-exam" },
    { label: "Digital Notice Board", href: "/dashboard/teacher/notice-board" },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard/student" },
    { label: "My Profile", href: "/dashboard/student/profile" },
    { label: "Academics", href: "/dashboard/student/academics" },
    { label: "Class Timetable", href: "/dashboard/student/class-timetable" }, // Added
    { label: "Attendance", href: "/dashboard/student/attendance" }, // Added
    { label: "Fees & Payments", href: "/dashboard/student/fees" }, // Added
    { label: "H.W. / C.W.", href: "/dashboard/student/homework" },
    { label: "Download Center", href: "/dashboard/student/download-center" },
    { label: "My Documents", href: "/dashboard/student/documents" }, // Added
    { label: "Notice Board", href: "/dashboard/student/notice-board" }, // Added
    { label: "Online Exam", href: "/dashboard/student/online-exam" },
    { label: "Online Class", href: "/dashboard/student/online-class" },
    { label: "Examinations", href: "/dashboard/student/examinations" },
    { label: "Report", href: "/dashboard/student/report" },
    { label: "Library", href: "/dashboard/student/library" },
    { label: "Transport", href: "/dashboard/student/transport" },
    { label: "Hostel", href: "/dashboard/student/hostel" },
    { label: "Student Wallet", href: "/dashboard/student/wallet" },
    {
      label: "Communicate",
      href: "/dashboard/student/communicate",
      subItems: [
        { label: "Messages", href: "/dashboard/student/communication" },
        { label: "Compose Message", href: "/dashboard/student/communication/compose" },
      ]
    },
    { label: "Apply Leave", href: "/dashboard/student/leave-apply" },
    { label: "Notifications", href: "/dashboard/student/notifications" },
    { label: "Settings", href: "/dashboard/student/settings" },
  ],
  parent: [
    { label: "Dashboard", href: "/dashboard/parent" },
    { label: "My Profile", href: "/dashboard/parent/profile" },
    { label: "My Child's Profile", href: "/dashboard/parent/child-profile" },
    { label: "Fees Collection", href: "/dashboard/parent/fees" },
    { label: "Class Timetable", href: "/dashboard/parent/class-timetable" }, // Added
    { label: "Attendance", href: "/dashboard/parent/attendance" },
    { label: "Apply Leave", href: "/dashboard/parent/leave" }, // Added
    { label: "H.W. / C.W.", href: "/dashboard/parent/homework" },
    { label: "Report", href: "/dashboard/parent/report" },
    { label: "Examinations", href: "/dashboard/parent/examinations" },
    { label: "Library", href: "/dashboard/parent/library" }, // Added
    { label: "Transport", href: "/dashboard/parent/transport" },
    { label: "Hostel", href: "/dashboard/parent/hostel" }, // Added
    { label: "Download Center", href: "/dashboard/parent/download-center" }, // Added
    {
      label: "Communicate",
      href: "/dashboard/parent/communicate",
      subItems: [
        { label: "Messages", href: "/dashboard/parent/communication" },
        { label: "Compose Message", href: "/dashboard/parent/communication/compose" },
      ]
    },
    { label: "Consent Letter", href: "/dashboard/parent/consent-letter" },
    { label: "Digital Notice Board", href: "/dashboard/parent/notice-board" },
    { label: "Notifications", href: "/dashboard/parent/notifications" },
    { label: "Settings", href: "/dashboard/parent/settings" },
  ],
  "super_admin": [
    { label: "Dashboard", href: "/dashboard/super-admin" },
    { label: "Institute Management", href: "/dashboard/super-admin/institute-management" },
    { label: "SaaS Plan Management", href: "/dashboard/super-admin/saas-plans" },
    { label: "Billing & Invoicing", href: "/dashboard/super-admin/billing" },
    { label: "Support Tickets", href: "/dashboard/super-admin/support-tickets" },
    {
      label: "Communicate",
      href: "/dashboard/super-admin/communication",
      subItems: [
        { label: "Messages", href: "/dashboard/super-admin/communication" },
        { label: "Compose Message", href: "/dashboard/super-admin/communication/compose" },
      ]
    },
    { label: "Notifications", href: "/dashboard/super-admin/notifications" },
    { label: "Settings", href: "/dashboard/super-admin/settings" },
    { label: "Platform Settings", href: "/dashboard/super-admin/platform-settings" },
  ],
}
