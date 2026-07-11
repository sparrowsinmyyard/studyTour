/* ==========================================================================
   🍔 SAVED JOURNEYS SIDE PANEL (FULLY ISOLATED)
   Builds the hamburger icon + sliding "more stuff" panel entirely via JS —
   zero edits needed to index.html, welcome.css, or nav.js. Reuses the
   page's EXISTING #mega-modal shell (built for the about/how-to/ideas nav
   links) to display an individual saved journey's details, instead of
   building a second modal system from scratch.
   Reads only 'savedJourneys' from localStorage — never writes to it here.
   ========================================================================== */

(function () {
    'use strict';

    /* ==========================================================================
       🎛️ KNOBS
       ========================================================================== */
    const PANEL_WIDTH        = '300px';
    const PANEL_BG           = '#dacfbe';      // matches body background
    const PANEL_TEXT_COLOR   = '#3d261d';      // matches body text color
    const PANEL_ACCENT       = '#593c30';      // matches .action-label / .signature
    const PANEL_SLIDE_MS     = 380;

    const HAMBURGER_SIZE     = '48px';
    const HAMBURGER_COLOR    = '#ffffff';      // matches .top-nav a (sits over the video section)

    const SOCIAL_LINKS = [
        { label: 'Instagram', url: '#' }, // <- drop your real profile URLs in here whenever ready
        { label: 'Spotify',   url: '#' },
        { label: 'Pinterest', url: '#' }
    ];

    /* ========================================================================== */

    let panelOpen = false;
    let ticketsOpen = false;

    function buildHamburger() {
        const btn = document.createElement('button');
        btn.id = 'sj-hamburger-btn';
        btn.setAttribute('aria-label', 'Open menu');
        btn.style.cssText = `
            position: fixed; top: 28px; right: 30px; z-index: 200;
            width: ${HAMBURGER_SIZE}; height: ${HAMBURGER_SIZE};
            background: rgba(255,255,255,0.12);
            border: none; border-radius: 50%;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
            cursor: pointer; transition: opacity 0.3s ease;
        `;
        btn.innerHTML = `
            <span style="width:20px; height:2px; background:${HAMBURGER_COLOR};"></span>
            <span style="width:20px; height:2px; background:${HAMBURGER_COLOR};"></span>
            <span style="width:20px; height:2px; background:${HAMBURGER_COLOR};"></span>
        `;
        btn.addEventListener('mouseenter', () => { btn.style.opacity = '0.7'; });
        btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; });
        btn.addEventListener('click', togglePanel);
        document.body.appendChild(btn);
    }

    function buildPanel() {
        const panel = document.createElement('div');
        panel.id = 'sj-panel';
        panel.style.cssText = `
            position: fixed; top: 0; right: 0; bottom: 0; width: ${PANEL_WIDTH};
            background: ${PANEL_BG}; color: ${PANEL_TEXT_COLOR};
            font-family: "Cormorant Infant", serif;
            box-shadow: -10px 0 30px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform ${PANEL_SLIDE_MS}ms cubic-bezier(0.25,1,0.5,1);
            z-index: 150; padding: 90px 32px 32px;
            display: flex; flex-direction: column; gap: 28px;
            overflow-y: auto;
        `;

        panel.innerHTML = `
            <h2 style="font-size:1.6rem; font-weight:900; letter-spacing:1px;">more stuff</h2>

            <div>
                <button id="sj-tickets-toggle" style="
                    background:none; border:none; cursor:pointer; padding:0;
                    font-family:inherit; font-size:1.3rem; font-weight:700;
                    color:${PANEL_ACCENT}; text-align:left;">
                    saved tickets
                </button>
                <div id="sj-tickets-list" style="
                    max-height:0; overflow:hidden;
                    transition: max-height 320ms ease;
                    display:flex; flex-direction:column; gap:10px; margin-top:12px;"></div>
            </div>

            <div style="display:flex; flex-direction:column; gap:14px;">
                ${SOCIAL_LINKS.map(s => `
                    <a href="${s.url}" target="_blank" rel="noopener" style="
                        color:${PANEL_TEXT_COLOR}; text-decoration:none; font-size:1.2rem; font-weight:600;
                        opacity:0.75; transition: opacity 0.2s ease;"
                       onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.75">
                        ${s.label}
                    </a>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('sj-tickets-toggle').addEventListener('click', toggleTicketsList);
    }

    function togglePanel() {
        panelOpen = !panelOpen;
        const panel = document.getElementById('sj-panel');
        panel.style.transform = panelOpen ? 'translateX(0)' : 'translateX(100%)';
        if (panelOpen) renderTicketsList(); // refresh in case a journey was saved since last open
    }

    function toggleTicketsList() {
        ticketsOpen = !ticketsOpen;
        const list = document.getElementById('sj-tickets-list');
        renderTicketsList();
        list.style.maxHeight = ticketsOpen ? '400px' : '0';
    }

    function renderTicketsList() {
        const list = document.getElementById('sj-tickets-list');
        if (!list) return;
        const journeys = JSON.parse(localStorage.getItem('savedJourneys') || '[]');
        list.innerHTML = '';

        if (journeys.length === 0) {
            list.innerHTML = `<div style="opacity:0.5; font-size:1rem; font-style:italic;">No journeys saved yet.</div>`;
            return;
        }

        // Newest first
        journeys.slice().reverse().forEach((journey, idx) => {
            const realIndex = journeys.length - 1 - idx; // index in the ORIGINAL (non-reversed) array
            const row = document.createElement('div');
            row.style.cssText = `
                background: rgba(89,60,48,0.08); border-radius: 10px;
                padding: 10px 14px; cursor: pointer;
                font-family: inherit; color: ${PANEL_TEXT_COLOR};
                transition: background 0.2s ease;
                display: flex; align-items: center; justify-content: space-between; gap: 8px;
            `;
            const dateStr = new Date(journey.date).toLocaleDateString();
            row.innerHTML = `
                <div>
                    <div style="font-size:1.05rem; font-weight:700;">${journey.departure || '—'} → ${journey.arrival || '—'}</div>
                    <div style="font-size:0.85rem; opacity:0.65;">${dateStr}</div>
                </div>
                <button class="sj-delete-btn" aria-label="Delete this journey" style="
                    background:none; border:none; cursor:pointer; font-size:1.1rem;
                    color: ${PANEL_TEXT_COLOR}; opacity:0; transition: opacity 0.2s ease;
                    flex-shrink:0; padding:4px;">🗑️</button>
            `;
            row.addEventListener('mouseenter', () => {
                row.style.background = 'rgba(89,60,48,0.16)';
                row.querySelector('.sj-delete-btn').style.opacity = '0.7';
            });
            row.addEventListener('mouseleave', () => {
                row.style.background = 'rgba(89,60,48,0.08)';
                row.querySelector('.sj-delete-btn').style.opacity = '0';
            });
            row.addEventListener('click', () => openJourneyInModal(journeys[realIndex]));

            const deleteBtn = row.querySelector('.sj-delete-btn');
            deleteBtn.addEventListener('mouseenter', () => { deleteBtn.style.opacity = '1'; });
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // don't also trigger the row's "open modal" click
                const confirmed = window.confirm('Permanently delete this saved journey? This can\'t be undone.');
                if (!confirmed) return;

                const current = JSON.parse(localStorage.getItem('savedJourneys') || '[]');
                current.splice(realIndex, 1);
                localStorage.setItem('savedJourneys', JSON.stringify(current));
                renderTicketsList(); // refresh the list in place
            });

            list.appendChild(row);
        });
    }

    function formatDuration(totalSeconds) {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }

    // Reuses the page's EXISTING #mega-modal shell (same one the top-nav
    // links open) rather than building a second modal system.
    function openJourneyInModal(journey) {
        const modal = document.getElementById('mega-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        if (!modal || !title || !body) {
            console.warn('Saved Journeys: #mega-modal not found — is index.html unchanged?');
            return;
        }

        title.innerText = 'Arrival Manifest';
        body.innerHTML = `
            <p><strong>Date:</strong> ${new Date(journey.date).toLocaleDateString()}</p>
            <p><strong>Time Elapsed:</strong> ${formatDuration(journey.durationSeconds || 0)}</p>
            <p><strong>Distance:</strong> ${(journey.distanceKM || 0).toFixed(1)} KM</p>
            <p><strong>Travel Mode:</strong> ${journey.mode === 'Pomodoro' ? 'Pomodoro' : 'Standard Timer'}</p>
            <p><strong>Route Taken:</strong> ${journey.departure || '—'} &rarr; ${journey.arrival || '—'}</p>
        `;
        modal.classList.add('is-active');
    }

    document.addEventListener('DOMContentLoaded', () => {
        buildHamburger();
        buildPanel();
    });
})();