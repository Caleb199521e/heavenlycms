# Heavenly Church Ghana - Full Stack Setup

## Project Structure

```
.
├── backend/              # Express.js API server
│   ├── package.json
│   ├── server.js        # Main server entry
│   ├── routes/          # API endpoints
│   ├── models/          # Database schemas
│   ├── middleware/      # Auth & role-based access
│   └── seed/           # Sample data
│
├── src/                 # React frontend (Vite)
│   ├── components/      # React components
│   ├── App.jsx
│   └── main.jsx
│
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── package.json         # Frontend dependencies
└── .env                # Environment variables
```

## Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Install frontend dependencies** (from root directory)
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configure backend** (create `.env` in backend folder)
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   cd ..
   ```

## Development

Run both servers simultaneously:

**Terminal 1 - Backend (port 5000)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 5173)**
```bash
npm run dev
```

Access the app at: `http://localhost:5173`

## Demo Credentials

- **Admin**: `admin@heavenly.gh` / `admin123`
- **Leader**: `leader@heavenly.gh` / `leader123`
- **Usher**: `usher@heavenly.gh` / `usher123`

## Build for Production

**Frontend**
```bash
npm run build
npm run preview
```

**Backend**
```bash
cd backend
npm start
```

## Features

✓ Member management  
✓ Visitor tracking  
✓ Attendance check-in  
✓ Service management  
✓ Analytics & reports  
✓ User roles & permissions  
✓ Responsive design  

---

Need help? Check the backend README for API documentation.
