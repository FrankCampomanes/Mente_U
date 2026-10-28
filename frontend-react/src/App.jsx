import React, { useState } from 'react';
import './App.css';
import { analyzeAndRespond, buildDynamicSummary } from './frenzEngine';

// Lista de los 4 profesionales con perfiles reales sincronizados con la BD
const PROFESIONALES = [
  {
    id: 'prof-01',
    nombre: 'Bienestar Universitario',
    subtitulo: 'Psicología para estudiantes',
    costoTexto: 'GRATIS',
    esGratis: true,
    precioValor: 0,
    modalidad: 'Virtual / Presencial',
    rating: 4.9,
    reviewsCount: 142,
    fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80',
    descripcionTop: 'Servicio gratuito de psicología universitaria',
    especialidades: 'Ansiedad, estrés académico',
    resenas: [
      { texto: '“Excelente atención y seguimiento.”', autor: '— Estudiante verificado' }
    ]
  },
  {
    id: 'prof-02',
    nombre: 'Psic. Ana Torres',
    subtitulo: 'Ansiedad y estrés académico',
    costoTexto: 'S/10 por sesión',
    esGratis: false,
    precioValor: 10,
    modalidad: 'Virtual / Presencial',
    rating: 4.8,
    reviewsCount: 110,
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    descripcionTop: 'Especialista en autorregulación y técnicas de estudio',
    especialidades: 'Ansiedad, estrés académico',
    resenas: [
      { texto: '“Orientación sobre mis preocupaciones: ansiedad y estrés académico.”', autor: '' },
      { texto: '“Ana trata el estrés académico con mucha cercanía.”', autor: '' }
    ]
  },
  {
    id: 'prof-03',
    nombre: 'Psic. Luis Mendoza',
    subtitulo: 'Orientación universitaria',
    costoTexto: 'S/10 por sesión',
    esGratis: false,
    precioValor: 10,
    modalidad: 'Virtual / Presencial',
    rating: 4.7,
    reviewsCount: 85,
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    descripcionTop: 'Acompañamiento en vocación y adaptación a la carrera',
    especialidades: 'Orientación universitaria, toma de decisiones',
    resenas: [
      { texto: '“Me ayudó a ordenar mis prioridades académicas y personales.”', autor: '— Alumno de 4to ciclo' }
    ]
  },
  {
    id: 'prof-04',
    nombre: 'Psic. Carla Rojas',
    subtitulo: 'Primera consulta GRATIS',
    costoTexto: 'S/15 por sesión',
    esGratis: false,
    precioValor: 15,
    modalidad: 'Virtual / Presencial',
    rating: 4.9,
    reviewsCount: 96,
    fotoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=160&auto=format&fit=crop&q=80',
    descripcionTop: 'Primera consulta GRATIS - Acompañamiento integral',
    especialidades: 'Gestión emocional y apoyo en situaciones complejas',
    resenas: [
      { texto: '“Muy buena profesional, empática y con horarios flexibles.”', autor: '— Estudiante de ingeniería' }
    ]
  }
];

