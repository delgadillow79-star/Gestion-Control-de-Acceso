const API_URL = "/api/auth";

// --- Funciones de utilidad reutilizables ---
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <span>${type === "success" ? "✓" : "✕"}</span>
        <span>${message}</span>
    `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

function validateEmailFormat(value) {
  return /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value);
}

function validatePasswordComplexity(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,15}$/.test(value);
}

// --- Elementos y estado para el registro ---
const registerForm = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const registerBtn = document.getElementById("registerBtn");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");

const fieldState = {
  name: false,
  email: false,
  password: false,
  confirm: false,
};

// Validaciones específicas del registro
function validateName(value) {
  const trimmed = value.trim();
  if (trimmed === "") {
    nameError.textContent = "";
    return false;
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) {
    nameError.textContent =
      "Tanto el nombre como el apellido deben comenzar con mayúscula";
    return false;
  }
  const isValid = parts.every(
    (part) =>
      part.length > 0 &&
      part[0] === part[0].toUpperCase() &&
      part[0] !== part[0].toLowerCase(),
  );
  if (!isValid) {
    nameError.textContent =
      "Tanto el nombre como el apellido deben comenzar con mayúscula";
  } else {
    nameError.textContent = "";
  }
  return isValid;
}

function validateConfirm(password, confirm) {
  const isValid = password !== "" && confirm !== "" && password === confirm;
  if (!isValid && confirm !== "") {
    confirmError.textContent = "Las contraseñas no coinciden";
  } else {
    confirmError.textContent = "";
  }
  return isValid;
}

function updateFieldStatus() {
  // Nombre
  const nameValid = validateName(nameInput.value);
  if (nameInput.value.trim() === "") {
    nameInput.classList.remove("valid", "invalid");
    fieldState.name = false;
  } else {
    nameInput.classList.toggle("valid", nameValid);
    nameInput.classList.toggle("invalid", !nameValid);
    fieldState.name = nameValid;
  }

  // Email
  const emailValid = validateEmailFormat(emailInput.value);
  if (emailInput.value === "") {
    emailInput.classList.remove("valid", "invalid");
    fieldState.email = false;
  } else {
    emailInput.classList.toggle("valid", emailValid);
    emailInput.classList.toggle("invalid", !emailValid);
    fieldState.email = emailValid;
    emailError.textContent =
      !emailValid && emailInput.value !== ""
        ? "Formato de correo inválido. Ejemplo: usuario@dominio.com"
        : "";
  }

  // Contraseña
  const passwordValid = validatePasswordComplexity(passwordInput.value);
  if (passwordInput.value === "") {
    passwordInput.classList.remove("valid", "invalid");
    fieldState.password = false;
  } else {
    passwordInput.classList.toggle("valid", passwordValid);
    passwordInput.classList.toggle("invalid", !passwordValid);
    fieldState.password = passwordValid;
    passwordError.textContent =
      !passwordValid && passwordInput.value !== ""
        ? "8-15 caracteres, al menos una mayúscula, una minúscula y un número"
        : "";
  }

  // Confirmación
  const confirmValid = validateConfirm(passwordInput.value, confirmInput.value);
  if (confirmInput.value === "") {
    confirmInput.classList.remove("valid", "invalid");
    fieldState.confirm = false;
  } else {
    confirmInput.classList.toggle("valid", confirmValid);
    confirmInput.classList.toggle("invalid", !confirmValid);
    fieldState.confirm = confirmValid;
  }

  const allValid =
    fieldState.name &&
    fieldState.email &&
    fieldState.password &&
    fieldState.confirm;
  if (registerBtn) registerBtn.disabled = !allValid;
}

if (registerForm) {
  nameInput?.addEventListener("input", updateFieldStatus);
  emailInput?.addEventListener("input", updateFieldStatus);
  passwordInput?.addEventListener("input", () => {
    updateFieldStatus();
    if (confirmInput && confirmInput.value) updateFieldStatus();
  });
  confirmInput?.addEventListener("input", updateFieldStatus);

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (registerBtn?.disabled) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast("Registro exitoso. Redirigiendo al login...", "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } else {
        showToast(data.error || "Error al registrar usuario", "error");
      }
    } catch (error) {
      console.error("Error de red:", error);
      showToast("Error de conexión con el servidor", "error");
    }
  });

  updateFieldStatus(); // inicial
}

// --- Lógica del Login ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const loginEmailInput = document.getElementById("email");
  const loginPasswordInput = document.getElementById("password");
  const loginErrorDiv = document.getElementById("loginError");

  function validateLoginEmail() {
    const value = loginEmailInput.value;
    const isValid = validateEmailFormat(value);
    if (value === "") {
      loginEmailInput.classList.remove("valid", "invalid");
    } else {
      loginEmailInput.classList.toggle("valid", isValid);
      loginEmailInput.classList.toggle("invalid", !isValid);
    }
    return isValid;
  }

  function validateLoginPassword() {
    const value = loginPasswordInput.value;
    const isValid = validatePasswordComplexity(value);
    if (value === "") {
      loginPasswordInput.classList.remove("valid", "invalid");
    } else {
      loginPasswordInput.classList.toggle("valid", isValid);
      loginPasswordInput.classList.toggle("invalid", !isValid);
    }
    return isValid;
  }

  // Forzar validación tras autocompletado
  validateLoginEmail();
  validateLoginPassword();

  loginEmailInput.addEventListener("input", validateLoginEmail);
  loginPasswordInput.addEventListener("input", validateLoginPassword);

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();
    if (!isEmailValid || !isPasswordValid) {
      showToast("Por favor, complete correctamente todos los campos.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmailInput.value,
          password: loginPasswordInput.value,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        if (loginErrorDiv) loginErrorDiv.textContent = "";
        showToast(`Bienvenido ${data.user.name}`, "success");
        setTimeout(() => {
          window.location.href = "/dashboard.html";
        }, 1500);
      } else {
        const msg = data.error || "Credenciales inválidas";
        if (loginErrorDiv) loginErrorDiv.textContent = msg;
        showToast(msg, "error");
      }
    } catch (error) {
      console.error("Error en login:", error);
      const msg = "Error de conexión con el servidor";
      if (loginErrorDiv) loginErrorDiv.textContent = msg;
      showToast(msg, "error");
    }
  });
}
