async function checkAuth() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      window.location.href = "/";
      return null;
    }
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    window.location.href = "/";
    return null;
  }
}

// ==================== VARIABLES GLOBALES ====================
let currentUser = null;
let towerCompanies = [];
let recurrentVisitors = [];
let activeVisitors = [];
let currentActiveView = "main";

// ==================== FUNCIONES DE API ====================
const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error en la petición");
  }
  return response.json();
};

// Cargar datos globales
const loadGlobalData = async () => {
  try {
    const [companies, recurrent] = await Promise.all([
      apiRequest("/api/global/companies"),
      apiRequest("/api/global/recurrent"),
    ]);
    towerCompanies = companies;
    recurrentVisitors = recurrent;
  } catch (error) {
    console.error("Error cargando datos globales:", error);
    showToast("Error al cargar datos del directorio", "error");
  }
};

// Cargar visitas activas del usuario
const loadActiveVisits = async () => {
  try {
    activeVisitors = await apiRequest("/api/visits/active");
  } catch (error) {
    console.error("Error cargando visitas activas:", error);
    activeVisitors = [];
  }
};

// Cargar TODAS las visitas NO archivadas del usuario
const loadAllVisits = async () => {
  try {
    return await apiRequest("/api/visits/all");
  } catch (error) {
    console.error("Error cargando todas las visitas:", error);
    return [];
  }
};

// ==================== TOAST ====================
const showToast = (message, type = "success") => {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast-close">&times;</button>`;
  container.appendChild(toast);
  const closeBtn = toast.querySelector(".toast-close");
  let timeout = setTimeout(() => closeToast(toast), 3000);
  const closeToast = (t) => {
    clearTimeout(timeout);
    t.style.animation = "fadeOut 0.5s ease forwards";
    setTimeout(() => t.remove(), 500);
  };
  closeBtn.addEventListener("click", () => closeToast(toast));
};

// ==================== AUXILIARES ====================
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const closeMobileMenu = () => {
  const toggle = document.getElementById("nav-toggle");
  if (toggle && toggle.checked) toggle.checked = false;
};

const changeView = (viewName, renderFunc, navIndex) => {
  if (currentActiveView === viewName) return;
  currentActiveView = viewName;
  closeMobileMenu();
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => link.classList.remove("active"));
  if (navIndex >= 0 && navLinks[navIndex])
    navLinks[navIndex].classList.add("active");
  renderFunc();
};

// ==================== GENERAR AVATAR ====================
const updateUserAvatar = (userName) => {
  const avatarContainer = document.getElementById("userProfileBtn");
  if (!avatarContainer) return;
  const names = userName.trim().split(/\s+/);
  let initials = "";
  if (names.length === 1) {
    initials = names[0].charAt(0).toUpperCase();
  } else {
    initials =
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase();
  }

  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const backgroundColor = `hsl(${hue}, 70%, 55%)`;

  avatarContainer.innerHTML = "";
  avatarContainer.style.display = "flex";
  avatarContainer.style.alignItems = "center";
  avatarContainer.style.justifyContent = "center";
  avatarContainer.style.width = "40px";
  avatarContainer.style.height = "40px";
  avatarContainer.style.borderRadius = "50%";
  avatarContainer.style.backgroundColor = backgroundColor;
  avatarContainer.style.color = "white";
  avatarContainer.style.fontWeight = "bold";
  avatarContainer.style.fontSize = "1.2rem";
  avatarContainer.style.textTransform = "uppercase";
  avatarContainer.style.cursor = "pointer";
  avatarContainer.textContent = initials;
};

// ==================== ACTUALIZAR DROPDOWN DEL USUARIO ====================
const updateUserDropdown = (user) => {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;

  dropdown.innerHTML = "";

  const userInfoDiv = document.createElement("div");
  userInfoDiv.className = "dropdown-user-info";
  userInfoDiv.innerHTML = `
    <div class="user-name">${user.name}</div>
    <div class="user-email">${user.email}</div>
  `;
  dropdown.appendChild(userInfoDiv);

  const newLogoutBtn = document.createElement("button");
  newLogoutBtn.id = "logoutBtn";
  newLogoutBtn.className = "dropdown-item";
  newLogoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar sesión';
  dropdown.appendChild(newLogoutBtn);

  newLogoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      showToast("Sesión cerrada exitosamente", "success");
      setTimeout(() => (window.location.href = "/"), 800);
    } catch (error) {
      showToast("Error al cerrar sesión", "error");
    }
  });
};

