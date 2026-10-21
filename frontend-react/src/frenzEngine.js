/**
 * Motor Empático Conversacional de Frenz
 * Reconocimiento contextual de temas universitarios, respuestas variadas y resumen dinámico.
 */

const TOPIC_PATTERNS = [
  {
    id: 'examenes',
    keywords: ['examen', 'examenes', 'parcial', 'parciales', 'final', 'finales', 'nota', 'notas', 'jalar', 'reprobar', 'desaprobar', 'estudiar', 'memorizar', 'pc'],
    label: 'Tensión ante exámenes y evaluaciones',
    summaryPoint: 'Tensión académica: Preocupación por el rendimiento en evaluaciones y parciales próximos.',
    advice: 'Divide el repaso en bloques Pomodoro de 25 min y no estudies de corrido sin pausas.',
    responses: [
      "Los periodos de exámenes suelen disparar la ansiedad al máximo. Es súper normal sentir que el tiempo no alcanza. ¿Sientes que el contenido es demasiado o es más el miedo a no llegar a la nota que esperas?",
      "Te entiendo. La presión por las notas muchas veces nos hace olvidar todo el esfuerzo que ya venimos poniendo. Recuerda que tu valor no se define solo por un número en un examen.",
      "Para los parciales, intentar abarcarlo todo de golpe genera bloqueo. ¿Te serviría priorizar solo los temas que tienen mayor peso para bajar un poco la angustia?"
    ]
  },
  {
    id: 'trabajos_grupo',
    keywords: ['grupo', 'grupal', 'equipo', 'compañero', 'compañeros', 'exposicion', 'exponer', 'informe', 'no hacen nada', 'no responde', 'recarga'],
    label: 'Sobrecarga y dinámicas en trabajos grupales',
    summaryPoint: 'Dinámica de equipo: Desgaste y frustración por descoordinación o falta de compromiso en entregas grupales.',
    advice: 'Define límites claros con tu equipo y comunica con anticipación lo que te corresponde.',
    responses: [
      "Los trabajos en grupo son de las cosas que más desgastan en la universidad, sobre todo cuando sientes que la carga no está equilibrada. ¿Has podido hablar con ellos o sientes que te toca asumir todo a ti?",
      "Es muy frustrante cuando el resto no responde con el mismo compromiso. Es válido que sientas molestia. Cuidar tu tranquilidad también implica no cargar con responsabilidades que no te tocan solo.",
      "A veces toca poner acuerdos por escrito o delegar tareas muy puntuales. No te sientas culpable por marcar límites sanos en el grupo."
    ]
  },
  {
    id: 'cansancio_sueno',
    keywords: ['dormir', 'sueño', 'cansado', 'cansada', 'agotado', 'agotada', 'insomnio', 'desvelo', 'energia', 'fatiga', 'no doy mas', 'despertar'],
    label: 'Agotamiento físico e insomnio',
    summaryPoint: 'Descanso comprometido: Fatiga acumulada y dificultad para desconectar la mente antes de dormir.',
    advice: 'Establece un corte de pantallas 30 minutos antes de dormir para permitir que tu mente baje revoluciones.',
    responses: [
      "El cuerpo te está pidiendo una pausa. Cuando estamos saturados de pantalla y tareas, el cerebro sigue acelerado incluso al acostarnos. ¿Logras dormir tus horas o te desvelas pensando en los pendientes?",
      "El cansancio acumulado nubla todo y hace que cualquier tarea parezca el triple de difícil. Dormir bien no es perder el tiempo, es lo que te permite rendir mañana.",
      "Si sientes que ya no das más, a veces lo más productivo hoy es parar temprano y reanudar mañana con la mente despejada."
    ]
  },
  {
    id: 'ansiedad_futuro',
    keywords: ['ansiedad', 'panico', 'miedo', 'futuro', 'presion', 'familia', 'papa', 'mama', 'decepcionar', 'fracaso', 'atrasar', 'ciclo'],
    label: 'Ansiedad por expectativas y futuro',
    summaryPoint: 'Presión por expectativas: Incertidumbre sobre el avance de la carrera y temor a defraudar expectativas.',
    advice: 'Concéntrate en la semana presente; el futuro de la carrera se construye un día a la vez.',
    responses: [
      "Esa sensación de que tenemos que cumplir con las expectativas de todos (familia, amigos, nosotros mismos) pesa un montón. Es totalmente comprensible sentir esa presión. ¿Sientes que te exiges más tú o viene de afuera?",
      "El miedo a atrasarse o no cumplir los tiempos 'esperados' es muy común, pero cada estudiante tiene su propio ritmo. No estás en una carrera contra nadie.",
      "Respira hondo un momento. Darte cuenta de que estás ansioso ya es el primer paso para no dejarte arrastrar por el pánico. Vamos un día a la vez."
    ]
  },
  {
    id: 'desahogo_tristeza',
    keywords: ['triste', 'llorar', 'solo', 'sola', 'aislado', 'desanimado', 'desanimada', 'vacio', 'ganas', 'desahogo', 'mal'],
    label: 'Desánimo y necesidad de contención',
    summaryPoint: 'Estado emocional: Sensación de desánimo, aislamiento y necesidad de un espacio seguro de escucha.',
    advice: 'Permítete sentir sin juzgarte; compartir lo que duele es una muestra de valentía, no de debilidad.',
    responses: [
      "Aquí no tienes que fingir que todo está bien. Si necesitas llorar o simplemente soltar lo que tienes atorado, este espacio es tuyo. Te escucho con mucha empatía.",
      "A veces se siente como si nadie alrededor entendiera lo pesado que es llevar todo esto. No estás solo en esto, y es súper valioso que te permitas hablarlo.",
      "Gracias por confiarme cómo te sientes de verdad. A veces el solo hecho de no guardarse las cosas ayuda a que el pecho se sienta un poquito menos apretado."
    ]
  }
];

const FALLBACK_RESPONSES = [
  "Te escucho con total atención. Cuéntame un poco más sobre eso, ¿desde cuándo vienes sintiendo esta situación?",
  "Tiene todo el sentido que te sientas así. A veces una sola cosa detona un montón de emociones acumuladas. ¿Qué crees que te ayudaría a sentirte un 10% más aliviado hoy?",
  "Comprendo lo que me dices. Es agotador sostener tantas cosas a la vez. Cuando tú me digas, podemos revisar un resumen de esto y explorar si te gustaría hablarlo con un especialista de bienestar o particular."
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
    if (topic) {
      points.push(topic.summaryPoint);
      tips.push(topic.advice);
    }
  }

  // Si no se detectaron temas específicos o fue una charla breve, usar puntos predeterminados cálidos
  if (points.length === 0) {
    points.push('Carga universitaria: Sensación de acumulación de tareas y pendientes que generan sobrecarga.');
    points.push('Agotamiento: Dificultad para desconectarte del estudio y descansar de verdad.');
    points.push('Disposición al cambio: Reconocer la necesidad de apoyo y buscar expresarlo a tiempo.');
  }

  if (tips.length === 0) {
    tips.push('Toma una pausa de 15 minutos sin revisar nada de la universidad.');
    tips.push('Elige avanzar solo UNA tarea pequeña para hoy.');
    tips.push('Bebe un vaso de agua y reconoce tu propio esfuerzo.');
  }

  return { points, tips: tips.slice(0, 3) };
}
