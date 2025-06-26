const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// === Body Parsing Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Session Middleware ===
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// === Static Route for Uploaded Images ===
app.use("/images", express.static(path.resolve(__dirname, "images")));
app.use("/images_profiles", express.static(path.resolve(__dirname, "images_profiles")));

// === API Routes ===
app.use("/auth", require("./routes/auth")); 
app.use("/upload", require("./routes/upload"));
app.use("/messages", require("./routes/messages"));
app.use("/items", require("./routes/itemRoutes"));
app.use("/api/profile", require("./routes/profile"));

// === Serve React Frontend ===
app.use(express.static(path.join(__dirname, "client", "build")));

// === Catch-All Route for React Router ===
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// === Start Backend Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


//Note: NPM install Marked