# API Endpoints

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`

## Users (Admin)
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Appointments
- `POST /api/appointments`
- `GET /api/appointments`
- `PATCH /api/appointments/:id/status`
- `GET /api/appointments/analytics/summary`

## Prescriptions
- `POST /api/prescriptions`
- `GET /api/prescriptions`
- `GET /api/prescriptions/:id`
- `GET /api/prescriptions/:id/pdf`
