# UniAssist AI – University Student Support System

UniAssist AI is a complete, modern, responsive, and functional full-stack web application designed for university student support. It features a Grounded RAG AI Chatbot, automated Support Ticket Escalation, real-time Socket.IO live messaging, WhatsApp Business Cloud API webhook integration, and an Executive Management Dashboard with Recharts and CSV exports.

---

## 🌟 Key Features

1. **24/7 AI-Powered Chatbot**:
   - Grounded RAG engine over university FAQs and Knowledge Base documents.
   - Quick reply pills for 12 core query categories (Admissions, Fees, Exams, Attendance, Timetable, Courses, Scholarships, Hostel, Library, Transport, Tech Support, Contact Depts).
   - Anti-hallucination guardrails and prompt injection protections.
   - Low confidence fallback to ticket creation ("I couldn't verify the answer...").

2. **Human Support & Ticket Escalation**:
   - 6 Ticket Statuses: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_STUDENT`, `RESOLVED`, `CLOSED`.
   - 8 University Support Departments: Admissions, Accounts & Fees, Exam Cell, Academic, Student Affairs, Hostel Admin, IT Helpdesk, General Support.
   - Support Agent Workbench with real-time Socket.IO chat, internal notes, and SLA response time tracking.

3. **WhatsApp Business Cloud API Integration**:
   - Webhook verification (`/api/whatsapp/webhook`).
   - Inbound event processing with deduplication check.
   - Interactive WhatsApp Webhook simulator for testing in admin panel.

4. **Admin & Management Dashboard**:
   - Analytics with Recharts (query trends, website vs. WhatsApp split, top FAQs).
   - Metrics: Auto-resolution rate %, Escalation rate %, CSAT rating.
   - CSV Exporter for ticket logs and student feedback reports.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Socket.io-client.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.IO, JWT Auth, Zod validation, Vitest.
- **Database**: PostgreSQL / SQLite (for zero-config out-of-the-box local testing).

---

## 🔑 Instant Demo Accounts

You can log in immediately using the pre-seeded demo accounts:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@university.edu` | `Password123!` | Ask bot, view personal tickets, lodge support ticket |
| **Support Agent** | `admissions.agent@university.edu` | `Password123!` | View queue, reply in real-time, update ticket status |
| **Administrator** | `admin@university.edu` | `Password123!` | Executive analytics, FAQ CRUD, team manager, WhatsApp setup |

---

## 🛠️ Installation & Setup Instructions

### 1. Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### 2. Clone & Install Dependencies
```bash
cd uniassist-ai
npm run install:all
```

### 3. Database Initialization & Seed
The application is pre-configured with SQLite for zero-config local testing.
```bash
# Push database schema and seed sample data
npm run db:push
npm run db:seed
```

*(For PostgreSQL in production, set `DATABASE_URL` in `server/.env` to `postgresql://user:pass@host:5432/dbname` and run `npx prisma db push`).*

### 4. Start Development Servers
```bash
# Starts Express server on port 5000 and Vite React dev server on port 5173
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the Vitest test suite covering RAG answer routing, prompt injection guardrails, and WhatsApp webhook deduplication:

```bash
npm run test
```

---

## 📱 WhatsApp Business Cloud API Setup

1. Go to the Meta Developer Portal and create a WhatsApp App.
2. Set the Webhook Callback URL to: `https://your-domain.com/api/whatsapp/webhook`
3. Set the Webhook Verify Token to match `WHATSAPP_VERIFY_TOKEN` in `server/.env` (default: `uniassist_whatsapp_verify_token_2026`).
4. Enter your `WHATSAPP_PHONE_NUMBER_ID` and Graph API `WHATSAPP_ACCESS_TOKEN` in `server/.env` or via the Admin WhatsApp Settings Page.

---

## 🚢 Deployment Guide

- **Frontend (Vercel)**: Build directory `client/dist`. Configure environment variable `VITE_API_BASE_URL` pointing to backend server URL.
- **Backend (Node.js / Railway / Render)**: Deploy `server/` directory, set environment variables from `.env.example`, and attach a PostgreSQL database.
