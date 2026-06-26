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
════════════════════════════════ */
const VIEWER_MIN  = 640;
const VIEWER_MAX  = 740;
const VIEWER_INIT = 677;
const VIEWER_TICK = 3500; // ms

let viewerCount = VIEWER_INIT;

const elBottom = document.getElementById('bottomViewerCount');
const elTop    = document.getElementById('topViewerCount');

function updateViewerCount() {
    const delta = Math.floor(Math.random() * 7) - 3; // –3 to +3
    viewerCount = Math.max(VIEWER_MIN, Math.min(VIEWER_MAX, viewerCount + delta));

    if (elBottom) elBottom.textContent = viewerCount;
    if (elTop)    elTop.textContent    = viewerCount + 10;
}

setInterval(updateViewerCount, VIEWER_TICK);

