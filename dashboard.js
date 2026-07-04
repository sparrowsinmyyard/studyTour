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
            
            // E. Fire the tracking hardware clock inside Journey Metrics
            initializeJourneyClock();
        });
        onboardBtn.click();
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

        // Main Ticking Clock Loop
        clockInterval = setInterval(() => {
            totalSeconds++;
            
            // Math converters for structural formatting
            let hrs = Math.floor(totalSeconds / 3600);
            let mins = Math.floor((totalSeconds % 3600) / 60);
            let secs = totalSeconds % 60;

            const timeString = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            const clockFace = document.getElementById('journey-clock-face');
            if (clockFace) clockFace.innerText = timeString;

            // Distance Accumulation Tracking (Updates every 10 seconds for testing)
            if (totalSeconds % 10 === 0) {
                currentDistanceKM++;
                const distanceCounter = document.getElementById('journey-distance-counter');
                if (distanceCounter) distanceCounter.innerText = `Distance: ${currentDistanceKM} KM`;
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
        }
    }, 150); // Fires every 150ms until dead stop
} else {
                    if (shutter) shutter.classList.remove('shutter-lifted');
                    metricsCard.classList.add('metrics-halo-active');
                }
            }
        }, 1000);
    }
});