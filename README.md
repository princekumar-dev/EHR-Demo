# EHR Demo Platform

A full-stack Electronic Health Record demo featuring role-based dashboards for patients, doctors, and administrators. The stack combines an Express.js + MongoDB API with a Next.js frontend styled as a modern clinical operations console.

## Features
- JWT authentication with patient, doctor, and admin roles
- Patient portal for profile management, appointment booking, and prescription downloads
- Doctor workspace for schedule management, visit notes, and prescription issuance
- Admin console for user management and appointment analytics
- Appointment status lifecycle (pending, confirmed, completed, cancelled) with double-booking prevention
- Prescription PDF export via PDFKit
- Swagger docs, Postman collection, seed data, and ER diagram for rapid onboarding

## Project Structure
```
backend/    # Express API + MongoDB models
frontend/   # Next.js dashboard UI
scripts/    # Seed utilities (within backend/scripts)
docs/       # ER diagram and endpoint list
```

## Prerequisites
- Node.js 18+
- MongoDB 6+

## Quick Start
1. Copy environment defaults:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start MongoDB (local or via Docker Compose).
3. Install dependencies:
   ```bash
   (cd backend && npm install)
   (cd frontend && npm install)
   ```
4. Seed demo data:
   ```bash
   (cd backend && npm run seed)
   ```
5. Run the services:
   ```bash
   (cd backend && npm run dev)    # API on http://localhost:5000
   (cd frontend && npm run dev)   # UI on http://localhost:3000
   ```

## Docker Compose
```bash
docker-compose up --build
```
This provisions MongoDB, the Express API, and the Next.js frontend.

## Environment Variables
Key variables are mirrored in `.env.example`, `backend/.env.example`, and `frontend/.env.example`:
- `MONGO_URI` – MongoDB connection string
- `MONGO_DB_NAME` - (optional) database name override. If set, the backend will connect to the named database instead of using the database encoded in `MONGO_URI`. Use this to keep your app data separate from other databases (e.g., `msec_connect`).
- `JWT_SECRET` – signing key for access tokens
- `JWT_EXPIRES_IN` – token lifetime
- `NEXT_PUBLIC_API_BASE_URL` – frontend API origin (e.g., `http://localhost:5000`)

## API Documentation
- Swagger UI: `http://localhost:5000/api/docs`
- Postman collection: `backend/src/docs/postman-collection.json`
- Endpoint summary: `docs/api-endpoints.md`

## Seed Data
The seed script (`backend/scripts/seed.js`) provisions:
- Admin: `admin@ehr.demo` / `Password123`
- Doctors: `j.wilson@ehr.demo`, `l.cuddy@ehr.demo`
- Patients: `john.doe@ehr.demo`, `jane.smith@ehr.demo`
- Sample appointment and prescription linking the demo users

## PDF Export Script
Prescription PDFs are generated through the `/api/prescriptions/:id/pdf` endpoint using `backend/src/utils/pdfGenerator.js`. The frontend triggers authenticated downloads in the patient dashboard.

## ER Diagram
See `docs/er-diagram.md` for a mermaid diagram covering Users, Appointments, and Prescriptions.

## Linting
- Backend: `cd backend && npm run lint`
- Frontend: `cd frontend && npm run lint`

## Testing & Verification
- Confirm API health: `curl http://localhost:5000/api/health`
- Validate patient login and dashboard flows via `http://localhost:3000`

## Deployment
The frontend is optimized for Vercel deployment. Set `NEXT_PUBLIC_API_BASE_URL` to your deployed API endpoint. A sample production command is provided:
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-9a46f808
```
Ensure the Express API is reachable from the deployed frontend (e.g., via a hosted MongoDB + API environment).

## Notes
- Email notifications are stubbed through `console.log` in `emailService.js`
- Double booking prevention is implemented with both application logic and a compound index on appointments
- Audit metadata (`createdAt`, `updatedAt`, `createdBy`) is automatically maintained by Mongoose timestamps + controller logic
