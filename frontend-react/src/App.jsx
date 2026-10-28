import React, { useState } from 'react';
import './App.css';
import { analyzeAndRespond, buildDynamicSummary } from './frenzEngine';

// Profesionales para las pantallas posteriores (flujo completo conectado)
const PROFESIONALES = [
  {
    id: 'prof-01',
    nombre: 'Bienestar Universitario (Lic. Carlos Ruiz)',
    especialidad: 'Ansiedad académica, adaptación universitaria y técnicas de estudio',
    tipo: 'gratis',
    modalidad: 'mixta',
    costo: 0,
    costoLabel: 'Gratuito (UTP)',
    rating: 4.8,
    reviewsCount: 112,
    resenas: [
      { autor: 'Estudiante anónimo', texto: 'Me ayudó a organizar mis semanas de parciales sin colapsar. Trato muy humano y cercano.' }
    ]
  },
  {
    id: 'prof-02',
    nombre: 'Psic. Ana Torres',
    especialidad: 'Manejo del estrés, sobrecarga emocional y hábitos de descanso',
    tipo: 'pago',
    modalidad: 'virtual',
    costo: 15,
    costoLabel: 'S/ 15 / sesión (Tarifa solidaria)',
    rating: 5.0,
    reviewsCount: 88,
    resenas: [
      { autor: 'Estudiante anónimo', texto: 'La sesión virtual fue súper puntual. Me dio ejercicios prácticos para el insomnio.' }
    ]
  },
  {
    id: 'prof-03',
    nombre: 'Psic. Luis Mendoza',
    especialidad: 'Orientación vocacional, crisis de desmotivación y autoestima',
    tipo: 'pago',
    modalidad: 'virtual',
    costo: 15,
    costoLabel: 'S/ 15 / sesión (Tarifa solidaria)',
    rating: 4.7,
    reviewsCount: 65,
    resenas: [
      { autor: 'Estudiante anónimo', texto: 'Tenía dudas con mi carrera y me ayudó a aclarar mi vocación sin juzgarme.' }
    ]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // welcome | prompt | chat | summary | options | calendar | success
  const [screenHistory, setScreenHistory] = useState(['welcome']);
  
  // Usuario y login
  const [userAlias, setUserAlias] = useState('Estudiante');
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register'
  const [aliasInput, setAliasInput] = useState('');

  // Mensajes de la conversación (inicializados con el ejemplo exacto del mockup del profesor)
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

  // Agendamiento para pantallas posteriores
  const [selectedProf, setSelectedProf] = useState(PROFESIONALES[0]);
  const [selectedDay, setSelectedDay] = useState('Jue 22');
  const [selectedSlot, setSelectedSlot] = useState('10:00 a. m.');
  const [reservaConfirmada, setReservaConfirmada] = useState(null);

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

  // Iniciar conversación desde la Pantalla 2 (Prompt)
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

  // Enviar mensaje en la Pantalla 3 (Chat)
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

  // Resumen dinámico para la Pantalla 4
  const summaryData = buildDynamicSummary(detectedTopics);

  return (
    <div className="device-wrapper">
      <div className="smartphone-frame">
        {/* Notch / Speaker */}
        <div className="phone-notch">
          <span className="phone-camera"></span>
        </div>

        {/* Header idéntico al mockup del profesor */}
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

        {/* CUERPO DE LAS 4 PANTALLAS */}
        <div className="phone-screen-content">

          {/* ======================================================== */}
          {/* PANTALLA 1: BIENVENIDA / INICIO (Mockup 3 del profesor)   */}
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

              {/* Modal de Registro Opcional */}
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
          {/* PANTALLA 5 EN ADELANTE (Continuidad completa del flujo)  */}
          {/* ======================================================== */}
          {currentScreen === 'options' && (
            <div className="screen-view view-options">
              <h2 className="chat-main-heading">Opciones de Apoyo</h2>
              <p className="prompt-sub-heading">Especialistas disponibles para atenderte:</p>

              <div className="options-prof-list">
                {PROFESIONALES.map((prof) => (
                  <div key={prof.id} className="prof-card-item">
                    <div className="prof-info-col">
                      <strong className="prof-name">{prof.nombre}</strong>
                      <span className="prof-spec">{prof.especialidad}</span>
                      <div className="prof-tags-row">
                        <span className="tag-pill">{prof.costoLabel}</span>
                        <span className="tag-pill">{prof.modalidad}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedProf(prof);
                        navigateTo('calendar');
                      }} 
                      className="btn-teal-primary btn-sm"
                    >
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentScreen === 'calendar' && (
            <div className="screen-view view-calendar">
              <h2 className="chat-main-heading">Selecciona Fecha y Hora</h2>
              <p className="prompt-sub-heading">Atención con: <strong>{selectedProf.nombre}</strong></p>

              <div className="date-selector-row">
                {['Mié 21', 'Jue 22', 'Vie 23'].map((d) => (
                  <button 
                    key={d} 
                    onClick={() => setSelectedDay(d)} 
                    className={selectedDay === d ? 'day-btn active' : 'day-btn'}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="slots-selector-grid">
                {['10:00 a. m.', '11:30 a. m.', '03:00 p. m.', '04:30 p. m.'].map((slot) => (
                  <button 
                    key={slot} 
                    onClick={() => setSelectedSlot(slot)} 
                    className={selectedSlot === slot ? 'slot-btn active' : 'slot-btn'}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="calendar-confirm-box">
                <button 
                  onClick={() => {
                    setReservaConfirmada({
                      id: 'CITA-' + Math.floor(1000 + Math.random() * 9000),
                      prof: selectedProf.nombre,
                      fecha: `${selectedDay} a las ${selectedSlot}`,
                      costo: selectedProf.costoLabel
                    });
                    navigateTo('success');
                  }} 
                  className="btn-teal-primary"
                >
                  Confirmar Agendamiento
                </button>
              </div>
            </div>
          )}

          {currentScreen === 'success' && reservaConfirmada && (
            <div className="screen-view view-success">
              <div className="success-check-circle">✓</div>
              <h2 className="success-main-heading">¡Cita Reservada con Éxito!</h2>
              <div className="summary-ice-card">
                <p><strong>Código de Reserva:</strong> {reservaConfirmada.id}</p>
                <p><strong>Especialista:</strong> {reservaConfirmada.prof}</p>
                <p><strong>Horario:</strong> {reservaConfirmada.fecha}</p>
                <p><strong>Tarifa:</strong> {reservaConfirmada.costo}</p>
              </div>
              <button onClick={handleGoHome} className="btn-teal-primary" style={{ marginTop: '24px' }}>
                Volver al Inicio
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
