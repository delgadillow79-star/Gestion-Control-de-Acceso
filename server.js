/**
 * ============================================================
 * SISTEMA DE GESTIÓN DE CONTROL DE ACCESO
 * ============================================================
 * @author: William Delgadillo <delgadillow79@gmail.com>
 * @version: 1.0.0
 * @copyright: © 2026 William Delgadillo. Todos los derechos reservados.
 * * Este código es propiedad intelectual exclusiva del autor.
 * Prohibida su reproducción o distribución sin autorización.
 * ============================================================
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const app = require("./app");
const connectDB = require("./config/config");

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
