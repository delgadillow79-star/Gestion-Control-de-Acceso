const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const validator = require("email-validator");

// Registro de Usuario con verificación externa (EmailListVerify)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    if (!validator.validate(email)) {
      return res.status(400).json({
        error: "El formato del correo es inválido o el dominio no existe.",
      });
    }

    if (!process.env.EMAIL_API_KEY) {
      return res.status(500).json({
        error: "El servicio de verificación de correos no está configurado.",
      });
    }

    try {
      const { data } = await axios.get(
        `https://apps.emaillistverify.com/api/verifEmail?secret=${process.env.EMAIL_API_KEY}&email=${email}`,
        { timeout: 8000 },
      );

      let isOk = false;
      if (typeof data === "string") {
        isOk = data === "ok";
      } else if (typeof data === "object" && data !== null) {
        isOk =
          data.result === "ok" || data.status === "ok" || data.success === true;
      }

      if (!isOk) {
        return res.status(400).json({
          error:
            "El correo electrónico no existe o no es válido. Usa una dirección real.",
        });
      }
    } catch (apiError) {
      console.error("❌ Error en la API de verificación:", apiError.message);
      return res.status(500).json({
        error: "No se pudo verificar el correo. Inténtalo más tarde.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      email,
      passwordHash,
      isVerified: true,
    });
    await user.save();

    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (error) {
    console.error("❌ Error detallado en Registro:", error);
    res.status(500).json({ error: "Error en el servidor al registrar" });
  }
};

// Login de Usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email o contraseña inválidos" });
    }

    if (user.isVerified === false) {
      return res
        .status(401)
        .json({ error: "Cuenta no verificada. Contacta al soporte." });
    }

    const isCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrect) {
      return res.status(400).json({ error: "Email o contraseña inválidos" });
    }

    const userForToken = { id: user._id, email: user.email };
    const accessToken = jwt.sign(
      userForToken,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({
      message: "Login exitoso",
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("❌ Error detallado en Login:", error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

// Obtener usuario autenticado (modificado para incluir nombre)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};
