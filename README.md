# 🚪 Gestion-Control-de-Acceso

Sistema integral de control de acceso para torres corporativas, desarrollado con Node.js, Express, MongoDB y un frontend moderno e intuitivo.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#descripción-del-proyecto)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## 🏢 Descripción del Proyecto

**Gestion-Control-de-Accesso** es una aplicación web full-stack diseñada para optimizar la gestión de visitantes en torres empresariales o entornos corporativos de alta afluencia. Permite a los equipos de seguridad registrar el ingreso, monitorear la estancia en tiempo real y gestionar la salida de cada visitante, incluyendo datos de vehículos, empresa destino y frecuencia de visita.

El sistema incorpora autenticación segura con JWT (almacenado en cookies HttpOnly), gestión de visitantes recurrentes, directorio de empresas, reportes diarios exportables y un proceso automatizado de cierre de guardia que archiva todos los registros activos al final de cada jornada.

---

## ✨ Características Principales

| Módulo                  | Funcionalidades                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Autenticación**       | Registro de usuarios con verificación de email, login con JWT en cookie HttpOnly, cierre de sesión                |
| **Registro de Visitas** | Formulario con validaciones, autocompletado de visitantes recurrentes, carnet numérico de 3 dígitos               |
| **Panel de Activos**    | Visualización de visitantes actuales, búsqueda en tiempo real, marcado de "recogido" y registro de hora de salida |
| **Reportes**            | Reporte diario agrupado por compañía, total general, opción de impresión y archivo automático al cerrar guardia   |
| **Directorio**          | CRUD completo de compañías (con logo opcional en Base64) y CRUD de visitantes recurrentes                         |
| **Diseño Responsive**   | Interfaz adaptable a móviles con menú hamburguesa y toasts de notificación                                        |

### 🔐 Validaciones Implementadas

- **Carnet:** exactamente 3 dígitos numéricos
- **Contraseña:** 8-15 caracteres, al menos una mayúscula, una minúscula y un número
- **Nombre:** debe incluir nombre y apellido, ambos iniciando con mayúscula
- **Email:** validación de formato + verificación externa (EmailListVerify API)

---

## 🛠️ Tecnologías Utilizadas

