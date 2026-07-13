/* ════════════════════════════════
   REACTION ICONS — keep only the like icon
════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reaction-icons').forEach(container => {
        container.innerHTML = '<span class="react-like"></span>';
    });
});

/* ════════════════════════════════
   VIEWER COUNTER
   topViewerCount  → viewers shown in the red live bar (slightly higher)
   bottomViewerCount → "personas están viendo ahora" bar (base count)
   Both driven by the same variable; top = base + offset so they
   always differ but move together.
════════════════════════════════ */
const VIEWER_MIN    = 650;
const VIEWER_MAX    = 750;
const VIEWER_INIT   = 682;   // base starting count
const VIEWER_OFFSET = 8;     // top bar always shows this many more
const VIEWER_TICK   = 3500;  // ms between updates

let viewerCount = VIEWER_INIT;

const elBottom = document.getElementById('bottomViewerCount');
const elTop    = document.getElementById('topViewerCount');

function renderCounts() {
    if (elBottom) elBottom.textContent = viewerCount;
    if (elTop)    elTop.textContent    = viewerCount;
}

function updateViewerCount() {
    const delta = Math.floor(Math.random() * 7) - 3; // –3 to +3
    viewerCount = Math.max(VIEWER_MIN, Math.min(VIEWER_MAX, viewerCount + delta));
    renderCounts();
}

renderCounts();                           // set both on first paint
setInterval(updateViewerCount, VIEWER_TICK);

/* ════════════════════════════════
   SOCIAL PROOF NOTIFICATIONS
   TEST MODE: começa após 5s de página aberta
   PRODUÇÃO:  trocar START_DELAY pelo minuto do vídeo em ms
════════════════════════════════ */
/* Modo de teste: abrir a página com ?notif_test=10 dispara aos 10s de vídeo */
const notifTestParam   = new URLSearchParams(location.search).get('notif_test');
const NOTIF_VIDEO_TIME = notifTestParam
    ? parseInt(notifTestParam, 10)
    : 20 * 60 + 18; // 20:18 do vídeo (em segundos)
const NOTIF_INTERVAL   = 23000;        // 23s entre notificações
const NOTIF_DURATION   = 6000;         // 6s visível na tela

const NOTIF_NAMES = [
    'María García',   'Carlos Rodríguez', 'Ana Martínez',
    'Luis Hernández', 'Sofía López',      'Miguel Torres',
    'Isabella Díaz',  'Jorge Sánchez',    'Valentina Pérez',
    'Andrés Ramírez', 'Camila Flores',    'Ricardo Morales',
    'Daniela Castro', 'Fernando Vargas',  'Patricia Jiménez',
    'Roberto Medina', 'Lucía Reyes',      'Eduardo Navarro',
    'Natalia Ortega', 'Sebastián Ruiz',
];

let notifNameIndex = Math.floor(Math.random() * NOTIF_NAMES.length);
let notifContainer = null;

function getNextName() {
    const name = NOTIF_NAMES[notifNameIndex % NOTIF_NAMES.length];
    notifNameIndex++;
    return name;
}

function getTimeLabel() {
    const opts = ['ahora', 'hace 1 min', 'hace 2 min', 'hace 3 min'];
    return opts[Math.floor(Math.random() * opts.length)];
}

function showNotif() {
    if (!notifContainer) return;

    const name = getNextName();
    const el   = document.createElement('div');
    el.className = 'notif';
    el.innerHTML = `
        <div class="notif-inner">
            <span class="notif-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
            </span>
            <div class="notif-text">
                <span class="notif-name">${name}</span>
                <span class="notif-action">acaba de adquirir el manuscrito</span>
            </div>
            <span class="notif-time">${getTimeLabel()}</span>
            <button class="notif-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="notif-bar"><div class="notif-bar-fill"></div></div>
    `;

    notifContainer.appendChild(el);

    // slide in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('notif--show'));
    });

    // start draining bar after slide-in
    const fill = el.querySelector('.notif-bar-fill');
    setTimeout(() => {
        fill.style.transitionDuration = NOTIF_DURATION + 'ms';
        fill.classList.add('notif-bar--drain');
    }, 400);

    // auto-dismiss
    const autoClose = setTimeout(() => dismiss(el), NOTIF_DURATION + 400);

    // manual close
    el.querySelector('.notif-close').addEventListener('click', () => {
        clearTimeout(autoClose);
        dismiss(el);
    });
}

function dismiss(el) {
    el.classList.add('notif--hide');
    setTimeout(() => el.remove(), 400);
}

function startNotifications() {
    notifContainer = document.createElement('div');
    notifContainer.className = 'notif-container';
    document.body.appendChild(notifContainer);

    showNotif(); // primeira imediata ao iniciar
    setInterval(showNotif, NOTIF_INTERVAL);

    // comentário da Carmen surge logo depois da primeira notificação
    setTimeout(() => spawnComment(CARMEN_COMMENT), CARMEN_AFTER_NOTIF_DELAY);
}