// ==================== ARCHIVAR VISITAS (CIERRE DE GUARDIA) ====================
const archiveUserVisits = async () => {
  try {
    await apiRequest("/api/visits/archive", { method: "POST" });
    showToast(
      "Guardia cerrada. Todos los registros han sido archivados.",
      "success",
    );
    await loadActiveVisits();

    if (currentActiveView === "main") {
      await renderMainView();
    } else if (currentActiveView === "activos") {
      await renderVisitorStatus();
    } else if (currentActiveView === "reportes") {
      await renderDailyReport();
    } else if (currentActiveView === "directorio") {
      await loadGlobalData();
      if (typeof renderDirectoryView === "function") renderDirectoryView();
    }
  } catch (error) {
    showToast(error.message, "error");
  }
};

// ==================== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ====================
/**
 * Muestra una tarjeta modal de confirmación para acciones destructivas.
 * @param {string} message - Mensaje de advertencia (ej: "¿Está seguro de eliminar esta compañía?")
 * @returns {Promise<boolean>} - Se resuelve a true si el usuario confirma, false en caso contrario.
 */
const showDeleteConfirmation = (message) => {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalContainer");
    if (!modal) return resolve(false);

    // Construir la tarjeta de confirmación
    modal.innerHTML = `
      <div class="modal-delete-card" style="background: var(--card-bg); border-radius: 1rem; box-shadow: var(--shadow-md); padding: 1.5rem; max-width: 400px; width: 90%; text-align: center;">
        <div style="font-size: 2.5rem; color: var(--danger); margin-bottom: 0.5rem;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="margin: 0 0 1rem; color: var(--text-dark); font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">Confirmar eliminación</h3>
        <p style="margin: 0 0 1.5rem; color: var(--text-muted); font-size: 0.95rem;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button class="btn-cancel" id="cancelDeleteBtn">Cancelar</button>
          <button class="btn-delete-modal" id="confirmDeleteBtn">Eliminar</button>
        </div>
      </div>
    `;
    modal.classList.add("active");

    const cancelBtn = document.getElementById("cancelDeleteBtn");
    const confirmBtn = document.getElementById("confirmDeleteBtn");

    const closeModal = (result) => {
      modal.classList.remove("active");
      modal.innerHTML = "";
      // Si la vista actual es el directorio, renderizarlo de nuevo para restaurar el DOM
      if (currentActiveView === "directorio") {
        renderDirectoryView();
      }
      resolve(result);
    };

    cancelBtn.addEventListener("click", () => closeModal(false));

    confirmBtn.addEventListener("click", () => closeModal(true));

    // Cerrar al hacer clic fuera de la tarjeta (backdrop)
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(false);
      }
    });

    // Cerrar con tecla Escape
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeModal(false);
        document.removeEventListener("keydown", handleEsc);
      }
    };
    document.addEventListener("keydown", handleEsc);
  });
};

