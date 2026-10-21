# GUÍA DE TRABAJO 10: PMV1 Y PDCA
## PROYECTO: MenteU — Plataforma de Orientación y Apoyo Emocional Universitario
### CURSO: Diseño de Productos y Servicios

---

# ACTIVIDAD 2: ORGANIZACIÓN E IMPLEMENTACIÓN DEL PMV1

---

## 2.1. ESTRUCTURA DEL CÓDIGO SEGÚN LA ARQUITECTURA HEXAGONAL

El proyecto **MenteU** se organiza en el IDE y en el repositorio respetando estrictamente el principio de inversión de dependencias y el aislamiento del núcleo del negocio.

### Árbol de Directorios del Repositorio

```text
menteu-pmv1/
├── app/
│   ├── domain/                              # Núcleo: Entidades puras y reglas de negocio
│   │   ├── __init__.py
│   │   ├── cita.py                          # Entidad Cita y validación de estados
│   │   └── sesion.py                        # Entidad Sesión y reglas de consentimiento
│   ├── application/                         # Casos de Uso (Orquestación del negocio)
│   │   ├── __init__.py
│   │   ├── agendar_cita.py                  # Caso de uso: Registrar y reservar cita
│   │   └── orientar_estudiante.py           # Caso de uso: Asistencia empática inicial
│   ├── ports/                               # Interfaces / Contratos abstractos
│   │   ├── __init__.py
│   │   ├── cita_repository.py               # Puerto de persistencia de citas
│   │   └── ia_orientacion.py                # Puerto del motor de IA empática
│   ├── adapters/                            # Adaptadores que conectan el mundo exterior
│   │   ├── entrada/                         # Driving / Primarios
│   │   │   ├── __init__.py
│   │   │   └── cita_controller.py           # API REST con FastAPI (Rutas HTTP y DTOs)
│   │   └── salida/                          # Driven / Secundarios
│   │       ├── __init__.py
│   │       ├── cita_repo_mysql.py           # Adaptador de persistencia para MySQL (XAMPP)
│   │       └── gemini_ia_adapter.py         # Adaptador del servicio de IA
│   └── infrastructure/                      # Conexiones técnicas y configuración
│       ├── __init__.py
│       └── database_mysql.py                # Pool de conexión a MySQL con PyMySQL
├── frontend-react/                          # Interfaz Web en React + Vite (Listo para Vercel)
│   ├── src/
│   │   ├── App.jsx                          # Componente interactivo de los 12 wireframes
│   │   ├── App.css                          # Estilos visuales con paleta de bienestar
│   │   └── main.jsx                         # Punto de anclaje de React
│   ├── package.json                         # Dependencias y scripts de construcción
│   └── vite.config.js                       # Configuración de empaquetado para despliegue
├── database/                                # Scripts de base de datos relacional
│   └── menteu_mysql.sql                     # DDL de tablas y datos semilla para XAMPP
├── tests/                                   # Pruebas automatizadas del PMV1
│   ├── __init__.py
│   └── test_agendar_cita.py                 # Pruebas unitarias de las reglas del dominio
├── .env.example                             # Variables de entorno de ejemplo sin credenciales
├── .gitignore                               # Exclusión de archivos temporales y secretos
├── main.py                                  # Punto de entrada de la aplicación FastAPI
├── requirements.txt                         # Dependencias del proyecto
└── README.md                                # Documentación de instalación y uso
```

La estructura hexagonal organiza el código desacoplando las reglas de negocio de cualquier tecnología externa: la capa de **dominio** contiene las entidades centrales (`Cita`) y valida las reglas del servicio (como estados de horario y duración de sesión); la capa de **aplicación** orquesta los casos de uso (`agendar_cita.py`) coordinando la lógica sin tocar SQL; los **puertos** definen las interfaces abstractas de persistencia e IA; los **adaptadores** comunican el mundo exterior con el núcleo (en la entrada el controlador web de FastAPI que recibe las peticiones HTTP y en la salida el repositorio MySQL que interactúa con XAMPP); e **infraestructura** administra la conexión y credenciales seguras.

---

## 2.2. Configuración de GitHub

### Flujo mínimo de trabajo:

```bash
git init
git add .
git commit -m "chore: estructura inicial del PMV1"
git branch -M main
git remote add origin <URL_REPOSITORIO>
git push -u origin main
```

### Para desarrollar una historia de usuario:

