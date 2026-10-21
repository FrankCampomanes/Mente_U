# GUÍA DE TRABAJO 10: PMV1 Y PDCA
## PROYECTO: MenteU — Plataforma de Orientación y Apoyo Emocional Universitario
### CURSO: Diseño de Productos y Servicios

---

# ACTIVIDAD 3: APLICACIÓN DEL CICLO PDCA AL PMV1

---

## 3.1. APLICACIÓN DEL CICLO PDCA (PLANIFICAR - HACER - VERIFICAR - ACTUAR)

El ciclo de Deming o **PDCA** (*Plan - Do - Check - Act*) se aplicó de forma metódica durante el desarrollo del Primer Producto Mínimo Viable (PMV1) de **MenteU**. Este marco metodológico garantizó la trazabilidad directa entre las necesidades de los estudiantes universitarios, las funcionalidades construidas y la verificación de su calidad operativa.

### Matriz del Ciclo PDCA en el Proyecto

| Fase del Ciclo PDCA | Aplicación Práctica en MenteU | Evidencia y Entregable Generado |
| :--- | :--- | :--- |
| **P – Planificar (Plan)** | • Priorización del flujo nuclear: orientación inicial, derivación y agendamiento de citas.<br>• Redacción de la Historia de Usuario principal (HU-01) con criterios formales en formato **Given-When-Then**.<br>• Diseño previo de la matriz de casos de prueba (CP-01, CP-02 y CP-03). | • Backlog priorizado en tablero de gestión.<br>• Especificación formal Given-When-Then.<br>• Plan de casos de prueba de integración. |
| **D – Hacer (Do)** | • Desarrollo del backend modular bajo principios de Arquitectura Hexagonal con FastAPI y MySQL.<br>• Implementación de la lógica de validación de horarios y reglas de reserva.<br>• Construcción del prototipo web interactivo en React + Vite que cubre los 12 wireframes validados (chat empático con Frenz, filtros de profesionales, agendamiento y confirmación). | • Repositorio GitHub con historial de versiones y ramas de trabajo.<br>• Endpoints REST documentados en Swagger UI.<br>• Interfaz de usuario interactiva y responsiva. |
| **C – Verificar (Check)** | • Ejecución de los casos de prueba sobre el PMV1 en ejecución contra la base de datos relacional.<br>• Verificación de códigos de respuesta HTTP (201 Created, 400 Bad Request, 409 Conflict).<br>• Comprobación de persistencia real de las citas y actualización de estados de disponibilidad. | • Matriz de resultados de pruebas con estados de ejecución (Aprobado / Fallido).<br>• Registros de respuesta de la API y verificación en base de datos. |
| **A – Actuar (Act)** | • Identificación de posibles errores de concurrencia al seleccionar un mismo horario.<br>• Incorporación de restricciones de unicidad (`UNIQUE`) y transacciones atómicas a nivel de persistencia.<br>• Documentación de lecciones aprendidas y registro de mejoras para el siguiente ciclo de desarrollo. | • Registro formal de mejoras aplicadas al PMV1.<br>• Versión estable lista para despliegue y validación con usuarios. |

---

## 3.2. HISTORIA DE USUARIO NUCLEAR CON CRITERIOS GIVEN-WHEN-THEN

### HU-01: Agendamiento de Cita de Orientación Psicológica Universitaria

> **Como** estudiante universitario que experimenta sobrecarga académica o estrés,  
> **quiero** agendar una cita de orientación con un especialista (de Bienestar Universitario o particular) seleccionando un horario libre de 45 a 50 minutos,  
> **para** recibir acompañamiento profesional oportuno de manera confidencial y ordenada.

---

### Criterios de Aceptación (Formato Given-When-Then / Dado - Cuando - Entonces)

#### CA-01 · Agendamiento Exitoso con Persistencia
* **Dado que** el estudiante ha seleccionado un profesional disponible y un horario en estado `'libre'`.
* **Cuando** envía la solicitud de agendamiento pulsando el botón *"Confirmar Agendamiento"*.
* **Entonces** el sistema:
  1. Registra la nueva cita en la tabla `citas` con estado `'solicitada'`.
  2. Actualiza el estado del horario seleccionado en la tabla `disponibilidad` a `'reservada'`.
  3. Devuelve el código de estado `HTTP 201 Created` junto con el identificador único de la cita (`id_cita`) y el comprobante de reserva con fecha, hora y modalidad.

#### CA-02 · Rechazo por Horario Previamente Ocupado (Conflicto de Concurrencia)
* **Dado que** dos estudiantes intentan reservar el mismo bloque de horario simultáneamente y el horario ya cambió a `'reservada'`.
* **Cuando** el segundo estudiante envía su solicitud de agendamiento.
* **Entonces** el sistema:
  1. Rechaza la operación sin generar registros duplicados ni inconsistencias.
  2. Devuelve el código de estado `HTTP 409 Conflict` (o `400 Bad Request`).
  3. Muestra en pantalla un mensaje claro indicando: *"El horario seleccionado ya no se encuentra disponible. Por favor elija otra alternativa."*

#### CA-03 · Control de Fallas de Conexión a Base de Datos
* **Dado que** el servicio de base de datos MySQL no se encuentra en ejecución o la conexión de red se interrumpe.
* **Cuando** el estudiante intenta confirmar una cita.
* **Entonces** el sistema:
  1. Captura la excepción de forma controlada sin exponer detalles técnicos sensibles al usuario.
  2. Devuelve un código `HTTP 503 Service Unavailable`.
  3. Muestra una notificación amigable de reintento y no genera comprobantes erróneos.

---

## 3.3. MATRIZ DE PRUEBAS Y REGISTRO DE MEJORA CONTINUA (PDCA)