// ==================== VISTA PRINCIPAL ====================
const renderMainView = async () => {
  await loadActiveVisits();
  const activeCount = activeVisitors.filter((v) => !v.horaSalida).length;
  const firstFour = activeVisitors.filter((v) => !v.horaSalida).slice(0, 4);
  const html = `
    <h1 class="page-title">PANEL DE CONTROL PRINCIPAL</h1>
    <div class="cards-grid">
      <div class="card card-register clickable" id="newRegisterCard">
        <div class="card-header"><i class="fas fa-user-plus"></i><h2>NUEVO REGISTRO VISITANTE</h2></div>
        <div class="card-body">
          <div class="register-action">
            <button class="btn-add" id="newRegisterBtn"><i class="fas fa-plus-circle"></i> Nuevo registro</button>
            <span class="helper-text">AGREGAR</span>
          </div>
          <p class="card-description">Crear una nueva entrada para un visitante.</p>
        </div>
      </div>
      <div class="card card-active clickable" id="activeVisitorsCard">
        <div class="card-header"><i class="fas fa-users"></i><h2>VISITANTES ACTIVOS AHORA</h2></div>
        <div class="card-body">
          <div class="active-count">
            <span class="count-number">${activeCount}</span>
            <span class="count-label">Total personas en sitio</span>
          </div>
          <ul class="visitor-list">
            ${firstFour.map((v) => `<li><i class="fas fa-user"></i> ${v.nombre} - Anfitrión: ${v.anfitrion}</li>`).join("")}
            ${activeCount > 4 ? `<li><i class="fas fa-user"></i> <span class="more-indicator">+${activeCount - 4} más</span></li>` : ""}
          </ul>
        </div>
      </div>
      <div class="card card-reports clickable" id="reportCard">
        <div class="card-header"><i class="fas fa-chart-line"></i><h2>REPORTES</h2></div>
        <div class="card-body">
          <p class="reports-desc">Generar reportes de acceso y actividad</p>
          <div class="report-buttons">
            <button class="report-btn" id="dailyReportBtn"><i class="fas fa-file-alt"></i> Reporte Visitantes</button>
          </div>
        </div>
      </div>
      <div class="card card-directory clickable" id="directoryCard">
        <div class="card-header"><i class="fas fa-database"></i><h2>DIRECTORIO DE DATOS Y CONFIGURACIÓN</h2></div>
        <div class="card-body">
          <button class="btn-add" id="openDirectoryBtn"><i class="fas fa-cog"></i> Agregar Compañía / Gestionar</button>
          <p class="card-description" style="margin-top:0.5rem;">Administrar compañías y visitantes recurrentes.</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById("mainContent").innerHTML = html;

  document.getElementById("newRegisterBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    changeView("registro", renderVisitorForm, 0);
  });
  document
    .getElementById("newRegisterCard")
    ?.addEventListener("click", () =>
      changeView("registro", renderVisitorForm, 0),
    );
  document
    .getElementById("activeVisitorsCard")
    ?.addEventListener("click", () =>
      changeView("activos", renderVisitorStatus, 1),
    );
  document.getElementById("dailyReportBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    changeView("reportes", renderDailyReport, 2);
  });
  document
    .getElementById("reportCard")
    ?.addEventListener("click", () =>
      changeView("reportes", renderDailyReport, 2),
    );
  document
    .getElementById("openDirectoryBtn")
    ?.addEventListener("click", (e) => {
      e.stopPropagation();
      changeView("directorio", renderDirectoryView, 3);
    });
  document
    .getElementById("directoryCard")
    ?.addEventListener("click", () =>
      changeView("directorio", renderDirectoryView, 3),
    );
};

// ==================== FORMULARIO DE REGISTRO ====================
const renderVisitorForm = async () => {
  await loadGlobalData();
  if (towerCompanies.length === 0) {
    const html = `
      <div class="visit-form-container">
        <div class="form-header"><h2>CONTROL DE ACCESO - NUEVO VISITANTE</h2></div>
        <div style="text-align: center; padding: 2rem;">
          <i class="fas fa-building" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem; display: block;"></i>
          <h3>No hay compañías registradas</h3>
          <p>Para registrar un visitante, primero debe agregar al menos una compañía en el Directorio.</p>
          <button class="btn-add" id="goToDirectoryBtn" style="margin-top: 1rem;"><i class="fas fa-database"></i> Ir al Directorio</button>
          <button class="btn-back" id="backFromEmptyBtn" style="margin-top: 1rem; margin-left: 0.5rem;">Volver al panel</button>
        </div>
      </div>
    `;
    document.getElementById("mainContent").innerHTML = html;
    document
      .getElementById("goToDirectoryBtn")
      ?.addEventListener("click", () =>
        changeView("directorio", renderDirectoryView, 3),
      );
    document
      .getElementById("backFromEmptyBtn")
      ?.addEventListener("click", () => changeView("main", renderMainView, -1));
    return;
  }

  const namesList = recurrentVisitors.map((v) => v.nombre);
  const datalistOptions = namesList
    .map((name) => `<option value="${name.replace(/"/g, "&quot;")}">`)
    .join("");

  // Generar opciones para el <select> de Empresa a Visitar
  const companyOptions = towerCompanies
    .map(
      (company) =>
        `<option value="${company.name.replace(/"/g, "&quot;")}">${company.name.replace(/"/g, "&quot;")}</option>`,
    )
    .join("");

  const html = `
    <div class="visit-form-container">
      <div class="form-header"><h2>CONTROL DE ACCESO - NUEVO VISITANTE</h2></div>
      <div class="form-block">
        <h3 class="form-section-title">Datos personales</h3>
        <div class="form-row">
          <div class="input-group"><label>Nombre y Apellido</label><input type="text" id="nombre" list="recurrentNamesList" required placeholder="Juan Pérez" autocomplete="off"><datalist id="recurrentNamesList">${datalistOptions}</datalist></div>
          <div class="input-group"><label>Cédula *</label><input type="text" id="cedula" required placeholder="12345678"></div>
          <div class="input-group"><label>Anfitrión *</label><input type="text" id="anfitrion" required placeholder="DANIELA"></div>
          <div class="input-group"><label>Empresa de procedencia</label><input type="text" id="empresaProcedencia" placeholder="Ej: AGV, IBM, Otra"></div>
          <div class="input-group"><label>Empresa a Visitar *</label>
            <select id="empresaVisitar" required>
              <option value="" disabled selected>Seleccione una empresa</option>
              ${companyOptions}
            </select>
          </div>
          <div class="input-group"><label>Carnet * (3 dígitos)</label><input type="text" id="carnet" pattern="[0-9]{3}" maxlength="3" required placeholder="001"></div>
        </div>
      </div>
      <div class="form-section">
        <h3><i class="fas fa-car"></i> DATOS DEL VEHÍCULO (opcional)</h3>
        <div class="form-row">
          <div class="input-group"><label>Modelo</label><input type="text" id="vehiculoModelo" placeholder="SBR"></div>
          <div class="input-group"><label>Color</label><input type="text" id="vehiculoColor" placeholder="AZUL"></div>
          <div class="input-group"><label>Placa</label><input type="text" id="vehiculoPlaca" placeholder="220583WD"></div>
        </div>
      </div>
      <div class="form-actions"><button type="button" class="btn-back" id="backToPanelBtn">Volver al panel</button><button type="submit" class="btn-submit" id="submitVisitBtn" disabled>Registrar visitante</button></div>
    </div>
  `;
  document.getElementById("mainContent").innerHTML = html;

  const nombreInput = document.getElementById("nombre");
  const cedulaInput = document.getElementById("cedula");
  const anfitrionInput = document.getElementById("anfitrion");
  const carnetInput = document.getElementById("carnet");
  const empresaProcedenciaInput = document.getElementById("empresaProcedencia");
  const empresaVisitarInput = document.getElementById("empresaVisitar");
  const submitBtn = document.getElementById("submitVisitBtn");
  const backBtn = document.getElementById("backToPanelBtn");

  const autoCompleteFromName = (selectedName) => {
    const visitor = recurrentVisitors.find(
      (v) => v.nombre.toLowerCase() === selectedName.toLowerCase(),
    );
    if (visitor) {
      cedulaInput.value = visitor.cedula || "";
      empresaProcedenciaInput.value = visitor.empresaProcedencia || "";
      empresaVisitarInput.value = visitor.empresaVisitar || "";
      document.getElementById("vehiculoModelo").value =
        visitor.vehiculoModelo || "";
      document.getElementById("vehiculoColor").value =
        visitor.vehiculoColor || "";
      document.getElementById("vehiculoPlaca").value =
        visitor.vehiculoPlaca || "";
      cedulaInput.dispatchEvent(new Event("input"));
    }
  };

  nombreInput.addEventListener("change", (e) =>
    autoCompleteFromName(e.target.value),
  );

  const validateForm = () => {
    submitBtn.disabled = !(
      nombreInput.checkValidity() &&
      cedulaInput.checkValidity() &&
      anfitrionInput.checkValidity() &&
      carnetInput.checkValidity() &&
      empresaVisitarInput.value.trim() !== ""
    );
  };

  nombreInput.addEventListener("input", validateForm);
  cedulaInput.addEventListener("input", validateForm);
  anfitrionInput.addEventListener("input", validateForm);
  carnetInput.addEventListener("input", validateForm);
  empresaVisitarInput.addEventListener("input", validateForm);
  validateForm();

  backBtn.addEventListener("click", () =>
    changeView("main", renderMainView, -1),
  );

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const carnet = carnetInput.value.trim();
    const nombre = nombreInput.value.trim();
    const cedula = cedulaInput.value.trim();
    const anfitrion = anfitrionInput.value.trim();
    const empresaProc = empresaProcedenciaInput.value.trim();
    const empresaVis = empresaVisitarInput.value.trim();

    if (!empresaVis) {
      showToast("Debe ingresar una empresa a visitar", "error");
      return;
    }
    if (!nombre || !cedula || !anfitrion || !carnet) {
      showToast("Complete todos los campos obligatorios", "error");
      return;
    }
    if (!/^\d{3}$/.test(carnet)) {
      showToast("Carnet debe ser exactamente 3 dígitos", "error");
      return;
    }

    const visitData = {
      carnet,
      nombre,
      cedula,
      anfitrion,
      empresaProcedencia: empresaProc,
      empresaVisitar: empresaVis,
      vehiculoModelo: document.getElementById("vehiculoModelo").value,
      vehiculoColor: document.getElementById("vehiculoColor").value,
      vehiculoPlaca: document.getElementById("vehiculoPlaca").value,
      horaEntrada: getCurrentTime(),
      recogido: false,
      horaSalida: null,
    };

    try {
      await apiRequest("/api/visits", {
        method: "POST",
        body: JSON.stringify(visitData),
      });
      showToast("Usuario registrado exitosamente", "success");
      setTimeout(() => changeView("main", renderMainView, -1), 1500);
    } catch (error) {
      showToast(error.message, "error");
    }
  });
};

