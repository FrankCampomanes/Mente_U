# MenteUTP IA - Bases de datos para continuar la Semana 09

## ¿Qué se hizo?

Se creó una **nueva base de 72 conversaciones ficticias** (24 por cada categoría), respetando los campos, los nombres de las tres etiquetas, la partición 75/25 y los tres algoritmos descritos en el documento **MenteUTP IA: Semana09**. No se recuperaron los **72 textos exactos del notebook original**. Los registros que se entregan son originales de demostración, no testimonios de estudiantes.

- `MenteUTP_Entrenamiento_Sintetico_72.csv`: 72 registros para Colab con las columnas `id_ejemplo`, `contexto`, `opcion_atencion_afin`, `origen`.
- `MenteUTP_IA_Entrenamiento.sqlite`: las mismas 72 filas en una tabla SQLite.
- `MenteUTP_Esquema_Datos_IA.sql`: estructura de la tabla de entrenamiento.
- `MenteUTP_Plataforma_Demo.sqlite`: base relacional para el flujo de los 12 wireframes con datos **únicamente ficticios**.
- `MenteUTP_Esquema_Plataforma.sql`: instrucciones SQL para crear las tablas del prototipo.
- `MenteUTP_Nueva_BD_Colab.ipynb`: notebook reproducible para comparar los tres modelos.
- `Resultados_Modelos_Nueva_Base.json`: métricas **nuevas**, no las cifras reportadas en el trabajo original.
- `MenteUTP_Base_Datos_Demo.xlsx`: hoja de cálculo legible con los registros y diccionario.

## Correspondencia con los 12 wireframes originales

- 01-02: acceso y comienzo (usuarios; aún sin autenticación real).
- 03: conversación libre **procesada temporalmente; no se guardan mensajes**.
- 04: resumen no diagnóstico; por defecto no se guarda.
- 05: `recomendaciones` cuando el estudiante da permiso `ver_opciones`.
- 06-07: `opciones_atencion` y `profesionales`, perfiles solamente ilustrativos.
- 08-10: `disponibilidad`; no hay agendas externas conectadas.
- 11-12: `citas` y `resenas` (estas últimas solo después de la atención).

La etiqueta `opcion_atencion_afin` identifica una **ruta orientativa**: bienestar_universitario, estres_academico o situaciones_personales. **No determina el diagnóstico ni asigna automáticamente a un profesional**. La elección de citas pertenece al estudiante.

## Cómo abrir la base de datos

Para ver los datos, abrir el CSV o el XLSX con Excel. Para inspeccionar tablas reales, utilizar un navegador de SQLite (por ejemplo, DB Browser for SQLite), importar el archivo `.sqlite` y ejecutar:

```sql
SELECT opcion_atencion_afin, COUNT(*) AS cantidad
FROM ejemplos_entrenamiento
GROUP BY opcion_atencion_afin;
```

En la plataforma demo, consultar:

```sql
SELECT name FROM sqlite_master WHERE type='table';
SELECT * FROM opciones_atencion;
SELECT * FROM disponibilidad;
```

En Colab: subir primero el `.ipynb`, ejecutar celdas y subir el CSV cuando lo solicite. No hay enlace de Colab creado ni capturas que acrediten ejecución en una cuenta externa.

## Privacidad y limitaciones

- No contiene nombres, contactos, expedientes ni chats reales.
- Los alias y perfiles de muestra son ficticios y no constituyen profesionales verificados.
- El texto de conversación de usuarios futuros se procesaría temporalmente, sin almacenarlo por defecto; para guardar un resumen se requiere consentimiento registrado.
- Para producción harían falta autenticación, cifrado, control de acceso, calendario real, acuerdos con profesionales, política de retención, consentimiento legal, tratamiento de incidentes y evaluación clínica externa.
- Las métricas del proyecto original (88,9 % Accuracy para Regresión Logística) corresponden a **otro conjunto específico de 72 ejemplos**. No deben atribuirse a esta nueva base.
- Se seleccionó Regresión Logística en la evaluación de **esta base nueva**, con F1 macro 94.4% en 18 ejemplos ficticios; resultado con valor únicamente académico.
