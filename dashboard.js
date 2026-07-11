// THE ULTIMATE STUDYTOUR CINEMATIC STATE ENGINE
window.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
        USER CONTROL DIALS & DATA UNIFICATION
       ========================================================================== */
    // A. Extract multi-unit duration inputs saved by timer.js
    const inputHours   = parseInt(localStorage.getItem('timer_hours')) || 0;
    const inputMinutes = parseInt(localStorage.getItem('timer_minutes')) || 0;
    const inputSeconds = parseInt(localStorage.getItem('timer_seconds')) || 0;

    // B. Calculate absolute trip seconds mathematically
    const computedTotalSeconds = (inputHours * 3600) + (inputMinutes * 60) + inputSeconds;

    const CONFIG = {
        entranceBlurDelay: 1000,    // Time spent blurred at start (ms)
        
        //  FIXED: Uses the unified total seconds string, or defaults safely to 20 mins (1200s)
        targetDurationSeconds: computedTotalSeconds || 1200,
        
        accelRate: 0.05,            // How much video speed gains every 200ms
        decelRate: 0.1             // How fast the train brakes down at the end
    };

    /* ==========================================================================
       TACKLE 1: ENTRANCE BLUR RESIDUAL CLEAR
       ========================================================================== */
    setTimeout(() => {
        const grid = document.getElementById('dashboard-reveal-grid');
        if (grid) grid.classList.remove('grid-shroud-active');
    }, CONFIG.entranceBlurDelay);


    /* ==========================================================================
       TACKLE 2, 3 & 4: IGNITION SEQUENCE TRIGGER
       ========================================================================== */
    const onboardBtn = document.getElementById('all-aboard-btn');
    const onboardMask = document.getElementById('all-aboard-mask');
    const shutter = document.getElementById('window-shutter');
    const video = document.getElementById('scenery-loop');
    const metricsCard = document.querySelector('.card-audio'); // Target Journey Metrics

    // Core Global Tracking Handles
    let clockInterval = null;
    let speedInterval = null;

    if (onboardBtn && onboardMask) {
        onboardBtn.addEventListener('click', () => {
            // A. Drop the glassmorphic deck mask down
            onboardMask.classList.add('mask-dropped');
            
            // B. Lift the window shutter up to reveal the scenery
            if (shutter) shutter.classList.remove('shutter-lifted'); 
            if (shutter) shutter.classList.add('shutter-lifted');
            
            // C. Prepare Video State (Start paused at microscopic crawl rate)
            if (video) {
                video.muted = true; // Ensure browser autoplay security doesn't block it
                video.playbackRate = 0.1;
                video.play();
                
                // D. Accelerate the Train smoothly up to cruising speed!
                speedInterval = setInterval(() => {
                    if (video.playbackRate < 1.0) {
                        video.playbackRate = Math.min(1.0, video.playbackRate + CONFIG.accelRate);
                    } else {
                        clearInterval(speedInterval); // Cruising speed achieved!
                    }
                }, 200);
            }
            
// E. Route to the correct engine depending on ticket type
 if (localStorage.getItem('pomo_work') !== null) {
                initializePomodoroEngine();
            } else {
                initializeJourneyClock();
            }
            initializeRouteMap();

            /* ==========================================================================
       POMODORO ENGINE (FULLY ISOLATED)
       Does not call, modify, or share any state with initializeJourneyClock()
       or the Timer Mode ignition code. Safe to delete entirely with zero
       impact on Timer Mode if something needs to be reverted.
       ========================================================================== */
    function initializePomodoroEngine() {
        if (!metricsCard) return;

        // A. Pull the ticket's work/break/cycle data committed by pomo.js
        const workMinutes  = parseInt(localStorage.getItem('pomo_work'))   || 25;
        const breakMinutes = parseInt(localStorage.getItem('pomo_break'))  || 5;
        const totalCycles  = parseInt(localStorage.getItem('pomo_cycles')) || 4;

        // B. Live state for the running session
        let currentCycle    = 1;
        let phase            = 'work';   // 'work' | 'break'
        let phaseSeconds     = 0;
        let totalDistanceKM  = 0;        // Only grows during Work phases
        let phaseInterval    = null;
        let pomoSpeedInterval = null;    // This engine's own accel handle
        let pomoBrakeInterval = null;    // This engine's own decel handle
        // Knobs for the phase-change pause — see note below
const SHUTTER_TRANSITION_MS = 2000;

        // === DIM/REVEAL KNOBS ===
        const BLACKOUT_FADE_MS = 1750;   // how fast the screen goes solid black
        const ART_REVEAL_MS    = 1000;   // how slowly the station art then lights up
        const STAGGER_MS       = 450;   // pause between "fully black" and "art starts appearing"

        const COUNTRY_BREAK_IMAGES = {
            japan:  'stbreakjp.png',
            india:  'stbreakin.png',
            france: 'stbreakfr.png'
        };

        let breakOverlay = null, blackoutLayer = null, artLayer = null, breakClockEl = null;

        
        // C. Build the layout shell ONCE. Same box, same clock, same distance
        //    line as Timer Mode — just one new "Session" line added above it.
        metricsCard.innerHTML = `
            <header class="block-label">Journey Metrics</header>
            <div class="metrics-display-core" style="display:
                flex; flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 75%;
                position: relative;
                top: 20px;
                gap: 14px;
                font-family: 'Montserrat', sans-serif;">
                <div id="pomo-session-label"
                style="font-size: 1rem;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 3px;
                color: rgba(255,255,255,0.5);">Session ${currentCycle} / ${totalCycles}</div>

                <div id="pomo-clock-face"
                style="font-size: 8rem;
                font-weight: 600;
                letter-spacing: 2px;
                color: #ffffff;">00:00:00</div>

                <div id="pomo-distance-counter"
                style="font-size: 1.9rem;
                font-weight: 600;
                top: -10px;
                position: relative;
                text-transform: uppercase;
                letter-spacing: 3px; color: rgb(90, 78, 45);">Travelled: 0 KM</div>
            </div>
        `;

        const sessionLabel    = document.getElementById('pomo-session-label');
        const clockFace       = document.getElementById('pomo-clock-face');
        const distanceCounter = document.getElementById('pomo-distance-counter');

        function formatTime(totalSecs) {
            const hrs  = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }


function ensureBreakOverlay() {
            if (breakOverlay) return;
            breakOverlay = document.createElement('div');
            breakOverlay.id = 'pomo-break-overlay';
            breakOverlay.style.cssText = `position: fixed; inset: 0; z-index: 9999; pointer-events: none;`;

            breakOverlay.innerHTML = `
                <div id="pomo-blackout" style="
                    position:absolute; inset:0; background:#000; opacity:0;
                    transition: opacity ${BLACKOUT_FADE_MS}ms ease;"></div>

                <div id="pomo-art" style="
                    position:absolute; inset:0; background-size:cover; background-position:center;
                    opacity:0; transition: opacity ${ART_REVEAL_MS}ms ease;"></div>

<div id="pomo-break-labelwrap" style="position:absolute; bottom:40px; right:40px; text-align:right; font-family:'Montserrat', sans-serif; z-index:2; opacity:0; transition: opacity ${ART_REVEAL_MS}ms ease;">                    <div style="
                        font-size: 0.9rem;               /* <- BREAK label size */
                        font-weight: 800;
                        letter-spacing: 3px;
                        text-transform: uppercase;
                        color: rgba(255,255,255,0.85);   /* <- BREAK label color */
                        margin-bottom: 6px;">Break</div>
                    <div id="pomo-break-clock" style="
                        font-size: 9rem;                 /* <- break clock size */
                        font-weight: 600;
                        color: #ffffff;">00:00:00</div>  <!-- <- break clock color, was #170f12 (near-black, invisible) -->
                </div>
            `;
            document.body.appendChild(breakOverlay);
            blackoutLayer = document.getElementById('pomo-blackout');
            artLayer      = document.getElementById('pomo-art');
            breakClockEl  = document.getElementById('pomo-break-clock');
            labelWrap     = document.getElementById('pomo-break-labelwrap');
        }

    function showBreakOverlay() {
            ensureBreakOverlay();
            const countryKey = localStorage.getItem('selected_country');
            const imgFile = COUNTRY_BREAK_IMAGES[countryKey] || COUNTRY_BREAK_IMAGES.japan;
            artLayer.style.backgroundImage = `url('${imgFile}')`;

            // Force the browser to register opacity:0 as a real, painted
            // state before we change it — otherwise a freshly-created
            // element skips the transition entirely and jumps straight
            // to the end value.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    blackoutLayer.style.opacity = '1';
                    setTimeout(() => {
                        artLayer.style.opacity = '1';
                        labelWrap.style.opacity = '1';
                    }, BLACKOUT_FADE_MS + STAGGER_MS);
                });
            });
        }

