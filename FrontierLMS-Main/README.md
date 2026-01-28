# 🚀 School ERP System

<div align="center">
  <p align="center">
    A modern, full-stack Enterprise Resource Planning (ERP) system built with Next.js, Express, and MongoDB.
    <br />
    <a href="#features"><strong>Explore Features »</strong></a>
    <br />
    <br />
    <a href="#getting-started">Getting Started</a>
    ·
    <a href="#tech-stack">Tech Stack</a>
    ·
    <a href="#deployment">Deployment</a>
    ·
    <a href="#contributing">Contributing</a>
  </p>
</div>

## ✨ Features

### 👨‍🏫 Teacher Portal
- **Dashboard** - Overview of classes, attendance, and tasks
- **Profile Management** - View and update personal information
- **Attendance** - Mark and track student attendance
- **Grading** - Record and manage student grades
- **Lesson Planning** - Create and manage lesson plans

### 🎒 Student Portal
- **Dashboard** - View schedule, grades, and attendance
- **Profile** - Personal information and academic records
- **Homework** - View and submit assignments
- **Examinations** - Check exam schedules and results

### 👪 Parent Portal
- **Dashboard** - Overview of children's performance
- **Child Profile** - Track academic progress
- **Attendance** - Monitor attendance records
- **Communication** - Message teachers and school staff

### 👨‍💼 Admin Portal
- **User Management** - Manage all user accounts
- **System Settings** - Configure school settings
- **Reports** - Generate and view reports
- **Data Management** - Import/export data

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm (v9.x or higher) or pnpm (v8.x or higher)

### Project Structure

```
ERP/
├── frontend/          # Next.js 14 application
│   ├── app/           # App router pages
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utility functions
│   └── public/        # Static assets
├── backend/           # Express + MongoDB API
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── models/        # MongoDB models
│   └── routes/        # API routes
└── README.md          # Project documentation
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/erp-system.git
   cd erp-system
   ```

2. **Set up the backend**
   ```bash
   cd backend
   cp .env.example .env  # Update with your MongoDB URI
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   cp .env.local.example .env.local  # Update API endpoints if needed
   npm install --legacy-peer-deps
   ```

### Running Locally

#### Development Mode

1. **Start the backend server** (from `/backend`)
   ```bash
   npm run dev
   ```
   > Runs on http://localhost:5000

2. **Start the frontend development server** (from `/frontend`)
   ```bash
   npm run dev
   ```
   > Open http://localhost:3000 in your browser

#### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start in production mode**
   ```bash
   npm run start
   ```

## 🔧 Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME="School ERP"
# Add other frontend environment variables here
```

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/erp_system
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
# Add other backend environment variables here
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Testing**: Jest + React Testing Library

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **API Documentation**: Swagger/OpenAPI

## 📦 Dependencies

### Key Frontend Dependencies
- `next`: 14.x
- `react`: 19.x
- `tailwindcss`: 3.x
- `shadcn/ui`: Latest
- `lucide-react`: Latest
- `framer-motion`: Latest
- `react-hook-form`: Latest

### Key Backend Dependencies
- `express`: 4.x
- `mongoose`: 8.x
- `jsonwebtoken`: 9.x
- `bcryptjs`: 2.x
- `cors`: 2.x
- `dotenv`: 16.x

## 🚀 Deployment

### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=YOUR_REPO_URL)

1. Connect your GitHub repository
2. Set up environment variables
3. Deploy!

### Railway (Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=YOUR_RAILWAY_TEMPLATE)

1. Connect your repository
2. Add MongoDB add-on
3. Set environment variables
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/erp-system](https://github.com/yourusername/erp-system)

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
