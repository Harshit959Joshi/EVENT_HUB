# ⚡ EventHub India — Full Stack MERN Event Management Platform
# Made by JOSHI JII
> A production-ready event discovery, booking, and management platform built with the MERN stack. Features real-time notifications, Stripe payments, role-based access, and a beautiful Indian-themed UI.

![EventHub Preview](https://via.placeholder.com/1200x600/FF9933/ffffff?text=EventHub+India+Preview)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schemas](#-database-schemas)
- [Deployment Guide](#-deployment-guide)
- [Test Accounts](#-test-accounts)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT authentication stored in HTTP-only cookies + localStorage
- bcrypt password hashing with salt rounds = 12
- Role-based access control (Attendee / Organizer / Admin)
- Rate limiting (100 req/15min), Helmet security headers, CORS

### 🎭 Event Management (Organizer)
- Create/edit/delete events with full details
- Image upload support (Cloudinary)
- View attendee list per event
- Real-time ticket availability tracking
- Event analytics dashboard

### 🎟 Booking System (Attendee)
- Atomic ticket booking with MongoDB transactions (prevents overbooking)
- Free and paid (Stripe) booking flows
- Unique booking reference generation
- Booking cancellation with ticket release
- Booking history with status tracking

### 🔔 Real-Time Notifications (Socket.io)
- Booking confirmations
- Sold-out alerts broadcasted to all users
- New event announcements
- Per-user notification rooms

### 💳 Payments (Stripe)
- Stripe Payment Intents (test mode)
- Webhook handling for payment confirmation
- Refund support

### ⭐ Reviews & Ratings
- Star rating system (1–5)
- Verified attendee badge
- Average rating auto-calculated on Event document
- One review per user per event (enforced by DB index)

### 📧 Email Notifications (NodeMailer)
- Booking confirmation emails
- Welcome email on registration
- Customizable HTML templates

### 👑 Admin Panel
- Platform stats dashboard
- User management (activate/deactivate)
- Featured event management

---

## 🛠 Tech Stack

| Layer        | Technology                              |
|-------------|----------------------------------------|
| Frontend     | React 18, React Router v6, Framer Motion |
| Styling      | Tailwind CSS v3, Google Fonts          |
| State        | React Context API + Custom Hooks       |
| HTTP Client  | Axios with interceptors                |
| Backend      | Node.js, Express.js                    |
| Database     | MongoDB Cloud                 |
| Auth         | JWT, bcryptjs                          |
| Real-time    | Socket.io v4                           |
| Payments     | Stripe (test mode)                     |
| Email        | NodeMailer (Gmail SMTP)                |
| Security     | Helmet, express-rate-limit, cors       |

---

## 📁 Project Structure

```
eventhub/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, logout, profile
│   │   ├── eventController.js       # CRUD, search, filter, attendees
│   │   ├── bookingController.js     # Book, cancel, list bookings
│   │   ├── reviewController.js      # Create, read, delete reviews
│   │   ├── paymentController.js     # Stripe payment intents & webhooks
│   │   └── adminController.js       # Admin stats, user/event management
│   ├── middleware/
│   │   └── auth.js                  # protect, authorize, optionalAuth
│   ├── models/
│   │   ├── User.js                  # User schema with bcrypt hooks
│   │   ├── Event.js                 # Event schema with virtuals & indexes
│   │   ├── Booking.js               # Booking schema with auto-ref
│   │   └── Review.js                # Review + Notification models
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── adminRoutes.js
│   │   └── notificationRoutes.js
│   ├── socket/
│   │   └── socketHandler.js         # Socket.io connection & event handlers
│   ├── utils/
│   │   ├── email.js                 # NodeMailer utility
│   │   └── seeder.js                # DB seeder with sample data
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx       # Responsive navbar with notifications
│   │   │   │   └── index.jsx        # Footer, ProtectedRoute, Skeleton, EmptyState
│   │   │   ├── events/
│   │   │   │   ├── EventCard.jsx    # Card with progress bar & ticket status
│   │   │   │   ├── EventFilters.jsx # Search, category pills, advanced filters
│   │   │   │   └── ReviewSection.jsx# Star rating, review form, review list
│   │   │   └── booking/
│   │   │       └── BookingModal.jsx # Animated modal with Stripe + free flow
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Global auth state + JWT management
│   │   │   └── SocketContext.jsx    # Socket.io client + notification state
│   │   ├── hooks/
│   │   │   └── useData.js           # useEvents, useBookings, useReviews, etc.
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Hero, featured events, categories, CTA
│   │   │   ├── EventsPage.jsx       # Filtered list with pagination
│   │   │   ├── EventDetailPage.jsx  # Full detail, booking card, reviews
│   │   │   ├── AuthPages.jsx        # Login + Register pages
│   │   │   ├── DashboardPage.jsx    # Organizer/Attendee dashboard (role-aware)
│   │   │   └── EventFormPages.jsx   # Create/Edit event + My Bookings
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + all API methods
│   │   ├── utils/
│   │   │   └── helpers.js           # Date formatting, price, categories, cities
│   │   ├── App.jsx                  # Routes + Layout + Lazy loading
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Tailwind + custom styles + animations
│   ├── tailwind.config.js           # Saffron theme, custom animations
│   ├── package.json
│   └── .env.example
│
├── package.json                     # Root scripts with concurrently
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account (free tier works)
- Stripe account (free test mode)
- Gmail account (for emails)

### Step 1 — Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/eventhub.git
cd eventhub

# Install all dependencies at once
npm install
npm run install:all
```

### Step 2 — Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

### Step 3 — Seed the Database

```bash
npm run seed
```

This creates:
- 3 user accounts (admin, organizer, attendee)
- 6 sample events across India
- Sample bookings

### Step 4 — Run the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# OR run separately:
npm run dev:backend    # Backend on http://localhost:5000
npm run dev:frontend   # Frontend on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/eventhub

# JWT (use a strong random string, min 32 chars)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000

# Gmail SMTP (create an App Password in Google Account settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=EventHub <noreply@eventhub.in>

# Stripe (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📡 API Documentation

### Authentication

| Method | Endpoint              | Auth | Description               |
|--------|-----------------------|------|---------------------------|
| POST   | `/api/auth/register`  | ❌   | Register new user         |
| POST   | `/api/auth/login`     | ❌   | Login, returns JWT cookie |
| POST   | `/api/auth/logout`    | ✅   | Clear auth cookie         |
| GET    | `/api/auth/me`        | ✅   | Get current user          |
| PUT    | `/api/auth/profile`   | ✅   | Update profile            |
| PUT    | `/api/auth/password`  | ✅   | Change password           |

### Events

| Method | Endpoint                        | Auth         | Description               |
|--------|---------------------------------|--------------|---------------------------|
| GET    | `/api/events`                   | Optional     | List with search & filter |
| GET    | `/api/events/featured`          | Optional     | Featured events           |
| GET    | `/api/events/organizer/my`      | Organizer    | My created events         |
| GET    | `/api/events/:id`               | Optional     | Single event detail       |
| POST   | `/api/events`                   | Organizer    | Create event              |
| PUT    | `/api/events/:id`               | Organizer    | Update event              |
| DELETE | `/api/events/:id`               | Organizer    | Delete event              |
| GET    | `/api/events/:id/attendees`     | Organizer    | Event attendee list       |

**Query params for GET /api/events:**
```
?search=react       # Text search
?category=tech      # Filter by category
?city=Mumbai        # Filter by city
?isFree=true        # Free events only
?isFeatured=true    # Featured only
?startDate=2025-05-01  # From date
?endDate=2025-06-01    # To date
?sort=-date         # Sort (prefix - for desc)
?page=1&limit=12    # Pagination
```

### Bookings

| Method | Endpoint                      | Auth    | Description            |
|--------|-------------------------------|---------|------------------------|
| POST   | `/api/bookings`               | ✅      | Create booking         |
| GET    | `/api/bookings`               | ✅      | My bookings list       |
| GET    | `/api/bookings/:id`           | ✅      | Single booking detail  |
| PUT    | `/api/bookings/:id/cancel`    | ✅      | Cancel booking         |

**POST /api/bookings body:**
```json
{
  "eventId": "60d...",
  "ticketsBooked": 2,
  "attendeeInfo": { "name": "Rahul", "email": "rahul@test.com" }
}
```

### Reviews

| Method | Endpoint                         | Auth | Description          |
|--------|----------------------------------|------|----------------------|
| POST   | `/api/reviews`                   | ✅   | Submit review        |
| GET    | `/api/reviews/event/:eventId`    | ❌   | Get event reviews    |
| DELETE | `/api/reviews/:id`               | ✅   | Delete own review    |

### Payments

| Method | Endpoint                       | Auth | Description              |
|--------|--------------------------------|------|--------------------------|
| POST   | `/api/payments/create-intent`  | ✅   | Create Stripe PaymentIntent |
| POST   | `/api/payments/confirm`        | ✅   | Confirm payment          |
| POST   | `/api/payments/webhook`        | ❌   | Stripe webhook handler   |

### Notifications

| Method | Endpoint                          | Auth | Description           |
|--------|-----------------------------------|------|-----------------------|
| GET    | `/api/notifications`              | ✅   | Get my notifications  |
| PUT    | `/api/notifications/read-all`     | ✅   | Mark all as read      |
| PUT    | `/api/notifications/:id/read`     | ✅   | Mark one as read      |

### Admin (Admin role only)

| Method | Endpoint                         | Auth  | Description           |
|--------|----------------------------------|-------|-----------------------|
| GET    | `/api/admin/stats`               | Admin | Platform stats        |
| GET    | `/api/admin/users`               | Admin | All users             |
| PUT    | `/api/admin/users/:id/toggle`    | Admin | Activate/deactivate   |
| PUT    | `/api/admin/events/:id/feature`  | Admin | Toggle featured       |

---

## 🗄 Database Schemas

### User
```javascript
{
  name: String,            // Required, max 50 chars
  email: String,           // Required, unique
  password: String,        // Hashed with bcrypt (select: false)
  role: String,            // 'attendee' | 'organizer' | 'admin'
  avatar: String,
  phone: String,
  bio: String,
  isVerified: Boolean,
  isActive: Boolean,
  notifications: { email, booking, reminders }
}
```

### Event
```javascript
{
  organizer: ObjectId,      // Ref: User
  title: String,            // Max 100 chars
  description: String,      // Max 2000 chars
  category: String,         // Enum: 9 categories
  date: Date,               // Required
  location: { venue, city, state, address, coordinates },
  image: String,
  ticketsTotal: Number,
  ticketsSold: Number,      // Atomic increments
  price: Number,            // 0 = free
  isFree: Boolean,
  tags: [String],
  status: String,           // 'published' | 'draft' | 'cancelled' | 'completed'
  isFeatured: Boolean,
  rating: { average, count } // Auto-calculated from reviews
}
```

### Booking
```javascript
{
  user: ObjectId,           // Ref: User
  event: ObjectId,          // Ref: Event
  ticketsBooked: Number,    // 1–10
  totalAmount: Number,
  status: String,           // 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  paymentStatus: String,    // 'pending' | 'paid' | 'free' | 'refunded'
  bookingRef: String,       // Auto-generated: EH-XXXXXXXX
  stripePaymentIntentId: String,
  attendeeInfo: { name, email, phone }
}
```

---

## 🌐 Deployment Guide

### Backend on Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add all environment variables from `backend/.env`
6. Change `CLIENT_URL` to your Vercel frontend URL
7. Deploy

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
   ```
5. Deploy

### MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Add IP: `0.0.0.0/0` (allow all) in Network Access
4. Create database user
5. Copy connection string to `MONGO_URI`

---

## 👤 Test Accounts

After running `npm run seed`:

| Role       | Email                      | Password   |
|------------|----------------------------|------------|
| Admin      | admin@eventhub.in          | Admin@123  |
| Organizer  | organizer@eventhub.in      | Test@123   |
| Attendee   | attendee@eventhub.in       | Test@123   |

Or use the **demo login buttons** on the login page!

---

## 🔌 Socket.io Events

| Event                | Direction       | Payload                    |
|---------------------|-----------------|----------------------------|
| `booking_confirmed`  | Server → User   | `{ message, booking }`     |
| `booking_cancelled`  | Server → User   | `{ message, bookingId }`   |
| `new_event`          | Server → All    | `{ message, event }`       |
| `event_sold_out`     | Server → All    | `{ eventId, message }`     |
| `new_booking`        | Server → Org    | `{ message, count }`       |
| `join_event`         | Client → Server | `eventId`                  |

---

## 🧪 Running Tests (Future)

```bash
# Backend tests (Jest + Supertest)
cd backend && npm test

# Frontend tests (React Testing Library)
cd frontend && npm test
```

---

## 📈 Performance Features

- MongoDB indexes on `date`, `category`, `city`, text search
- React lazy loading + code splitting
- Axios request/response caching
- Socket.io rooms (no broadcasting to unrelated clients)
- MongoDB transactions for atomic bookings

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License © 2025 EventHub India

---

*Built with ❤️ for India's event ecosystem*
