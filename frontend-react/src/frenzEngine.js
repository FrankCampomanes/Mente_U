/**
 * Motor Empático Conversacional de Frenz
 * Diseñado específicamente para el contexto de estudiantes universitarios en Perú.
 * Reconoce intenciones, valida emociones, sugiere técnicas de autorregulación
 * y genera una síntesis estructurada para el Resumen de Orientación.
 */

const TOPIC_PATTERNS = [
  {
    id: 'estoy_mal',
    keywords: [
      'estoy mal', 'me siento mal', 'no me siento bien', 'estoy pesimo', 'estoy pésimo',
      'horrible', 'todo mal', 'no se que hacer', 'no sé qué hacer', 'todo me sale mal',
      'desesperado', 'desesperada', 'colapso', 'colapsar', 'ya no puedo', 'no doy mas',
      'no doy más', 'hasta las patas', 'hecho polvo', 'hecha polvo'
    ],
    label: 'Sensación de agobio y crisis personal',
    summaryPoint: 'Crisis de agobio: Sensación de saturación personal y falta de claridad para afrontar el momento.',
    advice: 'Para un momento, toma un vaso de agua y no te exijas resolver todo hoy.',
    responses: [
      "Te escucho y te creo. Cuando decimos 'estoy mal', muchas veces es porque venimos aguantando solos más peso del que nos corresponde. Aquí no tienes que fingir fuerza. ¿Qué es lo que más te está apretando el pecho en este instante?",
      "Lamento mucho que estés pasando por este momento. Es completamente válido sentirse vulnerable o sin fuerzas. Vamos paso a paso: ¿esto viene de días atrás o algo puntual ocurrió hoy?",
      "Aquí estoy contigo. No tienes que solucionar tu vida en los próximos diez minutos. Solo suelta lo que tengas en la mente y desahógate conmigo con total tranquilidad."
    ]
  },
  {
    id: 'examenes',
    keywords: [
      'examen', 'examenes', 'exámenes', 'parcial', 'parciales', 'final', 'finales',
      'nota', 'notas', 'jalar', 'jale', 'reprobar', 'desaprobar', 'estudiar', 'memorizar',
      'pc', 'practica calificada', 'práctica calificada', 'no jalo una'
    ],
    label: 'Tensión ante exámenes y rendimiento académico',
    summaryPoint: 'Tensión académica: Temor a desaprobar y presión por calificaciones en parciales o finales.',
    advice: 'Divide el temario en bloques Pomodoro (25 min de estudio x 5 min de pausa) y prioriza los temas con mayor peso.',
    responses: [
      "Las semanas de exámenes disparan la adrenalina y la sensación de que el tiempo vuela. Recuerda algo importante: una nota evalúa tu momento en una prueba, no define tu inteligencia ni tu valor como persona. ¿Qué curso es el que más te preocupa ahora?",
      "Te entiendo totalmente. Cuando se acumulan los temas, intentar leerlo todo de corrido solo genera bloqueo. ¿Te serviría hacer un esquema de solo los 3 temas esenciales para asegurar los puntos clave?",
      "La angustia por jalar nos hace pensar en el peor escenario posible. Pero la mente suele exagerar el peligro. Vamos a ordenarlo: ¿aún tienes opciones de recuperación o entregas pendientes?"
    ]
  },
  {
    id: 'trabajos_grupo',
    keywords: [
      'grupo', 'grupal', 'equipo', 'compañero', 'compañeros', 'exposicion', 'exposición',
      'informe', 'no hacen nada', 'no responde', 'no responden', 'recarga', 'vagos',
      'hacerlo solo', 'hacerlo sola'
    ],
    label: 'Desgaste y frustración en trabajos de equipo',
    summaryPoint: 'Dinámica de equipo: Frustración por falta de compromiso de integrantes y sobrecarga injusta.',
    advice: 'Establece límites transparentes: asigna partes con fecha límite por escrito y no asumas lo que otros no hicieron sin avisar al docente.',
    responses: [
      "Los trabajos en grupo son de los factores que más agotan en la universidad. Da mucha impotencia poner empeño mientras otros se desentienden. ¿Has podido conversar con ellos directamente o sientes que no hay respuesta?",
      "Es completamente justo que sientas molestia. Cuidar tu salud mental también implica no sobrecargarte con el trabajo de los demás. A veces lo más sano es comunicar con anticipación al profesor la situación real del avance.",
      "No sientas culpa por poner límites en un equipo. No te toca hacerte responsable por la falta de compromiso ajena. ¿Qué parte te corresponde entregar a ti exactamente?"
    ]
  },
  {
    id: 'cansancio_sueno',
    keywords: [
      'dormir', 'sueño', 'sueno', 'cansado', 'cansada', 'agotado', 'agotada',
      'insomnio', 'desvelo', 'energia', 'energía', 'fatiga', 'muerto de sueño',
      'no descanso', 'pesadillas', 'despertar'
    ],
    label: 'Agotamiento físico e insomnio',
    summaryPoint: 'Higiene del descanso: Fatiga acumulada y dificultad para desconectar la mente antes de conciliar el sueño.',
    advice: 'Aplica corte de pantallas (celular/laptop) 30 minutos antes de dormir y haz respiraciones lentas.',
    responses: [
      "El cuerpo te está enviando una señal clara. Cuando estamos saturados de pantallas y diapositivas, el cerebro sigue en 'modo alerta' incluso al acostarnos. ¿Logras dormir tus horas o te despiertas a cada rato pensando en las tareas?",
      "El cansancio acumulado hace que cualquier problema pequeño se sienta como una montaña gigante. Dormir bien no es una pérdida de tiempo: es la única forma en que tu memoria consolida lo estudiado.",
      "Si hoy sientes que tu cabeza no da más, a veces la decisión más inteligente y productiva es cerrar los cuadernos, hidratarte y acostarte temprano para retomar mañana con la mente limpia."
    ]
  },
  {
    id: 'ansiedad_futuro',
    keywords: [
      'ansiedad', 'panico', 'pánico', 'miedo', 'futuro', 'presion', 'presión',
      'familia', 'papa', 'papá', 'mama', 'mamá', 'padres', 'decepcionar', 'fracaso',
      'atrasar', 'atrasarme', 'ciclo', 'tiempo', 'perder tiempo'
    ],
    label: 'Incertidumbre vocacional y expectativas externas',
    summaryPoint: 'Presión por el futuro: Miedo a defraudar a la familia o retrasarse respecto al ritmo de otros compañeros.',
    advice: 'Enfócate en la semana en curso; cada estudiante tiene su propio ritmo y no estás compitiendo con nadie.',
    responses: [
      "La mochila de las expectativas (de la familia, de los amigos o de uno mismo) pesa muchísimo. Querer salir adelante es genial, pero autoexigirse la perfección agota el alma. ¿Sientes que la mayor presión viene de afuera o de tu propia cabeza?",
      "El temor a 'atrasarse' es una trampa muy común. En la universidad nadie lleva el mismo camino: algunos trabajan, otros cuidan a su familia, otros van a su ritmo. No estás en una carrera contra nadie.",
      "Respira hondo conmigo. Pensar en lo que pasará de aquí a dos años solo te roba la energía de lo que tienes que hacer hoy. Vamos un día a la vez."
    ]
  },
  {
    id: 'crisis_ansiedad',
    keywords: [
      'corazon', 'corazón', 'latir', 'taquicardia', 'aire', 'no puedo respirar',
      'ahogo', 'pecho', 'temblor', 'ataque', 'me falta el aire'
    ],
    label: 'Activación fisiológica o crisis de ansiedad',
    summaryPoint: 'Activación ansiosa: Taquicardia, opresión en el pecho y necesidad de autorregulación fisiológica.',
    advice: 'Ejercicio 4-7-8: Inhala en 4 segundos, mantén el aire 7 segundos y exhala suavemente por la boca en 8 segundos.',
    responses: [
      "Por favor, detén lo que estés haciendo un segundo. Pon tus dos pies firmes en el suelo y suelta los hombros. Lo que sientes es una reacción de alarma de tu cuerpo, pero estás a salvo. Vamos a inhalar juntos en 4 segundos, aguantar 4 y soltar en 6. Hazlo conmigo dos veces.",
      "Tranquilo/a, no te va a pasar nada grave, tu cuerpo está sobrecargado y necesita regularse. Toca un objeto sólido a tu lado (tu mesa, tu botella de agua), siente su textura y respira despacio por la nariz.",
      "Estoy aquí contigo. Deja que el aire entre suave por la nariz y salga como si soplaras una vela despacio. No intentes pelear contra la sensación, solo acompáñala mientras baja la intensidad."
    ]
  },
  {
    id: 'dudas_carrera',
    keywords: [
      'carrera', 'vocacion', 'vocación', 'no me gusta', 'me equivoque', 'me equivoqué',
      'no es lo mio', 'no es lo mío', 'cambiarme', 'salirme', 'dejar la carrera'
    ],
    label: 'Cuestionamiento vocacional',
    summaryPoint: 'Orientación vocacional: Dudas sobre la afinidad con la carrera elegida y desmotivación en los cursos.',
    advice: 'Conversa con estudiantes de ciclos superiores o docentes de tu carrera para tener una perspectiva del campo laboral real.',
    responses: [
      "Cuestionarse la carrera es súper común, sobre todo a mitad de los ciclos cuando los cursos se ponen más teóricos o pesados. ¿Sientes que no te gusta la carrera en general o son ciertos cursos específicos los que te están desmotivando?",
      "Es completamente válido detenerse a pensar si el camino que elegiste a los 17 o 18 años sigue resonando con quién eres hoy. No es un fracaso replantearse el rumbo; es madurez.",
      "Antes de tomar cualquier decisión drástica, ayuda mucho separar el cansancio temporal del verdadero desinterés vocacional. Podemos explorar esto con un orientador si gustas."
    ]
  },
  {
    id: 'soledad_social',
    keywords: [
      'solo', 'sola', 'soledad', 'amigos', 'amigas', 'no tengo amigos', 'aislado',
      'aislada', 'nadie me habla', 'encajar', 'socializar', 'timido', 'tímida'
    ],
    label: 'Aislamiento y sentido de pertenencia',
    summaryPoint: 'Integración social: Sentimiento de soledad en el entorno universitario y dificultad para formar vínculos.',
    advice: 'Involúcrate en talleres deportivos, culturales o grupos de estudio donde la interacción se dé de forma natural.',
    responses: [
      "La universidad a veces puede sentirse como un lugar muy frío y multitudinario, donde parece que todos ya tienen su grupo armado menos uno. No tiene nada de malo ser reservado o tardar en conectar.",
      "Sentirse solo en el campus es más común de lo que la gente admite. Muchas personas van con audífonos puestos sintiendo exactamente lo mismo que tú. La conexión suele empezar por compartir un detalle pequeño, como prestar un apunte o pedir una duda de clase.",
      "Quiero que sepas que en este espacio eres bienvenido tal y como eres. No tienes que demostrarle nada a nadie."
    ]
  },
  {
    id: 'procrastinacion',
    keywords: [
      'procrastino', 'procrastinar', 'dejo todo', 'distraigo', 'distraer', 'no avanzo',
      'celular', 'redes', 'tiktok', 'instagram', 'pereza', 'no me concentro'
    ],
    label: 'Bloqueo y procrastinación',
    summaryPoint: 'Gestión del tiempo: Dificultad para iniciar actividades por postergación o perfeccionismo evitativo.',
    advice: 'Aplica la regla de los 2 minutos: comprométete a abrir el archivo y escribir solo dos líneas sin juzgar la calidad.',
    responses: [
      "Casi nunca procrastinamos por flojera; casi siempre procrastinamos porque la tarea nos da ansiedad, nos parece enorme o tememos no hacerla perfecta. ¿Qué es lo que tienes que hacer que te está costando tanto arrancar?",
      "La mejor forma de engañar a la mente para empezar es bajar la exigencia a lo ridículamente fácil: dile a tu cerebro 'solo voy a sentarme y abrir el Word 5 minutos'. Una vez que arrancas, la resistencia disminuye.",
      "El celular suele ser el refugio donde escapamos de la incomodidad de estudiar. Ponlo en otra habitación o en modo avión solo por media hora y mira cómo cambia tu foco."
    ]
  },
  {
    id: 'saludo_cortesia',
    keywords: [
      'hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches',
      'hey', 'que tal', 'qué tal', 'como estas', 'cómo estás'
    ],
    label: 'Contacto inicial cordial',
    summaryPoint: 'Apertura de canal: Saludo inicial y disposición para explorar bienestar y alternativas de apoyo.',
    advice: 'Aprovecha este espacio confidencial para expresar libremente cualquier situación académica o personal.',
    responses: [
      "¡Hola! Me da mucho gusto saludarte. Soy Frenz, tu asistente de bienestar en MenteU. Cuéntame con toda confianza: ¿cómo ha estado tu día o qué te gustaría conversar hoy?",
      "¡Hola! Qué bueno que te des este ratito para ti. Puedes contarme lo que tengas en mente, sea sobre tus cursos, tu día o simplemente desahogarte. Te escucho.",
      "Hola, bienvenido/a. Estoy aquí para escucharte sin juicios y acompañarte a ordenar tus ideas. ¿De qué te gustaría que hablemos?"
    ]
  },
  {
    id: 'agradecimiento',
    keywords: [
      'gracias', 'muchas gracias', 'te pasaste', 'me ayudo', 'me ayudó', 'alivio',
      'me siento mejor', 'lindo', 'chau', 'adios', 'adiós'
    ],
    label: 'Cierre y agradecimiento',
    summaryPoint: 'Cierre positivo: Expresión de alivio tras el espacio de desahogo e introspección.',
    advice: 'Conserva las técnicas aprendidas y recuerda que puedes agendar con un especialista cuando lo desees.',
    responses: [
      "¡De nada! Me alegra de corazón haber podido darte una mano. Recuerda que siempre puedes volver a hablar conmigo o dar el siguiente paso agendando una cita con nuestros psicólogos si deseas profundizar. ¡Te mando un abrazo fuerte!",
      "Gracias a ti por tu confianza y valentía al compartir lo que sientes. Cuidar tu mente es tan importante como cualquier examen. ¡Mucho ánimo hoy!",
      "Fue un gusto escucharte. Cuando estés listo/a, puedes hacer clic en 'Ver alternativas de apoyo' para ver tu resumen de orientación y las opciones de atención disponibles."
    ]
  }
];