function hideBreakOverlay() {
            if (!breakOverlay) return;
            artLayer.style.opacity = '0';
            labelWrap.style.opacity = '0';                // Now actually fades away too
            setTimeout(() => {
                blackoutLayer.style.opacity = '0';
            }, ART_REVEAL_MS * 0.4);
        }

        // D. This engine's OWN accelerate — separate from Timer Mode's.
        function pomoAccelerate(onComplete) {
            if (!video) { if (onComplete) onComplete(); return; }
            video.muted = true;
            video.playbackRate = 0.1;
            video.play();
            pomoSpeedInterval = setInterval(() => {
                const next = video.playbackRate + CONFIG.accelRate;
                if (next < 1.0) {
                    video.playbackRate = next;
                } else {
                    video.playbackRate = 1.0;
                    clearInterval(pomoSpeedInterval);
                    if (onComplete) onComplete();
                }
            }, 200);
        }

        //    This engine's OWN decelerate — steps smoothly all the way to 0,
        //    pauses on that exact frame (does not reset currentTime), then
        //    calls onComplete.
        function pomoDecelerate(onComplete) {
            if (!video) { if (onComplete) onComplete(); return; }
            pomoBrakeInterval = setInterval(() => {
                const next = video.playbackRate - CONFIG.decelRate;
                if (next > 0.01) {
                    video.playbackRate = next;
                } else {
                    clearInterval(pomoBrakeInterval);
                    video.playbackRate = 0;
                    video.pause();
                    if (onComplete) onComplete();
                }
            }, 150);
        }

        // F. Runs the ticking clock for whichever phase is currently active.
        function runPhase() {
            phaseSeconds = 0;
            const phaseStartTimestamp = Date.now(); // same self-correcting anchor, per-phase
            const targetSeconds = (phase === 'work' ? workMinutes : breakMinutes) * 60;

            if (clockFace)    clockFace.style.color = (phase === 'work') ? '#ffffff' : '#170f12';
            if (clockFace)    clockFace.innerText = '00:00:00';
            if (sessionLabel) sessionLabel.innerText = `Session ${currentCycle} / ${totalCycles}`;

            phaseInterval = setInterval(() => {
                phaseSeconds = Math.floor((Date.now() - phaseStartTimestamp) / 1000);

         if (clockFace) clockFace.innerText = formatTime(phaseSeconds);
                if (phase === 'break' && breakClockEl) breakClockEl.innerText = formatTime(phaseSeconds);
                if (phase === 'work' && distanceCounter) {
                    const km = (typeof window.routeDistanceKM === 'number') ? window.routeDistanceKM : 0;
                    distanceCounter.innerText = `Distance: ${km.toFixed(1)} KM`;
                }

                if (phaseSeconds >= targetSeconds) {
                    clearInterval(phaseInterval);
                    completePhase();
                }
            }, 1000);
        }

        // G. Phase target hit: brake, shutter down, halo for a firm 2s buffer.
