const mongoose = require("mongoose");

const recurrentVisitorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    cedula: { type: String, required: true },
    empresaProcedencia: { type: String, default: "" },
    empresaVisitar: { type: String, default: "" },
    vehiculoModelo: { type: String, default: "" },
    vehiculoColor: { type: String, default: "" },
    vehiculoPlaca: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RecurrentVisitor", recurrentVisitorSchema);
