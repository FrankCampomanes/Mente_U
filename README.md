# MenteU — Plataforma de Acompañamiento y Bienestar Universitario

Plataforma de orientación inicial con IA empática y agendamiento de citas de bienestar psicológico para estudiantes universitarios del Perú.

## 🚀 Arquitectura y Tecnologías
- **Frontend:** React + Vite (Desplegable en Vercel) en `frontend-react/`
- **Backend:** Python + FastAPI con Arquitectura Hexagonal en `app/`
- **Base de Datos:** MySQL (XAMPP) en `database/menteu_mysql.sql`
- **Pruebas:** Pytest con casos de prueba del ciclo PDCA en `tests/`

## 📦 Ejecución Rápida

### 1. Frontend (React)
```bash
cd frontend-react
npm install
npm run dev
```
Acceder a: `http://localhost:5173`

### 2. Backend (FastAPI)
```bash
pip install -r requirements.txt
python main.py
```
Documentación interactiva Swagger: `http://localhost:8000/docs`

### 3. Pruebas Unitarias
```bash
pytest tests/
```
