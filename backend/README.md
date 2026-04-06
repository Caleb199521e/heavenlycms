# Heavenly Church Ghana — Backend API

## Setup
```bash
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
npm run seed    # Seed sample data
npm run dev     # Development server
npm start       # Production
```

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/members | List members |
| POST | /api/members | Add member |
| PUT | /api/members/:id | Update member |
| DELETE | /api/members/:id | Delete member |
| GET | /api/visitors | List visitors |
| POST | /api/visitors | Register visitor |
| POST | /api/attendance/checkin | Check in person |
| GET | /api/attendance/service/:id | Get service attendance |
| GET | /api/services | List services |
| POST | /api/services | Create service |
| GET | /api/reports/summary | Dashboard summary |
| GET | /api/reports/trends | Attendance trends |

## Roles
- **admin**: Full access
- **leader**: Read-only analytics + member view
- **usher**: Attendance check-in only
