-- ==============================================================
-- SISTEMA MENTEU - BASE DE DATOS RELACIONAL MYSQL
-- Arquitectura Hexagonal - PMV1
-- Soporte para: 8 Profesionales, Disponibilidad Semanal y Reseñas
-- ==============================================================

CREATE DATABASE IF NOT EXISTS bd_menteu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_menteu;

-- 1. Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    alias VARCHAR(50) NOT NULL UNIQUE,
    rol ENUM('estudiante', 'profesional_utp', 'profesional_externo', 'administrador') NOT NULL DEFAULT 'estudiante',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Sesiones de orientación con IA
CREATE TABLE IF NOT EXISTS sesiones_orientacion (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NULL,
    estado ENUM('abierta', 'cerrada') NOT NULL DEFAULT 'abierta',
    inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fin TIMESTAMP NULL,
    resumen_orientativo TEXT NULL,
    guardado_autorizado TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_sesion_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Consentimientos éticos del estudiante
CREATE TABLE IF NOT EXISTS consentimientos (
    id VARCHAR(36) PRIMARY KEY,
    sesion_id VARCHAR(36) NOT NULL,
    tipo ENUM('ver_opciones', 'guardar_resumen', 'compartir_resumen') NOT NULL,
    autorizado TINYINT(1) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sesion_tipo (sesion_id, tipo),
    CONSTRAINT fk_consentimiento_sesion FOREIGN KEY (sesion_id) REFERENCES sesiones_orientacion(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Opciones de atención (Gratuitas / Particulares)
CREATE TABLE IF NOT EXISTS opciones_atencion (
    id VARCHAR(36) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('institucional', 'particular') NOT NULL,
    modalidad ENUM('virtual', 'presencial', 'mixta') NOT NULL,
    descripcion TEXT,
    costo_referencial_soles DECIMAL(8,2) DEFAULT 0.00
) ENGINE=InnoDB;

-- 5. Catálogo de Profesionales
CREATE TABLE IF NOT EXISTS profesionales (
    id VARCHAR(36) PRIMARY KEY,
    opcion_id VARCHAR(36) NOT NULL,
    nombre_mostrado VARCHAR(100) NOT NULL,
    especialidad_descriptiva VARCHAR(255) NOT NULL,
    CONSTRAINT fk_profesional_opcion FOREIGN KEY (opcion_id) REFERENCES opciones_atencion(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Disponibilidad de horarios
CREATE TABLE IF NOT EXISTS disponibilidad (
    id VARCHAR(36) PRIMARY KEY,
    profesional_id VARCHAR(36) NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    estado ENUM('libre', 'reservada') NOT NULL DEFAULT 'libre',
    UNIQUE KEY uq_prof_horario (profesional_id, inicio),
    CONSTRAINT fk_disponibilidad_prof FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Citas reservadas (Transacción Atómica)
CREATE TABLE IF NOT EXISTS citas (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    disponibilidad_id VARCHAR(36) NOT NULL UNIQUE,
    modalidad ENUM('virtual', 'presencial') NOT NULL,
    estado ENUM('solicitada', 'confirmada', 'cancelada', 'atendida') NOT NULL DEFAULT 'solicitada',
    costo_informado_soles DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    condiciones_aceptadas TINYINT(1) NOT NULL DEFAULT 1,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cita_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_cita_disponibilidad FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidad(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Reseñas y Calificación de Estudiantes (Escala 1 a 5 estrellas)
CREATE TABLE IF NOT EXISTS resenas (
    id VARCHAR(36) PRIMARY KEY,
    cita_id VARCHAR(36) NOT NULL UNIQUE,
    puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resena_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================================
-- DATOS INICIALES SEMILLA (CATÁLOGO DIVERSO DE 8 PROFESIONALES)
-- ==============================================================
INSERT INTO opciones_atencion (id, nombre, tipo, modalidad, descripcion, costo_referencial_soles) VALUES
('opt-01', 'Bienestar Universitario UTP', 'institucional', 'mixta', 'Servicio gratuito de apoyo y psicología estudiantil.', 0.00),
('opt-02', 'Consejería Psicopedagógica', 'institucional', 'mixta', 'Acompañamiento en métodos de estudio y planificación.', 0.00),
('opt-03', 'Consultorio Solidario S/8', 'particular', 'virtual', 'Tarifa solidaria universitaria de 8 soles por sesión.', 8.00),
('opt-04', 'Consultorio Accesible S/10', 'particular', 'mixta', 'Atención profesional personalizada de 10 soles por sesión.', 10.00),
('opt-05', 'Consultorio Especializado S/15', 'particular', 'mixta', 'Primera sesión gratis y atención integral a 15 soles.', 15.00)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO profesionales (id, opcion_id, nombre_mostrado, especialidad_descriptiva) VALUES
('prof-01', 'opt-01', 'Bienestar Universitario (Lic. Carlos Ruiz)', 'Ansiedad académica, adaptación y estrés'),
('prof-02', 'opt-02', 'Consejería y Tutoría (Lic. Mariana Paredes)', 'Planificación de horario, hábitos de estudio y bloqueo'),
('prof-03', 'opt-03', 'Psic. Diego Salinas', 'Desactivación de pánico ante evaluaciones y notas'),
('prof-04', 'opt-03', 'Lic. Valeria Castro', 'TDAH en adultos, atención sostenida y memoria'),
('prof-05', 'opt-04', 'Psic. Ana Torres', 'Ansiedad, estrés académico y manejo del tiempo'),
('prof-06', 'opt-04', 'Psic. Luis Mendoza', 'Orientación vocacional, dudas de carrera y decisiones'),
('prof-07', 'opt-04', 'Psic. Jorge Carrillo', 'Fobia social, hablar en público y trabajos grupales'),
('prof-08', 'opt-05', 'Psic. Carla Rojas', 'Gestión emocional y apoyo en situaciones complejas')
ON DUPLICATE KEY UPDATE nombre_mostrado=VALUES(nombre_mostrado);

-- Disponibilidad para toda la semana
INSERT INTO disponibilidad (id, profesional_id, inicio, fin, estado) VALUES
('disp-01', 'prof-01', '2026-10-14 10:00:00', '2026-10-14 10:45:00', 'libre'),
('disp-02', 'prof-01', '2026-10-15 11:30:00', '2026-10-15 12:15:00', 'libre'),
('disp-03', 'prof-03', '2026-10-16 14:00:00', '2026-10-16 14:45:00', 'libre'),
('disp-04', 'prof-04', '2026-10-17 15:30:00', '2026-10-17 16:15:00', 'libre'),
('disp-05', 'prof-05', '2026-10-18 10:00:00', '2026-10-18 10:45:00', 'libre'),
('disp-06', 'prof-05', '2026-10-19 11:30:00', '2026-10-19 12:15:00', 'libre'),
('disp-07', 'prof-06', '2026-10-21 15:00:00', '2026-10-21 15:45:00', 'libre'),
('disp-08', 'prof-08', '2026-10-22 16:30:00', '2026-10-22 17:15:00', 'libre')
ON DUPLICATE KEY UPDATE estado=VALUES(estado);

INSERT INTO usuarios (id, alias, rol) VALUES
('usr-demo-01', 'EstudianteAnonimo_74', 'estudiante'),
('usr-demo-02', 'Lince_Academico', 'estudiante'),
('usr-demo-03', 'SanMarcos_Psicologia', 'estudiante')
ON DUPLICATE KEY UPDATE alias=VALUES(alias);

-- Cita semilla y reseña asociada
INSERT INTO citas (id, usuario_id, disponibilidad_id, modalidad, estado, costo_informado_soles) VALUES
('CITA-SEMILLA-01', 'usr-demo-01', 'disp-01', 'virtual', 'atendida', 0.00)
ON DUPLICATE KEY UPDATE estado=VALUES(estado);

INSERT INTO resenas (id, cita_id, puntuacion, comentario) VALUES
('res-01', 'CITA-SEMILLA-01', 5, 'Excelente atención y seguimiento. Me ayudó con mis parciales.')
ON DUPLICATE KEY UPDATE puntuacion=VALUES(puntuacion);
