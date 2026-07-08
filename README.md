# Bereket Fikre Portfolio — Backend API

Production-ready Node.js + Express REST API with PostgreSQL (Neon) and Cloudinary image uploads.

---

## Quick Start

### 1. Install dependencies
```bash
cd Backend
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in all values in .env before continuing
```

### 3. Set up database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to Neon (first time)
npm run db:push

# OR run migrations
npm run db:migrate:dev

# Seed initial data (admin user + services + FAQs + partners)
npm run db:seed
```

### 4. Start development server
```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | 64+ character random string for access tokens |
| `JWT_REFRESH_SECRET` | 64+ character random string for refresh tokens |
| `JWT_EXPIRES_IN` | Access token expiry (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: `7d`) |
| `ADMIN_EMAIL` | Initial admin email |
| `ADMIN_PASSWORD` | Initial admin password (change after first login!) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://bereketfikre.et`) |
| `ADMIN_URL` | Admin panel URL for CORS |
| `EMAIL_USER` | Gmail address for notifications |
| `EMAIL_PASS` | Gmail App Password |
| `EMAIL_TO` | Notification recipient email |
| `PORT` | Server port (default: `5000`) |

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Admin login |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current admin |
| PUT | `/api/auth/change-password` | Yes | Change password |

### Public Endpoints (no auth required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/project-request` | Submit project request |
| GET | `/api/projects` | List published projects |
| GET | `/api/projects/:idOrSlug` | Get single project |
| GET | `/api/services` | List active services |
| GET | `/api/services/:idOrSlug` | Get single service |
| GET | `/api/insights` | List published insights |
| GET | `/api/insights/:idOrSlug` | Get single insight |
| GET | `/api/partners` | List active partners |
| GET | `/api/testimonials` | List active testimonials |
| GET | `/api/faqs` | List active FAQs |

### Admin Endpoints (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard stats |
| POST/PUT/DELETE | `/api/admin/projects` | Project CRUD |
| POST/PUT/DELETE | `/api/admin/services` | Service CRUD |
| POST/PUT/DELETE | `/api/admin/insights` | Insight CRUD |
| POST/PUT/DELETE | `/api/admin/partners` | Partner CRUD |
| POST/PUT/DELETE | `/api/admin/testimonials` | Testimonial CRUD |
| POST/PUT/DELETE | `/api/admin/faqs` | FAQ CRUD |
| GET | `/api/admin/contacts` | Contact submissions |
| GET | `/api/admin/project-requests` | Project requests |

### Query Parameters (list endpoints)
| Param | Description |
|---|---|
| `page` | Page number (default: 1) |
| `limit` | Items per page (default: 10, max: 100) |
| `search` | Full-text search |
| `status` | Filter by status |
| `featured` | Filter featured items |
| `sortBy` | Sort field |
| `order` | `asc` or `desc` |

---

## Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Valid email is required." }]
}
```

---

## Contact Form Integration

The backend is a **drop-in replacement** for Formspree. Update the frontend to point to your backend:

**Contact.jsx** — change `FORMSPREE_ENDPOINT` to:
```
POST https://your-api.onrender.com/api/contact
```

**ProjectRequestModal.jsx** — change the fetch URL to:
```
POST https://your-api.onrender.com/api/project-request
```

Both endpoints return `{ ok: true }` on success, matching the existing frontend checks.

---

## Project Structure

```
Backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Initial data seeder
├── src/
│   ├── config/
│   │   ├── env.js          # Environment config + validation
│   │   ├── database.js     # Prisma client singleton
│   │   └── cloudinary.js   # Cloudinary + Multer setup
│   ├── controllers/        # Request handlers
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── errorHandler.js # Global error handler
│   │   ├── rateLimiter.js  # Rate limiting
│   │   └── validate.js     # express-validator runner
│   ├── routes/             # Express routers
│   ├── utils/
│   │   ├── logger.js       # Winston logger
│   │   ├── response.js     # Standardized responses
│   │   ├── slugify.js      # Unique slug generation
│   │   ├── pagination.js   # Pagination helpers
│   │   └── email.js        # Nodemailer notifications
│   ├── validators/         # express-validator rule sets
│   ├── app.js              # Express app setup
│   └── server.js           # Entry point
└── package.json
```

---

## Deployment to Render

### 1. Neon PostgreSQL Setup
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project → copy the connection string
3. Add to Render environment as `DATABASE_URL`

### 2. Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get `Cloud Name`, `API Key`, `API Secret` from dashboard
3. Add to Render environment variables

### 3. Render Web Service
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Configure:
   - **Build Command:** `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add all environment variables from `.env.example`
6. Deploy

### 4. Run Seed on First Deploy
In Render Shell (one-time):
```bash
node prisma/seed.js
```

### 5. Update Frontend CORS
Add your Render URL to `FRONTEND_URL` in Render environment variables.
