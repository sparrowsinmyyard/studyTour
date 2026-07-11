/* ==========================================================================
   🎟️ ARRIVAL MANIFEST LOGIC
   Reads the one-time handoff object dashboard.js writes right before
   navigating here ('pendingArrivalData'), displays it, and either discards
   it (✕) or commits it into the permanent 'savedJourneys' list (Save).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById('arrival-page');
    const raw = localStorage.getItem('pendingArrivalData');
    const data = raw ? JSON.parse(raw) : null;

    // --- Fill the bill ---
    if (data) {
        const dateObj = new Date(data.date);
        document.getElementById('mf-date').innerText = dateObj.toLocaleDateString();

        const hrs = Math.floor(data.durationSeconds / 3600);
        const mins = Math.floor((data.durationSeconds % 3600) / 60);
        const secs = data.durationSeconds % 60;
        document.getElementById('mf-time').innerText =
            `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

        document.getElementById('mf-distance').innerText = `${data.distanceKM.toFixed(1)} KM`;
        document.getElementById('mf-mode').innerText = data.mode === 'Pomodoro' ? 'Pomodoro' : 'Standard Timer';
        document.getElementById('mf-route').innerText = `${data.departure || '—'} → ${data.arrival || '—'}`;
    }

    // Fade in
    requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('mf-visible')));

    // --- Both buttons lead to the same exit: fade out, then back to index.html ---
    function returnToWelcome() {
        page.classList.remove('mf-visible');
        localStorage.removeItem('pendingArrivalData'); // handoff data's job is done either way
        setTimeout(() => { window.location.href = 'index.html'; }, 900);
    }

    document.getElementById('mf-close-btn').addEventListener('click', returnToWelcome);

    document.getElementById('mf-save-btn').addEventListener('click', (e) => {
        if (!data) { returnToWelcome(); return; }

        const existing = JSON.parse(localStorage.getItem('savedJourneys') || '[]');
        existing.push(data);
        localStorage.setItem('savedJourneys', JSON.stringify(existing));

        const btn = e.currentTarget;
        btn.innerText = 'Saved!';
        btn.classList.add('mf-saved');
        btn.disabled = true;

        setTimeout(returnToWelcome, 900); // let "Saved!" register before leaving
    });

    /* ==========================================================================
       EASTER EGG — type the secret code yes ik you dont know it anywhere on this page
       Fully isolated: its own overlay, its own listener, doesn't touch the
       manifest/save/close logic above at all. Real math off the session's
       actual elapsed seconds — not placeholder numbers.
       ========================================================================== */
    const KONAMI_SEQUENCE = 'ilyaryan';
    const KONAMI_COOLDOWN_MS = 2000; // ignore input for a moment after a trigger

    // Real, verified average speeds/rates — see chat for sourcing
    const EARTH_ORBITAL_SPEED_KMS   = 29.78;  // Earth around the Sun
    const MOON_ORBITAL_SPEED_KMS    = 1.022;  // Moon around Earth
    const ARCTURUS_APPROACH_KMS     = 5.24;   // Arcturus's radial (closing) velocity toward the Sun
    const ANDROMEDA_APPROACH_KMS    = 110;    // Andromeda's net closing speed toward the Milky Way
    const CARDIAC_OUTPUT_L_PER_MIN  = 5;      // average resting cardiac output

    let konamiBuffer = '';
    let konamiOnCooldown = false;

    document.addEventListener('keydown', (e) => {
        if (konamiOnCooldown || e.repeat) return;
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        konamiBuffer += e.key.toLowerCase();
        if (konamiBuffer.length > KONAMI_SEQUENCE.length) {
            konamiBuffer = konamiBuffer.slice(-KONAMI_SEQUENCE.length);
        }

        if (konamiBuffer === KONAMI_SEQUENCE) {
            konamiOnCooldown = true;
            showCosmicOverlay();
            setTimeout(() => { konamiOnCooldown = false; konamiBuffer = ''; }, KONAMI_COOLDOWN_MS);
        }
    });

    function showCosmicOverlay() {
        const seconds = data ? (data.durationSeconds || 0) : 0;

        const earthKm     = EARTH_ORBITAL_SPEED_KMS * seconds;
        const moonKm       = MOON_ORBITAL_SPEED_KMS * seconds;
        const arcturusKm   = ARCTURUS_APPROACH_KMS * seconds;
        const andromedaKm  = ANDROMEDA_APPROACH_KMS * seconds;
        const bloodLitres  = CARDIAC_OUTPUT_L_PER_MIN * (seconds / 60);

        const fmt = (n) => Math.round(n).toLocaleString();

        const overlay = document.createElement('div');
        overlay.id = 'cosmic-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 30000;
            background: radial-gradient(1px 1px at 20px 30px, #fff, transparent),
                        radial-gradient(1px 1px at 90px 120px, #fff, transparent),
                        radial-gradient(1.5px 1.5px at 160px 60px, #fff, transparent),
                        radial-gradient(1px 1px at 230px 200px, #fff, transparent),
                        radial-gradient(1.5px 1.5px at 300px 90px, #fff, transparent),
                        radial-gradient(1px 1px at 40px 250px, #fff, transparent),
                        radial-gradient(1px 1px at 350px 300px, #fff, transparent),
                        #000;
            background-repeat: repeat;
            background-size: 400px 400px;
            color: #f2ecdf;
            font-family: "Cormorant Infant", serif;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 600ms ease;
        `;
       
        overlay.innerHTML = `
            <button id="cosmic-close" style="
                position:absolute; top:30px; right:36px;
                width:44px; height:60px; border-radius:50%; border:none;
                background:rgba(255,255,255,0.1); color:#f2ecdf; font-size:1.5rem;
                cursor:pointer;">✕</button>
            <div style="max-width:900px; padding:1px; text-align:left;">
                <p style="font-size:3rem; color:#E2F1FF; opacity:0.8; margin-bottom:50px;">While you completed your session:</p>
                <p style="font-size:1.5rem; margin-bottom:14px;">⟡ The Earth moved <strong>${fmt(earthKm)} km</strong> around the Sun.</p>
                <p style="font-size:1.5rem; margin-bottom:14px;">⟡ The Moon moved <strong>${fmt(moonKm)} km</strong> around the Earth.</p>
                <p style="font-size:1.5rem; margin-bottom:14px;">⟡ Arcturus drifted <strong>${fmt(arcturusKm)} km</strong> closer to us. (i hope i live to see it closer) (i know i wont hush)</p>
                <p style="font-size:1.5rem; margin-bottom:14px;">⟡ The Milky Way and Andromeda got <strong>${fmt(andromedaKm)} km</strong> closer. Get a room, guys.</p>
                <p style="font-size:1.5rem;">♡ Your heart pumped about <strong>${bloodLitres.toFixed(1)} litres</strong> of blood.</p>
                <br><br>
<p style="font-size:1.5rem; color:#FFD1C1; font-weight:500; line-height:1.6;">Most importantly, you had a real productive session and that is all that matters :) I am proud of you!!</p>

            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });

        document.getElementById('cosmic-close').addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 600);
        });
    }
});