| Capa              | Tecnologías                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **Backend**       | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, dotenv, axios, cookie-parser, morgan, email-validator |
| **Frontend**      | HTML5, CSS3 (Flexbox/Grid), JavaScript ES6 (vanilla), Font Awesome                                       |
| **Base de Datos** | MongoDB Atlas (nube)                                                                                     |
| **Herramientas**  | NPM, Git, Nodemon (desarrollo)                                                                           |
| **Seguridad**     | CORS, Cookies HttpOnly (JWT), bcrypt (hash de contraseñas), validación de emails externa                 |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v16 o superior
- [MongoDB Atlas](https://www.mongodb.com/atlas) cuenta gratuita (o MongoDB local)
- [Git](https://git-scm.com/) para clonar el repositorio
- Cuenta en [EmailListVerify](https://emaillistverify.com/) para validación de emails

---

## 🚀 Instalación

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

```bash
# 1. Clonar el repositorio
git clone https://github.com/delgadillow79-star/Gestion-Control-de-Accesso.git

# 2. Acceder al directorio del proyecto
cd Gestion-Control-de-Accesso

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno (ver siguiente sección)
# Crear archivo .env manualmente con tus valores

# 5. Iniciar el servidor en modo desarrollo
npm run dev

# 6. Abrir el navegador en http://localhost:3000

⚙️ Configuración
Crea un archivo .env en la raíz del proyecto con las siguientes variables:
# Puerto del servidor
PORT=3000

# Conexión a MongoDB Atlas
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.xxxxx.mongodb.net/<basededatos>?retryWrites=true&w=majority

# Secreto para JWT (mínimo 32 caracteres)
ACCESS_TOKEN_SECRET=tu_clave_secreta_aqui

# Entorno (development / production)
NODE_ENV=development

# API Key para verificación de emails (EmailListVerify)
EMAIL_API_KEY=tu_api_key_aqui

🔐 Configuración de MongoDB Atlas
Crea una cuenta gratuita en MongoDB Atlas

Crea un nuevo cluster (nivel gratuito M0)

En "Database Access", crea un usuario y contraseña

En "Network Access", permite acceso desde cualquier IP (0.0.0.0/0) o tu IP específica

Copia tu cadena de conexión (MONGO_URI) y pégala en .env

⚠️ IMPORTANTE: Nunca subas el archivo .env al repositorio. El .gitignore ya está configurado para ignorarlo.
💻 Uso
Flujo de trabajo típico

1. Registro de usuario
   ↓
2. Inicio de sesión
   ↓
3. Dashboard Principal
   ↓
   ├── Nuevo Registro → Completar datos del visitante → Guardar visita
   ├── Visitantes Activos → Buscar visitante → Marcar Recogido → Registrar Salida
   ├── Reportes → Generar Reporte → Cerrar Guardia → Archivar Automático
   └── Directorio → Administrar Compañías / Visitantes Recurrentes

    Registro de usuario
Accede a http://localhost:3000/registro.html

Completa el formulario:

Nombre: nombre y apellido, ambos con mayúscula inicial

Email: formato válido (se verifica externamente)

Contraseña: 8-15 caracteres, una mayúscula, una minúscula y un número

2. Inicio de sesión
En http://localhost:3000/, ingresa tus credenciales

El sistema guarda una cookie HttpOnly con el token JWT

3. Dashboard Principal
Opción	Descripción
Nuevo Registro	Registrar la entrada de un visitante
Visitantes Activos	Visualizar y gestionar visitantes actuales
Reportes	Generar reportes diarios agrupados por compañía
Directorio	Administrar compañías y visitantes recurrentes
4. Registro de visitante
Escribe el nombre: si es visitante recurrente, se autocompletan sus datos

Carnet: exactamente 3 dígitos numéricos

Hora de entrada: se registra automáticamente

5. Gestión de visitantes activos
Tabla completa con todos los visitantes registrados

Búsqueda en tiempo real: por cualquier campo

Checkbox "Recogido": indica que el visitante está en reunión

Botón "Salida": registra la hora de salida

6. Reporte diario
Agrupa visitantes por compañía visitada

Muestra total general

Botón "Descargar PDF / Imprimir": abre diálogo de impresión y archiva automáticamente todos los registros del operador

7. Directorio
Pestaña	Funcionalidad
Compañías	Agregar, editar o eliminar compañías (logo opcional en Base64)
Visitantes Recurrentes	CRUD completo de perfiles para autocompletado futuro

📁 Estructura del Proyecto
Gestion-Control-de-Accesso/
│
├── .env                     # Variables de entorno (no se sube a GitHub)
├── .gitignore               # Archivos ignorados por Git
├── app.js                   # Configuración principal de Express
├── server.js                # Punto de entrada del servidor
├── package.json             # Dependencias y scripts
├── package-lock.json        # Bloqueo de versiones exactas
│
├── config/
│   └── config.js            # Conexión a MongoDB
│
├── controllers/
│   ├── authController.js    # Registro, login, logout, getMe
│   ├── globalController.js  # CRUD de compañías y visitantes recurrentes
│   ├── visitController.js   # CRUD de visitas, reportes, archivado
│   └── visitorController.js # (Legacy) Control de visitantes
│
├── middleware/
│   └── authMiddleware.js    # Verificación de token JWT
│
├── models/
│   ├── user.js              # Modelo de Usuario
│   ├── Visit.js             # Modelo de Visita (con campo archived)
│   ├── Company.js           # Modelo de Compañía
│   └── RecurrentVisitor.js  # Modelo de Visitante Recurrente
│
├── routes/
│   ├── authRoutes.js        # Endpoints de autenticación
│   ├── globalRoutes.js      # Endpoints de directorio global
│   ├── visitRoutes.js       # Endpoints de visitas
│   └── visitorRoutes.js     # Endpoints legacy
│
└── views/
    ├── index.html           # Página de login
    ├── registro.html        # Página de registro
    ├── dashboard.html       # Panel principal (SPA)
    ├── css/
    │   ├── style.css        # Estilos de login/registro
    │   ├── dashboard.css    # Estilos del panel
    │   └── img/             # Imágenes del sistema (logo.jpg, login.png)
    ├── js/
    │   ├── auth.js          # Lógica de login/registro
    │   └── dashboard.js     # Lógica completa del dashboard (SPA)
    └── video/
        └── REGISTRO.mp4     # Video de fondo en página de registro

        API Reference
Autenticación (/api/auth)
Método	Endpoint	Descripción	Autenticación
POST	/register	Registrar nuevo usuario	No
POST	/login	Iniciar sesión (devuelve cookie HttpOnly)	No
POST	/logout	Cerrar sesión	No
GET	/me	Obtener usuario actual	Sí
Visitas (/api/visits)
Método	Endpoint	Descripción	Autenticación
GET	/active	Obtener visitas activas del usuario	Sí
GET	/all	Obtener todas las visitas NO archivadas	Sí
POST	/	Crear nueva visita	Sí
PUT	/:id	Actualizar visita (recogido, horaSalida)	Sí
GET	/report	Obtener reporte diario agrupado por compañía	Sí
POST	/archive	Archivar todas las visitas del usuario (cierre de guardia)	Sí
Directorio Global (/api/global)
Método	Endpoint	Descripción	Autenticación
GET	/companies	Obtener todas las compañías	Sí
POST	/companies	Crear nueva compañía	Sí
PUT	/companies/:id	Actualizar compañía	Sí
DELETE	/companies/:id	Eliminar compañía	Sí
GET	/recurrent	Obtener visitantes recurrentes	Sí
POST	/recurrent	Crear visitante recurrente	Sí
PUT	/recurrent/:id	Actualizar visitante recurrente	Sí
DELETE	/recurrent/:id	Eliminar visitante recurrente	Sí
Ejemplo: Registrar una visita
Petición:

http
POST /api/visits
Cookie: accessToken=<jwt_token>
Content-Type: application/json

{
  "carnet": "001",
  "nombre": "María González",
  "cedula": "12345678",
  "anfitrion": "Daniela",
  "empresaProcedencia": "AGV",
  "empresaVisitar": "IBM",
  "vehiculoModelo": "SBR",
  "vehiculoColor": "AZUL",
  "vehiculoPlaca": "220583WD"
}
Respuesta (201 Created):

json
{
  "_id": "60f7b3e5c8d4e9a1b2c3d4e6",
  "carnet": "001",
  "nombre": "María González",
  "horaEntrada": "10:30:45",
  "recogido": false,
  "horaSalida": null,
  "archived": false
}
🤝 Contribución
Las contribuciones son bienvenidas. Para cambios importantes:

Fork el proyecto

Crea una rama: git checkout -b feature/nueva-funcionalidad

Commit tus cambios: git commit -m 'Añadir nueva funcionalidad X'

Push a la rama: git push origin feature/nueva-funcionalidad

Abre un Pull Request

Estándares de código
Usa nombres de variables descriptivos

Comenta funciones complejas

Sigue el patrón MVC existente

## 🌐 Aplicación en vivo

La aplicación está desplegada y funcionando en Render:

🔗 [https://gestion-control-de-acceso.onrender.com]

📄 Licencia
Distribuido bajo la licencia MIT. Consulta el archivo LICENSE para más información.

text
MIT License

Copyright (c) 2026 William Delgadillo

📬 Contacto

Autor: William Delgadillo

GitHub: @delgadillow79-star

Proyecto: Gestion-Control-de-Accesso

```
