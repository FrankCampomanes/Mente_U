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

  // Chat con Frenz
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
          text: 'Hola, qué bueno que te des este ratito para ti. A veces con la universidad se junta todo y guardárselo solo cansa más. Cuéntame tranquilo, ¿qué es lo que más te anda dando vueltas hoy?'
        }
      ]);
    }, 800);
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
        ? 'Te entiendo totalmente. La u puede volverse bien pesada y no siempre se puede con todo a la vez. ¿Esto viene de hace días o es por alguna entrega o parcial en específico?'
        : 'Suena pesado lidiar con eso, pero es valioso que lo estés reconociendo en vez de ignorarlo. Cuando gustes podemos ver un resumen rápido de lo que conversamos y ver personas con quienes puedas hablar con más calma.';
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 900);
  };

  const filteredProfessionals = PROFESIONALES.filter((p) => {
    if (filterCost === 'gratis' && p.tipo !== 'gratis') return false;
    if (filterCost === 'pago' && p.tipo !== 'pago') return false;
    if (filterModality === 'virtual' && p.modalidad === 'presencial') return false;
    if (filterModality === 'presencial' && p.modalidad === 'virtual') return false;
    return true;
  });

  return (
    <>
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>
      <div className="ambient-glow ambient-glow-3"></div>

      <main className="app-viewport">
        {/* Barra Superior */}
        <header className="app-header">
          <div className="header-left">
            {screenHistory.length > 1 && currentScreen !== 'welcome' && currentScreen !== 'success' && (
              <button onClick={handleBack} className="icon-btn" aria-label="Volver">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <div className="brand">
              <span className="brand-dot-pulse"></span>
              <span className="brand-title">Mente<span className="brand-accent">U</span></span>
            </div>
          </div>
          <div className="header-right">
            <span className="badge-anon">
              <span>Anónimo #74</span>
            </span>
          </div>
        </header>

        {/* PANTALLA 1: Bienvenida */}
        {currentScreen === 'welcome' && (
          <div className="screen-container">
            <div className="welcome-hero">
              <div className="hero-avatar-box">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h1 className="hero-title">Un espacio para ti</h1>
              <p className="hero-subtitle">Habla de lo que sientes en la universidad, a tu ritmo y con total confidencialidad.</p>
              
              <div className="privacy-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Privado &bull; No guardamos tus mensajes</span>
              </div>
            </div>

            <div className="welcome-actions">
              <button onClick={() => navigateTo('prompt')} className="btn btn-primary btn-block">
                <span>Conversar con Frenz</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={() => navigateTo('options')} className="btn btn-secondary btn-block">
                <span>Ver opciones de atención</span>
              </button>
            </div>
            <p className="footnote">Para estudiantes universitarios de todo el Perú</p>
          </div>
        )}

        {/* PANTALLA 2: Prompts Rápidos */}
        {currentScreen === 'prompt' && (
          <div className="screen-container">
            <div className="prompt-header">
              <div className="avatar-frenz">F</div>
              <h2>Hola, soy Frenz</h2>
              <p>Elige de qué te gustaría hablar o cuéntame directo:</p>
            </div>

            <div className="quick-cards-grid">
              <button onClick={() => handleStartConversation('Quiero desahogarme un poco, siento que se me juntaron varias cosas.')} className="quick-card">
                <div className="card-icon-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div>
                  <strong>Quiero desahogarme</strong>
                  <small>Expresar lo que tengo acumulado</small>
                </div>
              </button>

              <button onClick={() => handleStartConversation('Tuve un día pesado con los cursos y tareas.')} className="quick-card">
                <div className="card-icon-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <strong>Tuve un día difícil</strong>
                  <small>Cansancio o sobrecarga de tareas</small>
                </div>
              </button>

              <button onClick={() => handleStartConversation('Me preocupa bastante mi rendimiento y las semanas de evaluaciones.')} className="quick-card">
                <div className="card-icon-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div>
                  <strong>Me preocupa el ciclo</strong>
                  <small>Exámenes y evaluaciones próximas</small>
                </div>
              </button>

              <button onClick={() => handleStartConversation('Solo quiero hablar con alguien para despejar la cabeza.')} className="quick-card">
                <div className="card-icon-pill">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
                </div>
                <div>
                  <strong>Solo charlar un rato</strong>
                  <small>Pausar y ordenar pensamientos</small>
                </div>
              </button>
            </div>

            <div className="input-box-light">
              <input 
                type="text" 
                placeholder="O escribe libremente aquí..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleStartConversation(e.target.value.trim());
                  }
                }}
              />
              <button className="btn-send" aria-label="Enviar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
            <p className="disclaimer-soft">Espacio de apoyo inicial &bull; No sustituye atención médica</p>
          </div>
        )}

        {/* PANTALLA 3: Chat Interactivo */}
        {currentScreen === 'chat' && (
          <div className="screen-container">
            <div className="chat-status-bar">
              <div className="frenz-identity">
                <div className="frenz-avatar-mini">F</div>
                <div>
                  <strong>Frenz</strong>
                  <span className="frenz-status">En línea contigo</span>
                </div>
              </div>
              <button onClick={() => navigateTo('summary')} className="btn btn-sm btn-ghost">
                <span>Ver resumen</span>
              </button>
            </div>

            <div className="chat-flow">
              {messages.map((m, idx) => (
                <div key={idx} className={`msg-wrapper ${m.sender}`}>
                  <span className="msg-author">{m.sender === 'user' ? 'Tú' : 'Frenz'}</span>
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="msg-wrapper ai">
                  <span className="msg-author">Frenz</span>
                  <div className="msg-bubble" style={{ display: 'flex', gap: '4px', padding: '12px 16px' }}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="input-box-light" style={{ padding: '4px 6px 4px 16px' }}>
              <input
                type="text"
                placeholder="Escribe lo que sientes..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-send" aria-label="Enviar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </form>
          </div>
        )}

        {/* PANTALLA 4: Resumen Orientativo */}
        {currentScreen === 'summary' && (
          <div className="screen-container">
            <div className="summary-card">
              <span className="summary-badge">Puntos clave</span>
              <h2 className="summary-title">Gracias por compartir esto con Frenz</h2>
              <p className="summary-intro">De lo que charlamos, esto es lo principal que identificamos:</p>

              <ul className="summary-points">
                <li><strong>Carga universitaria:</strong> Varias tareas y pendientes acumulados que te están pesando.</li>
                <li><strong>Cansancio acumulado:</strong> Dificultad para desconectarte del estudio y descansar de verdad.</li>
                <li><strong>Disposición al cambio:</strong> Reconocerlo y buscar expresarlo ya es un paso positivo.</li>
              </ul>

              <div className="tips-box">
                <span className="tips-label">Pasos suaves para hoy:</span>
                <ol className="tips-list">
                  <li>Toma una pausa de 15 minutos sin revisar la u.</li>
                  <li>Elige avanzar solo UNA cosa pequeña hoy.</li>
                  <li>Toma un vaso de agua y no te culpes.</li>
                </ol>
              </div>

              <div className="consent-check">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                  />
                  <span className="label-text">Autorizo ver las opciones de apoyo y compartir este resumen únicamente si elijo agendar una cita.</span>
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
                <span>Ver opciones de atención</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 5: Opciones y Filtros */}
        {currentScreen === 'options' && (
          <div className="screen-container">
            <div className="options-header">
              <h2>Especialistas disponibles</h2>
              <p>Puedes elegir entre el servicio gratuito universitario o psicólogos colegiados particulares.</p>
            </div>

            <div className="filters-bar">
              <div className="filter-group">
                <label>Costo:</label>
                <div className="pill-selector">
                  <button className={`pill ${filterCost === 'all' ? 'active' : ''}`} onClick={() => setFilterCost('all')}>Todos</button>
                  <button className={`pill ${filterCost === 'gratis' ? 'active' : ''}`} onClick={() => setFilterCost('gratis')}>Gratis</button>
                  <button className={`pill ${filterCost === 'pago' ? 'active' : ''}`} onClick={() => setFilterCost('pago')}>Solidario</button>
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
                    <h3>{prof.nombre}</h3>
                    <span className={prof.tipo === 'gratis' ? 'badge-gratis' : 'badge-pago'}>
                      {prof.tipo === 'gratis' ? 'Gratis' : 'S/ 15'}
                    </span>
                  </div>
                  <p className="prof-specialty">{prof.especialidad}</p>
                  <div className="prof-meta-row">
                    <div className="prof-rating">
                      ★ {prof.rating} <small>({prof.reviewsCount} opiniones)</small>
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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: '4px' }}>
                  {selectedProf.modalidad === 'mixta' ? 'Virtual o Presencial' : `Modalidad ${selectedProf.modalidad}`} &bull; Sesión de 45-50 min
                </div>
              </div>

              <div className="detail-box-privacy">
                <strong>Privacidad asegurada</strong>
                <p>El profesional solo verá el resumen orientativo si tú autorizas compartirlo. Tus chats no se guardan.</p>
              </div>

              <div className="reviews-preview-box">
                <h4>Opiniones de otros estudiantes:</h4>
                {selectedProf.resenas.map((r, i) => (
                  <div key={i} className="review-item">
                    "{r.texto}"
                    <span className="review-author">— {r.autor}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigateTo('schedule')} className="btn btn-primary btn-block">
                <span>Elegir fecha y horario</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* PANTALLA 8: Selección de Horario */}
        {currentScreen === 'schedule' && selectedProf && (
          <div className="screen-container">
            <div className="schedule-header">
              <h2>Elige tu horario</h2>
              <p>Sesiones de 45 a 50 minutos con atención personalizada.</p>
            </div>

            <div className="prof-summary-badge">
              Atención con: <strong>{selectedProf.nombre}</strong> ({selectedProf.costoLabel})
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

            <div className="selection-preview-box">
              <span className="preview-label">Has elegido:</span>
              <strong>{selectedDay}, {selectedSlot} ({selectedProf.modalidad === 'presencial' ? 'Presencial' : 'Virtual'})</strong>
            </div>

            <button onClick={() => navigateTo('success')} className="btn btn-primary btn-block">
              <span>Confirmar Cita</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* PANTALLA 12: Confirmación */}
        {currentScreen === 'success' && selectedProf && (
          <div className="screen-container">
            <div className="success-card">
              <div className="success-icon-wrapper">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2>Cita confirmada</h2>
              <p className="success-subtitle">Tu espacio ha quedado reservado en MenteU.</p>

              <div className="ticket-card">
                <div className="ticket-row">
                  <span className="ticket-label">Especialista:</span>
                  <strong>{selectedProf.nombre}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Horario:</span>
                  <strong>{selectedDay}, {selectedSlot}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Modalidad:</span>
                  <span>{selectedProf.modalidad === 'presencial' ? 'Presencial' : 'Virtual (Meet)'}</span>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Costo:</span>
                  <strong className="cost-tag">{selectedProf.costo === 0 ? 'GRATIS' : `S/ ${selectedProf.costo}.00`}</strong>
                </div>
                <div className="ticket-row">
                  <span className="ticket-label">Estado:</span>
                  <span className="status-solicitada">CONFIRMADA</span>
                </div>
              </div>

              <div className="review-lock-box">
                <div className="stars-row disabled">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <small className="lock-note">
                  La opción de dejar una reseña se activa después de realizar la sesión.
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