function completePhase() {
            console.log(`Pomodoro: ${phase} phase complete.`);
            metricsCard.classList.add('metrics-halo-active'); // fires the instant target is hit

            if (phase === 'work') {
                // Work just ended: really decelerate, close shutter, and
                // partway through that close, bring the station art in.
                pomoDecelerate(() => {
                    if (shutter) shutter.classList.remove('shutter-lifted');
                    setTimeout(() => {
                        showBreakOverlay();
                        metricsCard.classList.remove('metrics-halo-active');
                        advancePhase();
                    }, SHUTTER_TRANSITION_MS / 2);
                });
            } else {
                // Break just ended: nothing to decelerate, train's been
                // parked the whole time. Take the overlay down and let
                // advancePhase's resumeAndRun lift the shutter + accelerate.
                metricsCard.classList.remove('metrics-halo-active');
                hideBreakOverlay();
                advancePhase();
            }
        }

        // H. Work -> Break, Break -> next Work, or Break on final cycle -> end.
function advancePhase() {
            if (phase === 'work') {
                phase = 'break';
                window.pomoOnBreak = true;  // map engine reads this to freeze
                runPhase();
            } else if (currentCycle < totalCycles) {
                currentCycle++;
                phase = 'work';
                window.pomoOnBreak = false; // map engine resumes from here
                resumeAndRun();
            } else {
                window.pomoOnBreak = false;
                finishJourney();
            }
        }

        // I. Lifts shutter, resumes video from the SAME paused frame, ticks on.
        function resumeAndRun() {
            if (shutter) shutter.classList.add('shutter-lifted');
            pomoAccelerate();
            runPhase();
        }

        // J. Final cycle's break just ended — permanent stop.
        function finishJourney() {
            console.log('Pomodoro journey complete. Final stop.');
            pomoDecelerate(() => {
                if (shutter) shutter.classList.remove('shutter-lifted');
                metricsCard.classList.add('metrics-halo-active');
                console.log('Pomodoro: journey ended, train locked.');
                setTimeout(triggerArrivalSequence, 2000);
            });
        }

        // Kick off Cycle 1 / Work. Video is already accelerating from ignition.
        runPhase();
    }
            
        });
    }

    /* ==========================================================================
       JOURNEY METRICS ENGINE (TIMER, DISTANCE & AUTOMATIC BRAKING)
       ========================================================================== */
    function initializeJourneyClock() {
        if (!metricsCard) return;

        /* ⏳ FUTURE POMODORO EXPANSION HOOK
           If you check localStorage for a pomodoro flag later, you can swap layouts right here.
           e.g., if(localStorage.getItem('isPomodoro') === 'true') { renderPomodoroLayout(); return; }
        */

        // Standard Countdown Mode Layout Construction
        metricsCard.innerHTML = `
            <header class="block-label">Journey Metrics</header>
            <div class="metrics-display-core" style="display: 
                flex; flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                height: 75%; 
                position: relative;
                top: 30px;
                gap: 19px; 
                color: #fff; 
                font-family: 'Montserrat', sans-serif;">
                <div id="journey-clock-face" 
                style="font-size: 8rem; 
                font-weight: 600; 
                letter-spacing: 2px; 
                color: #ffffff;">00:00:00</div>

                <div id="journey-distance-counter" 
                style="font-size: 1.9rem; 
                font-weight: 600; 
                top: -10px;
                position: relative;
                text-transform: uppercase; s
                etter-spacing: 3px; color: rgb(90, 78, 45);">Travelled: 0 KM</div>
            </div>
        `;

        let totalSeconds = 0;
        let currentDistanceKM = 0;
        const sessionStartTimestamp = Date.now(); // anchor for self-correcting time

        clockInterval = setInterval(() => {
            // Recomputed from real elapsed time every tick, instead of trusting
            // the interval to have fired exactly once per second — self-corrects
            // even if ticks were throttled/delayed while the tab was backgrounded.
            totalSeconds = Math.floor((Date.now() - sessionStartTimestamp) / 1000);
            
            // Math converters for structural formatting
            let hrs = Math.floor(totalSeconds / 3600);
            let mins = Math.floor((totalSeconds % 3600) / 60);
            let secs = totalSeconds % 60;

            const timeString = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            const clockFace = document.getElementById('journey-clock-face');
            if (clockFace) clockFace.innerText = timeString;

            // Distance now reflects the REAL route distance covered so far.
            const distanceCounter = document.getElementById('journey-distance-counter');
            if (distanceCounter) {
                const km = (typeof window.routeDistanceKM === 'number') ? window.routeDistanceKM : 0;
                distanceCounter.innerText = `Distance: ${km.toFixed(1)} KM`;
            }

            /* ==========================================================================
               AUTOMATIC BRAKING COMPLETION GATEWAY
               ========================================================================== */
            if (totalSeconds >= CONFIG.targetDurationSeconds) {
                clearInterval(clockInterval); // Kill the clock ticking engine immediately
                
                console.log("Trip completed. Initiating programmatic deceleration sequence...");

                // 1. Begin dynamic deceleration braking loop
// 1. Begin dynamic deceleration braking loop
if (video) {
    let brakeInterval = setInterval(() => {
        if (video.playbackRate > 0.5) {
            // Step down the speed smoothly
            video.playbackRate = Math.max(0.0, video.playbackRate - CONFIG.decelRate);
        } else {
            // THE CRITICAL TRIPWIRE: Stops the braking loop completely from running infinitely!
            clearInterval(brakeInterval); 
            video.playbackRate = 0.0;
            video.pause(); // Video completely immobilized
            
            // 2. Shutters drop automatically to mask the stopped view
            if (shutter) shutter.classList.remove('shutter-lifted');
            
            // 3. Mount Halo Glow onto Journey Metrics Box
            metricsCard.classList.add('metrics-halo-active');
            console.log("Train locked at complete stop. Shutter secured. Halo deployed.");
            setTimeout(triggerArrivalSequence, 2000);
        }
    }, 150); // Fires every 150ms until dead stop
} else {
                    if (shutter) shutter.classList.remove('shutter-lifted');
                    metricsCard.classList.add('metrics-halo-active');
                    setTimeout(triggerArrivalSequence, 2000);
                }
            }
        }, 1000);
    }
    /* ==========================================================================
   ROUTE PROGRESS MAP ENGINE (ISOLATED — Timer Mode only, for now)
   Does not call or modify Timer Mode's clock/decel code, or the Pomodoro
   engine. Safe to delete entirely with zero impact elsewhere.
   ========================================================================== */

