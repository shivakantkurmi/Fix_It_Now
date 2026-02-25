# FixItNow

A full-stack civic issue reporting platform that enables citizens to report local infrastructure problems and allows administrators to manage, track, and resolve them in real time. havig the functionality of govt schemes so that rural people will be aware of any new scheme from a single point of access as well as all local services like bank, aadhar kendra etc also been added.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Authentication & Authorization Flow](#authentication--authorization-flow)
- [Frontend Architecture](#frontend-architecture)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Deployment](#deployment)

---

## Overview

FixItNow is a two-sided web application:

- **Citizens** can register, report civic issues (potholes, garbage, street lights, water leakage, electricity faults), attach photos, and share their GPS location. They can track the status of their own submissions and receive feedback when resolved.
- **Administrators** see all reported issues across the city, update statuses, upload resolution evidence, and view analytics dashboards with category breakdowns and average resolution times.

Resolved issues are automatically purged from the database after **24 hours** via a server-side cleanup job, keeping the data lean and relevant.

---

## Screenshots


### Landing Page

![Landing Page](docs/screenshots/landing.png)

*Public home page introducing FixItNow with a call-to-action to register or log in.*

---

### Login / Register

![Auth Page](docs/screenshots/auth.png)

*Authentication page with Login and Register tabs. Includes Google reCAPTCHA bot protection.*

---

### Citizen Dashboard

![Citizen Dashboard](docs/screenshots/citizen-dashboard.png)

*Citizens can view all their submitted issues, see live status updates (Pending / In Progress / Resolved / Rejected), and leave feedback once an issue is resolved.*

---

### Report an Issue

![Report Issue](docs/screenshots/report-issue.png)

*Issue submission form — select category, attach a photo (up to 15 MB), and capture GPS location with one click. Address is auto-filled via reverse geocoding.*

---

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

*Admin view showing analytics cards (total / resolved / pending issues, average resolution time), category breakdown, and the paginated issue list with status controls.*

---

### Admin — Update Issue Status

![Admin Status Update](docs/screenshots/admin-status-update.png)

*Admins can change issue status to In Progress, Resolved, or Rejected and upload photographic resolution evidence.*

---

### Government Schemes & Facilities

![Info Schemes](docs/screenshots/info-schemes.png)

*Info hub listing government schemes (eligibility, benefits, website) and local facilities (address, contact, operating hours), filterable by type and region.*

---

## Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| Frontend     | React 19, Vite 7, Tailwind CSS 3, Framer Motion, Lucide React |
| Backend      | Node.js, Express 5                                      |
| Database     | MongoDB (via Mongoose 9)                                |
| Auth         | JWT (jsonwebtoken), bcryptjs                            |
| Image Upload | Base64 encoding stored directly in MongoDB (up to 15 MB) |
| Geolocation  | Browser Geolocation API + Nominatim (OpenStreetMap) reverse geocoding |
| Notifications| react-hot-toast                                         |
| Bot Protection | react-google-recaptcha                               |
| Deployment   | Vercel (both Frontend and Backend)                      |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                              │
│   React SPA (Vite)                                           │
│   ┌──────────┐  ┌────────────────┐  ┌──────────────────┐    │
│   │ AuthPage │  │ CitizenDashboard│  │  AdminDashboard  │    │
│   └──────────┘  └────────────────┘  └──────────────────┘    │
│   ┌──────────────┐  ┌────────────┐  ┌──────────────────┐    │
│   │ ReportIssue  │  │ InfoSchemes│  │   LandingPage    │    │
│   └──────────────┘  └────────────┘  └──────────────────┘    │
│                                                              │
│   State: React useState / localStorage (JWT persistence)     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS  (Bearer JWT)
                            │ JSON REST API
┌───────────────────────────▼─────────────────────────────────┐
│                     BACKEND  (Express 5)                     │
│                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│   │ /api/auth   │  │ /api/issues │  │ /api/analytics     │  │
│   └─────────────┘  └─────────────┘  └────────────────────┘  │
│   ┌─────────────┐                                            │
│   │ /api/info   │      JWT Middleware (protect / admin)      │
│   └─────────────┘                                            │
│                                                              │
│   Scheduled Job: cleanupResolvedIssues (every 24 h)         │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼─────────────────────────────────┐
│                    MongoDB Atlas                              │
│                                                              │
│   Collections:  users  │  issues  │  infos                   │
└─────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
Browser → fetch() with Bearer token
    → Express CORS check
    → express.json() parser (≤15 MB)
    → Route handler
        → protect middleware (JWT verify → attach req.user)
        → [admin middleware if admin-only route]
        → Controller logic (Mongoose queries)
        → JSON response
```

---

## Project Structure

```
FixItNow/
├── Backend/
│   ├── server.js              # Entry point, Express app, CORS, route mounting, cleanup scheduler
│   ├── vercel.json            # Vercel serverless deployment config
│   ├── package.json
│   ├── config/
│   │   └── db.js              # MongoDB connection via Mongoose
│   ├── middleware/
│   │   └── auth.js            # JWT protect + admin role guard
│   ├── models/
│   │   ├── User.js            # User schema (citizen / admin roles, bcrypt password)
│   │   ├── Issue.js           # Issue schema (status, category, location, image, feedback)
│   │   └── Info.js            # Scheme / Facility info schema
│   ├── routes/
│   │   ├── authRoutes.js      # Register, Login, Verify token
│   │   ├── issueRoutes.js     # CRUD for issues + status updates
│   │   ├── infoRoutes.js      # CRUD for schemes & facilities
│   │   └── analyticsRoutes.js # Admin dashboard statistics
│   └── utils/
│       └── Cleanup.js         # Auto-delete resolved issues older than 24 h
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── main.jsx           # React root mount
        ├── App.jsx            # Root component — routing state, auth persistence, token verification
        ├── components/
        │   ├── LandingPage.jsx       # Public home page
        │   ├── AuthPage.jsx          # Login / Register form with reCAPTCHA
        │   ├── Navbar.jsx            # Top navigation bar
        │   ├── Footer.jsx            # Site footer
        │   ├── CitizenDashboard.jsx  # Citizen: view & manage own issues
        │   ├── AdminDashboard.jsx    # Admin: all issues + analytics + status updates
        │   ├── ReportIssue.jsx       # Issue submission form (GPS + image)
        │   ├── IssueCard.jsx         # Reusable issue display card
        │   └── InfoSchemes.jsx       # Government schemes & facilities listing
        └── pages/                    # (Reserved for future page-level components)
```

---

## Data Models

### User

| Field              | Type     | Notes                                  |
|--------------------|----------|----------------------------------------|
| `name`             | String   | Required                               |
| `email`            | String   | Required, unique                       |
| `password`         | String   | bcrypt hashed before save              |
| `role`             | String   | `citizen` (default) or `admin`         |
| `phone`            | String   | Optional                               |
| `languagePreference` | String | Default `en`; supports `hi`, `mr`, `bn` |
| `location.lat/lng` | Number   | Approximate home location              |
| `createdAt/updatedAt` | Date  | Auto-managed by Mongoose               |

### Issue

| Field                  | Type     | Notes                                                        |
|------------------------|----------|--------------------------------------------------------------|
| `user`                 | ObjectId | Ref → User                                                   |
| `title`                | String   | Required                                                     |
| `description`          | String   | Required                                                     |
| `category`             | String   | Enum: `Pothole`, `Garbage`, `Street Light`, `Water Leakage`, `Electricity`, `Other` |
| `imageUrl`             | String   | Base64 encoded image (optional)                              |
| `location.lat/lng`     | Number   | Required GPS coordinates                                     |
| `location.address`     | String   | Human-readable address from reverse geocoding                |
| `status`               | String   | Enum: `Pending` → `In Progress` → `Resolved` / `Rejected`   |
| `priority`             | String   | Enum: `Low`, `Medium` (default), `High`                      |
| `assignedTo`           | String   | Admin/department name (`Unassigned` by default)              |
| `resolutionEvidenceUrl`| String   | Base64 photo of fix uploaded by admin                        |
| `resolvedAt`           | Date     | Set when status becomes `Resolved`, used for cleanup & analytics |
| `feedback.rating`      | Number   | 1–5 citizen rating                                           |
| `feedback.comment`     | String   | Citizen text feedback                                        |

### Info (Schemes & Facilities)

| Field            | Type   | Notes                                |
|------------------|--------|--------------------------------------|
| `type`           | String | `Scheme` or `Facility`               |
| `title`          | String | Required                             |
| `description`    | String | Required                             |
| `region`         | String | `All`, `Rural`, or `Urban`           |
| `eligibility`    | String | Scheme-specific                      |
| `benefits`       | String | Scheme-specific                      |
| `website`        | String | Scheme-specific                      |
| `contactInfo`    | String | Facility-specific                    |
| `address`        | String | Facility-specific                    |
| `operatingHours` | String | Facility-specific (default 9–5)      |

---

## API Reference

### Auth  `/api/auth`

| Method | Endpoint           | Auth     | Description                       |
|--------|--------------------|----------|-----------------------------------|
| POST   | `/register`        | Public   | Create new user account           |
| POST   | `/login`           | Public   | Authenticate, receive JWT         |
| GET    | `/verify`          | Bearer   | Validate existing token & refresh user data |

**Login response:**
```json
{
  "_id": "...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "citizen",
  "token": "<JWT>"
}
```

---

### Issues  `/api/issues`

| Method | Endpoint              | Auth            | Description                                  |
|--------|-----------------------|-----------------|----------------------------------------------|
| POST   | `/`                   | Citizen / Admin | Create a new issue                           |
| GET    | `/`                   | Any logged-in   | List all issues (paginated, filterable)      |
| GET    | `/my`                 | Citizen / Admin | Get own issues with full contact details     |
| GET    | `/:id`                | Any logged-in   | Get single issue                             |
| PUT    | `/:id/status`         | Admin only      | Update issue status + resolution evidence   |
| DELETE | `/:id`                | Owner (non-resolved) | Delete own pending/in-progress issue   |
| POST   | `/:id/feedback`       | Citizen         | Submit rating + comment                      |

**Query Parameters for GET `/`:**
- `status` — filter by status value
- `category` — filter by category value
- `pageNumber` — page index (default `1`, page size `10`)

**Privacy model:** Admins receive `name + email + phone` for reporters; citizens receive only `name`.

---

### Analytics  `/api/analytics`

| Method | Endpoint       | Auth       | Description                                   |
|--------|----------------|------------|-----------------------------------------------|
| GET    | `/dashboard`   | Admin only | Total/resolved/pending counts, category breakdown, avg resolution time |

**Sample response:**
```json
{
  "totalIssues": 142,
  "resolvedIssues": 98,
  "pendingIssues": 30,
  "categoryStats": [
    { "_id": "Pothole", "count": 45 },
    { "_id": "Garbage", "count": 32 }
  ],
  "avgResolutionTime": "2.45 days"
}
```

---

### Info  `/api/info`

| Method | Endpoint  | Auth       | Description                            |
|--------|-----------|------------|----------------------------------------|
| GET    | `/`       | Public     | List schemes/facilities (filterable)   |
| POST   | `/`       | Admin only | Create new scheme or facility          |
| PUT    | `/:id`    | Admin only | Update existing entry                  |
| DELETE | `/:id`    | Admin only | Remove entry                           |

**Query Parameters for GET `/`:**
- `type` — `Scheme` or `Facility`
- `region` — `All`, `Rural`, or `Urban`

---

## Authentication & Authorization Flow

```
1. User submits login credentials
        │
        ▼
2. Backend verifies email + bcrypt.compare(password)
        │
        ▼
3. JWT signed with JWT_SECRET (expires in 30 days)
        │
        ▼
4. Token stored in localStorage as part of userInfo object
        │
        ▼
5. Every API request → Authorization: Bearer <token>
        │
        ▼
6. protect middleware:
     - Extracts token from header
     - Verifies signature with JWT_SECRET
     - Loads User document (minus password) → req.user
        │
        ▼
7. admin middleware (admin-only routes):
     - Checks req.user.role === 'admin'
     - Rejects with 401 if not admin
        │
        ▼
8. App startup: token re-verified via GET /api/auth/verify
   - Session expired? → auto logout + redirect to landing
```

---

## Frontend Architecture

### State Management

The application uses **React component state** (`useState`) with **localStorage persistence**. There is no external state library.

| State        | Location  | Purpose                                               |
|--------------|-----------|-------------------------------------------------------|
| `user`       | `App.jsx` | Logged-in user object (name, email, role, token)      |
| `currentView`| `App.jsx` | Controls which top-level component is rendered        |
| `loading`    | `App.jsx` | Prevents flash of unauthenticated content on startup  |

### View / Routing

FixItNow uses **state-based view switching** instead of a URL router (`react-router-dom` is not used). The `currentView` string in `App.jsx` determines what is rendered:

```
'landing'   → <LandingPage />
'auth'      → <AuthPage />
'dashboard' → <CitizenDashboard />
'report'    → <ReportIssue />
'admin'     → <AdminDashboard />
'info'      → <InfoSchemes />
```

On load, `App.jsx`:
1. Reads `userInfo` from `localStorage`.
2. If found, sets `user` state and routes to `dashboard` or `admin` based on role.
3. Verifies the token against the backend; auto-logouts on `401`.

### Component Responsibilities

| Component            | Role                                                                                  |
|----------------------|---------------------------------------------------------------------------------------|
| `App.jsx`            | Root orchestrator — auth state, session verification, view routing, global toast notifications |
| `Navbar.jsx`         | Navigation bar with conditional links based on auth state and role                    |
| `LandingPage.jsx`    | Public marketing/info page                                                            |
| `AuthPage.jsx`       | Login & register forms with Google reCAPTCHA integration                              |
| `CitizenDashboard.jsx` | Displays citizen's own submitted issues; allows deletion and feedback                |
| `AdminDashboard.jsx` | Paginated issue list + analytics stats; admin can update statuses and upload evidence |
| `ReportIssue.jsx`    | Form to submit new issue — captures GPS via Browser Geolocation API, reverse-geocodes with Nominatim, supports Base64 image upload |
| `IssueCard.jsx`      | Reusable card component rendering a single issue with all details and actions         |
| `InfoSchemes.jsx`    | Fetches and displays government schemes and local facilities with filtering           |

### Image Upload Flow

```
User selects file
    │
    ▼
FileReader.readAsDataURL()  (browser-side)
    │
    ▼
Base64 string stored in component state + preview shown
    │
    ▼
Sent as part of JSON body to POST /api/issues
    │
    ▼
Stored as imageUrl string in MongoDB document
    │
    ▼
Rendered as <img src={imageUrl} /> on issue cards
```

> The server accepts up to **15 MB** JSON bodies to accommodate Base64-encoded images.

### Geolocation Flow

```
User clicks "Capture Location"
    │
    ▼
navigator.geolocation.getCurrentPosition()
    │
    ▼
Nominatim reverse geocoding API
  GET https://nominatim.openstreetmap.org/reverse?format=json&lat=...&lon=...
    │
    ▼
{ lat, lng, address } stored in form state
    │
    ▼
Submitted with issue to backend
```

---

## Key Features

- **Role-based access control** — Separate citizen and admin experiences enforced on both frontend and backend.
- **JWT session persistence** — Token stored in `localStorage`; silently verified on app load; auto-logout on expiry.
- **GPS issue location** — Browser Geolocation API + OpenStreetMap Nominatim reverse geocoding for human-readable addresses.
- **Base64 image attachments** — Citizens attach photographic evidence; admins upload resolution proof.
- **Real-time analytics** — Admin dashboard aggregates issue counts, category distribution, and computed average resolution time via MongoDB aggregation pipelines.
- **Automated cleanup** — Resolved issues older than 24 hours are automatically deleted by a `setInterval` job running on the server.
- **Privacy controls** — Citizens see only reporter names; admins see full contact details (email, phone).
- **Government information hub** — Schemes and facility listings with region and type filtering, managed by admins.
- **Pagination** — Issue lists paginated at 10 per page on both backend and frontend.
- **Animated UI** — Page and component transitions powered by Framer Motion.

---

## Environment Variables

### Backend  (`Backend/.env`)

| Variable     | Description                                      |
|--------------|--------------------------------------------------|
| `PORT`       | Server port (default `8000`)                     |
| `MONGO_URI`  | MongoDB Atlas connection string                  |
| `JWT_SECRET` | Secret key for signing/verifying JWT tokens      |
| `CLIENT_URL` | Allowed frontend origin for CORS (e.g. `https://fixitnow.vercel.app`) |

### Frontend  (`Frontend/.env`)

| Variable   | Description                          |
|------------|--------------------------------------|
| `VITE_URL` | Backend base URL (e.g. `https://fixitnow-api.vercel.app`) |

---

## Local Development Setup

### Prerequisites

- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB instance)

### Backend

```bash
cd Backend
npm install
# Create .env with the variables listed above
node server.js
# or for hot-reload:
npx nodemon server.js
```

Server starts at `http://localhost:8000`.

### Frontend

```bash
cd Frontend
npm install
# Create .env with VITE_URL=http://localhost:8000
npm run dev
```

App starts at `http://localhost:5173`.

---

## Deployment

Both services are deployed independently on **Vercel**.

### Backend

`Backend/vercel.json` routes all requests to `server.js` via `@vercel/node`:

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

Set `MONGO_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_URL` as Vercel environment variables in the backend project settings.

### Frontend

`Frontend/vercel.json` handles SPA routing (all paths fall back to `index.html`). Set `VITE_URL` to the deployed backend URL in Vercel's environment variable settings, then run `npm run build` — Vercel picks up the `dist/` output automatically.
