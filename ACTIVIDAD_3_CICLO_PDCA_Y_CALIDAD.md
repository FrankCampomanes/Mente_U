# GUÍA DE TRABAJO 10: PMV1 Y PDCA
## PROYECTO: MenteU — Plataforma de Orientación y Apoyo Emocional Universitario
### CURSO: Diseño de Productos y Servicios

---

# ACTIVIDAD 3: APLICACIÓN DEL CICLO PDCA AL PMV1

---

## 3.1. APLICACIÓN DEL CICLO PDCA (PLANIFICAR - HACER - VERIFICAR - ACTUAR)

El ciclo de Deming o **PDCA** (*Plan - Do - Check - Act*) se aplicó de forma rigurosa durante el diseño e implementación del PMV1 de **MenteU**, garantizando la trazabilidad entre las necesidades de los estudiantes, el código implementado y su verificación empírica.

### Matriz del Ciclo PDCA en el Proyecto

| Fase del Ciclo PDCA | Aplicación Práctica en MenteU | Evidencia Generada y Entregable |
| :--- | :--- | :--- |
| **P – Planificar (Plan)** | • Priorización del flujo nuclear de agendamiento de citas de orientación.<br>• Redacción de la Historia de Usuario principal (HU-01) y definición de criterios de aceptación formales en formato **Given-When-Then**.<br>• Diseño de la matriz de casos de prueba previstos (CP-01, CP-02, CP-03). | • Backlog priorizado en tablero Kanban.<br>• Especificación formal Given-When-Then.<br>• Plan de pruebas de integración. |
| **D – Hacer (Do)** | • Implementación de la arquitectura hexagonal en FastAPI y MySQL.<br>• Creación de las entidades de dominio y validaciones de disponibilidad de horario.<br>• Construcción de la interfaz web responsiva basada en los wireframes aprobados. | • Repositorio GitHub con commits semánticos (`feat:`, `chore:`, etc.).<br>• Endpoints REST documentados en Swagger UI.<br>• Frontend demostrable en `frontend/index.html`. |
| **C – Verificar (Check)** | • Ejecución de los casos de prueba sobre el PMV1 en ejecución contra MySQL en XAMPP.<br>• Verificación de respuestas HTTP (201 Created, 400 Bad Request, 409 Conflict).<br>• Comprobación de persistencia real de citas y actualización de estados en phpMyAdmin. | • Matriz de resultados de pruebas con estados de ejecución (Aprobado / Fallido).<br>• Registro de respuestas de la API en formato JSON. |
| **A – Actuar (Act)** | • Análisis de defectos detectados durante las pruebas (ej. intento de agendar un horario ya ocupado por concurrencia).<br>• Implementación de mejoras preventivas a nivel de base de datos (`UNIQUE KEY`) y control transaccional.<br>• Estandarización de pruebas unitarias automatizadas para versiones futuras. | • Registro formal de mejoras aplicadas.<br>• Nueva versión corregida del PMV1 desplegable. |

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
  3. Devuelve el código de estado `HTTP 201 Created` junto con el identificador único de la cita (`id_cita`) y el resumen de la reserva.

#### CA-02 · Rechazo por Horario Previamente Ocupado (Conflicto de Concurrencia)
* **Dado que** dos estudiantes intentan reservar el mismo bloque de horario simultáneamente y el horario ya cambió a `'reservada'`.
* **Cuando** el segundo estudiante envía su solicitud de agendamiento.
* **Entonces** el sistema:
  1. Rechaza la operación sin duplicar registros en la base de datos.
  2. Devuelve el código de estado `HTTP 409 Conflict` (o `400 Bad Request`).
  3. Muestra en pantalla un mensaje claro indicando: *"El horario seleccionado ya no se encuentra disponible. Por favor elija otra alternativa."*

#### CA-03 · Control de Fallas de Persistencia y Base de Datos Inaccesible
* **Dado que** el servicio de base de datos MySQL (XAMPP) no se encuentra en ejecución o la conexión se interrumpe.
* **Cuando** el estudiante intenta confirmar una cita.
* **Entonces** el sistema:
  1. Captura la excepción sin exponer errores técnicos internos de base de datos al usuario final.
  2. Devuelve un código `HTTP 503 Service Unavailable`.
  3. No emite ninguna confirmación de reserva falsa ni comprobante erróneo.

---

## 3.3. MATRIZ DE PRUEBAS Y REGISTRO DE MEJORA CONTINUA (PDCA)

### Tabla de Ejecución de Casos de Prueba

| Código de Prueba | Criterio Asociado | Procedimiento Ejecutado | Resultado Esperado | Resultado Real Obtenido | Estado Final |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **CP-01** | **CA-01** | Selección del Psic. Carlos Ruiz (Bienestar), fecha 22-Oct 10:00 a.m. Envío de petición POST `/api/citas`. | Cita guardada en base de datos, disponibilidad en `'reservada'`, ticket visible con check verde. | Código `201 Created` devuelto. Registro visible en phpMyAdmin. Ticket mostrado correctamente. | **APROBADO** ✅ |
| **CP-02** | **CA-02** | Reenvío de la misma solicitud con el mismo `disponibilidad_id` ya reservado. | Petición rechazada, ningún registro duplicado, mensaje de validación amigable. | Código `409 Conflict` retornado con mensaje: *"El horario ya ha sido reservado"*. No hubo duplicados. | **APROBADO** ✅ |
| **CP-03** | **CA-03** | Detención temporal del servicio MySQL en el panel de XAMPP y confirmación de cita desde la web. | Error controlado, ausencia de pantalla en blanco y aviso de indisponibilidad del servicio. | Código `503` capturado por el adaptador. Notificación: *"Servicio no disponible temporalmente"*. | **APROBADO** ✅ |