// Fill in real coordinates for all 18 — [latitude, longitude]
// Fill in real coordinates for all 18 — [latitude, longitude]
const STATION_COORDS = {
    // Japan
    "tokyo-cen":     [35.6812, 139.7671], // Tokyo Station
    "nagoya-cen":    [35.1709, 136.8815], // Nagoya Station
    "akita-stn":     [39.7169, 140.1299], // Akita Station
    "kyoto-stn":     [34.9858, 135.7588], // Kyoto Station
    "takayama-alp":  [36.1408, 137.2513], // Takayama Station
    "aomori-harb":   [40.8294, 140.7335], // Aomori Station

    // France
    "paris-lyon":    [48.8443, 2.3744],  // Gare de Lyon (Paris)
    "strasbourg":    [48.5851, 7.7341],  // Gare de Strasbourg
    "tours":         [47.3899, 0.6935],  // Gare de Tours
    "marseille":     [43.3027, 5.3805],  // Gare de Marseille-Saint-Charles
    "colmar":        [48.0725, 7.3466],  // Gare de Colmar
    "orleans":       [47.9070, 1.9038],  // Gare d'Orléans

    // India
    "lucknow":       [26.8322, 80.9231], // Lucknow Charbagh (LJN)
    "kalka":         [30.8331, 76.9351], // Kalka Railway Station
    "vasco":         [15.3976, 73.8111], // Vasco da Gama Railway Station
    "kathgodam":     [29.2704, 79.5447], // Kathgodam Railway Station
    "shimla":        [31.1033, 77.1666], // Shimla Railway Station
    "hubbali":       [15.3475, 75.1481]  // SSS Hubballi Junction
};