const FALLBACK_RESPONSES = [
  "Te escucho con total atención. Cuéntame un poquito más sobre eso, ¿desde cuándo vienes sintiendo esta situación?",
  "Tiene todo el sentido que te sientas así. A veces se nos juntan varias cosas pequeñas y terminan pesando como una roca. ¿Qué crees que te daría un respiro el día de hoy?",
  "Comprendo lo que me dices. Es agotador sobrellevar tantas responsabilidades a la vez. Cuando tú me digas, podemos pulsar en 'Ver alternativas de apoyo' para revisar un resumen de esto y ver los profesionales disponibles para una sesión."
];

export function analyzeAndRespond(userMessage, history = []) {
  const textLower = userMessage.toLowerCase();
  
  // Detectar temas presentes en el mensaje
  const detectedTopics = [];
  for (const topic of TOPIC_PATTERNS) {
    if (topic.keywords.some(k => textLower.includes(k))) {
      detectedTopics.push(topic);
    }
  }

  // Generar respuesta
  let responseText = "";
  if (detectedTopics.length > 0) {
    const primaryTopic = detectedTopics[0];
    const pool = primaryTopic.responses;
    // Seleccionar respuesta variada según la longitud del historial
    const index = history.length % pool.length;
    responseText = pool[index];
  } else {
    // Si no coincide con palabras clave específicas, responder de forma reflexiva y empática
    const index = history.length % FALLBACK_RESPONSES.length;
    responseText = FALLBACK_RESPONSES[index];
  }

  return {
    reply: responseText,
    detectedTopicIds: detectedTopics.map(t => t.id)
  };
}

