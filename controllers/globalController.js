const Company = require("../models/Company");
const RecurrentVisitor = require("../models/RecurrentVisitor");

// ========== COMPAÑÍAS ==========
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener compañías" });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, logo } = req.body;
    const existing = await Company.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "La compañía ya existe" });
    }
    const company = new Company({ name, logo: logo || "" });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear compañía" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ error: "Compañía no encontrada" });
    }
    if (name && name !== company.name) {
      const existing = await Company.findOne({ name });
      if (existing)
        return res.status(400).json({ error: "El nombre ya existe" });
      company.name = name;
    }
    if (logo !== undefined) company.logo = logo;
    await company.save();
    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar compañía" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.json({ message: "Compañía eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar compañía" });
  }
};

// ========== VISITANTES RECURRENTES ==========
exports.getRecurrentVisitors = async (req, res) => {
  try {
    const visitors = await RecurrentVisitor.find().sort({ nombre: 1 });
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener recurrentes" });
  }
};

exports.createRecurrentVisitor = async (req, res) => {
  try {
    const { nombre, cedula } = req.body;
    const existing = await RecurrentVisitor.findOne({ nombre, cedula });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Ya existe un visitante con ese nombre y cédula" });
    }
    const visitor = new RecurrentVisitor(req.body);
    await visitor.save();
    res.status(201).json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear visitante recurrente" });
  }
};

exports.updateRecurrentVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await RecurrentVisitor.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!visitor) {
      return res.status(404).json({ error: "Visitante no encontrado" });
    }
    res.json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar visitante recurrente" });
  }
};

exports.deleteRecurrentVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    await RecurrentVisitor.findByIdAndDelete(id);
    res.json({ message: "Visitante recurrente eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar visitante recurrente" });
  }
};
