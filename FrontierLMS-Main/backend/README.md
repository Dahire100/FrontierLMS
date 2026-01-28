# Frontiar ERP Backend

This is a starter backend for the Frontiar LMS ERP frontend. It's an Express + MongoDB API with JWT authentication.

Features included:
- Express server scaffold
- MongoDB (Mongoose) connection
- JWT authentication (register/login/me)
- Example Student model and CRUD routes (protected)
- Dockerfile and docker-compose to run MongoDB + backend locally

Quick start (Windows PowerShell)

1) Copy `.env.example` to `.env` and update values.

2) Install dependencies:

```powershell
cd backend
npm ci
```

3) Start server locally:

```powershell
# dev (hot reload)
npm run dev
# or production
npm run start
```

4) Or use Docker Compose (starts mongo + backend):

```powershell
docker compose up --build
```

API endpoints (examples):
- POST /api/auth/register  { name, email, password, role }
- POST /api/auth/login     { email, password }
- GET  /api/auth/me        (Authorization: Bearer <token>)
- CRUD students under /api/students (all routes require Bearer token)

Integration with Next.js frontend
- Update your frontend to call the backend endpoints (e.g., http://localhost:4000/api/auth/login)
- Store the JWT returned from login in secure storage (cookies or localStorage depending on your needs)
- Use the `/api/auth/me` endpoint to resolve current user session on the frontend

Next steps you might want me to implement:
- Role-based access control and permissions
- More domain models: Teachers, Classes, Fees, Exams, Notifications
- File uploads (student photos, documents)
- Automated tests and CI