const FOLLOW_ZOOM = 10; // knob: lower = more zoomed out, higher = closer to street level
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Optional bendy waypoints for specific routes, keyed "departureId->arrivalId".
// Leave a route out entirely and it'll just draw a straight line between
// the two stations — safe default, add curves only where you want them.
const ROUTE_WAYPOINTS = {
    // Example: "tokyo-cen->kyoto-stn": [[35.4, 138.9], [35.1, 137.2]]
};

let routeMap = null, routeMarker = null, routeAnimFrame = null;


function initializeRouteMap() {
    const mapEl = document.getElementById('route-map');
    if (!mapEl || typeof L === 'undefined') return; // Leaflet not loaded, bail safely

    const departureId = localStorage.getItem('departure_platform');
    const arrivalId = localStorage.getItem('arrival_platform');
    const start = STATION_COORDS[departureId];
    const end = STATION_COORDS[arrivalId];
    if (!start || !end) { console.warn('Route map: missing station coords for', departureId, arrivalId); return; }

    const routeKey = `${departureId}->${arrivalId}`;
    const midPoints = ROUTE_WAYPOINTS[routeKey] || [];
    const fullPath = [start, ...midPoints, end];
    // One-time calculation of the ACTUAL real-world route distance, in km —
    // this is what Journey Metrics' distance counter reads from now on,
    // instead of a made-up "1km per 10s" placeholder.
    let totalRouteKm = 0;
    for (let i = 0; i < fullPath.length - 1; i++) {
        const a = L.latLng(fullPath[i][0], fullPath[i][1]);
        const b = L.latLng(fullPath[i + 1][0], fullPath[i + 1][1]);
        totalRouteKm += a.distanceTo(b) / 1000; // distanceTo() returns meters
    }

routeMap = L.map('route-map', { zoomControl: true, attributionControl: false, dragging: false, scrollWheelZoom: false });

const activeTileLayer = L.tileLayer(TILE_DARK, { maxZoom: 19 }).addTo(routeMap);

    L.polyline(fullPath, { color: '#5a4e2d', weight: 3, opacity: 0.8 }).addTo(routeMap);
    routeMap.setView(start, FOLLOW_ZOOM);

    routeMarker = L.circleMarker(start, { radius: 7, color: '#170f12', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }).addTo(routeMap);
    const themeToggleBtn = document.createElement('button');
    themeToggleBtn.innerText = '☀️';
    themeToggleBtn.style.cssText = `
        position:absolute; top:10px; right:10px; z-index:1000;
        width:32px; height:32px; border-radius:50%; border:none;
        background:rgba(0, 0, 0, 0.9); cursor:pointer; font-size:16px;
        display:flex; align-items:center; justify-content:center; 
        user-select:none; -webkit-user-select:none; -moz-user-select:none;
    `;
    let isDarkMode = true;
    themeToggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        activeTileLayer.setUrl(isDarkMode ? TILE_DARK : TILE_LIGHT);
        themeToggleBtn.innerText = isDarkMode ? '🌙' : '☀️';
    });
    mapEl.appendChild(themeToggleBtn);

    // --- Smooth animation, driven by real elapsed time, not tick count ---