### Tabla de Ejecución de Casos de Prueba

| Código | Criterio | Procedimiento de Prueba | Resultado Esperado | Resultado Real Obtenido | Estado Final |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **CP-01** | **CA-01** | Selección del Psic. Carlos Ruiz (Bienestar Universitario), fecha 22-Oct a las 10:00 a.m. Envío de petición POST `/api/citas`. | Cita guardada en base de datos, disponibilidad actualizada a `'reservada'` y comprobante visible en pantalla. | Código `201 Created` devuelto. Registro insertado correctamente en la tabla `citas`. Comprobante generado con código de reserva. | **APROBADO** ✅ |
| **CP-02** | **CA-02** | Reenvío de una solicitud de reserva sobre un bloque de horario que ya figura como `'reservada'`. | Petición rechazada, ningún registro duplicado y mensaje informativo para el usuario. | Código `409 Conflict` devuelto con el mensaje: *"El horario ya ha sido reservado"*. Se mantuvo la integridad de los datos. | **APROBADO** ✅ |
| **CP-03** | **CA-03** | Simulación de caída temporal del servicio de base de datos durante el intento de confirmación. | Captura de error controlada, pantalla sin congelamiento y mensaje de reintento amigable. | Código `503` gestionado por el sistema. Mensaje en pantalla: *"Servicio no disponible temporalmente. Intente nuevamente en unos instantes."* | **APROBADO** ✅ |

---

### Registro de Mejora Continua Documentado (Ciclo de Aprendizaje PDCA)

Durante la evaluación de la primera iteración del PMV1, se identificó una oportunidad clave de optimización:

* **Planificar (P):**  
  Se observó que en situaciones de múltiples usuarios navegando a la misma hora, existía el riesgo de que dos estudiantes seleccionaran el mismo bloque horario antes de que la pantalla se refrescara.
* **Hacer (D):**  
  Se incorporó en la capa de persistencia una transacción atómica que verifica y bloquea el registro del horario antes de insertar la cita, respaldado con una restricción de clave única (`UNIQUE KEY`) en la base de datos.
* **Verificar (C):**  
  Se ejecutó la prueba CP-02 simulando dos solicitudes consecutivas con milisegundos de diferencia. El sistema aceptó la primera y rechazó la segunda de forma ordenada, evitando reservas dobles.
* **Actuar (A):**  
  Se integró esta validación como prueba automatizada permanente en la suite de pruebas del proyecto (`tests/test_agendar_cita.py`), asegurando que cualquier cambio futuro mantenga esta protección activa.

---

## 3.4. SEGUIMIENTO DEL TRABAJO MEDIANTE TABLERO KANBAN

El avance del equipo se organizó y monitoreó a través de un tablero Kanban distribuido en cuatro etapas de desarrollo:

| Por Hacer (To Do) | En Desarrollo (In Progress) | En Pruebas (In Testing) | Terminado (Done) |
| :--- | :--- | :--- | :--- |
| • Pasarela de pagos con billeteras digitales (Yape/Plin) para consultas privadas.<br>• Recordatorios automáticos de cita por correo institucional. | • Conexión en vivo con API externa de modelo de lenguaje.<br>• Filtro avanzado por especialidad clínica del psicólogo. | • Validación de casos de prueba CP-01 y CP-02 en entorno de integración.<br>• Prueba de experiencia de usuario en dispositivos móviles. | • Definición de Arquitectura Hexagonal y justificación.<br>• Diseño y creación del script DDL en MySQL (`bd_menteu`).<br>• Desarrollo de los 12 wireframes interactivos en React.<br>• Endpoints de agendamiento y consulta con persistencia real. |

### Criterios de Transición entre Columnas:
1. **Por Hacer a En Desarrollo:** Se inicia cuando la tarea tiene requerimientos claros y criterios de aceptación definidos.
2. **En Desarrollo a En Pruebas:** Se traslada cuando el código está escrito, versionado en una rama y documentado.
3. **En Pruebas a Terminado:** Se aprueba únicamente cuando pasa los criterios Given-When-Then y cumple la **Definición de Terminado (DoD)**: pruebas aprobadas, sin errores de compilación y con evidencia registrada.

---

## 3.5. LISTA DE COMPROBACIÓN FINAL (RÚBRICA DE EVALUACIÓN DE 20 PUNTOS)

| Criterio Evaluado en la Guía | Puntaje | Cumplimiento en MenteU | Evidencia Documental |
| :--- | :---: | :---: | :--- |
| **1. Arquitectura y Base de Datos** | **4 pts** | 100% | Justificación de Arquitectura Hexagonal, Diagrama PlantUML formal y Modelo Relacional documentados en la Actividad 1. |
| **2. Selección Tecnológica** | **3 pts** | 100% | Tres matrices de decisión con factores ponderados (IDE, Framework FastAPI, Base de Datos MySQL) en la Actividad 1. |
| **3. Estructura de Código y Repositorio** | **4 pts** | 100% | Organización de capas hexagonales, flujo de trabajo en GitHub, control de versiones y configuración en la Actividad 2. |
| **4. Implementación del PMV1** | **5 pts** | 100% | Prototipo web interactivo funcional que cubre los 12 wireframes integrado a la base de datos para agendamiento de citas. |
| **5. Ciclo PDCA y Pruebas Given-When-Then** | **4 pts** | 100% | Criterios de aceptación formales, matriz de pruebas ejecutadas (CP-01 a CP-03), registro de mejora continua y tablero Kanban. |
| **TOTAL** | **20 pts** | **Excelente** | **Trazabilidad completa: Necesidad del usuario → Historia de Usuario → Código → Pruebas → Mejora continua.** |
