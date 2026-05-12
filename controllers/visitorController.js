const Visitor = require("../models/visitor");

// Obtener todos los visitantes (tanto activos como perfiles recurrentes)
exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.status(200).json(visitors);
  } catch (error) {
    console.error("❌ Error al obtener visitantes:", error);
    res
      .status(500)
      .json({ error: "Error en el servidor al obtener visitantes" });
  }
};

// Crear un visitante (puede ser un ingreso nuevo o guardar un perfil recurrente)
exports.createVisitor = async (req, res) => {
  try {
    const newVisitor = new Visitor(req.body);
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (error) {
    console.error("❌ Error al crear visitante:", error);
    res.status(500).json({ error: "Error en el servidor al crear visitante" });
  }
};

// Actualizar un visitante (marcar salida, marcar recogido o editar recurrente)
exports.updateVisitor = async (req, res) => {
  try {
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // Devuelve el documento actualizado
    );
    if (!updatedVisitor) {
      return res.status(404).json({ error: "Visitante no encontrado" });
    }
    res.status(200).json(updatedVisitor);
  } catch (error) {
    console.error("❌ Error al actualizar visitante:", error);
    res
      .status(500)
      .json({ error: "Error en el servidor al actualizar visitante" });
  }
};

// Eliminar un visitante (usado principalmente para el directorio de recurrentes)
exports.deleteVisitor = async (req, res) => {
  try {
    const deletedVisitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!deletedVisitor) {
      return res.status(404).json({ error: "Visitante no encontrado" });
    }
    res.status(200).json({ message: "Visitante eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar visitante:", error);
    res
      .status(500)
      .json({ error: "Error en el servidor al eliminar visitante" });
  }
};
