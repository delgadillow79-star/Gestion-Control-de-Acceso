const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    carnet: { type: String, required: true },
    nombre: { type: String, required: true },
    cedula: { type: String, required: true },
    anfitrion: { type: String, required: true },
    empresaProcedencia: { type: String, default: "" },
    empresaVisitar: { type: String, required: true },
    vehiculoModelo: { type: String, default: "" },
    vehiculoColor: { type: String, default: "" },
    vehiculoPlaca: { type: String, default: "" },
    horaEntrada: { type: String, required: true },
    horaSalida: { type: String, default: null },
    recogido: { type: Boolean, default: false },
    archived: { type: Boolean, default: false }, // ← NUEVO CAMPO
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visit", visitSchema);
