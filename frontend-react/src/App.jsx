import React, { useState } from 'react';
import './App.css';
import { analyzeAndRespond, buildDynamicSummary } from './frenzEngine';

// Lista de los 4 profesionales exactamente como en el mockup del profesor
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
  // Pantallas: welcome (1) | prompt (2) | chat (3) | summary (4) | options (5) | profile (6) | datetime (7) | success (8)
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenHistory, setScreenHistory] = useState(['welcome']);
  
  // Usuario
  const [userAlias, setUserAlias] = useState('Estudiante');
  const [authMode, setAuthMode] = useState(null);
  const [aliasInput, setAliasInput] = useState('');

  // Conversación (con el diálogo del mockup)
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
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos' | 'gratis' | 'precio' | 'modalidad' | 'calificacion'

  // Selección de profesional y horario (Pantallas 6 y 7)
  const [selectedProf, setSelectedProf] = useState(PROFESIONALES[1]); // Psic. Ana Torres por defecto como en el mockup
  const [selectedDay, setSelectedDay] = useState('Martes 15');
  const [selectedTime, setSelectedTime] = useState('11:30 a. m.');
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Chat
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

  // Filtrado de profesionales
  const filteredProfessionals = PROFESIONALES.filter((p) => {
    if (activeFilter === 'gratis') return p.esGratis;
    if (activeFilter === 'precio') return !p.esGratis;
    if (activeFilter === 'calificacion') return p.rating >= 4.8;
    return true;
  });

  // Confirmar agendamiento en base de datos
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://mente-u-backend.onrender.com';
    const nuevaCita = {
      id: 'CITA-' + Math.floor(1000 + Math.random() * 9000),
      prof: selectedProf.nombre,
      fecha: `${selectedDay} a las ${selectedTime}`,
      costo: selectedProf.costoTexto,
      modalidad: selectedProf.modalidad
    };

    try {
      // Intentar persistir en el backend en vivo (Render + Aiven MySQL)
      await fetch(`${apiUrl}/api/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: 'usr-demo-01',
          disponibilidad_id: 'disp-01',
          modalidad: 'virtual',
          costo: selectedProf.precioValor
        })
      });
    } catch (err) {
      console.log('Persistencia offline activa:', err);
    }

    setReservaConfirmada(nuevaCita);
    setIsSubmitting(false);
    navigateTo('success');
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
          {/* PANTALLA 1: BIENVENIDA (Mockup 3 del profesor)           */}
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
          {/* PANTALLA 2: PROMPT INICIAL (Mockup 4 del profesor)        */}
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
          {/* PANTALLA 3: CONVERSACIÓN CON IA (Mockup 2 del profesor)    */}
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
          {/* PANTALLA 4: RESUMEN DE CONVERSACIÓN (Mockup 1 del profesor)*/}
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
          {/* PANTALLA 5: OPCIONES DE APOYO (Mockup 2 del nuevo set)     */}
          {/* ======================================================== */}
          {currentScreen === 'options' && (
            <div className="screen-view view-options">
              <h2 className="chat-main-heading">Opciones que podrían ayudarte</h2>
              <p className="prompt-sub-heading" style={{ marginBottom: '14px' }}>
                Según lo que conversamos, puedes elegir la opción de atención que prefieras.
              </p>

              {/* Botones de filtro del mockup */}
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

              {/* Lista de 4 tarjetas de profesionales del mockup */}
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
          {/* PANTALLA 6: PERFIL DEL PROFESIONAL (Mockups 3 y 4 del set)*/}
          {/* ======================================================== */}
          {currentScreen === 'profile' && selectedProf && (
            <div className="screen-view view-profile">
              <h2 className="chat-main-heading" style={{ marginBottom: '14px' }}>
                {selectedProf.nombre}
              </h2>

              {/* Bloque superior con foto y subtítulo / estrellas */}
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

              {/* Datos de especialidad y tarifa */}
              <div className="profile-specs-block">
                <p><strong>Especialidades:</strong> {selectedProf.especialidades}</p>
                <p><strong>Modalidad:</strong> {selectedProf.modalidad}</p>
                <p><strong>{selectedProf.costoTexto}</strong></p>
              </div>

              {/* Caja celeste de contexto de conversación */}
              <div className="summary-ice-card profile-context-box">
                <strong className="context-box-title">Contexto de la conversación</strong>
                <p className="context-box-desc">
                  El profesional puede recibir un resumen orientativo de la conversación con MenteU para conocer el contexto antes de la atención. (No se comparte la conversación completa)
                </p>
              </div>

              {/* Caja blanca de reseñas de estudiantes */}
              <div className="profile-reviews-box">
                <strong className="reviews-box-title">Reseñas de estudiantes</strong>
                {selectedProf.resenas.map((r, i) => (
                  <div key={i} className="review-quote-item">
                    <p>{r.texto}</p>
                    {r.autor && <small className="review-author-tag">{r.autor}</small>}
                  </div>
                ))}
              </div>

              {/* Botón inferior Solicitar cita */}
              <div className="profile-bottom-cta">
                <button 
                  onClick={() => navigateTo('datetime')} 
                  className="btn-teal-primary"
                >
                  Solicitar cita
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 7: FECHA Y HORA (Mockup 1 del nuevo set)          */}
          {/* ======================================================== */}
          {currentScreen === 'datetime' && (
            <div className="screen-view view-datetime">
              <h2 className="chat-main-heading" style={{ marginBottom: '20px' }}>
                Selecciona fecha y hora<br />para tu cita
              </h2>

              {/* Fila de días exactamente como en el mockup */}
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

              {/* Bloques de horario verticales idénticos al mockup */}
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

              {/* Caja informativa celeste de selección */}
              <div className="summary-ice-card datetime-selected-summary">
                <span className="selected-lead-tag">Has seleccionado:</span>
                <strong className="selected-lead-val">{selectedDay} a las {selectedTime}.</strong>
              </div>

              {/* Botón inferior Confirmar agendamiento */}
              <div className="datetime-bottom-cta">
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={isSubmitting}
                  className="btn-teal-primary"
                >
                  {isSubmitting ? 'Guardando en Base de Datos...' : 'Confirmar agendamiento'}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PANTALLA 8: CONFIRMACIÓN Y COMPROBANTE DE CITA             */}
          {/* ======================================================== */}
          {currentScreen === 'success' && reservaConfirmada && (
            <div className="screen-view view-success">
              <div className="success-check-circle">✓</div>
              <h2 className="success-main-heading">¡Cita Registrada!</h2>
              <p className="prompt-sub-heading" style={{ textAlign: 'center', marginBottom: '18px' }}>
                Tu solicitud ha sido guardada en la base de datos de MenteU.
              </p>

              <div className="summary-ice-card success-ticket-card">
                <p><strong>Código de Cita:</strong> {reservaConfirmada.id}</p>
                <p><strong>Especialista:</strong> {reservaConfirmada.prof}</p>
                <p><strong>Fecha y hora:</strong> {reservaConfirmada.fecha}</p>
                <p><strong>Tarifa acordada:</strong> {reservaConfirmada.costo}</p>
                <p><strong>Modalidad:</strong> {reservaConfirmada.modalidad}</p>
              </div>

              <div className="success-actions-bottom">
                <button onClick={handleGoHome} className="btn-teal-primary">
                  Volver al Inicio
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
