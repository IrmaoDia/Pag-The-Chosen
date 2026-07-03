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
   AUDIO PLAYER
════════════════════════════════ */
const audio       = document.getElementById('oracaoAudio');
const playBtn     = document.getElementById('playBtn');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const progressBar = document.getElementById('progressBar');
const progressFill= document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const totalTime   = document.getElementById('totalTime');

function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2,'0')}`;
}

if (audio && playBtn) {
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            iconPlay.style.display  = 'none';
            iconPause.style.display = 'block';
        } else {
            audio.pause();
            iconPlay.style.display  = 'block';
            iconPause.style.display = 'none';
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = pct + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(pct));
        currentTime.textContent  = fmt(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
        totalTime.textContent = fmt(audio.duration);
    });

    audio.addEventListener('ended', () => {
        iconPlay.style.display  = 'block';
        iconPause.style.display = 'none';
        progressFill.style.width = '0%';
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pct  = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
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
