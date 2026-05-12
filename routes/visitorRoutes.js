const express = require("express");
const router = express.Router();
const {
  getVisitors,
  createVisitor,
  updateVisitor,
  deleteVisitor,
} = require("../controllers/visitorController");
const verifyToken = require("../middleware/authMiddleware");

// Protegemos todas las rutas con el token de acceso de los operadores
router.use(verifyToken);

router.get("/", getVisitors);
router.post("/", createVisitor);
router.put("/:id", updateVisitor);
router.delete("/:id", deleteVisitor);

module.exports = router;
