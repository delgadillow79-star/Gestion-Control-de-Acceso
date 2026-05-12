const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getActiveVisits,
  getAllUserVisits,
  createVisit,
  updateVisit,
  getDailyReport,
  archiveVisits, // ← NUEVA FUNCIÓN
} = require("../controllers/visitController");

router.use(verifyToken);

router.get("/active", getActiveVisits);
router.get("/all", getAllUserVisits);
router.post("/", createVisit);
router.put("/:id", updateVisit);
router.get("/report", getDailyReport);
router.post("/archive", archiveVisits); // ← NUEVA RUTA

module.exports = router;