// --- Smooth animation, driven by real elapsed time, not tick count ---
    const isPomodoroSession = localStorage.getItem('pomo_work') !== null;
    let totalMs;
    if (isPomodoroSession) {
        const workMinutes = parseInt(localStorage.getItem('pomo_work')) || 25;
        const totalCycles = parseInt(localStorage.getItem('pomo_cycles')) || 4;
        totalMs = workMinutes * 60 * totalCycles * 1000; // total WORK time across ALL cycles combined
    } else {
        totalMs = CONFIG.targetDurationSeconds * 1000;
    }

    let workElapsedMs = 0;   // Only accumulates while NOT on a break
    let lastFrameTime;       // Set right before the real animation starts (see below)

    function pointAlongPath(fraction) {
        // Walks the (possibly multi-segment) path proportionally by distance,
        // not just by point-index, so bends don't cause uneven speed.
        const latlngs = fullPath.map(p => L.latLng(p[0], p[1]));
        let segLengths = [], total = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
            const d = latlngs[i].distanceTo(latlngs[i + 1]);
            segLengths.push(d);
            total += d;
        }
        let target = fraction * total, covered = 0;
        for (let i = 0; i < segLengths.length; i++) {
            if (covered + segLengths[i] >= target) {
                const segFrac = (target - covered) / segLengths[i];
                return L.latLng(
                    latlngs[i].lat + (latlngs[i + 1].lat - latlngs[i].lat) * segFrac,
                    latlngs[i].lng + (latlngs[i + 1].lng - latlngs[i].lng) * segFrac
                );
            }
            covered += segLengths[i];
        }
        return latlngs[latlngs.length - 1];
    }

