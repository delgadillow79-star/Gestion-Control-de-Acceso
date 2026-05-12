const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Importar las rutas
const authRoutes = require("./routes/authRoutes");
const visitRoutes = require("./routes/visitRoutes");
const globalRoutes = require("./routes/globalRoutes");
const verifyToken = require("./middleware/authMiddleware");

const app = express();

// --- MIDDLEWARES ---
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));

// Ruta protegida para el dashboard
app.get("/dashboard.html", verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

// Servir archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, "views")));

// --- RUTAS ---
app.use("/api/auth", authRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/global", globalRoutes);

// Ruta para servir el login por defecto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

module.exports = app;
