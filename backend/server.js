const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "tech_secret_key";

// Middleware
app.use(cors({ 
  origin: "http://localhost:5173",
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/jeevancare")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Import models
const Booking = require("./models/Booking");
const Technician = require("./models/Technician");

// Import routes
const authRoutes = require("./routes/auth");
const testsRoutes = require("./routes/tests");
const packagesRoutes = require("./routes/packages");
const bookingsRoutes = require("./routes/bookings");
const { authenticateTechnician, authenticateUser } = require("./middleware/auth");

/* ================= ROUTES ================= */

// User Authentication Routes
app.use("/api/auth", authRoutes);

// Tests Routes
app.use("/api/tests", testsRoutes);

// Packages Routes
app.use("/api/packages", packagesRoutes);

// User Bookings Routes (my-bookings, create)
app.use("/api/bookings", bookingsRoutes);

// USER BOOKING (authenticated - links booking to logged-in user)
app.post("/api/book-home-visit", authenticateUser, async (req, res) => {
  try {
    const { services, ...rest } = req.body;
    // Build a readable serviceType summary from selected services
    const serviceType = services && services.length > 0
      ? services.map(s => s.name).join(", ")
      : rest.serviceType || "";

    const booking = new Booking({
      ...rest,
      services: services || [],
      serviceType,
      email: req.user.email
    });
    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TECHNICIAN LOGIN
app.post("/api/technician/login", async (req, res) => {
  const { username, password } = req.body;

  const tech = await Technician.findOne({ username });

  if (!tech) {
    return res.status(401).json({ message: "Username not found" });
  }

  if (tech.password !== password) {
    return res.status(401).json({ message: "Password mismatch" });
  }

  const token = jwt.sign(
    { id: tech._id, role: "technician" },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

// TECHNICIAN TOKEN VALIDATION
app.get("/api/technician/validate", authenticateTechnician, (req, res) => {
  res.json({ valid: true, technician: req.technician });
});

// TECHNICIAN FETCH BOOKINGS (Protected)
app.get("/api/technician/bookings", authenticateTechnician, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// UPDATE BOOKING STATUS (Protected)
app.patch("/api/technician/bookings/:id", authenticateTechnician, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Update failed" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