// ==================== VISTA DE VISITANTES ACTIVOS ====================
const renderVisitorStatus = async () => {
  const allVisits = await loadAllVisits();
  const totalActive = allVisits.filter((v) => !v.horaSalida).length;
  const inMeeting = allVisits.filter((v) => !v.horaSalida && v.recogido).length;
  const leaving = allVisits.filter((v) => v.horaSalida).length;

  let allRowsHtml = "";
  allVisits.forEach((visitor) => {
    const isActive = !visitor.horaSalida;
    const rowClass = visitor.recogido
      ? "recogido"
      : visitor.horaSalida
        ? "salida"
        : "";
    allRowsHtml += `
      <tr class="${rowClass}" data-id="${visitor._id}">
        <td style="text-align:center" title="${visitor.carnet || "---"}">${visitor.carnet || "---"}</td>
        <td title="${visitor.nombre}">${visitor.nombre}</td>
        <td title="${visitor.cedula}">${visitor.cedula}</td>
        <td title="${visitor.anfitrion}">${visitor.anfitrion}</td>
        <td title="${visitor.empresaProcedencia}">${visitor.empresaProcedencia}</td>
        <td title="${visitor.empresaVisitar}">${visitor.empresaVisitar}</td>
        <td title="${visitor.horaEntrada}">${visitor.horaEntrada}</td>
        <td title="${visitor.horaSalida || "---"}">${visitor.horaSalida || "---"}</td>
        <td style="text-align:center"><input type="checkbox" class="checkbox-recogido" ${visitor.recogido ? "checked" : ""} ${!isActive ? "disabled" : ""}></td>
        <td style="text-align:center"><button class="btn-exit" ${!isActive ? "disabled" : ""}>Salida</button></td>
      </tr>
    `;
  });

  const html = `
    <div class="status-container" id="statusViewContainer">
      <div class="status-header"><h2><i class="fas fa-chart-line"></i> ESTADO DE VISITANTE</h2><button class="btn-back-status" id="backFromStatusBtn"><i class="fas fa-arrow-left"></i> Volver al panel</button></div>
      <div class="status-stats">
        <div class="stat-card"><div class="stat-number">${totalActive}</div><div class="stat-label">Total visitantes activos</div></div>
        <div class="stat-card"><div class="stat-number">${inMeeting}</div><div class="stat-label">En reunión</div></div>
        <div class="stat-card"><div class="stat-number">${leaving}</div><div class="stat-label">Saliendo</div></div>
      </div>
      <div class="status-layout">
        <div class="visitors-table-wrapper">
           <div class="search-container"><div class="ibm-search"><i class="fas fa-search search-icon"></i><input type="text" class="search-input" id="tableSearchInput" placeholder="Buscar por Carnet, Nombre, Cédula o Empresa..."></div></div>
          <table class="visitors-table"><thead><tr><th>Carnet</th><th>Nombre y Apellido</th><th>Cédula</th><th>Anfitrión</th><th>E/P</th><th>E/V</th><th>H/E</th><th>H/S</th><th>Recogido</th><th>Acción</th></tr></thead>
          <tbody id="visitorsTableBody">${allRowsHtml || '<tr><td colspan="10" style="text-align:center">No hay visitantes registrados</td></tr>'}</tbody>
        </table>
        </div>
        <div class="companies-sidebar"><h3><i class="fas fa-building"></i> Compañías en la torre</h3>${towerCompanies.map((c) => `<div class="company-item"><div class="company-logo">${c.logo ? `<img src="${c.logo}" alt="${c.name} logo" style="width:100%;height:100%;object-fit:contain;">` : '<i class="fas fa-building"></i>'}</div><div class="company-name">${c.name}</div></div>`).join("")}</div>
      </div>
    </div>
  `;
  document.getElementById("mainContent").innerHTML = html;

  document
    .getElementById("backFromStatusBtn")
    ?.addEventListener("click", () => changeView("main", renderMainView, -1));

  document.querySelectorAll(".checkbox-recogido").forEach((cb) => {
    const row = cb.closest("tr");
    const visitId = row.dataset.id;
    cb.addEventListener("change", async (e) => {
      const checked = e.target.checked;
      try {
        await apiRequest(`/api/visits/${visitId}`, {
          method: "PUT",
          body: JSON.stringify({ recogido: checked }),
        });
        await renderVisitorStatus();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  document.querySelectorAll(".btn-exit").forEach((btn) => {
    const row = btn.closest("tr");
    const visitId = row.dataset.id;
    btn.addEventListener("click", async () => {
      try {
        await apiRequest(`/api/visits/${visitId}`, {
          method: "PUT",
          body: JSON.stringify({ horaSalida: getCurrentTime() }),
        });
        await renderVisitorStatus();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });

  const searchInput = document.getElementById("tableSearchInput");
  const tableBody = document.getElementById("visitorsTableBody");
  if (searchInput && tableBody) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();
      Array.from(tableBody.querySelectorAll("tr")).forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(term)
          ? ""
          : "none";
      });
    });
  }
};

// ==================== REPORTE DIARIO ====================
const renderDailyReport = async () => {
  let reportData = { report: {}, lastUpdated: Date.now() };
  try {
    reportData = await apiRequest("/api/visits/report");
  } catch (error) {
    showToast("Error al cargar el reporte", "error");
  }
  const { report } = reportData;
  let total = 0,
    rows = "";

  for (const [company, count] of Object.entries(report)) {
    if (count <= 0) continue;
    total += count;
    rows += `<tr><td style="padding:0.75rem; border:1px solid var(--border);">${company}</td><td style="padding:0.75rem; border:1px solid var(--border); text-align:center">${count}</td></tr>`;
  }
  if (!rows)
    rows = `<tr><td colspan="2" style="padding:0.75rem; text-align:center">No hay visitantes registrados por este operador</td></tr>`;

  // Obtener nombre del operador y fecha/hora actual
  const operatorName = currentUser ? currentUser.name : "Desconocido";
  const now = new Date();
  const formattedDate =
    now.toLocaleDateString("es-ES") + " " + now.toLocaleTimeString("es-ES");

  const html = `
    <div class="report-container" id="dailyReportContainer">
      <div class="report-header">
        <h2><i class="fas fa-chart-bar"></i> REPORTE DIARIO DE INGRESO DE PERSONAL VISITANTE DE LA TORRE IBM</h2>
        <div class="report-actions">
          <button class="btn-print" id="printReportBtn"><i class="fas fa-print"></i> Descargar PDF / Imprimir</button>
          <button class="btn-back" id="backFromReportBtn"><i class="fas fa-arrow-left"></i> Volver al panel</button>
        </div>
      </div>
      <!-- Nueva línea: información del operador y fecha -->
      <div class="report-meta" style="margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-gray); border-radius: 0.5rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
        <span><strong>Operador:</strong> ${escapeHtml(operatorName)}</span>
        <span><strong>Fecha y hora de generación:</strong> ${escapeHtml(formattedDate)}</span>
      </div>
      <div class="report-table-wrapper">
        <table class="report-table">
          <thead><tr><th>Compañía</th><th>Cantidad de personas</th></tr></thead>
          <tbody id="reportTableBody">${rows}</tbody>
          <tfoot><tr class="total-row"><td><strong>TOTAL GENERAL DE PERSONAS</strong></td><td style="text-align:center"><strong id="reportTotal">${total}</strong></td></tr></tfoot>
        </table>
      </div>
    </div>
  `;
  document.getElementById("mainContent").innerHTML = html;

  // Función auxiliar para escapar caracteres HTML (seguridad)
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  }

  const printBtn = document.getElementById("printReportBtn");
  const backBtn = document.getElementById("backFromReportBtn");

  if (printBtn) {
    printBtn.addEventListener("click", async () => {
      window.print();
      setTimeout(async () => {
        await archiveUserVisits();
        changeView("main", renderMainView, -1);
      }, 1000);
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () =>
      changeView("main", renderMainView, -1),
    );
  }
};

// ==================== DIRECTORIO GLOBAL ====================
const renderDirectoryView = async () => {
  await loadGlobalData();
  const html = `
    <div class="directory-container">
      <div class="directory-header">
        <h2><i class="fas fa-database"></i> GESTIÓN DE DIRECTORIO</h2>
        <button class="btn-back-status" id="backFromDirectoryBtn"><i class="fas fa-arrow-left"></i> Volver al panel</button>
      </div>
      <div class="tabs">
        <button class="tab-btn active" data-tab="companies">Compañías</button>
        <button class="tab-btn" data-tab="recurrent">Visitantes Recurrentes</button>
      </div>
      <div id="dir-tab-companies" class="tab-content active">
         <button class="btn-add" id="addCompanyBtn" style="margin-bottom:0.5rem;"><i class="fas fa-plus"></i> Agregar Compañía</button>
        <div class="data-table-wrapper"><table class="data-table"><thead><tr><th>Compañía</th><th>Acciones</th></tr></thead><tbody id="companiesTable"></tbody></table></div>
      </div>
      <div id="dir-tab-recurrent" class="tab-content">
        <div class="data-table-wrapper"><table class="recurrent-table"><thead><tr><th>Nombre</th><th>Cédula</th><th>Empresa Proc.</th><th>Empresa Vis.</th><th>Modelo</th><th>Color</th><th>Placa</th><th>Acciones</th></tr></thead><tbody id="recurrentTable"></tbody></table></div>
      </div>
    </div>
  `;
  document.getElementById("mainContent").innerHTML = html;

  document
    .getElementById("backFromDirectoryBtn")
    .addEventListener("click", () => changeView("main", renderMainView, -1));

  const tabs = document.querySelectorAll(".directory-container .tab-btn");
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("dir-tab-companies").classList.remove("active");
      document.getElementById("dir-tab-recurrent").classList.remove("active");
      if (btn.dataset.tab === "companies") {
        document.getElementById("dir-tab-companies").classList.add("active");
        renderCompaniesTable();
      } else {
        document.getElementById("dir-tab-recurrent").classList.add("active");
        renderRecurrentTable();
      }
    });
  });

  document
    .getElementById("addCompanyBtn")
    .addEventListener("click", () => openCompanyModal());
  renderCompaniesTable();
  renderRecurrentTable();
};

