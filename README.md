# 🏨 HostelHub — Hostel Management System

A full-stack hostel management system with role-based access for **Admin**, **Warden**, and **Student** users.

## Tech Stack
- **Frontend**: React 19, Vite, Recharts, Framer Motion
- **Backend**: Node.js, Express 5, JWT Authentication
- **Database**: MongoDB with Mongoose

## Features
- 🔐 Role-based authentication (Admin / Warden / Student)
- 🏠 Room management with allocation/deallocation
- 💰 Fee tracking and payment management
- 📋 Complaint submission and resolution
- 🍽️ Weekly meal schedule management
- 🔔 Notification system with broadcasting
- 🌓 Dark/Light theme toggle
- 📊 Dashboard analytics with charts

## Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | admin123 |
| Warden | warden@hostel.com | warden123 |
| Student | student1@hostel.com | student123 |

## Local Development

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

## Deployment
- **Backend**: Render (Web Service)
- **Frontend**: Vercel
- **Database**: MongoDB Atlas (Free M0)
