const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getRecurrentVisitors,
  createRecurrentVisitor,
  updateRecurrentVisitor,
  deleteRecurrentVisitor,
} = require("../controllers/globalController");

router.use(verifyToken);

// Compañías
router.get("/companies", getCompanies);
router.post("/companies", createCompany);
router.put("/companies/:id", updateCompany);
router.delete("/companies/:id", deleteCompany);

// Visitantes recurrentes
router.get("/recurrent", getRecurrentVisitors);
router.post("/recurrent", createRecurrentVisitor);
router.put("/recurrent/:id", updateRecurrentVisitor);
router.delete("/recurrent/:id", deleteRecurrentVisitor);

module.exports = router;
