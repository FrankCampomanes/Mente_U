/**
 * MENTEU — Lógica Interactiva del Frontend PMV1
 * Implementación de los 12 wireframes con navegación fluida y simulación empática
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- DATOS INICIALES (Espejo de la Base de Datos MySQL bd_menteu) ---
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

  // --- ESTADO DE LA APLICACIÓN ---
  const state = {
    screenHistory: ['screen-welcome'],
    currentScreen: 'screen-welcome',
    chatCount: 0,
    selectedProfessional: PROFESIONALES[1], // Ana Torres por defecto
    selectedDay: 'Jue 22',
    selectedSlot: '11:30 a. m.',
    selectedModality: 'Virtual',
    userAlias: 'EstudianteAnonimo_74',
    filters: {
      cost: 'all',
      modality: 'all'
    }
  };

  // --- ELEMENTOS DEL DOM ---
  const screens = document.querySelectorAll('.screen');
  const btnBack = document.getElementById('btn-back');
  const btnStartChat = document.getElementById('btn-start-chat');
  const btnDirectBooking = document.getElementById('btn-direct-booking');
  const initialInput = document.getElementById('initial-input');
  const btnInitialSend = document.getElementById('btn-initial-send');
  const chips = document.querySelectorAll('.chip-card');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const btnFinishChat = document.getElementById('btn-finish-chat');
  const btnViewOptions = document.getElementById('btn-view-options');
  const profListContainer = document.getElementById('prof-list');
  const btnGoSchedule = document.getElementById('btn-go-schedule');
  const btnConfirmBooking = document.getElementById('btn-confirm-booking');
  const btnRestart = document.getElementById('btn-restart');
  const filterCostBtns = document.querySelectorAll('#filter-cost .pill');
  const filterModalityBtns = document.querySelectorAll('#filter-modality .pill');

  // --- NAVEGACIÓN ENTRE PANTALLAS ---
  function navigateTo(screenId, pushToHistory = true) {
    screens.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      target.scrollTop = 0;
      if (pushToHistory && state.currentScreen !== screenId) {
        state.screenHistory.push(screenId);
      }
      state.currentScreen = screenId;
      
      // Control del botón atrás
      if (state.screenHistory.length > 1 && screenId !== 'screen-welcome' && screenId !== 'screen-success') {
        btnBack.classList.remove('hidden');
      } else {
        btnBack.classList.add('hidden');
      }
    }
  }

  btnBack.addEventListener('click', () => {
    if (state.screenHistory.length > 1) {
      state.screenHistory.pop(); // Quita la pantalla actual
      const prevScreen = state.screenHistory[state.screenHistory.length - 1];
      navigateTo(prevScreen, false);
    }
  });

  // --- FLUJO PANTALLA 1: Bienvenida ---
  btnStartChat.addEventListener('click', () => {
    navigateTo('screen-prompt');
  });

  btnDirectBooking.addEventListener('click', () => {
    renderProfessionals();
    navigateTo('screen-options');
  });

  // --- FLUJO PANTALLA 2: Opciones de Inicio de Chat ---
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      startConversationWith(promptText);
    });
  });

  btnInitialSend.addEventListener('click', () => {
    const text = initialInput.value.trim();
    if (text) {
      startConversationWith(text);
      initialInput.value = '';
    }
  });

  initialInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnInitialSend.click();
    }
  });

  function startConversationWith(userText) {
    chatMessages.innerHTML = '';
    state.chatCount = 0;
    navigateTo('screen-chat');
    
    // Mensaje del usuario
    appendMessage('user', userText);
    
    // Respuesta inicial de la IA
    showAiTyping();
    setTimeout(() => {
      removeAiTyping();
      const aiResponse = generateEmpatheticResponse(userText, 0);
      appendMessage('ai', aiResponse);
    }, 900);
  }

  // --- FLUJO PANTALLA 3: Chat Interactivo ---
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendMessage('user', text);
    chatInput.value = '';
    state.chatCount++;
    
    showAiTyping();
    setTimeout(() => {
      removeAiTyping();
      const aiReply = generateEmpatheticResponse(text, state.chatCount);
      appendMessage('ai', aiReply);
    }, 1100);
  });

  btnFinishChat.addEventListener('click', () => {
    navigateTo('screen-summary');
  });

  function appendMessage(sender, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `msg-wrapper ${sender}`;
    
    const author = document.createElement('span');
    author.className = 'msg-author';
    author.textContent = sender === 'user' ? 'Tú' : 'MenteU (Compañero)';
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    
    wrapper.appendChild(author);
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showAiTyping() {
    const typingWrapper = document.createElement('div');
    typingWrapper.id = 'ai-typing-indicator';
    typingWrapper.className = 'msg-wrapper ai';
    typingWrapper.innerHTML = `
      <span class="msg-author">MenteU (Compañero)</span>
      <div class="msg-bubble typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatMessages.appendChild(typingWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeAiTyping() {
    const ind = document.getElementById('ai-typing-indicator');
    if (ind) ind.remove();
  }

  // Motor Empático de Respuestas (Humanas, Cálidas y No Clínicas)
  function generateEmpatheticResponse(input, step) {
    const lower = input.toLowerCase();
    
    if (step === 0) {
      if (lower.includes('difícil') || lower.includes('acumuladas') || lower.includes('rendimiento')) {
        return "Entiendo completamente. La vida universitaria a veces se siente como una montaña rusa de exigencias. Es completamente válido sentirse abrumado. ¿Qué es lo que más te tiene pensando en este momento?";
      }
      return "Te agradezco mucho por darte este espacio para hablar. A veces solo poner en palabras lo que sentimos ayuda a aligerar el peso. Cuéntame con tranquilidad, estoy aquí para escucharte a tu ritmo.";
    }
    
    if (step === 1) {
      return "Tiene todo el sentido que te sientas así. A veces nos exigimos estar al 100% todos los días y olvidamos que somos humanos. ¿Sientes que esto viene de hace semanas o se intensificó con alguna entrega reciente?";
    }
    
    return "Suena agotador lidiar con tantas cosas a la vez, pero quiero recordarte que el solo hecho de reconocerlo y buscar desahogarte es un paso muy valioso. Cuando estés listo, podemos revisar un breve resumen y ver opciones de personas que pueden orientarte de cerca.";
  }

  // --- FLUJO PANTALLA 4: Resumen a Opciones ---
  btnViewOptions.addEventListener('click', () => {
    const consent = document.getElementById('check-consent').checked;
    if (!consent) {
      alert('Por favor autoriza la opción de ver apoyos para continuar protegiendo tu privacidad.');
      return;
    }
    renderProfessionals();
    navigateTo('screen-options');
  });

  // --- FLUJO PANTALLA 5: Filtrado y Lista de Profesionales ---
  filterCostBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterCostBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.cost = btn.getAttribute('data-cost');
      renderProfessionals();
    });
  });

  filterModalityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterModalityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.modality = btn.getAttribute('data-mod');
      renderProfessionals();
    });
  });

  function renderProfessionals() {
    profListContainer.innerHTML = '';
    
    const filtered = PROFESIONALES.filter(p => {
      // Filtro Costo
      if (state.filters.cost === 'gratis' && p.tipo !== 'gratis') return false;
      if (state.filters.cost === 'pago' && p.tipo !== 'pago') return false;
      
      // Filtro Modalidad
      if (state.filters.modality === 'virtual' && p.modalidad === 'presencial') return false;
      if (state.filters.modality === 'presencial' && p.modalidad === 'virtual') return false;
      
      return true;
    });

    if (filtered.length === 0) {
      profListContainer.innerHTML = `
        <div style="text-align:center; padding:30px 10px; color:var(--text-dim);">
          <p>No se encontraron especialistas con los filtros seleccionados.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(prof => {
      const card = document.createElement('div');
      card.className = 'prof-card';
      
      const badgeClass = prof.tipo === 'gratis' ? 'badge-gratis' : 'badge-pago';
      const badgeText = prof.tipo === 'gratis' ? 'Institucional &bull; Gratis' : 'Colegiado &bull; Solidario';
      const modLabel = prof.modalidad === 'mixta' ? 'Virtual / Presencial' : (prof.modalidad === 'virtual' ? 'Virtual' : 'Presencial');

      card.innerHTML = `
        <div class="prof-card-top">
          <div class="prof-title-box">
            <h3>${prof.nombre}</h3>
            <span class="prof-badge-tag ${badgeClass}">${badgeText}</span>
          </div>
        </div>
        <p class="prof-specialty">${prof.especialidad}</p>
        <div class="prof-meta-row">
          <div class="prof-rating">
            <span>★</span> ${prof.rating} <small>(${prof.reviewsCount} reseñas)</small>
          </div>
          <div class="prof-cost">${prof.costoLabel}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        openProfessionalDetail(prof);
      });

      profListContainer.appendChild(card);
    });
  }

  // --- FLUJO PANTALLA 6/7: Detalle del Profesional ---
  function openProfessionalDetail(prof) {
    state.selectedProfessional = prof;
    const content = document.getElementById('detail-card-content');
    
    const initial = prof.nombre.charAt(0);
    const modLabel = prof.modalidad === 'mixta' ? 'Modalidad Virtual y Presencial' : `Modalidad ${prof.modalidad}`;

    content.innerHTML = `
      <div class="detail-header-hero">
        <div class="detail-avatar-box">${initial}</div>
        <h2>${prof.nombre}</h2>
        <p style="color:var(--text-muted); font-size:0.85rem;">${prof.especialidad}</p>
        <div class="detail-price-big">${prof.costoLabel}</div>
        <div style="font-size:0.78rem; color:var(--text-dim); margin-top:4px;">${modLabel} &bull; Sesión de 45-50 min</div>
      </div>

      <div class="detail-box-privacy">
        <strong>🔒 Protección de tu Privacidad</strong>
        <p>El profesional solo recibirá el resumen orientativo de los temas que conversaste si tú decides compartirlo. Tus mensajes directos no se almacenan.</p>
      </div>

      <div class="reviews-preview-box">
        <h4>⭐ Reseñas verificadas de estudiantes:</h4>
        ${prof.resenas.map(r => `
          <div class="review-item">
            "${r.texto}"
            <span class="review-author">— ${r.autor}</span>
          </div>
        `).join('')}
      </div>
    `;

    navigateTo('screen-detail');
  }

  btnGoSchedule.addEventListener('click', () => {
    setupScheduleScreen();
    navigateTo('screen-schedule');
  });

  // --- FLUJO PANTALLA 8: Selección de Horarios ---
  function setupScheduleScreen() {
    const prof = state.selectedProfessional;
    const badge = document.getElementById('schedule-prof-badge');
    badge.innerHTML = `Agendando con: <strong>${prof.nombre}</strong> (${prof.costoLabel})`;

    // Días
    const dayBtns = document.querySelectorAll('#days-selector .day-card');
    dayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dayBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedDay = btn.getAttribute('data-day');
        updateSelectionPreview();
      });
    });

    // Slots
    const slotBtns = document.querySelectorAll('#slots-grid .slot-btn');
    slotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        slotBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedSlot = btn.textContent;
        updateSelectionPreview();
      });
    });

    updateSelectionPreview();
  }

  function updateSelectionPreview() {
    const preview = document.getElementById('selected-slot-label');
    const mod = state.selectedProfessional.modalidad === 'presencial' ? 'Presencial' : 'Virtual';
    preview.textContent = `${state.selectedDay}, ${state.selectedSlot} (${mod})`;
  }

  // --- FLUJO PANTALLA 12: Confirmación Exitosa de Cita ---
  btnConfirmBooking.addEventListener('click', () => {
    const prof = state.selectedProfessional;
    const mod = prof.modalidad === 'presencial' ? 'Presencial (Campus/Consultorio)' : 'Virtual (Enlace privado de Google Meet)';
    
    document.getElementById('ticket-prof').textContent = prof.nombre;
    document.getElementById('ticket-datetime').textContent = `${state.selectedDay}, ${state.selectedSlot}`;
    document.getElementById('ticket-modality').textContent = mod;
    document.getElementById('ticket-cost').textContent = prof.costo === 0 ? 'GRATIS' : `S/ ${prof.costo}.00`;
    
    navigateTo('screen-success');
  });

  btnRestart.addEventListener('click', () => {
    state.screenHistory = ['screen-welcome'];
    navigateTo('screen-welcome', false);
  });

});