/* Dispara quando o VÍDEO chega em NOTIF_VIDEO_TIME (20:18).
   O <video> do Vturb fica dentro de shadow DOM, então eventos de mídia
   não chegam ao document. Usamos dois métodos:
   1. API oficial do smartplayer (global exposto pela ConverteAI)
   2. Fallback: polling que varre a página (incluindo shadow roots
      abertos) atrás do <video> e lê currentTime diretamente.
   Em ambos os casos o relógio é o do próprio vídeo — pausou, parou. */
let notifStarted = false;

function triggerNotifsIfTime(t) {
    if (!notifStarted && typeof t === 'number' && t >= NOTIF_VIDEO_TIME) {
        notifStarted = true;
        startNotifications();
    }
}

/* Método 1 — API oficial do smartplayer */
(function hookSmartplayer(attempts) {
    if (notifStarted) return;
    if (typeof smartplayer === 'undefined' || !smartplayer.instances || !smartplayer.instances.length) {
        if (attempts >= 60) return; // desiste após ~60s (fallback continua ativo)
        return setTimeout(() => hookSmartplayer(attempts + 1), 1000);
    }
    smartplayer.instances[0].on('timeupdate', () => {
        const inst = smartplayer.instances[0];
        const t = inst.video
            ? inst.video.currentTime
            : (typeof inst.currentTime === 'function' ? inst.currentTime() : null);
        triggerNotifsIfTime(t);
    });
})(0);

/* Método 2 — fallback por polling (cobre shadow DOM aberto) */
function findVideo(root) {
    if (root.querySelector) {
        const direct = root.querySelector('video');
        if (direct) return direct;
    }
    const all = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (const el of all) {
        if (el.shadowRoot) {
            const v = findVideo(el.shadowRoot);
            if (v) return v;
        }
    }
    return null;
}

let notifVideoEl = null;
const notifPoll = setInterval(() => {
    if (notifStarted) { clearInterval(notifPoll); return; }
    if (!notifVideoEl || !notifVideoEl.isConnected) notifVideoEl = findVideo(document);
    if (notifVideoEl) triggerNotifsIfTime(notifVideoEl.currentTime);
}, 1000);

/* ════════════════════════════════
   COMENTÁRIO DINÂMICO — Carmen Rodríguez
   Surge no topo dos comentários logo depois da PRIMEIRA
   notificação de compra aparecer (disparado em startNotifications).
════════════════════════════════ */
const CARMEN_AFTER_NOTIF_DELAY = 2000; // 2s após a primeira notificação

const CARMEN_COMMENT = {
    name:   'Carmen Rodríguez',
    img:    'assets/img/carmen-rodriguez.webp',
    letter: 'C',
    color:  'avatar--purple',
    likes:  3,
    time:   '1 min',
    text:   'Nadie está cobrando por la fe ni por la oración. Estamos pagando ' +
            'por recibir todo preparado, explicado y disponible en un solo ' +
            'lugar. Lo pagué con gusto.',
};

function spawnComment(c) {
    const section      = document.querySelector('.comments-section');
    const firstComment = section ? section.querySelector('.comment') : null;
    if (!firstComment) return;

    const el = document.createElement('article');
    el.className = 'comment comment--incoming';
    el.innerHTML = `
        <div class="avatar ${c.color}" aria-hidden="true">
            <img class="avatar-img" src="${c.img}" alt="${c.name}" onerror="this.remove()">
            <span class="avatar-letter">${c.letter}</span>
        </div>
        <div class="comment-body">
            <div class="comment-bubble">
                <div class="comment-name">${c.name}</div>
                <div class="comment-text">${c.text}</div>
            </div>
            <div class="comment-actions">
                <span class="action-btn">Me gusta</span>
                <span class="dot-sep">·</span>
                <span class="action-btn">Responder</span>
                <span class="dot-sep">·</span>
                <span class="reaction-wrap">
                    <span class="reaction-icons"><span class="react-like"></span></span>
                    <span class="reaction-count">${c.likes}</span>
                </span>
                <span class="dot-sep">·</span>
                <span>${c.time}</span>
            </div>
        </div>
    `;

    firstComment.parentNode.insertBefore(el, firstComment);

    // dois frames para a transição de entrada disparar
    requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('comment--in'));
    });
}


/* ════════════════════════════════
   DYNAMIC EXPIRY DATE
   Always shows tomorrow's date in DD/MM/YYYY format
════════════════════════════════ */
function setTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const day   = String(tomorrow.getDate()).padStart(2, '0');
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const year  = tomorrow.getFullYear();

    const dateEl = document.querySelector('.warning-box .date');
    if (dateEl) dateEl.textContent = `${day}/${month}/${year}`;
}

setTomorrowDate();