function animateArrow() {
        const now = performance.now();
        const delta = now - lastFrameTime;
        lastFrameTime = now;

        // During a Pomodoro break, the train's parked behind the station
        // art — freeze progress entirely instead of advancing.
        if (!window.pomoOnBreak) {
            workElapsedMs += delta;
        }

        const fraction = Math.min(1, workElapsedMs / totalMs);
        const currentPos = pointAlongPath(fraction);
        routeMarker.setLatLng(currentPos);

        window.routeDistanceKM = fraction * totalRouteKm; // real distance covered so far


        if (!animateArrow.lastPan || now - animateArrow.lastPan > 160) {
            routeMap.panTo(currentPos, { animate: true, duration: 0.16, easeLinearity: 1 });
            animateArrow.lastPan = now;
        }

        if (fraction < 1) {
            routeAnimFrame = requestAnimationFrame(animateArrow);
        }
    }

// --- PRE-WARM: silently sweep the camera along the whole route,
    // off-screen, so the browser downloads + caches every tile in advance.
    // Only once that's done do we reveal the map and start the real animation.
    mapEl.style.opacity = '0';
    mapEl.style.transition = 'opacity 400ms ease';

    function prewarmRouteTiles(onDone) {
        const steps = 14; // knob: more steps = more thorough caching, slightly longer prewarm
        let i = 0;
        const sweep = setInterval(() => {
            if (i >= steps) {
                clearInterval(sweep);
                onDone();
                return;
            }
            const pos = pointAlongPath(i / (steps - 1));
            routeMap.setView(pos, FOLLOW_ZOOM, { animate: false });
            i++;
        }, 120); // knob: time between camera hops during the silent sweep
    }

prewarmRouteTiles(() => {
        routeMap.setView(start, FOLLOW_ZOOM, { animate: false });
        routeMap.invalidateSize();
        setTimeout(() => {
            mapEl.style.opacity = '1';
            lastFrameTime = performance.now(); // reset right here, so no false "elapsed time" sneaks in
            animateArrow();
        }, 250);
    });}

 /* ==========================================================================
       🎟️ ARRIVAL SEQUENCE (shared by Timer Mode's ending AND Pomodoro's
       finishJourney()) — dims to a soft cream, signals the soundboard to
       fade out, packages the journey's stats, and hands off to arrival.html.
       ========================================================================== */
    function triggerArrivalSequence() {
        window.journeyComplete = true; // soundboard.js polls this to fade sound out

        const dimOverlay = document.createElement('div');
        dimOverlay.style.cssText = `
            position: fixed; inset: 0; z-index: 20000;
            background: #f6f1e7; opacity: 0; pointer-events: none;
            transition: opacity 1200ms ease;
        `;
        document.body.appendChild(dimOverlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => { dimOverlay.style.opacity = '1'; });
        });

        const isPomodoroSession = localStorage.getItem('pomo_work') !== null;
        const durationSeconds = isPomodoroSession
            ? (parseInt(localStorage.getItem('pomo_work')) || 0) * 60 * (parseInt(localStorage.getItem('pomo_cycles')) || 0)
            : CONFIG.targetDurationSeconds;

        const journeyData = {
            date: new Date().toISOString(),
            mode: isPomodoroSession ? 'Pomodoro' : 'Timer',
            durationSeconds: durationSeconds,
            distanceKM: (typeof window.routeDistanceKM === 'number') ? window.routeDistanceKM : 0,
            departure: localStorage.getItem('departure_platform'),
            arrival: localStorage.getItem('arrival_platform'),
            country: localStorage.getItem('selected_country')
        };
        localStorage.setItem('pendingArrivalData', JSON.stringify(journeyData));

        setTimeout(() => {
            window.location.href = 'arrival.html';
        }, 2000);
    }

});