-- MenteUTP IA: base RELACIONAL DE DEMOSTRACION, separada de entrenamiento.
-- No contiene conversaciones reales ni dispone de autenticacion productiva.
PRAGMA foreign_keys = ON;

CREATE TABLE usuarios (
 id TEXT PRIMARY KEY,
 alias TEXT NOT NULL UNIQUE,
 creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sesiones_orientacion (
 id TEXT PRIMARY KEY,
 usuario_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
 estado TEXT NOT NULL CHECK(estado IN ('abierta','cerrada')) DEFAULT 'abierta',
 inicio TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 fin TEXT,
 resumen_orientativo TEXT,
 guardado_autorizado INTEGER NOT NULL DEFAULT 0 CHECK(guardado_autorizado IN (0,1)),
 CHECK (guardado_autorizado=1 OR resumen_orientativo IS NULL)
);
-- No existe una tabla de mensajes: el contenido de chat se procesa temporalmente.
-- El resumen se guarda solo tras consentimiento y nunca equivale a diagnostico.

CREATE TABLE consentimientos (
 id TEXT PRIMARY KEY,
 sesion_id TEXT NOT NULL REFERENCES sesiones_orientacion(id) ON DELETE CASCADE,
 tipo TEXT NOT NULL CHECK(tipo IN ('ver_opciones','guardar_resumen','compartir_resumen')),
 autorizado INTEGER NOT NULL CHECK(autorizado IN (0,1)),
 fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(sesion_id,tipo)
);

CREATE TABLE recomendaciones (
 id TEXT PRIMARY KEY,
 sesion_id TEXT NOT NULL REFERENCES sesiones_orientacion(id) ON DELETE CASCADE,
 opcion_atencion_afin TEXT NOT NULL CHECK(opcion_atencion_afin IN ('bienestar_universitario','estres_academico','situaciones_personales')),
 modelo_version TEXT NOT NULL,
 solicitada_por_usuario INTEGER NOT NULL CHECK(solicitada_por_usuario=1),
 fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opciones_atencion (
 id TEXT PRIMARY KEY,
 nombre TEXT NOT NULL,
 tipo TEXT NOT NULL CHECK(tipo IN ('institucional','particular')),
 modalidad TEXT NOT NULL CHECK(modalidad IN ('virtual','presencial','mixta')),
 descripcion TEXT,
 costo_referencial_soles REAL CHECK(costo_referencial_soles IS NULL OR costo_referencial_soles >= 0),
 perfil_verificado INTEGER NOT NULL DEFAULT 0 CHECK(perfil_verificado IN (0,1)),
 es_demo INTEGER NOT NULL DEFAULT 1 CHECK(es_demo IN (0,1))
);

CREATE TABLE profesionales (
 id TEXT PRIMARY KEY,
 opcion_id TEXT NOT NULL REFERENCES opciones_atencion(id),
 nombre_mostrado TEXT NOT NULL,
 especialidad_descriptiva TEXT,
 perfil_verificado INTEGER NOT NULL DEFAULT 0 CHECK(perfil_verificado IN (0,1)),
 es_demo INTEGER NOT NULL DEFAULT 1 CHECK(es_demo IN (0,1))
);

CREATE TABLE disponibilidad (
 id TEXT PRIMARY KEY,
 profesional_id TEXT NOT NULL REFERENCES profesionales(id),
 inicio TEXT NOT NULL,
 fin TEXT NOT NULL,
 estado TEXT NOT NULL CHECK(estado IN ('libre','reservada','bloqueada')) DEFAULT 'libre',
 es_demo INTEGER NOT NULL DEFAULT 1 CHECK(es_demo IN (0,1)),
 CHECK(inicio < fin)
);

CREATE TABLE citas (
 id TEXT PRIMARY KEY,
 usuario_id TEXT NOT NULL REFERENCES usuarios(id),
 disponibilidad_id TEXT NOT NULL UNIQUE REFERENCES disponibilidad(id),
 modalidad TEXT NOT NULL CHECK(modalidad IN ('virtual','presencial')),
 estado TEXT NOT NULL CHECK(estado IN ('solicitada','confirmada','cancelada','realizada')) DEFAULT 'solicitada',
 costo_informado_soles REAL CHECK(costo_informado_soles IS NULL OR costo_informado_soles >= 0),
 condiciones_aceptadas INTEGER NOT NULL CHECK(condiciones_aceptadas IN (0,1)),
 fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resenas (
 id TEXT PRIMARY KEY,
 cita_id TEXT NOT NULL UNIQUE REFERENCES citas(id),
 puntuacion INTEGER NOT NULL CHECK(puntuacion BETWEEN 1 AND 5),
 comentario TEXT,
 creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER resena_solo_tras_atencion
BEFORE INSERT ON resenas
FOR EACH ROW
WHEN (SELECT estado FROM citas WHERE id = NEW.cita_id) <> 'realizada'
BEGIN
 SELECT RAISE(ABORT,'La resena solo se registra despues de realizar la cita');
END;

CREATE TRIGGER recomendacion_requiere_permiso
BEFORE INSERT ON recomendaciones
FOR EACH ROW
WHEN NOT EXISTS(
 SELECT 1 FROM consentimientos c
 WHERE c.sesion_id=NEW.sesion_id AND c.tipo='ver_opciones' AND c.autorizado=1
)
BEGIN
 SELECT RAISE(ABORT,'El estudiante debe solicitar ver opciones primero');
END;

CREATE TRIGGER resumen_requiere_permiso
BEFORE UPDATE OF resumen_orientativo, guardado_autorizado ON sesiones_orientacion
FOR EACH ROW
WHEN NEW.resumen_orientativo IS NOT NULL AND NOT EXISTS(
 SELECT 1 FROM consentimientos c
 WHERE c.sesion_id=NEW.id AND c.tipo='guardar_resumen' AND c.autorizado=1
)
BEGIN
 SELECT RAISE(ABORT,'Se requiere consentimiento explicito para guardar el resumen');
END;

CREATE INDEX idx_sesiones_usuario ON sesiones_orientacion(usuario_id);
CREATE INDEX idx_citas_usuario ON citas(usuario_id);
CREATE INDEX idx_disponibilidad_profesional ON disponibilidad(profesional_id,inicio);