export default function App() {
  // Navegación de pantallas:
  // welcome (1) | prompt (2) | chat (3) | summary (4) | options (5) | profile (6)
  // datetime (7) | prochat (8) | propose_time (9) | confirm_detail (10) | confirmed (11) | review (12)
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenHistory, setScreenHistory] = useState(['welcome']);
  
  // Usuario y login
  const [userAlias, setUserAlias] = useState('Estudiante');
  const [authMode, setAuthMode] = useState(null);
  const [aliasInput, setAliasInput] = useState('');

  // Mensajes de la conversación con IA (Frenz)
  const [messages, setMessages] = useState([
    { sender: 'user', text: 'Hoy siento que no puedo con todo.' },
    { sender: 'ai', text: 'Parece que estás teniendo bastante encima. ¿Qué es lo que más te está preocupando ahora?' },
    { sender: 'user', text: 'La universidad. Tengo varios trabajos y una exposición.' },
    { sender: 'ai', text: 'Entiendo. ¿Sientes que te preocupa no llegar a todo o hay algo más que te está afectando?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [detectedTopics, setDetectedTopics] = useState(['examenes', 'cansancio_sueno']);

  // Filtros de la Pantalla 5
  const [activeFilter, setActiveFilter] = useState('todos');

  // Selección de profesional y horario
  const [selectedProf, setSelectedProf] = useState(PROFESIONALES[1]); // Psic. Ana Torres
  const [selectedDay, setSelectedDay] = useState('Martes 15');
  const [selectedTime, setSelectedTime] = useState('11:30 a. m.');
  const [selectedModality, setSelectedModality] = useState('Virtual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mensajes en el Chat con el profesional (Mockup 4)
  const [proMessages, setProMessages] = useState([
    { sender: 'user', text: 'Hola, quisiera consultar por una cita.' },
    { sender: 'pro', text: 'Claro. Tengo disponibilidad esta semana. ¿Prefieres atención virtual o presencial?' }
  ]);
  const [proInput, setProInput] = useState('');

  // Reseña y evaluación (Mockup 1)
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSent, setReviewSent] = useState(false);

  // Navegación
  const navigateTo = (screen) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      setScreenHistory(nextHistory);
      setCurrentScreen(nextHistory[nextHistory.length - 1]);
    } else {
      setCurrentScreen('welcome');
    }
  };

  const handleGoHome = () => {
    setScreenHistory(['welcome']);
    setCurrentScreen('welcome');
  };

  // Inicio de chat desde Prompt
  const handleStartFromPrompt = (text) => {
    if (!text.trim()) return;
    const initialUserMsg = { sender: 'user', text: text.trim() };
    const analysis = analyzeAndRespond(text.trim(), []);
    setDetectedTopics(analysis.detectedTopicIds);
    setMessages([
      initialUserMsg,
      { sender: 'ai', text: analysis.reply }
    ]);
    navigateTo('chat');
  };

  // Enviar mensaje en el chat con IA
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const updatedMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(updatedMessages);
    setChatInput('');
    setIsTyping(true);

    const analysis = analyzeAndRespond(userText, updatedMessages);
    setDetectedTopics((prev) => [...prev, ...analysis.detectedTopicIds]);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: analysis.reply }]);
    }, 600);
  };

  // Enviar mensaje en el chat con Profesional
  const handleSendProMessage = (e) => {
    e.preventDefault();
    if (!proInput.trim()) return;
    const userText = proInput.trim();
    setProMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setProInput('');

    setTimeout(() => {
      setProMessages((prev) => [
        ...prev,
        {
          sender: 'pro',
          text: 'Perfecto, te he enviado una propuesta de horario para coordinar nuestra sesión.'
        }
      ]);
    }, 700);
  };

  // Filtrado de profesionales
  const filteredProfessionals = PROFESIONALES.filter((p) => {
    if (activeFilter === 'gratis') return p.esGratis;
    if (activeFilter === 'precio') return !p.esGratis;
    if (activeFilter === 'calificacion') return p.rating >= 4.8;
    return true;
  });

  // Confirmar y pagar cita (Persistencia en base de datos)
  const handleExecutePayment = async () => {
    setIsSubmitting(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://mente-u-backend.onrender.com';
    try {
      await fetch(`${apiUrl}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: 'usr-demo-01',
          disponibilidad_id: 'disp-01',
          modalidad: selectedModality.toLowerCase(),
          costo: selectedProf.precioValor
        })
      });
    } catch (err) {
      console.log('Persistencia offline activa:', err);
    }
    setIsSubmitting(false);
    navigateTo('confirmed');
  };

  const summaryData = buildDynamicSummary(detectedTopics);

  return (
    <div className="device-wrapper">
      <div className="smartphone-frame">
        {/* Notch / Parlante superior */}
        <div className="phone-notch">
          <span className="phone-camera"></span>
        </div>

        {/* Header superior unificado */}
        <header className="mockup-header">
          <div className="header-left-col">
            {currentScreen !== 'welcome' ? (
              <button onClick={handleBack} className="btn-circle-back" aria-label="Volver">
                &lt;
              </button>
            ) : (
              <div style={{ width: '32px' }}></div>
            )}
          </div>

          <div className="header-center-logo">
            <svg className="brain-logo-svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#e6fffa" />
              <path d="M8.5 7A2 2 0 0 1 11 9v6a2 2 0 0 1-4 .4 2 2 0 0 1-2-2.5 2.5 2.5 0 0 1 0-4.5A2 2 0 0 1 8.5 7z" stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.5 7A2 2 0 0 0 13 9v6a2 2 0 0 0 4 .4 2 2 0 0 0 2-2.5 2.5 2.5 0 0 0 0-4.5A2 2 0 0 0 15.5 7z" stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 18l3-3M20 15h-2.5M20 15v2.5" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="brand-title">Mente<span className="brand-accent">U</span></span>
          </div>

          <div className="header-right-col">
            <button onClick={handleGoHome} className="btn-pill-home">
              Inicio
            </button>
          </div>
        </header>

        {/* CONTENEDOR DE PANTALLAS */}
        <div className="phone-screen-content">

          {/* ======================================================== */}
          {/* PANTALLA 1: BIENVENIDA (Mockup 3 del set 1)              */}
          {/* ======================================================== */}
          {currentScreen === 'welcome' && (
            <div className="screen-view view-welcome">
              <div className="welcome-center-box">
                <div className="welcome-logo-badge">
                  <div className="badge-brain-box">
                    <svg viewBox="0 0 24 24" width="46" height="46" fill="none">
                      <rect x="1" y="1" width="22" height="22" rx="7" fill="#e6fffa" />
                      <path d="M8.5 6.5A2.2 2.2 0 0 1 11 8.8v6.4a2 2 0 0 1-4 .4 2 2 0 0 1-2-2.5 2.5 2.5 0 0 1 0-4.5A2.2 2.2 0 0 1 8.5 6.5z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.5 6.5A2.2 2.2 0 0 0 13 8.8v6.4a2 2 0 0 0 4 .4 2 2 0 0 0 2-2.5 2.5 2.5 0 0 0 0-4.5A2.2 2.2 0 0 0 15.5 6.5z" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 18l3.5-3.5M20.5 14.5H17.5M20.5 14.5V17.5" stroke="#0d9488" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="brand-welcome-text">Mente<span className="brand-welcome-accent">U</span></span>
                </div>

                <h1 className="welcome-tagline">
                  Tu espacio para hablar<br />cuando lo necesites.
                </h1>
              </div>

              <div className="welcome-bottom-actions">
                <button 
                  onClick={() => navigateTo('prompt')} 
                  className="btn-teal-primary"
                >
                  Iniciar sesión
                </button>
                <button 
                  onClick={() => setAuthMode('register')} 
                  className="btn-ice-secondary"
                >
                  Registrarme
                </button>
              </div>

              {authMode && (
                <div className="simple-modal-backdrop">
                  <div className="simple-modal-card">
                    <h3>Crear cuenta de estudiante</h3>
                    <p>Elige un alias anónimo para identificarte:</p>
                    <input 
                      type="text" 
                      placeholder="Ej. Estudiante_21" 
                      value={aliasInput}
                      onChange={(e) => setAliasInput(e.target.value)}
                      className="modal-text-input"
                    />
                    <div className="modal-btns-row">
                      <button onClick={() => setAuthMode(null)} className="btn-cancel-modal">Cancelar</button>
                      <button onClick={() => {
                        if (aliasInput.trim()) setUserAlias(aliasInput.trim());
                        setAuthMode(null);
                        navigateTo('prompt');
                      }} className="btn-teal-primary btn-sm">Aceptar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 2: PROMPT INICIAL (Mockup 4 del set 1)           */}
          {/* ======================================================== */}
          {currentScreen === 'prompt' && (
            <div className="screen-view view-prompt">
              <div className="prompt-header-texts">
                <h2 className="prompt-main-heading">Hola, ¿cómo estás hoy?</h2>
                <p className="prompt-sub-heading">Puedes comenzar por aquí:</p>
              </div>

              <div className="prompt-pills-list">
                <button onClick={() => handleStartFromPrompt('Quiero contar cómo me siento')} className="btn-prompt-pill">
                  Quiero contar cómo me siento
                </button>
                <button onClick={() => handleStartFromPrompt('Tuve un día difícil')} className="btn-prompt-pill">
                  Tuve un día difícil
                </button>
                <button onClick={() => handleStartFromPrompt('Me preocupa algo')} className="btn-prompt-pill">
                  Me preocupa algo
                </button>
                <button onClick={() => handleStartFromPrompt('Solo quiero conversar')} className="btn-prompt-pill">
                  Solo quiero conversar
                </button>
              </div>

              <div className="prompt-bottom-input-zone">
                <p className="prompt-write-anyway-text">También puedes escribir lo que quieras.</p>
                <div className="input-bar-mockup">
                  <input 
                    type="text" 
                    placeholder="Escribe cómo te sientes..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStartFromPrompt(promptInput);
                    }}
                    className="input-field-clean"
                  />
                  <button 
                    onClick={() => handleStartFromPrompt(promptInput)} 
                    className="btn-teal-square-send" 
                    aria-label="Enviar"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 3: CONVERSACIÓN CON IA (Mockup 2 del set 1)       */}
          {/* ======================================================== */}
          {currentScreen === 'chat' && (
            <div className="screen-view view-chat">
              <div className="chat-title-row">
                <h2 className="chat-main-heading">Conversación con IA</h2>
              </div>

              <div className="chat-messages-container">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={msg.sender === 'user' ? 'bubble-user-full' : 'bubble-ai-white'}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))}
                {isTyping && (
                  <div className="bubble-ai-white typing-indicator-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                )}
              </div>

              <div className="chat-bottom-dock">
                <form onSubmit={handleSendMessage} className="input-bar-mockup">
                  <input 
                    type="text" 
                    placeholder="Escribe un mensaje..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="input-field-clean"
                  />
                  <button type="submit" className="btn-teal-square-send" aria-label="Enviar">
                    &gt;
                  </button>
                </form>

                <button 
                  onClick={() => navigateTo('summary')} 
                  className="btn-teal-primary btn-close-convo"
                >
                  Cerrar conversación
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 4: RESUMEN DE CONVERSACIÓN (Mockup 1 del set 1)  */}
          {/* ======================================================== */}
          {currentScreen === 'summary' && (
            <div className="screen-view view-summary">
              <h2 className="summary-title-heading">
                Gracias por compartir conmigo. No estás solo.
              </h2>

              <p className="summary-section-lead">
                De nuestra conversación, parece que estás lidiando con:
              </p>

              <div className="summary-ice-card">
                <ul className="summary-bullets-list">
                  {summaryData.points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="summary-advice-block">
                <p className="summary-advice-lead">
                  <strong>¡Ánimo! Lo importante es que ya estás buscando ayuda. Aquí tienes unos consejos:</strong>
                </p>
                <ol className="summary-numbered-tips">
                  {summaryData.tips.map((tip, i) => (
                    <li key={i}>{i + 1}. {tip}</li>
                  ))}
                </ol>
              </div>

              <p className="summary-disclaimer-text">
                Estas observaciones son un resumen de nuestra charla y no son un diagnóstico médico.
              </p>

              <p className="summary-referral-prompt">
                Si quieres, exploremos juntos opciones para encontrar el apoyo que necesitas para superar este momento.
              </p>

              <div className="summary-action-bottom">
                <button 
                  onClick={() => navigateTo('options')} 
                  className="btn-teal-primary"
                >
                  Ver opciones de apoyo
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 5: OPCIONES DE APOYO (Mockup 2 del set 2)        */}
          {/* ======================================================== */}
          {currentScreen === 'options' && (
            <div className="screen-view view-options">
              <h2 className="chat-main-heading">Opciones que podrían ayudarte</h2>
              <p className="prompt-sub-heading" style={{ marginBottom: '14px' }}>
                Según lo que conversamos, puedes elegir la opción de atención que prefieras.
              </p>

              <div className="filter-pills-grid">
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'gratis' ? 'todos' : 'gratis')} 
                  className={activeFilter === 'gratis' ? 'btn-filter-pill active' : 'btn-filter-pill'}
                >
                  Gratis
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'precio' ? 'todos' : 'precio')} 
                  className={activeFilter === 'precio' ? 'btn-filter-pill active' : 'btn-filter-pill'}
                >
                  Precio
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'modalidad' ? 'todos' : 'modalidad')} 
                  className={activeFilter === 'modalidad' ? 'btn-filter-pill active' : 'btn-filter-pill'}
                >
                  Modalidad
                </button>
                <button 
                  onClick={() => setActiveFilter(activeFilter === 'calificacion' ? 'todos' : 'calificacion')} 
                  className={activeFilter === 'calificacion' ? 'btn-filter-pill active' : 'btn-filter-pill'}
                >
                  Calificación
                </button>
                <button 
                  onClick={() => setActiveFilter('todos')} 
                  className={activeFilter === 'todos' ? 'btn-filter-pill active full-width' : 'btn-filter-pill full-width'}
                >
                  Todos
                </button>
              </div>

              <div className="prof-cards-vertical-list">
                {filteredProfessionals.map((prof) => (
                  <div key={prof.id} className="prof-card-row">
                    <img src={prof.fotoUrl} alt={prof.nombre} className="prof-avatar-img" />
                    <div className="prof-card-details">
                      <strong className="prof-title-line">{prof.nombre}</strong>
                      <span className="prof-sub-line">{prof.subtitulo}</span>
                      <span className="prof-price-highlight">{prof.costoTexto}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedProf(prof);
                        navigateTo('profile');
                      }} 
                      className="btn-ice-ver-perfil"
                    >
                      Ver perfil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 6: PERFIL DEL PROFESIONAL (Mockups 3 y 4 del set 2)*/}
          {/* ======================================================== */}
          {currentScreen === 'profile' && selectedProf && (
            <div className="screen-view view-profile">
              <h2 className="chat-main-heading" style={{ marginBottom: '14px' }}>
                {selectedProf.nombre}
              </h2>

              <div className="profile-header-card">
                <img src={selectedProf.fotoUrl} alt={selectedProf.nombre} className="profile-large-img" />
                <div className="profile-header-info">
                  {selectedProf.esGratis ? (
                    <span className="profile-service-teal">{selectedProf.descripcionTop}</span>
                  ) : (
                    <div className="stars-rating-row">
                      <span className="stars-green">★★★★☆</span>
                      <span className="rating-num">{selectedProf.rating} - {selectedProf.reviewsCount} reseñas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-specs-block">
                <p><strong>Especialidades:</strong> {selectedProf.especialidades}</p>
                <p><strong>Modalidad:</strong> {selectedProf.modalidad}</p>
                <p><strong>{selectedProf.costoTexto}</strong></p>
              </div>

              <div className="summary-ice-card profile-context-box">
                <strong className="context-box-title">Contexto de la conversación</strong>
                <p className="context-box-desc">
                  El profesional puede recibir un resumen orientativo de la conversación con MenteU para conocer el contexto antes de la atención. (No se comparte la conversación completa)
                </p>
              </div>

              <div className="profile-reviews-box">
                <strong className="reviews-box-title">Reseñas de estudiantes</strong>
                {selectedProf.resenas.map((r, i) => (
                  <div key={i} className="review-quote-item">
                    <p>{r.texto}</p>
                    {r.autor && <small className="review-author-tag">{r.autor}</small>}
                  </div>
                ))}
              </div>

              <div className="profile-bottom-cta" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => navigateTo('datetime')} 
                  className="btn-teal-primary"
                >
                  Solicitar cita
                </button>
                <button 
                  onClick={() => navigateTo('prochat')} 
                  className="btn-ice-secondary"
                  style={{ fontSize: '13.5px', padding: '10px' }}
                >
                  Coordinar por chat previo
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 7: FECHA Y HORA (Mockup 1 del set 2)              */}
          {/* ======================================================== */}
          {currentScreen === 'datetime' && (
            <div className="screen-view view-datetime">
              <h2 className="chat-main-heading" style={{ marginBottom: '20px' }}>
                Selecciona fecha y hora<br />para tu cita
              </h2>

              <div className="days-pills-row">
                {['Lunes 14', 'Martes 15', 'Miércoles 16'].map((d) => (
                  <button 
                    key={d} 
                    onClick={() => setSelectedDay(d)} 
                    className={selectedDay === d ? 'btn-day-pill active' : 'btn-day-pill'}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="time-slots-vertical-list">
                {['10:00 a. m.', '11:30 a. m.', '2:00 p. m.', '3:30 p. m.'].map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setSelectedTime(t)} 
                    className={selectedTime === t ? 'btn-time-slot active' : 'btn-time-slot'}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="summary-ice-card datetime-selected-summary">
                <span className="selected-lead-tag">Has seleccionado:</span>
                <strong className="selected-lead-val">{selectedDay} a las {selectedTime}.</strong>
              </div>

              <div className="datetime-bottom-cta">
                <button 
                  onClick={() => navigateTo('confirm_detail')} 
                  className="btn-teal-primary"
                >
                  Confirmar agendamiento
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 8: CHAT CON PROFESIONAL (Mockup 4 del nuevo set) */}
          {/* ======================================================== */}
          {currentScreen === 'prochat' && (
            <div className="screen-view view-prochat">
              <div className="chat-title-row">
                <h2 className="chat-main-heading">Chat con profesional</h2>
              </div>

              <div className="chat-messages-container">
                {proMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={msg.sender === 'user' ? 'bubble-user-full' : 'bubble-ai-white'}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="chat-bottom-dock">
                <form onSubmit={handleSendProMessage} className="input-bar-mockup">
                  <input 
                    type="text" 
                    placeholder="Escribe..."
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    className="input-field-clean"
                  />
                  <button type="submit" className="btn-teal-pill-send" aria-label="Enviar">
                    Enviar
                  </button>
                </form>

                <button 
                  onClick={() => navigateTo('propose_time')} 
                  className="btn-teal-primary"
                  style={{ marginTop: '6px' }}
                >
                  Ver propuesta de horario
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 9: PROPUESTA DE HORARIO (Mockup 3 del nuevo set)  */}
          {/* ======================================================== */}
          {currentScreen === 'propose_time' && (
            <div className="screen-view view-propose-time">
              <div className="chat-title-row" style={{ marginBottom: '22px' }}>
                <h2 className="chat-main-heading">Propuesta de horario</h2>
              </div>

              <div className="summary-ice-card propose-time-card">
                <p className="propose-lead-text">El profesional te propone:</p>
                <h3 className="propose-time-highlight">Martes 30 | 4:00 p. m. | Virtual</h3>
              </div>

              <div className="propose-actions-bottom">
                <button 
                  onClick={() => {
                    setSelectedDay('Martes 30');
                    setSelectedTime('4:00 p. m.');
                    setSelectedModality('Virtual');
                    navigateTo('confirm_detail');
                  }} 
                  className="btn-teal-primary"
                >
                  Aceptar
                </button>
                <button 
                  onClick={() => navigateTo('prochat')} 
                  className="btn-ice-secondary"
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 10: CONFIRMACIÓN Y DETALLE (Mockup 2 del nuevo set)*/}
          {/* ======================================================== */}
          {currentScreen === 'confirm_detail' && (
            <div className="screen-view view-confirm-detail">
              <div className="chat-title-row" style={{ marginBottom: '20px' }}>
                <h2 className="chat-main-heading">Confirmación y detalle</h2>
              </div>

              <div className="summary-ice-card detail-summary-card">
                <strong className="detail-summary-title">Resumen de la cita</strong>
                <div className="detail-lines-list">
                  <p><strong>Profesional:</strong> {selectedProf.nombre}</p>
                  <p><strong>Fecha:</strong> {selectedDay}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Modalidad:</strong> {selectedModality}</p>
                  <p><strong>Costo:</strong> {selectedProf.costoTexto}</p>
                </div>
              </div>

              <div className="confirm-detail-bottom-cta">
                <button 
                  onClick={handleExecutePayment} 
                  disabled={isSubmitting}
                  className="btn-teal-primary"
                >
                  {isSubmitting ? 'Procesando confirmación...' : 'Realizar pago y confirmar'}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 11: CITA CONFIRMADA (Mockup 1 del nuevo set)      */}
          {/* ======================================================== */}
          {currentScreen === 'confirmed' && (
            <div className="screen-view view-confirmed">
              <div className="confirmed-header-row">
                <span className="confirmed-check-icon">✓</span>
                <h2 className="chat-main-heading">Cita confirmada</h2>
              </div>

              <div className="confirmed-mint-card">
                <div className="detail-lines-list">
                  <p><strong>Profesional:</strong> {selectedProf.nombre}</p>
                  <p><strong>Fecha:</strong> {selectedDay}</p>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Modalidad:</strong> {selectedModality}</p>
                  <p><strong>Costo:</strong> {selectedProf.costoTexto}</p>
                </div>
              </div>

              <button 
                onClick={() => alert(`Código de cita: CITA-${Math.floor(1000 + Math.random() * 9000)}\nEspecialista: ${selectedProf.nombre}\nHorario: ${selectedDay} a las ${selectedTime}`)} 
                className="btn-teal-primary"
                style={{ marginBottom: '24px' }}
              >
                Ver cita
              </button>

              <div className="confirmed-review-section">
                <p className="after-appointment-text">Después de que efectivamente ocurra la cita:</p>
                <button 
                  onClick={() => navigateTo('review')} 
                  className="btn-ice-secondary"
                >
                  ¿Cómo fue tu experiencia?
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 12: RESEÑA Y VALORACIÓN DE LA ATENCIÓN           */}
          {/* ======================================================== */}
          {currentScreen === 'review' && (
            <div className="screen-view view-review">
              <h2 className="chat-main-heading" style={{ marginBottom: '8px' }}>
                ¿Cómo fue tu experiencia?
              </h2>
              <p className="prompt-sub-heading" style={{ marginBottom: '18px' }}>
                Tu opinión anónima ayuda a otros estudiantes a encontrar el apoyo adecuado.
              </p>

              <div className="summary-ice-card review-interactive-box">
                <strong style={{ fontSize: '13.5px', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Califica la atención recibida:
                </strong>
                <div className="stars-interactive-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setReviewStars(star)} 
                      className={star <= reviewStars ? 'star-btn-pick active' : 'star-btn-pick'}
                    >
                      ★
                    </button>
                  ))}
                  <span className="stars-val-label">{reviewStars} de 5 estrellas</span>
                </div>

                <textarea 
                  placeholder="Escribe un breve comentario sobre la sesión (ej. 'Trato muy humano y puntual')..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="review-textarea-field"
                  rows={3}
                ></textarea>
              </div>

              <div className="review-bottom-cta">
                <button 
                  onClick={() => {
                    setReviewSent(true);
                    alert('¡Muchas gracias! Tu reseña anónima ha sido registrada.');
                    navigateTo('welcome');
                  }} 
                  className="btn-teal-primary"
                >
                  Enviar reseña
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
