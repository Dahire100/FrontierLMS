# Project Information & Login Guide

## 🚀 Project Overview
**Name:** School ERP System (Frontier LMS)
**Description:** A modern, full-stack Enterprise Resource Planning (ERP) system designed for educational institutions to manage administrative operations, academic activities, and communication between stakeholders.

### 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, OTP-based login

---

## ✨ Features by Module

### 1. 🛡️ Super Admin Portal
- Manage multiple schools
- System-wide settings and configuration
- School registration approval

### 2. 👨‍💼 School Admin Portal
- **Front Office:** Postal exchange, visitor log, setup
- **User Management:** Manage teachers, students, and parents
- **Academic:** Class/Section management, subject assignment
- **Finance:** Fee collection, expense management
- **Reports:** Generate comprehensive reports

### 3. 👨‍🏫 Teacher Portal
- **Dashboard:** Overview of classes and tasks
- **Attendance:** Mark and track student attendance
- **Grading:** Record and manage student grades
- **Lesson Planning:** Create and manage lesson plans
- **Homework:** Assign and review homework

### 4. 👨‍👩‍👧 Parent Portal
- **Dashboard:** Overview of child's performance
- **Progress Tracking:** View grades, attendance, and remarks
- **Fee Status:** Check fee payment status
- **Communication:** Message teachers and school staff

### 5. 🎓 Student Portal
- **Dashboard:** View schedule, grades, and upcoming events
- **Homework:** Submit assignments
- **Examinations:** Check exam schedules and results
- **Attendance:** View personal attendance records

---

## 🔐 Login Information

**Login URL:** `http://localhost:3000/login`
**Authentication Method:** Role Selection + Email + OTP (One-Time Password)

### available Roles & Example Credentials

| Role | Email Pattern | Access Scope | Password |
|------|---------------|--------------|----------|
| **Super Admin** | `superadmin@frontierlms.com` | Full System Access | `FrontierLMS@2025!SuperAdmin` |


> **Note:** In Development Mode, the OTP is displayed in the browser console or the UI itself. In Production, it is sent via email.

---

## 🔄 User Login Flow

The system uses a **universal login portal** where the flow adapts based on the selected role.

### Step-by-Step Process

1.  **Navigate to Portal**
    - Go to `http://localhost:3000/login`.

2.  **Select Role**
    - Users are presented with a role selection screen.
    - Choose one of: `Super Admin`, `School Admin`, `Teacher`, `Parent`, or `Student`.

3.  **Enter Credentials**
    - Enter the registered **Email Address**.
    - Click **Password**.

4.  **Verify OTP**
    - **Dev Mode:** Check the browser console or the UI popup for the 6-digit code.
    - **Prod Mode:** Check your email inbox.
    - Enter the 6-digit code into the verification field.
    - Click **"Verify & Login"**.

5.  **Access Dashboard**
    - Upon successful verification, the system redirects to the specific dashboard for that role:
        - Super Admin: `/dashboard/super-admin`
        - School Admin: `/dashboard/admin`
        - Teacher: `/dashboard/teacher`
        - Student: `/dashboard/student`
        - Parent: `/dashboard/parent`

### Troubleshooting Login
- **Wrong Role:** If you selected the wrong role, click "Change" to go back to the selection screen.
- **OTP Not Received:** In dev mode, check the server terminal or browser console. In prod, check spam folders.
- **Backend Status:** Ensure the backend server (`npm run dev` in `/backend`) is running on port 5000.