const renderCompaniesTable = () => {
  const tbody = document.getElementById("companiesTable");
  if (!tbody) return;
  tbody.innerHTML = "";
  towerCompanies.forEach((comp) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${comp.name}</td><td><div class="action-btns"><button class="btn-edit" data-id="${comp._id}">Editar</button><button class="btn-danger" data-id="${comp._id}">Eliminar</button></div></td>`;
    tbody.appendChild(row);
  });
  document.querySelectorAll("#companiesTable .btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openCompanyModal(btn.dataset.id));
  });
  document.querySelectorAll("#companiesTable .btn-danger").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = await showDeleteConfirmation(
        "¿Está seguro de eliminar esta compañía?",
      );
      if (!confirmed) return;
      try {
        await apiRequest(`/api/global/companies/${btn.dataset.id}`, {
          method: "DELETE",
        });
        await loadGlobalData();
        renderCompaniesTable();
        showToast("Compañía eliminada", "success");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
};

const renderRecurrentTable = () => {
  const tbody = document.getElementById("recurrentTable");
  if (!tbody) return;
  tbody.innerHTML = "";
  recurrentVisitors.forEach((v) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.nombre}</td>
      <td>${v.cedula}</td>
      <td>${v.empresaProcedencia || ""}</td>
      <td>${v.empresaVisitar || ""}</td>
      <td>${v.vehiculoModelo || ""}</td>
      <td>${v.vehiculoColor || ""}</td>
      <td>${v.vehiculoPlaca || ""}</td>
      <td><div class="action-btns"><button class="btn-edit" data-id="${v._id}">Editar</button><button class="btn-danger" data-id="${v._id}">Eliminar</button></div></td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll("#recurrentTable .btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => openRecurrentModal(btn.dataset.id));
  });

  document.querySelectorAll("#recurrentTable .btn-danger").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = await showDeleteConfirmation(
        "¿Está seguro de eliminar este visitante recurrente?",
      );
      if (!confirmed) return;
      try {
        await apiRequest(`/api/global/recurrent/${btn.dataset.id}`, {
          method: "DELETE",
        });
        await loadGlobalData();
        renderRecurrentTable();
        showToast("Visitante eliminado", "success");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  });
};

const openCompanyModal = async (id = null) => {
  const isEdit = !!id;
  let company = { name: "", logo: "" };
  if (isEdit) {
    company = towerCompanies.find((c) => c._id === id);
    if (!company) return;
  }
  const modal = document.getElementById("modalContainer");
  modal.innerHTML = `
    <div class="modal-content" style="min-width: unset; width: 95%; max-width: 400px; max-height: 85vh; overflow-y: auto;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:flex-start;">
        <h3 style="margin:0;">${isEdit ? "Editar Compañía" : "Nueva Compañía"}</h3>
        <button class="btn-close-modal" id="closeInnerModalBtn" title="Cerrar">&times;</button>
      </div>
      <div class="input-group" style="margin-top:1rem;"><label>Nombre</label><input type="text" id="innerCompanyName" value="${company.name ? company.name.replace(/"/g, "&quot;") : ""}" placeholder="Ej: IBM"></div>
      <div class="input-group"><label>Logo (Opcional)</label><div style="display:flex; align-items:center; gap:0.5rem;"><input type="file" id="innerCompanyLogo" accept="image/*" style="display:none;"><button type="button" class="btn-select-logo" id="selectLogoBtn" style="padding: 0.5rem 1rem;"><i class="fas fa-upload"></i> Seleccionar</button></div></div>
      <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1.5rem;"><button class="btn-back" id="cancelInnerModalBtn">Cancelar</button><button class="btn-submit" id="saveInnerCompanyBtn">Guardar</button></div>
    </div>
  `;
  modal.classList.add("active");

  const selectLogoBtn = document.getElementById("selectLogoBtn");
  const logoInput = document.getElementById("innerCompanyLogo");
  if (selectLogoBtn && logoInput)
    selectLogoBtn.addEventListener("click", () => logoInput.click());

  const closeModal = () => {
    modal.classList.remove("active");
    modal.innerHTML = "";
    if (currentActiveView === "directorio") renderDirectoryView();
  };

  document
    .getElementById("closeInnerModalBtn")
    .addEventListener("click", closeModal);
  document
    .getElementById("cancelInnerModalBtn")
    .addEventListener("click", closeModal);
  document
    .getElementById("saveInnerCompanyBtn")
    .addEventListener("click", async () => {
      const newName = document.getElementById("innerCompanyName").value.trim();
      let logoData = company.logo || "";

      if (logoInput.files && logoInput.files[0]) {
        logoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(logoInput.files[0]);
        });
      }

      if (!newName) {
        showToast("Nombre requerido", "error");
        return;
      }

      try {
        if (isEdit) {
          await apiRequest(`/api/global/companies/${id}`, {
            method: "PUT",
            body: JSON.stringify({ name: newName, logo: logoData }),
          });
          showToast("Compañía actualizada", "success");
        } else {
          await apiRequest("/api/global/companies", {
            method: "POST",
            body: JSON.stringify({ name: newName, logo: logoData }),
          });
          showToast("Compañía agregada", "success");
        }
        await loadGlobalData();
        closeModal();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
};

const openRecurrentModal = async (id) => {
  const visitor = recurrentVisitors.find((v) => v._id === id);
  if (!visitor) return;
  const modal = document.getElementById("modalContainer");
  modal.innerHTML = `
    <div class="modal-content" style="min-width: unset; width: 95%; max-width: 600px; min-height: 500px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; padding: 0;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid var(--border);">
        <h3 style="margin:0;">Editar Visitante</h3>
        <button class="btn-close-modal" id="closeInnerModalBtn" title="Cerrar">&times;</button>
      </div>
      <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
        <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div class="input-group"><label>Nombre</label><input type="text" id="editNombre" value="${visitor.nombre.replace(/"/g, "&quot;")}"></div>
          <div class="input-group"><label>Cédula</label><input type="text" id="editCedula" value="${visitor.cedula}"></div>
          <div class="input-group"><label>Empresa procedencia</label><input type="text" id="editEmpresaProc" value="${visitor.empresaProcedencia || ""}"></div>
          <div class="input-group"><label>Empresa a visitar</label><input type="text" id="editEmpresaVis" value="${visitor.empresaVisitar || ""}"></div>
          <div class="input-group"><label>Vehículo Modelo</label><input type="text" id="editModelo" value="${visitor.vehiculoModelo || ""}"></div>
          <div class="input-group"><label>Color</label><input type="text" id="editColor" value="${visitor.vehiculoColor || ""}"></div>
          <div class="input-group"><label>Placa</label><input type="text" id="editPlaca" value="${visitor.vehiculoPlaca || ""}"></div>
        </div>
      </div>
      <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display:flex; gap:1rem; justify-content:flex-end;">
        <button class="btn-back" id="cancelInnerModalBtn">Cancelar</button>
        <button class="btn-submit" id="saveRecurrentBtn">Guardar</button>
      </div>
    </div>
  `;
  modal.classList.add("active");

  const closeModal = () => {
    modal.classList.remove("active");
    modal.innerHTML = "";
    if (currentActiveView === "directorio") renderDirectoryView();
  };

  document
    .getElementById("closeInnerModalBtn")
    .addEventListener("click", closeModal);
  document
    .getElementById("cancelInnerModalBtn")
    .addEventListener("click", closeModal);
  document
    .getElementById("saveRecurrentBtn")
    .addEventListener("click", async () => {
      const newNombre = document.getElementById("editNombre").value.trim();
      const newCedula = document.getElementById("editCedula").value.trim();
      if (!newNombre || !newCedula) {
        showToast("Nombre y cédula obligatorios", "error");
        return;
      }
      const updated = {
        nombre: newNombre,
        cedula: newCedula,
        empresaProcedencia: document.getElementById("editEmpresaProc").value,
        empresaVisitar: document.getElementById("editEmpresaVis").value,
        vehiculoModelo: document.getElementById("editModelo").value,
        vehiculoColor: document.getElementById("editColor").value,
        vehiculoPlaca: document.getElementById("editPlaca").value,
      };

      try {
        await apiRequest(`/api/global/recurrent/${id}`, {
          method: "PUT",
          body: JSON.stringify(updated),
        });
        await loadGlobalData();
        closeModal();
        showToast("Visitante actualizado", "success");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
};

// ==================== INICIALIZACIÓN ====================
document.addEventListener("DOMContentLoaded", async () => {
  const user = await checkAuth();
  if (!user) return;
  currentUser = user;

  updateUserAvatar(user.name);
  updateUserDropdown(user);

  await loadGlobalData();

  const navLinks = document.querySelectorAll(".nav-links a");
  if (navLinks.length >= 4) {
    navLinks[0].addEventListener("click", (e) => {
      e.preventDefault();
      changeView("registro", renderVisitorForm, 0);
    });
    navLinks[1].addEventListener("click", (e) => {
      e.preventDefault();
      changeView("activos", renderVisitorStatus, 1);
    });
    navLinks[2].addEventListener("click", (e) => {
      e.preventDefault();
      changeView("reportes", renderDailyReport, 2);
    });
    navLinks[3].addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileMenu();
      changeView("directorio", renderDirectoryView, 3);
    });
  }

  const logo = document.querySelector(".nav-brand");
  if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () =>
      changeView("main", renderMainView, -1),
    );
  }

  const userProfileBtn = document.getElementById("userProfileBtn");
  const userDropdown = document.getElementById("userDropdown");
  if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (
        !userProfileBtn.contains(e.target) &&
        !userDropdown.contains(e.target)
      ) {
        userDropdown.classList.remove("active");
      }
    });
  }

  renderMainView();
});
