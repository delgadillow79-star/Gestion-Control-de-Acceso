const Visit = require("../models/Visit");
const RecurrentVisitor = require("../models/RecurrentVisitor");

// Obtener todas las visitas activas (sin horaSalida Y no archivadas) del usuario actual
exports.getActiveVisits = async (req, res) => {
  try {
    const visits = await Visit.find({
      createdBy: req.user.id,
      horaSalida: null,
      archived: false, // ← FILTRO
    }).sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener visitas activas" });
  }
};

// Obtener todas las visitas (activas y finalizadas, NO archivadas) del usuario actual
exports.getAllUserVisits = async (req, res) => {
  try {
    const visits = await Visit.find({
      createdBy: req.user.id,
      archived: false, // ← FILTRO
    }).sort({ createdAt: -1 });
    res.json(visits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener visitas" });
  }
};

// Crear una nueva visita (siempre no archivada)
exports.createVisit = async (req, res) => {
  try {
    const visitData = {
      ...req.body,
      horaEntrada:
        req.body.horaEntrada || new Date().toLocaleTimeString("es-ES"),
      createdBy: req.user.id,
      archived: false, // ← NUEVA VISITA NO ARCHIVADA
    };
    const visit = new Visit(visitData);
    await visit.save();

    // Actualizar o crear visitante recurrente (si no existe)
    const {
      nombre,
      cedula,
      empresaProcedencia,
      empresaVisitar,
      vehiculoModelo,
      vehiculoColor,
      vehiculoPlaca,
    } = req.body;
    const exists = await RecurrentVisitor.findOne({ nombre, cedula });
    if (!exists) {
      const recurrent = new RecurrentVisitor({
        nombre,
        cedula,
        empresaProcedencia,
        empresaVisitar,
        vehiculoModelo,
        vehiculoColor,
        vehiculoPlaca,
      });
      await recurrent.save();
    }

    res.status(201).json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la visita" });
  }
};

// Actualizar una visita (recogido, horaSalida) - sin restricción de archivado (ya no se mostrarán)
exports.updateVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const visit = await Visit.findOne({ _id: id, createdBy: req.user.id });
    if (!visit) {
      return res
        .status(404)
        .json({ error: "Visita no encontrada o no autorizada" });
    }
    Object.assign(visit, update);
    await visit.save();
    res.json(visit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la visita" });
  }
};

// Reporte diario por operador (solo visitas NO archivadas)
exports.getDailyReport = async (req, res) => {
  try {
    const visits = await Visit.find({
      createdBy: req.user.id,
      archived: false, // ← FILTRO
    });
    const report = {};
    visits.forEach((visit) => {
      const company = visit.empresaVisitar;
      if (company) {
        report[company] = (report[company] || 0) + 1;
      }
    });
    res.json({ report, lastUpdated: Date.now() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar reporte" });
  }
};

// NUEVO: Archivar todas las visitas del usuario (cierre de guardia)
exports.archiveVisits = async (req, res) => {
  try {
    await Visit.updateMany(
      { createdBy: req.user.id, archived: false },
      { $set: { archived: true } },
    );
    res.json({
      message: "Guardia cerrada. Todos los registros han sido archivados.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al archivar las visitas" });
  }
};
