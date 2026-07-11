/* ==========================================================================
   🔊 SOUNDBOARD ENGINE (FULLY ISOLATED)
   Stage 1: Main dashboard tray (Work). Stage 2: Break mini-tray ("mole").
   Both share the SAME 9 <audio> elements — never two copies of one sound
   playing at once. Zero dependencies on dashboard.js internals; talks to
   the rest of the app only through:
     1. #all-aboard-btn's click event (real ignition, not the video's
        autoplay 'play' event, which fires on page load for ambient flavor)
     2. window.pomoOnBreak (the same flag the map engine already reads)
   Safe to delete this whole file + its one <script> tag with zero impact
   on anything else.
   ========================================================================== */

(function () {
    'use strict';

    /* ==========================================================================
       🎛️ ALL KNOBS LIVE HERE
       ========================================================================== */
    const AUDIO_FOLDER = ''; // same folder as dashboard.html

    const SOUND_LIBRARY = {
        train:     { label: 'Train',       file: 'train.mp3',     defaultVolume: 0.5,  breakDefaultVolume: 0 },
        chatter:   { label: 'Chatter',     file: 'chatter.mp3',   defaultVolume: 0.25, breakDefaultVolume: 0.3 }, // only sound "on" during break by default
        rain:      { label: 'Rain',        file: 'rain.mp3',      defaultVolume: 0.5,  breakDefaultVolume: 0 },
        storm:     { label: 'Storm',       file: 'thunder.mp3',   defaultVolume: 0.5,  breakDefaultVolume: 0 },
        fireplace: { label: 'Fireplace',   file: 'fireplace.mp3', defaultVolume: 0.5,  breakDefaultVolume: 0 },
        white:     { label: 'White Noise', file: 'white.mp3',     defaultVolume: 0.5,  breakDefaultVolume: 0 },
        brown:     { label: 'Brown Noise', file: 'brown.mp3',     defaultVolume: 0.5,  breakDefaultVolume: 0 },
        typing:    { label: 'Typing',      file: 'typing.mp3',    defaultVolume: 0.5,  breakDefaultVolume: 0 },
        wind:      { label: 'Wind',        file: 'wind.mp3',      defaultVolume: 0.5,  breakDefaultVolume: 0 }
    };

    const DEFAULT_ACTIVE = ['train', 'chatter']; // main tray's starting active sounds

    // --- Main tray visual knobs ---
    const ICON_SIZE          = '48px';
    const ICON_SIZE_OPTIONS  = '44px';
    const ICON_SHAPE         = '50%';
    const ICON_BG            = 'rgba(255,255,255,0.12)';
    const ICON_TEXT_COLOR    = '#ffffff';
    const ICON_FONT_SIZE     = '0.75rem';

    const LABEL_COLOR        = 'rgba(255,255,255,0.6)';
    const LABEL_FONT_SIZE    = '0.65rem';
    const LABEL_LETTER_SPACE = '1px';

    const SLIDER_ACCENT      = '#3b3268';
    const SLIDER_WIDTH       = '100%';

    const GRID_GAP           = '14px';
    const GRID_CARD_WIDTH    = '110px';

    const TRAY_BG            = 'rgba(0,0,0,0.25)';
    const TRAY_BLUR          = '6px';
    const TRAY_RADIUS        = '0 0 20px 20px';
    const TRAY_SLIDE_MS      = 350;

    const TOGGLE_BTN_SIZE    = '36px';
    const TOGGLE_BTN_BG      = 'rgba(255,255,255,0.15)';
    const TOGGLE_BTN_COLOR   = '#ffffff';

    // --- Break "mole" tray knobs ---
    const MOLE_TAB_WIDTH     = '90px';
    const MOLE_TAB_HEIGHT    = '30px';
    const MOLE_TAB_BG        = 'rgba(255,255,255,0.55)';
    const MOLE_PANEL_BG      = 'rgba(0,0,0,0.55)';
    const MOLE_PANEL_BLUR    = '10px';
    const MOLE_PANEL_HEIGHT  = '200px';
    const MOLE_SLIDE_MS      = 320;
    const MOLE_Z_INDEX       = 10000; // must sit above the break overlay's z-index (9999)

    /* ========================================================================== */

    // === STATE ===
    const audioElements = {};        // key -> <audio> element (shared by both trays)
    let activeKeys = [...DEFAULT_ACTIVE]; // main tray's active list
    let soundboardStarted = false;
    let wasOnBreak = false;
    let arrivalTriggered = false;
    let volumeMemory = {};           // snapshot of every sound's volume, taken right before a break starts

    // === BUILD AUDIO ELEMENTS ===
    Object.keys(SOUND_LIBRARY).forEach(key => {
        const el = document.createElement('audio');
        el.src = AUDIO_FOLDER + SOUND_LIBRARY[key].file;
        el.loop = true;
        el.volume = SOUND_LIBRARY[key].defaultVolume;
        el.preload = 'auto';
        audioElements[key] = el;
        document.body.appendChild(el);
    });

    // === HOOK: real ignition ===
    function hookIgnition() {
        const btn = document.getElementById('all-aboard-btn');
        if (!btn) { setTimeout(hookIgnition, 200); return; }
        btn.addEventListener('click', () => {
            if (soundboardStarted) return;
            soundboardStarted = true;
            activeKeys.forEach(key => audioElements[key].play().catch(() => {}));
        });
    }

function watchArrivalState() {
        setInterval(() => {
            if (arrivalTriggered || !window.journeyComplete) return;
            arrivalTriggered = true;

            const fadeSteps = 20, fadeIntervalMs = 75; // ~1.5s total fade
            let step = 0;
            const startVolumes = {};
            Object.keys(audioElements).forEach(key => { startVolumes[key] = audioElements[key].volume; });

            const fade = setInterval(() => {
                step++;
                const ratio = 1 - (step / fadeSteps);
                Object.keys(audioElements).forEach(key => {
                    if (!audioElements[key].paused) {
                        audioElements[key].volume = Math.max(0, startVolumes[key] * ratio);
                    }
                });
                if (step >= fadeSteps) {
                    clearInterval(fade);
                    Object.keys(audioElements).forEach(key => audioElements[key].pause());
                }
            }, fadeIntervalMs);
        }, 200);
    }


    // === HOOK: break transitions — coordinates BOTH trays in one place,
    // so there's never a race between "main pausing" and "break starting" ===
    function watchBreakState() {
        setInterval(() => {
            const onBreak = !!window.pomoOnBreak;
            if (onBreak === wasOnBreak) return;
            wasOnBreak = onBreak;
            if (!soundboardStarted) return;

            if (onBreak) {
                // Snapshot every sound's current volume before touching anything,
                // so Work can resume exactly as it was left.
                Object.keys(SOUND_LIBRARY).forEach(key => {
                    volumeMemory[key] = audioElements[key].volume;
                });

                activeKeys.forEach(key => audioElements[key].pause());

                Object.keys(SOUND_LIBRARY).forEach(key => {
                    audioElements[key].volume = SOUND_LIBRARY[key].breakDefaultVolume;
                    audioElements[key].play().catch(() => {});
                });

                showMoleTab();
            } else {
                Object.keys(SOUND_LIBRARY).forEach(key => {
                    audioElements[key].pause();
                    audioElements[key].volume = (volumeMemory[key] !== undefined)
                        ? volumeMemory[key]
                        : SOUND_LIBRARY[key].defaultVolume;
                });

                activeKeys.forEach(key => audioElements[key].play().catch(() => {}));

                hideMoleTab();
                collapseMoleTray(); // always start collapsed next time a break begins
            }
        }, 200);
    }

    /* ==========================================================================
       STAGE 1 — MAIN TRAY UI
       ========================================================================== */
    function buildUI() {
        const container = document.querySelector('.card-metrics');
        if (!container) return;

        container.innerHTML = `
            <header class="block-label">Audio Master Tray</header>
            <div id="sb-main-grid" style="
                display:flex; flex-wrap:wrap; gap:${GRID_GAP};
                margin-top:16px; align-items:flex-start;"></div>
            <button id="sb-add-btn" style="
                position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
                width:${TOGGLE_BTN_SIZE}; height:${TOGGLE_BTN_SIZE}; border-radius:50%; border:none;
                background:${TOGGLE_BTN_BG}; color:${TOGGLE_BTN_COLOR}; font-size:1.3rem;
                cursor:pointer; display:flex; align-items:center; justify-content:center;
                user-select:none;">+</button>
            <div id="sb-options-tray" style="
                position:absolute; left:0; right:0; bottom:-100%;
                background:${TRAY_BG}; backdrop-filter: blur(${TRAY_BLUR});
                border-radius:${TRAY_RADIUS}; padding:16px;
                display:flex; flex-wrap:wrap; gap:16px; justify-content:center;
                transition: bottom ${TRAY_SLIDE_MS}ms cubic-bezier(0.25,1,0.5,1);"></div>
        `;

        renderMainGrid();
        renderOptionsTray();

        const addBtn = document.getElementById('sb-add-btn');
        const optionsTray = document.getElementById('sb-options-tray');
        let trayOpen = false;

        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            trayOpen = !trayOpen;
            optionsTray.style.bottom = trayOpen ? '0' : '-100%';
        });

        document.addEventListener('click', (e) => {
            if (!trayOpen) return;
            if (optionsTray.contains(e.target)) return;
            trayOpen = false;
            optionsTray.style.bottom = '-100%';
        });
    }

    function renderMainGrid() {
        const grid = document.getElementById('sb-main-grid');
        if (!grid) return;
        grid.innerHTML = '';

        activeKeys.forEach(key => {
            const sound = SOUND_LIBRARY[key];
            const card = document.createElement('div');
            card.style.cssText = `display:flex; flex-direction:column; align-items:center; gap:6px; width:${GRID_CARD_WIDTH}; position:relative;`;

            card.innerHTML = `
                <div class="sb-icon" style="
                    width:${ICON_SIZE}; height:${ICON_SIZE}; border-radius:${ICON_SHAPE};
                    background:${ICON_BG}; display:flex; align-items:center; justify-content:center;
                    cursor:pointer; font-size:${ICON_FONT_SIZE}; font-weight:700; color:${ICON_TEXT_COLOR}; user-select:none;">
                    ${sound.label.slice(0,2).toUpperCase()}
                </div>
                <div style="font-size:${LABEL_FONT_SIZE}; letter-spacing:${LABEL_LETTER_SPACE}; text-transform:uppercase; color:${LABEL_COLOR};">${sound.label}</div>
                <input type="range" min="0" max="100" value="${Math.round(audioElements[key].volume * 100)}"
                    style="width:${SLIDER_WIDTH}; accent-color:${SLIDER_ACCENT};" data-key="${key}">
            `;

            const iconEl = card.querySelector('.sb-icon');
            const slider = card.querySelector('input[type="range"]');

            slider.addEventListener('input', (e) => {
                audioElements[key].volume = e.target.value / 100;
            });

            iconEl.addEventListener('mouseenter', () => { iconEl.innerText = '−'; iconEl.style.fontSize = '1.4rem'; });
            iconEl.addEventListener('mouseleave', () => { iconEl.innerText = sound.label.slice(0,2).toUpperCase(); iconEl.style.fontSize = ICON_FONT_SIZE; });
            iconEl.addEventListener('click', () => removeSound(key));

            grid.appendChild(card);
        });
    }

    function renderOptionsTray() {
        const tray = document.getElementById('sb-options-tray');
        if (!tray) return;
        tray.innerHTML = '';

        Object.keys(SOUND_LIBRARY).forEach(key => {
            if (activeKeys.includes(key)) return;
            const sound = SOUND_LIBRARY[key];
            const opt = document.createElement('div');
            opt.style.cssText = `display:flex; flex-direction:column; align-items:center; gap:6px; width:90px;`;
            opt.innerHTML = `
                <div class="sb-opt-icon" style="
                    width:${ICON_SIZE_OPTIONS}; height:${ICON_SIZE_OPTIONS}; border-radius:${ICON_SHAPE};
                    background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center;
                    cursor:pointer; font-size:1.1rem; color:${ICON_TEXT_COLOR}; user-select:none;">+</div>
                <div style="font-size:0.6rem; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.55); text-align:center;">${sound.label}</div>
            `;
            const iconEl = opt.querySelector('.sb-opt-icon');
            iconEl.addEventListener('mouseenter', () => { iconEl.innerText = '✓'; });
            iconEl.addEventListener('mouseleave', () => { iconEl.innerText = '+'; });
            iconEl.addEventListener('click', () => addSound(key));
            tray.appendChild(opt);
        });
    }

    function addSound(key) {
        if (activeKeys.includes(key)) return;
        activeKeys.push(key);
        if (soundboardStarted) audioElements[key].play().catch(() => {});
        renderMainGrid();
        renderOptionsTray();
    }

    function removeSound(key) {
        activeKeys = activeKeys.filter(k => k !== key);
        audioElements[key].pause();
        audioElements[key].currentTime = 0;
        renderMainGrid();
        renderOptionsTray();
    }

    /* ==========================================================================
       STAGE 2 — BREAK "MOLE" TRAY UI
       Flat panel, all 9 sounds always present as sliders — no add/remove.
       Hidden entirely outside of Break; only appears via showMoleTab().
       ========================================================================== */
    let moleOpen = false;
    let moleTabEl, molePanelEl;

    function buildMoleTray() {
        const wrap = document.createElement('div');
        wrap.id = 'sb-mole-wrap';
        wrap.style.cssText = `
            position:fixed; left:50%; bottom:0; transform:translateX(-50%);
            z-index:${MOLE_Z_INDEX}; display:none; flex-direction:column; align-items:center;
        `;

        wrap.innerHTML = `
            <div id="sb-mole-panel" style="
                width:min(480px, 80vw); height:0; overflow-x:hidden; overflow-y:auto;
                background:${MOLE_PANEL_BG}; backdrop-filter: blur(${MOLE_PANEL_BLUR});
                border-radius:16px 16px 0 0; padding:0 20px;
                display:flex; flex-wrap:wrap; align-content:flex-start; gap:10px 18px;
                transition: height ${MOLE_SLIDE_MS}ms cubic-bezier(0.25,1,0.5,1), padding ${MOLE_SLIDE_MS}ms ease;
            "></div>
            <div id="sb-mole-tab" style="
                width:${MOLE_TAB_WIDTH}; height:${MOLE_TAB_HEIGHT};
                background:${MOLE_TAB_BG}; border-radius:8px 8px 0 0;
                display:flex; align-items:center; justify-content:center;
                cursor:pointer; color:#170f12; font-size:1.1rem; user-select:none;
            ">▲</div>
        `;
        document.body.appendChild(wrap);

        moleTabEl = document.getElementById('sb-mole-tab');
        molePanelEl = document.getElementById('sb-mole-panel');

        renderMoleSliders();

        moleTabEl.addEventListener('click', () => {
            moleOpen = !moleOpen;
            molePanelEl.style.height = moleOpen ? MOLE_PANEL_HEIGHT : '0';
            molePanelEl.style.padding = moleOpen ? '16px 20px' : '0 20px';
            moleTabEl.innerText = moleOpen ? '▼' : '▲';
        });
    }

    function renderMoleSliders() {
        molePanelEl.innerHTML = '';
        Object.keys(SOUND_LIBRARY).forEach(key => {
            const sound = SOUND_LIBRARY[key];
            const row = document.createElement('div');
            row.style.cssText = `display:flex; flex-direction:column; width:120px; gap:4px; margin-top:12px;`;
            row.innerHTML = `
                <div style="font-size:0.6rem; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.7);">${sound.label}</div>
                <input type="range" min="0" max="100" value="${Math.round(SOUND_LIBRARY[key].breakDefaultVolume * 100)}"
                    style="width:100%; accent-color:${SLIDER_ACCENT};" data-key="${key}">
            `;
            const slider = row.querySelector('input[type="range"]');
            slider.addEventListener('input', (e) => {
                audioElements[key].volume = e.target.value / 100;
            });
            molePanelEl.appendChild(row);
        });
    }

    function showMoleTab() {
        const wrap = document.getElementById('sb-mole-wrap');
        if (wrap) wrap.style.display = 'flex';
        renderMoleSliders(); // resets slider positions to this break's starting volumes
    }

    function hideMoleTab() {
        const wrap = document.getElementById('sb-mole-wrap');
        if (wrap) wrap.style.display = 'none';
    }

    function collapseMoleTray() {
        moleOpen = false;
        if (molePanelEl) { molePanelEl.style.height = '0'; molePanelEl.style.padding = '0 20px'; }
        if (moleTabEl) moleTabEl.innerText = '▲';
    }

    // === INIT ===
    document.addEventListener('DOMContentLoaded', () => {
        buildUI();
        buildMoleTray();
        hookIgnition();
        watchBreakState();
        watchArrivalState();
    });
})();