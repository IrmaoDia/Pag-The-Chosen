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
const NOTIF_VIDEO_TIME = 20 * 60 + 18; // 20:18 do vídeo (em segundos)
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
}

/* Dispara quando o VÍDEO chega em NOTIF_VIDEO_TIME (20:18).
   O player Vturb injeta um <video> na página; os eventos de mídia
   não borbulham, mas são capturáveis na fase de captura do documento.
   Usamos 'timeupdate' com o tempo real do vídeo — se a pessoa pausar,
   o relógio para junto. */
let notifStarted = false;

document.addEventListener('timeupdate', (e) => {
    if (notifStarted) return;
    if (!(e.target instanceof HTMLMediaElement)) return;
    if (e.target.currentTime >= NOTIF_VIDEO_TIME) {
        notifStarted = true;
        startNotifications();
    }
}, true);

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
