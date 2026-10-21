import React, { useState } from 'react';
import './App.css';

const PROFESIONALES = [
  {
    id: 'prof-01',
    nombre: 'Bienestar Universitario (Lic. Carlos Ruiz)',
    especialidad: 'Psicología estudiantil, ansiedad ante exámenes y adaptación',
    tipo: 'gratis',
    modalidad: 'mixta',
    costo: 0,
    costoLabel: 'GRATIS',
    rating: 4.9,
    reviewsCount: 142,
    resenas: [
      { autor: 'Estudiante de 4to ciclo', texto: 'Excelente atención. Me ayudó a organizar mis semanas de exámenes finales sin colapsar.' },
      { autor: 'Estudiante anónimo', texto: 'Trato muy amable y comprensivo. Sentí que realmente me escucharon.' }
    ]
  },
  {
    id: 'prof-02',
    nombre: 'Psic. Ana Torres',
    especialidad: 'Manejo del estrés académico, burnout y técnicas de relajación',
    tipo: 'pago',
    modalidad: 'virtual',
    costo: 15,
    costoLabel: 'S/ 15 / sesión',
    rating: 4.8,
    reviewsCount: 110,
    resenas: [
      { autor: 'Estudiante de Ingeniería', texto: 'Explicaciones claras y un espacio muy seguro. La sesión de 45 minutos fue muy productiva.' },
      { autor: 'Estudiante anónimo', texto: 'Tarifa súper accesible para universitarios. Me dio pautas prácticas desde el primer día.' }
    ]
  },
  {
    id: 'prof-03',
    nombre: 'Psic. Luis Mendoza',
    especialidad: 'Orientación vocacional, motivación y equilibrio personal',
    tipo: 'pago',
    modalidad: 'virtual',
    costo: 10,
    costoLabel: 'S/ 10 / sesión',
    rating: 4.7,
    reviewsCount: 85,
    resenas: [
      { autor: 'Estudiante de Ciencias', texto: 'Muy empático. Me ayudó a replantear mis metas sin sentir tanta presión familiar.' }
    ]
  },
  {
    id: 'prof-04',
    nombre: 'Psic. Carla Rojas',
    especialidad: 'Gestión emocional y apoyo en situaciones personales complejas',
    tipo: 'pago',
    modalidad: 'presencial',
    costo: 15,
    costoLabel: 'S/ 15 / sesión',
    rating: 4.9,
    reviewsCount: 94,
    resenas: [
      { autor: 'Estudiante anónimo', texto: 'Atención presencial impecable. Da mucha tranquilidad poder hablar cara a cara.' }
    ]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenHistory, setScreenHistory] = useState(['welcome']);
  
  // Estado del Chat
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatCount, setChatCount] = useState(0);

  // Estado del Filtro y Selección
  const [filterCost, setFilterCost] = useState('all');
  const [filterModality, setFilterModality] = useState('all');
  const [selectedProf, setSelectedProf] = useState(PROFESIONALES[1]);
  const [selectedDay, setSelectedDay] = useState('Jue 22');
  const [selectedSlot, setSelectedSlot] = useState('11:30 a. m.');
  const [consentGranted, setConsentGranted] = useState(true);

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
    }
  };

  // Chat
  const handleStartConversation = (promptText) => {
    setMessages([{ sender: 'user', text: promptText }]);
    setChatCount(0);
    navigateTo('chat');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Te agradezco mucho por darte este espacio para hablar. A veces solo poner en palabras lo que sentimos ayuda a aligerar el peso. Cuéntame con tranquilidad, estoy aquí para escucharte a tu ritmo.'
        }
      ]);
    }, 900);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);
    setChatCount((prev) => prev + 1);

    setTimeout(() => {
      setIsTyping(false);
      const reply = chatCount === 0
        ? 'Tiene todo el sentido que te sientas así. A veces nos exigimos estar al 100% todos los días y olvidamos que somos humanos. ¿Sientes que esto viene de hace semanas o se intensificó con alguna entrega reciente?'
        : 'Suena agotador lidiar con tantas cosas a la vez, pero quiero recordarte que reconocerlo y buscar desahogarte es un paso muy valioso. Cuando estés listo, podemos revisar un breve resumen y ver opciones de personas que pueden orientarte de cerca.';
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 1000);
  };

  // Filtrado de profesionales
  const filteredProfessionals = PROFESIONALES.filter((p) => {
    if (filterCost === 'gratis' && p.tipo !== 'gratis') return false;
    if (filterCost === 'pago' && p.tipo !== 'pago') return false;
    if (filterModality === 'virtual' && p.modalidad === 'presencial') return false;
    if (filterModality === 'presencial' && p.modalidad === 'virtual') return false;
    return true;
  });

  return (
    <>
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>
      <div className="bg-glow bg-glow-3"></div>

      <main className="app-viewport">
        {/* Header Superior */}
        <header className="app-header">
          <div className="header-left">
            {screenHistory.length > 1 && currentScreen !== 'welcome' && currentScreen !== 'success' && (
              <button onClick={handleBack} className="icon-btn" aria-label="Volver">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <div className="brand">
              <div className="brand-symbol"><span className="brand-dot"></span></div>
              <span className="brand-title">Mente<span className="brand-accent">U</span></span>
            </div>
          </div>
          <div className="header-right">
            <span className="badge-anon">
              <span className="pulse-indicator"></span>
              <span>Anónimo #74</span>
            </span>
          </div>
        </header>

        {/* PANTALLA 1: Bienvenida */}
        {currentScreen === 'welcome' && (
          <div className="screen-container">
            <div className="welcome-hero">
              <div className="hero-illustration">
                <div className="sparkle-orbit">
                  <div className="sparkle s1">✦</div>
                  <div className="sparkle s2">✧</div>
                  <div className="sparkle s3">✦</div>
                </div>
                <div className="hero-logo-box">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#react-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <linearGradient id="react-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8"/>
                        <stop offset="100%" stopColor="#818cf8"/>
                      </linearGradient>
                    </defs>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <path d="M8 10h.01M12 10h.01M16 10h.01"/>
                  </svg>
                </div>
              </div>
              <h1 className="hero-title">Mente<span className="gradient-text">U</span></h1>
              <p className="hero-subtitle">Tu espacio para hablar libremente cuando lo necesites, sin juicios ni etiquetas.</p>
              <div className="privacy-guarantee">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>100% Anónimo &bull; No guardamos tus mensajes</span>
              </div>
            </div>

            <div className="welcome-actions">
              <button onClick={() => navigateTo('prompt')} className="btn btn-primary btn-block">
                <span>Comenzar a hablar</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => navigateTo('options')} className="btn btn-secondary btn-block">
                <span>Ver psicólogos y bienestar</span>
              </button>
            </div>
            <p className="footnote">Para universitarios de todo el Perú &bull; React + Vercel</p>
          </div>
        )}

        {/* PANTALLA 2: Prompts Rápidos */}
        {currentScreen === 'prompt' && (
          <div className="screen-container">
            <div className="prompt-header">
              <div className="avatar-ai"><span>🌱</span></div>
              <h2>¡Hola! ¿Cómo estás hoy?</h2>
              <p>Elige cómo te gustaría empezar o simplemente escribe lo que sientas:</p>
            </div>

            <div className="chips-grid">
              <button onClick={() => handleStartConversation('Quiero contar cómo me siento hoy, tengo varias cosas acumuladas.')} className="chip-card">
                <span className="chip-icon">💭</span>
                <div className="chip-text">
                  <strong>Quiero desahogarme</strong>
                  <small>Expresar lo que siento</small>
                </div>
              </button>
              <button onClick={() => handleStartConversation('Tuve un día difícil en la universidad con las clases y exámenes.')} className="chip-card">
                <span className="chip-icon">🌧️</span>
                <div className="chip-text">
                  <strong>Tuve un día difícil</strong>
                  <small>Cansancio o frustración</small>
                </div>
              </button>
              <button onClick={() => handleStartConversation('Me preocupa algo sobre mi rendimiento y entregas académicas.')} className="chip-card">
                <span className="chip-icon">⏳</span>
                <div className="chip-text">
                  <strong>Me preocupa algo</strong>
                  <small>Ansiedad por el futuro</small>
                </div>
              </button>
              <button onClick={() => handleStartConversation('Solo quiero conversar un momento para despejar mi mente.')} className="chip-card">
                <span className="chip-icon">☕</span>
                <div className="chip-text">
                  <strong>Solo quiero conversar</strong>
                  <small>Pausar y respirar</small>
                </div>
              </button>
            </div>

            <div className="input-inline-box">
              <input 
                type="text" 
                placeholder="O escribe libremente cómo te sientes..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleStartConversation(e.target.value.trim());
                  }
                }}
              />
              <button className="btn-send" aria-label="Enviar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
            <span className="micro-disclaimer">Orientación inicial reflexiva &bull; No sustituye evaluación clínica</span>
          </div>
        )}

        {/* PANTALLA 3: Chat Interactivo */}
        {currentScreen === 'chat' && (
          <div className="screen-container">
            <div className="chat-status-bar">
              <div className="ai-identity">
                <div className="ai-avatar-mini">M</div>
                <div>
                  <strong>Compañero MenteU</strong>
                  <span className="ai-status">Escuchando activamente...</span>
                </div>
              </div>
              <button onClick={() => navigateTo('summary')} className="btn btn-sm btn-ghost">
                <span>Finalizar</span>
              </button>
            </div>

            <div className="chat-flow">
              {messages.map((m, idx) => (
                <div key={idx} className={`msg-wrapper ${m.sender}`}>
                  <span className="msg-author">{m.sender === 'user' ? 'Tú' : 'MenteU (Compañero)'}</span>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="msg-wrapper ai">
                  <span className="msg-author">MenteU (Compañero)</span>
                  <div className="msg-bubble typing-bubble">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="chat-input-wrapper">
              <input
                type="text"
                placeholder="Escribe tu mensaje aquí..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-send" aria-label="Enviar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </form>
          </div>
        )}

        {/* PANTALLA 4: Resumen Orientativo */}
        {currentScreen === 'summary' && (
          <div className="screen-container">
            <div className="summary-card">
              <div className="summary-badge">🌿 Cierre Orientativo</div>
              <h2 className="summary-title">"Gracias por compartir conmigo. No estás solo."</h2>
              <p className="summary-intro">De nuestra conversación, los temas clave que identificamos juntos son:</p>

              <ul className="summary-points">
                <li><strong>Sobrecarga académica:</strong> Sensación de acumulación de tareas y evaluaciones próximas.</li>
                <li><strong>Tensión emocional:</strong> Dificultad para desconectarse de las obligaciones universitarias.</li>
                <li><strong>Búsqueda proactiva:</strong> Interés positivo en ordenar prioridades y pedir orientación.</li>
              </ul>

              <div className="tips-box">
                <span className="tips-label">💡 Pequeños pasos para hoy (sin presión):</span>
                <ol className="tips-list">
                  <li>Tómate una pausa de 15 minutos sin pantallas.</li>
                  <li>Elige solo UNA tarea prioritaria para avanzar hoy.</li>
                  <li>Bebe un vaso de agua y reconoce tu esfuerzo.</li>
                </ol>
              </div>

              <div className="disclaimer-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <small>Este resumen es orientativo y no constituye diagnóstico médico ni psicológico.</small>
              </div>

              <div className="consent-check">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                  />
                  <span className="label-text">Autorizo ver las opciones de apoyo y compartir este resumen únicamente si decido agendar una cita.</span>
                </label>
              </div>

              <button
                onClick={() => {
                  if (!consentGranted) {
                    alert('Por favor autoriza la opción de ver apoyos para continuar.');
                    return;
                  }
                  navigateTo('options');
                }}
                className="btn btn-primary btn-block"
              >
                <span>Ver opciones de apoyo</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 5: Opciones y Filtros */}
        {currentScreen === 'options' && (
          <div className="screen-container">
            <div className="options-header">
              <h2>Opciones que podrían ayudarte</h2>
              <p>Elige entre el servicio gratuito de tu universidad o psicólogos particulares solidarios.</p>
            </div>

            <div className="filters-bar">
              <div className="filter-group">
                <label>Costo:</label>
                <div className="pill-selector">
                  <button className={`pill ${filterCost === 'all' ? 'active' : ''}`} onClick={() => setFilterCost('all')}>Todos</button>
                  <button className={`pill ${filterCost === 'gratis' ? 'active' : ''}`} onClick={() => setFilterCost('gratis')}>Gratis</button>
                  <button className={`pill ${filterCost === 'pago' ? 'active' : ''}`} onClick={() => setFilterCost('pago')}>De pago</button>
                </div>
              </div>
              <div className="filter-group">
                <label>Modalidad:</label>
                <div className="pill-selector">
                  <button className={`pill ${filterModality === 'all' ? 'active' : ''}`} onClick={() => setFilterModality('all')}>Todas</button>
                  <button className={`pill ${filterModality === 'virtual' ? 'active' : ''}`} onClick={() => setFilterModality('virtual')}>Virtual</button>
                  <button className={`pill ${filterModality === 'presencial' ? 'active' : ''}`} onClick={() => setFilterModality('presencial')}>Presencial</button>
                </div>
              </div>
            </div>

            <div className="professionals-list">
              {filteredProfessionals.map((prof) => (
                <div
                  key={prof.id}
                  className="prof-card"
                  onClick={() => {
                    setSelectedProf(prof);
                    navigateTo('detail');
                  }}
                >
                  <div className="prof-card-top">
                    <div className="prof-title-box">
                      <h3>{prof.nombre}</h3>
                      <span className={`prof-badge-tag ${prof.tipo === 'gratis' ? 'badge-gratis' : 'badge-pago'}`}>
                        {prof.tipo === 'gratis' ? 'Institucional • Gratis' : 'Colegiado • Solidario'}
                      </span>
                    </div>
                  </div>
                  <p className="prof-specialty">{prof.especialidad}</p>
                  <div className="prof-meta-row">
                    <div className="prof-rating">
                      <span>★</span> {prof.rating} <small>({prof.reviewsCount} reseñas)</small>
                    </div>
                    <div className="prof-cost">{prof.costoLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANTALLA 6/7: Detalle del Profesional */}
        {currentScreen === 'detail' && selectedProf && (
          <div className="screen-container">
            <div className="detail-card">
              <div className="detail-header-hero">
                <div className="detail-avatar-box">{selectedProf.nombre.charAt(0)}</div>
                <h2>{selectedProf.nombre}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedProf.especialidad}</p>
                <div className="detail-price-big">{selectedProf.costoLabel}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {selectedProf.modalidad === 'mixta' ? 'Modalidad Virtual y Presencial' : `Modalidad ${selectedProf.modalidad}`} &bull; Sesión de 45-50 min
                </div>
              </div>

              <div className="detail-box-privacy">
                <strong>🔒 Protección de tu Privacidad</strong>
                <p>El profesional solo recibirá el resumen orientativo si tú autorizas compartirlo. Tus mensajes directos nunca se guardan.</p>
              </div>

              <div className="reviews-preview-box">
                <h4>⭐ Reseñas verificadas de estudiantes:</h4>
                {selectedProf.resenas.map((r, i) => (
                  <div key={i} className="review-item">
                    "{r.texto}"
                    <span className="review-author">— {r.autor}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigateTo('schedule')} className="btn btn-primary btn-block">
                <span>Solicitar y elegir horario</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 8: Selección de Horario */}
        {currentScreen === 'schedule' && selectedProf && (
          <div className="screen-container">
            <div className="schedule-header">
              <h2>Selecciona fecha y hora</h2>
              <p>Sesiones de 45 a 50 minutos diseñadas para acompañarte a tu ritmo.</p>
            </div>

            <div className="prof-summary-badge">
              Agendando con: <strong>{selectedProf.nombre}</strong> ({selectedProf.costoLabel})
            </div>

            <div className="days-carousel">
              {['Jue 22', 'Vie 23', 'Sáb 24', 'Lun 26'].map((d) => (
                <button
                  key={d}
                  className={`day-card ${selectedDay === d ? 'active' : ''}`}
                  onClick={() => setSelectedDay(d)}
                >
                  <span className="day-name">{d.split(' ')[0]}</span>
                  <span className="day-num">{d.split(' ')[1]}</span>
                  <span className="day-status">{d === 'Jue 22' ? 'Hoy' : 'Libre'}</span>
                </button>
              ))}
            </div>

            <div className="time-slots-container">
              <h3>Horarios disponibles (45 min):</h3>
              <div className="slots-grid">
                {['10:00 a. m.', '11:30 a. m.', '03:00 p. m.', '04:30 p. m.'].map((slot) => (
                  <button
                    key={slot}
                    className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="selection-preview-box">
              <span className="preview-label">Has seleccionado:</span>
              <strong>{selectedDay}, {selectedSlot} ({selectedProf.modalidad === 'presencial' ? 'Presencial' : 'Virtual'})</strong>
            </div>

            <button onClick={() => navigateTo('success')} className="btn btn-primary btn-block">
              <span>Confirmar Agendamiento</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* PANTALLA 12: Confirmación Exitosa */}
        {currentScreen === 'success' && selectedProf && (
          <div className="screen-container">
            <div className="success-card">
              <div className="success-icon-wrapper">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2>¡Cita Registrada con Éxito!</h2>
              <p className="success-subtitle">Tu solicitud ha sido guardada en la base de datos de MenteU.</p>

              <div className="ticket-card">
                <div className="ticket-row">
                  <span className="ticket-label">Profesional:</span>
                  <strong>{selectedProf.nombre}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Fecha y Hora:</span>
                  <strong>{selectedDay}, {selectedSlot}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Modalidad:</span>
                  <span className="badge-virtual">{selectedProf.modalidad === 'presencial' ? 'Presencial' : 'Virtual (Meet)'}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Costo:</span>
                  <strong className="cost-tag">{selectedProf.costo === 0 ? 'GRATIS' : `S/ ${selectedProf.costo}.00`}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Estado:</span>
                  <span className="status-pill status-solicitada">CONFIRMADA (PMV1)</span>
                </div>
              </div>

              <div className="review-lock-box">
                <div className="stars-row disabled">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <small className="lock-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  La opción de calificar y reseñar se habilitará automáticamente una vez completada tu sesión.
                </small>
              </div>

              <button onClick={() => navigateTo('welcome')} className="btn btn-secondary btn-block">
                <span>Volver al inicio</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
