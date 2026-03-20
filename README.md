# Evantor

Evantor is a full-stack event platform for discovering events, purchasing tickets, and managing organizer workflows.

It includes role-based dashboards for:
- Host
- Team Lead
- Ticketer
- Admin

The app uses a React + Vite frontend and a Node.js + Express + MongoDB backend.

## Features

### Public and attendee features
- Browse and filter events
- Event modal with ticket tier selection
- Checkout flow and ticket purchase
- My Tickets page with real QR rendering
- About, Privacy, and Terms pages

### Host dashboard
- Create events (including image upload and ticket tiers)
- Request services by sector (Decoration, DJ, Food, Photographers, Travels)
- Track service request pipeline and budget summary

### Team Lead dashboard
- View sector-based service requests
- Schedule host meetings
- Issue invoices and quotes

### Ticketer analytics dashboard
- Ticket sales KPIs
- Revenue and ticket charts
- Event-level sales breakdown with sorting and row limits

### Admin dashboard
- Platform KPIs and charts
- Advanced user and role management
- Filter/search/sort user table
- Change user roles and assign sectors
- Remove users (with safety guards)

## Tech Stack

### Frontend
- React 19
- React Router
- Axios
- Recharts
- qrcode.react
- Vite

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT auth with cookie-based sessions
- Multer (image upload)

## Project Structure

```
Evantor/
	client/   # React + Vite frontend
	server/   # Express + MongoDB backend
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or cloud)

## Environment Variables

Create a file at `server/.env`:

```env
PORT=5000
NODE_ENV=development
DB_URI=mongodb://127.0.0.1:27017/evantor
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Installation

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

## Run Locally

Start backend (Terminal 1):

```bash
cd server
npm start
```

Start frontend (Terminal 2):

```bash
cd client
npm run dev
```

App URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Scripts

### Frontend (`client/package.json`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (`server/package.json`)
- `npm start` - Start server with nodemon

## API Overview

Base URL: `/api`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/logout`
- `GET /auth/me`
- `PUT /auth/profile`
- `POST /auth/verify-email`

### Events and tickets
- `GET /events`
- `GET /events/:id`
- `POST /tickets`
- `GET /tickets/my-tickets`

### Role dashboards
- Host: `/host/*`
- Team Lead: `/team-lead/*`
- Ticketer: `/ticketer/*`
- Admin: `/admin/*`

## Role Notes

- Default role is `host`.
- Available roles: `host`, `ticketer`, `team_lead`, `admin`.
- Team leads can be assigned a service sector.
- Admin routes are protected and include user deletion safeguards:
	- Cannot remove own account
	- Cannot remove the last admin account

## License

This project is licensed under the license in [LICENSE](LICENSE).
