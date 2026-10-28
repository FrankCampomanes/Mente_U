-- ==============================================================
-- SISTEMA MENTEU: BASE DE DATOS RELACIONAL PARA XAMPP (MySQL)
-- Archivo para importar en phpMyAdmin
-- ==============================================================
CREATE DATABASE IF NOT EXISTS bd_menteu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_menteu;

-- 1. Usuarios anónimos
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    alias VARCHAR(50) NOT NULL UNIQUE,
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
    costo_referencial_soles DECIMAL(8,2) DEFAULT 0.00,
    perfil_verificado TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- 5. Profesionales
CREATE TABLE IF NOT EXISTS profesionales (
    id VARCHAR(36) PRIMARY KEY,
    opcion_id VARCHAR(36) NOT NULL,
    nombre_mostrado VARCHAR(100) NOT NULL,
    especialidad_descriptiva VARCHAR(150),
    perfil_verificado TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_profesional_opcion FOREIGN KEY (opcion_id) REFERENCES opciones_atencion(id)
) ENGINE=InnoDB;

-- 6. Horarios y disponibilidad (Bloques de 45-50 min)
CREATE TABLE IF NOT EXISTS disponibilidad (
    id VARCHAR(36) PRIMARY KEY,
    profesional_id VARCHAR(36) NOT NULL,
    inicio DATETIME NOT NULL,
    fin DATETIME NOT NULL,
    estado ENUM('libre', 'reservada', 'bloqueada') NOT NULL DEFAULT 'libre',
    CONSTRAINT fk_disponibilidad_profesional FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Citas reservadas (Funcionalidad prioritaria PMV1)
CREATE TABLE IF NOT EXISTS citas (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    disponibilidad_id VARCHAR(36) NOT NULL UNIQUE,
    modalidad ENUM('virtual', 'presencial') NOT NULL,
    estado ENUM('solicitada', 'confirmada', 'cancelada', 'realizada') NOT NULL DEFAULT 'solicitada',
    costo_informado_soles DECIMAL(8,2) DEFAULT 0.00,
    condiciones_aceptadas TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cita_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_cita_disponibilidad FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidad(id)
) ENGINE=InnoDB;

-- 8. Reseñas y retroalimentación
CREATE TABLE IF NOT EXISTS resenas (
    id VARCHAR(36) PRIMARY KEY,
    cita_id VARCHAR(36) NOT NULL UNIQUE,
    puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resena_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==============================================================
-- DATOS INICIALES SEMILLA (SEED DATA PARA DEMOSTRACIÓN DEL PMV1)
-- ==============================================================
INSERT INTO opciones_atencion (id, nombre, tipo, modalidad, descripcion, costo_referencial_soles) VALUES
('opt-01', 'Bienestar Universitario', 'institucional', 'mixta', 'Servicio gratuito de apoyo y orientación psicológica estudiantil.', 0.00),
('opt-02', 'Consultorio Particular Afín', 'particular', 'virtual', 'Atención personalizada de psicólogos colegiados a tarifa solidaria estudiantil.', 15.00);

INSERT INTO profesionales (id, opcion_id, nombre_mostrado, especialidad_descriptiva) VALUES
('prof-01', 'opt-01', 'Bienestar Universitario (Lic. Carlos Ruiz)', 'Ansiedad académica y gestión del tiempo'),
('prof-02', 'opt-02', 'Psic. Ana Torres', 'Manejo de estrés, sobrecarga y hábitos de estudio'),
('prof-03', 'opt-02', 'Psic. Luis Mendoza', 'Orientación vocacional y equilibrio emocional'),
('prof-04', 'opt-02', 'Psic. Carla Rojas', 'Gestión emocional y apoyo en situaciones complejas');

INSERT INTO disponibilidad (id, profesional_id, inicio, fin, estado) VALUES
('disp-01', 'prof-01', '2026-10-22 10:00:00', '2026-10-22 10:45:00', 'libre'),
('disp-02', 'prof-01', '2026-10-22 11:30:00', '2026-10-22 12:15:00', 'libre'),
('disp-03', 'prof-02', '2026-10-22 15:00:00', '2026-10-22 15:45:00', 'libre'),
('disp-04', 'prof-02', '2026-10-22 16:30:00', '2026-10-22 17:15:00', 'libre');

INSERT INTO usuarios (id, alias) VALUES
('usr-demo-01', 'EstudianteAnonimo_74'),
('usr-demo-02', 'Lince_Academico'),
('usr-demo-03', 'SanMarcos_Psicologia');

INSERT INTO sesiones_orientacion (id, usuario_id, estado, resumen_orientativo, guardado_autorizado) VALUES
('ses-01', 'usr-demo-01', 'cerrada', 'Tensión académica: Preocupación por parciales de cálculo. Se recomiendan pausas activas y derivación a Bienestar Universitario.', 1),
('ses-02', 'usr-demo-02', 'cerrada', 'Agotamiento físico e insomnio: Dificultad para desconectar antes de dormir. Se sugiere higiene del sueño y sesión psicológica.', 1);

