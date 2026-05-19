# Backend Setup Instructions

## Quick Fix for Network Errors

If you're getting network errors for login/signup, follow these steps:

### 1. Install Backend Dependencies
```bash
cd patient-master/backend
npm install
```

### 2. Make sure MongoDB is running
- MongoDB should be running on `mongodb://127.0.0.1:27017`
- If not installed, download from https://www.mongodb.com/try/download/community

### 3. Start the Backend Server
```bash
cd patient-master/backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
MongoDB connected
Server running on http://localhost:5000
Health check: http://localhost:5000/api/health
```

### 4. Test the Backend
Open your browser and go to:
```
http://localhost:5000/api/health
```

You should see: `{"status":"ok","message":"Server is running"}`

### 5. Start the Frontend
In a new terminal:
```bash
cd patient-master
npm install
npm run dev
```

### Common Issues:

1. **"Cannot connect to server"** - Backend is not running. Start it with `npm start` in the backend folder.

2. **MongoDB connection error** - Make sure MongoDB is installed and running.

3. **Port 5000 already in use** - Change PORT in `backend/server.js` or stop the other service.

4. **CORS errors** - Make sure frontend is running on `http://localhost:5173` (default Vite port).

### Verify Backend Routes:
- Health: http://localhost:5000/api/health
- Signup: POST http://localhost:5000/api/auth/signup
- Login: POST http://localhost:5000/api/auth/login
- Tests: GET http://localhost:5000/api/tests
- Packages: GET http://localhost:5000/api/packages