```bash
git switch -c feature/registro-solicitudes
# Implementar y probar
git add .
git commit -m "feat: registrar solicitudes"
git push -u origin feature/registro-solicitudes
```

El equipo abrirá un pull request para revisar e integrar los cambios a la rama `main`.

**Consideraciones:** Documentar la instalación en `README.md`, excluir secretos mediante `.gitignore` y utilizar `.env.example` sin credenciales reales.


---

## 2.3. SEGURIDAD Y CONFIGURACIÓN DEL ENTORNO

### Archivo `.gitignore`
Evita que se suban credenciales, cachés de Python o dependencias locales al repositorio público:

```gitignore
# Entorno virtual y dependencias
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
env/

# Variables de entorno confidenciales
.env
*.local

# IDEs y editores
.vscode/
.idea/
*.swp

# Logs y bases de datos temporales
*.log
*.sqlite3
```

### Archivo `.env.example`
Plantilla limpia que indica qué variables configurar sin exponer contraseñas reales:

```env
# Configuración del Servidor FastAPI
APP_ENV=development
APP_PORT=8000

# Base de Datos MySQL (XAMPP por defecto)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bd_menteu
```

---

## 2.4. EVIDENCIAS DE EJECUCIÓN Y VALIDACIÓN DEL PMV1

Las siguientes comprobaciones describen las evidencias técnicas y operativas acreditadas durante la ejecución del Primer Producto Mínimo Viable (PMV1) de **MenteU**, tanto en el entorno de desarrollo local como en el entorno desplegado en la nube:

### 1. Servidor Backend y Swagger UI Activo
* **Entorno Local:** El servidor backend se ejecuta mediante FastAPI y Uvicorn con el comando:
  ```bash
  python -m uvicorn main:app --reload --port 8000
  ```
* **Documentación Interactiva:** Acceso operativo a `http://localhost:8000/docs` (Swagger UI), donde se verificó el correcto funcionamiento de los endpoints REST (`POST /api/citas` para registrar reservas y `GET /api/citas/usuario/{id}` para consultar el historial).
* **Despliegue en la Nube:** Acreditado en **Render** como Web Service continuo en Python 3 (`uvicorn main:app --host 0.0.0.0 --port $PORT`), conectado a la base de datos relacional.

### 2. Frontend Interactivo en React + Vite
* **Entorno Local:** Desarrollado bajo la arquitectura de componentes en `frontend-react/`, ejecutado con:
  ```bash
  cd frontend-react
  npm install
  npm run dev
  ```
  Acceso en `http://localhost:5173/`, permitiendo navegar de forma interactiva y fluida por las 12 pantallas que componen los tres prototipos aprobados (conversación empática con Frenz, selección de atención/especialista y confirmación de cita).
* **Despliegue en Producción (Vercel):** Frontend compilado y desplegado de manera pública y accesible 24/7 en el dominio:
  👉 **`https://mente-u-nine.vercel.app`**

### 3. Verificación de Persistencia Transaccional en Base de Datos MySQL
* **Entorno Local (XAMPP / phpMyAdmin):** Base de datos `bd_menteu` estructurada con 8 tablas relacionales (`usuarios`, `profesionales`, `disponibilidad`, `citas`, `sesiones_orientacion`, `consentimientos`, `opciones_atencion` y `resenas`).
* **Entorno en la Nube (Aiven Cloud):** Servicio MySQL Cloud aprovisionado e integrado mediante conexión segura SSL en el puerto `10890`.
* **Prueba de Integración y Concurrencia:** Tras pulsar el botón *"Confirmar Agendamiento"* en el frontend:
  1. Se genera un nuevo registro en la tabla `citas` con estado `'solicitada'`.
  2. El registro correspondiente en la tabla `disponibilidad` actualiza su estado de `'libre'` a `'reservada'`.
  3. Ambas operaciones se ejecutan de forma atómica (`BEGIN ... COMMIT / ROLLBACK`), garantizando que no existan reservas dobles ni inconsistencias de horario.

### 4. Pruebas Automatizadas y Control de Calidad
* Ejecución de pruebas unitarias con la herramienta `pytest` dentro del directorio `tests/` (`pytest tests/`), obteniendo el 100% de casos aprobados (`2 passed in 0.26s`) para validación de estados y prevención de horarios ocupados.
* Control de versiones, ramas y trazabilidad de commits disponible en el repositorio de GitHub:  
  👉 **`https://github.com/FrankCampomanes/Mente_U`**
