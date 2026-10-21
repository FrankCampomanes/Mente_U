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

## 2.4. EVIDENCIAS DE EJECUCIÓN DEL PMV1

1. **Servidor API Activo:** Ejecutando `python -m uvicorn main:app --reload` en el puerto `8000`.
2. **Swagger UI Interactivo:** Acceso directo en `http://localhost:8000/docs` para que el docente pruebe los endpoints en vivo con documentación OpenAPI automática.
3. **Frontend Interactivo:** Visualización de la interfaz en `http://localhost:8000/` o abriendo `frontend/index.html`.
4. **Verificación en phpMyAdmin:** Tras pulsar *"Confirmar Agendamiento"*, se verifica en MySQL que el registro se insertó en la tabla `citas` y que el horario en `disponibilidad` cambió de `'libre'` a `'reservada'`.