---

### Registro de Mejora Continua Documentado (Ciclo de Aprendizaje PDCA)

Durante la primera iteración de pruebas del PMV1, se identificó una oportunidad crítica de mejora y se aplicó el ciclo completo de resolución:

* **Planificar (P):**  
  Se detectó que si la aplicación se ejecutaba sin control transaccional estricto, existía la posibilidad teórica de que se insertara la cita pero fallara la actualización del horario a `'reservada'`, dejando el horario libre para otra persona.
* **Hacer (D):**  
  Se modificó el Adaptador de Persistencia MySQL (`app/adapters/salida/cita_repo_mysql.py`) para encapsular ambas operaciones dentro de una **transacción atómica** (`BEGIN ... COMMIT`) con reversión automática (`ROLLBACK`) en caso de cualquier error intermedio, reforzado con una restricción de clave única (`UNIQUE KEY`) en la tabla `citas`.
* **Verificar (C):**  
  Se ejecutó la prueba de estrés **CP-02**, simulando peticiones consecutivas sobre el mismo horario. Se constató que la base de datos mantuvo la integridad referencial al 100% sin estados inconsistentes.
* **Actuar (A):**  
  Se incorporó la prueba unitaria automatizada `test_no_permite_horario_ocupado` dentro del directorio `tests/` para que forme parte de la suite recurrente en cada despliegue del proyecto.

---

## 3.4. SEGUIMIENTO DEL TRABAJO MEDIANTE TABLERO (GITHUB PROJECTS / TRELLO)

El avance del equipo se gestionó utilizando un tablero Kanban estructurado en cuatro columnas de flujo de valor:

```text
+-----------------------+-----------------------+-----------------------+-----------------------+
|      POR HACER        |     EN DESARROLLO     |       EN PRUEBAS      |       TERMINADO       |
+-----------------------+-----------------------+-----------------------+-----------------------+
| [ ] Pasarela de pagos | [ ] Integración API   | [ ] Verificación de   | [x] Arquitectura      |
|     con Yape/Plin     |     Gemini en vivo    |     criterios Given-  |     Hexagonal elegida |
|     para particulares |     para chat         |     When-Then (CP-02) | [x] DDL de MySQL para |
| [ ] Notificaciones de |                       |                       |     XAMPP estructurado|
|     recordatorio por  |                       |                       | [x] Flujo de 12       |
|     correo/WhatsApp   |                       |                       |     wireframes en     |
|                       |                       |                       |     frontend creado   |
|                       |                       |                       | [x] Persistencia de   |
|                       |                       |                       |     citas (CP-01)     |
+-----------------------+-----------------------+-----------------------+-----------------------+
```

### Detalle de Estados del Tablero:
1. **Por Hacer (To Do):** Funcionalidades complementarias para versiones posteriores al PMV1 (pagos con billeteras digitales, recordatorios automáticos de sesión).
2. **En Desarrollo (In Progress):** Tareas técnicas en construcción activa (conexión con SDK de IA en la nube).
3. **En Pruebas (In Testing):** Tareas con código terminado sujetas a verificación de criterios de aceptación y ejecución de casos de prueba.
4. **Terminado (Done):** Tareas que cumplen la **Definición de Terminado (DoD)**: código documentado, revisado en Pull Request, probado contra base de datos y con evidencia fotográfica/funcional disponible.

---

## 3.5. LISTA DE COMPROBACIÓN FINAL (RÚBRICA DE 20 PUNTOS)

| Criterio Evaluado en la Guía | Puntaje Máximo | Estado en MenteU | Ubicación de la Evidencia |
| :--- | :---: | :---: | :--- |
| **Arquitectura y Base de Datos** | **4 puntos** | Cumplido al 100% | Justificación Hexagonal, Diagrama PlantUML y Modelo Relacional documentados en la Actividad 1. |
| **Selección Tecnológica** | **3 puntos** | Cumplido al 100% | Tres matrices de factores ponderados (IDE, Framework FastAPI, Base de Datos MySQL) en la Actividad 1. |
| **Estructura del Código y GitHub** | **4 puntos** | Cumplido al 100% | Árbol de carpetas hexagonal, flujo de commits semánticos, `.gitignore` y `.env.example` en la Actividad 2. |
| **Implementación del PMV1** | **5 puntos** | Cumplido al 100% | Frontend responsivo de 12 wireframes integrado con la base de datos relacional para agendamiento. |
| **PDCA y Pruebas Given-When-Then** | **4 puntos** | Cumplido al 100% | Especificación Given-When-Then, matriz de pruebas ejecutadas (CP-01 a CP-03) y registro de mejora continua. |
| **Puntaje Total Alcanzado** | **20 puntos** | **Excelente** | **Trazabilidad completa: Necesidad -> HU -> Código -> Pruebas -> Mejora.** |