export function buildDynamicSummary(detectedTopicIds = []) {
  const uniqueIds = Array.from(new Set(detectedTopicIds));
  const points = [];
  const tips = [];

  for (const id of uniqueIds) {
    const topic = TOPIC_PATTERNS.find(t => t.id === id);
    if (topic && topic.id !== 'saludo_cortesia' && topic.id !== 'agradecimiento') {
      points.push(topic.summaryPoint);
      tips.push(topic.advice);
    }
  }

  // Si no se detectaron temas específicos o fue una charla breve, usar puntos predeterminados universitarios
  if (points.length === 0) {
    points.push('Carga académica y presión: Acumulación de tareas y evaluaciones en el semestre.');
    points.push('Agotamiento psicofísico: Dificultad para desconectarse y tener un descanso reparador.');
    points.push('Disposición a la orientación: Búsqueda activa de un espacio de acompañamiento profesional.');
  }

  if (tips.length === 0) {
    tips.push('Pausa de desconexión: Toma un receso de 15 minutos sin revisar pantallas ni pendientes.');
    tips.push('Priorización puntual: Enfócate en resolver solo UNA tarea prioritaria el día de hoy.');
    tips.push('Autocuidado consciente: Reconoce el esfuerzo realizado hasta hoy y mantén una buena hidratación.');
  }

  return { points, tips: tips.slice(0, 3) };
}
