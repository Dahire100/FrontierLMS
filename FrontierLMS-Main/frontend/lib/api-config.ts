/**
 * API Configuration
 * Centralized API URL configuration for all fetch requests
 */

// Get API URL from environment variable
// In production (Vercel), if empty, it will use relative paths (same origin)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://127.0.0.1:5000');

// API endpoint builder helper
export const getApiUrl = (endpoint: string) => {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_URL}${path}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    SCHOOL_LOGIN: '/api/auth/school-login',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  // OTP
  OTP: {
    SEND: '/api/otp/send-otp',
    VERIFY: '/api/otp/verify-otp',
    RESEND: '/api/otp/resend-otp',
  },
  // Schools
  SCHOOLS: {
    REGISTER: '/api/schools/register',
    ACTIVE: '/api/schools/active',
    LIST: '/api/schools',
  },
  // Dashboard
  DASHBOARD: '/api/dashboard',

  // Students
  STUDENTS: '/api/students',

  // Teachers
  TEACHERS: '/api/teachers',
  TEACHER_PORTAL: {
    CLASSES: '/api/teacher/classes',
    ATTENDANCE: '/api/teacher/attendance',
    EXAMS: '/api/teacher/exams',
  },

  // Parent
  PARENT: {
    DASHBOARD: '/api/parent/dashboard',
    PROFILE: '/api/parent/profile',
  },

  // Classes & Subjects
  CLASSES: '/api/classes',
  SECTIONS: '/api/sections',
  SUBJECTS: '/api/subjects',

  // Fees
  FEES: {
    BASE: '/api/fees',
    GROUPS: '/api/fees/groups',
    TYPES: '/api/fees/types',
    MASTERS: '/api/fees/masters',
    DISCOUNTS: '/api/fees/discounts',
    COLLECT: '/api/fees/collect',
    DUE_REPORT: '/api/fees/due-report',
    SUMMARY: '/api/fees/summary',
  },

  // Attendance
  ATTENDANCE: '/api/attendance',

  // Exams
  EXAMS: '/api/exams',

  // Homework
  HOMEWORK: '/api/homework',

  // Notices
  NOTICES: '/api/notices',

  // Communication
  MESSAGES: '/api/messages',

  // Library
  LIBRARY: '/api/library',

  // Transport
  TRANSPORT: '/api/transport',

  // Hostel
  HOSTEL: '/api/hostel',

  // Certificates
  CERTIFICATES: '/api/certificates',

  // Front Office
  FRONT_OFFICE: {
    SETUP: '/api/front-office-setup',
    VISITORS: '/api/visitors',
    VISITOR_LOG: '/api/visitors',
    GATE_PASS: '/api/gate-pass',
    PHONE_LOGS: '/api/phone-call-log',
    POSTAL: '/api/postal-exchange',
    POSTAL_RECEIVE_DISPATCH: '/api/postal-receive-dispatch',
  },

  // Admission & Enquiry
  ADMISSION_ENQUIRY: '/api/admission-enquiry',
  ENQUIRY: '/api/admission-enquiry',
  ENTRANCE_EXAM: '/api/entrance-exam',

  // Complaints
  COMPLAINT: '/api/complaints',
  COMPLAINT_REGISTER: '/api/complaints',

  // Finance
  EXPENSES: {
    BASE: '/api/expenses',
    SEARCH: '/api/expenses/search',
    STATS: '/api/expenses/stats',
    HEADS: '/api/expense-heads',
    VOUCHER_SETTINGS: '/api/voucher-settings',
  },
  INCOME: {
    BASE: '/api/income',
    STATS: '/api/income/stats',
    SEARCH: '/api/income/search',
    HEADS: '/api/income-heads'
  },
  BANK_ACCOUNTS: '/api/bank-accounts',

  // Academic
  TIMETABLE: '/api/timetable',
  LESSON_PLANNER: '/api/lesson-planner',
  CLASSWORK: '/api/classwork',
  ONLINE_CLASSES: '/api/online-classes',
  STUDY_MATERIAL: '/api/study-material',

  // Download Center
  DOWNLOAD_CONTENT: '/api/download-content',
  SYLLABI: '/api/syllabi',
  VIDEOS: '/api/videos',
  FILE_CATEGORIES: '/api/file-categories',

  // HR
  STAFF: '/api/staff',

  // Leave
  LEAVE_REQUESTS: '/api/leave-requests',

  // Discipline
  COMPLAINTS: '/api/complaints',
  DISCIPLINARY: '/api/disciplinary',

  // CMS & Settings
  CMS: '/api/cms',
  SUBSCRIPTION: '/api/subscription',
  EVENTS: '/api/events',
  SETTINGS: '/api/settings',

  // Super Admin
  SUPER_ADMIN: '/api/super-admin',

  // Reports
  REPORTS: {
    TRANSACTIONS: '/api/reports/transactions',
    ACTIVITY_LOG: '/api/reports/activity-log',
    DOCUMENT_AVAILABILITY: '/api/reports/document-availability',
    LESSON_PLANNER: '/api/reports/lesson-planner',
    APP_LOGIN_STATUS: '/api/reports/app-login-status',
  },
};

// Helper function to create authenticated headers
export const getAuthHeaders = (token?: string | null) => {
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

// Fetch wrapper with automatic token handling
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    // Log response status for debugging
    console.log(`[API] ${options.method || 'GET'} ${endpoint}:`, response.status);

    return response;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
};

export default API_URL;
