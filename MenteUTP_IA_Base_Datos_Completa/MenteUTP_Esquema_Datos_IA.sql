-- Datos educativos y ficticios. NO cargar datos personales de estudiantes.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS ejemplos_entrenamiento (
 id_ejemplo TEXT PRIMARY KEY,
 contexto TEXT NOT NULL,
 opcion_atencion_afin TEXT NOT NULL CHECK(opcion_atencion_afin IN ('bienestar_universitario','estres_academico','situaciones_personales')),
 origen TEXT NOT NULL CHECK(origen='sintetico_nuevo_no_clinico')
);
CREATE INDEX IF NOT EXISTS idx_ejemplos_etiqueta ON ejemplos_entrenamiento(opcion_atencion_afin);
