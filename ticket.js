/* ==========================================
   VIEW 4: THE FINAL TICKET CEREMONY SYSTEM
   ========================================== */

// 1. Comprehensive Database of Station Codes, Distances, and Train Metadata
const CEREMONY_TRAIN_DATABASE = {
    "japan": {
        trainNo: "503",
        trainName: "SHINKANSEN HIKARI",
        ticketClass: "GREEN CAR (1ST CLASS)",
        currency: "¥",
        wordsModifier: "YEN ONLY",
        stationCodes: {
            "tokyo-cen": "TYO", "nagoya-cen": "NGO", "akita-stn": "AKT",
            "kyoto-stn": "KYT", "takayama-alp": "TKM", "aomori-harb": "AOM"
        },
        distances: {
            "tokyo-cen_kyoto-stn": { km: 513, fare: 14200, words: "FOURTEEN THOUSAND TWO HUNDRED" },
            "nagoya-cen_takayama-alp": { km: 166, fare: 6200, words: "SIX THOUSAND TWO HUNDRED" },
            "akita-stn_aomori-harb": { km: 185, fare: 5800, words: "FIVE THOUSAND EIGHT HUNDRED" }
        }
    },
    "france": {
        trainNo: "8624",
        trainName: "TGV INOUI LUXE",
        ticketClass: "PREMIÈRE CLASSE",
        currency: "€",
        wordsModifier: "EUROS ONLY",
        stationCodes: {
            "paris-lyon": "PAR", "strasbourg": "SXB", "tours": "TUF",
            "marseille": "MRS", "colmar": "CMR", "orleans": "ORL"
        },
        distances: {
            "paris-lyon_marseille": { km: 750, fare: 115, words: "ONE HUNDRED AND FIFTEEN" },
            "strasbourg_colmar": { km: 70, fare: 24, words: "TWENTY FOUR" },
            "tours_orleans": { km: 115, fare: 38, words: "THIRTY EIGHT" }
        }
    },
    "india": {
        trainNo: "12204",
        trainName: "SHATABDI EXPRESS",
        ticketClass: "EXECUTIVE AC CHAIR CAR (1AC)",
        currency: "Rs",
        wordsModifier: "RUPEES ONLY",
        stationCodes: {
            "lucknow": "LJN", "kalka": "KLK", "vasco": "VSG",
            "kathgodam": "KGM", "shimla": "SML", "hubbali": "UBL"
        },
        distances: {
            "lucknow_kathgodam": { km: 340, fare: 945, words: "NINE HUNDRED AND FORTY FIVE" },
            "kalka_shimla": { km: 96, fare: 310, words: "THREE HUNDRED AND TEN" },
            "vasco_hubbali": { km: 180, fare: 525, words: "FIVE HUNDRED AND TWENTY FIVE" }
        }
    }
};

// 2. Initialize and Construct the Ceremony Stage Overlay
window.startTicketCeremony = function() {
    // Collect variables from browser storage
    const country = localStorage.getItem('selected_country');
    const departureId = localStorage.getItem('departure_platform');
    const arrivalId = localStorage.getItem('arrival_platform');

    // Fallback checks
    if (!country || !departureId || !arrivalId) {
        alert("Missing travel logs! Please complete your itinerary choices first.");
        return;
    }

    // Hide active modal overlays safely across both setups
    const timerMod = document.getElementById('timer-setup-modal');
    const pomoMod = document.getElementById('pomo-setup-modal');
    if (timerMod) timerMod.classList.remove('is-active');
    if (pomoMod) pomoMod.classList.remove('is-active');

    // Pull localized engine metadata metrics
    const meta = CEREMONY_TRAIN_DATABASE[country];
    const depSelect = document.getElementById('dep-select');
    const arrSelect = document.getElementById('arr-select');
    const depName = depSelect.options[depSelect.selectedIndex].text;
    const arrName = arrSelect.options[arrSelect.selectedIndex].text;
    
    const depCode = meta.stationCodes[departureId] || "DEP";
    const arrCode = meta.stationCodes[arrivalId] || "ARR";

    // Form lookup keys to calculate custom fares and distance metrics
    const directKey = `${departureId}_${arrivalId}`;
    const reverseKey = `${arrivalId}_${departureId}`;
    const pricing = meta.distances[directKey] || meta.distances[reverseKey] || { km: 250, fare: 450, words: "FOUR HUNDRED AND FIFTY" };

    // Dynamic generator string loops
    const generatedPNR = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date();
    const formattedDate = String(today.getDate()).padStart(2, '0') + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + today.getFullYear();
    const timestampStr = formattedDate + " " + String(today.getHours()).padStart(2, '0') + ":" + String(today.getMinutes()).padStart(2, '0');
    const counterID = `RESRV_CTR_0${Math.floor(1 + Math.random() * 5)}`;

    // Build absolute element wrapper markup layout
    const ceremonyHTML = `
        <div id="ceremony-overlay" class="ceremony-backdrop">
            <div id="ticket-parent-wrapper" class="ticket-master-wrapper">
                
                <div id="static-ticket-view" class="ticket-view-layer">
                    <img src="emptyticket.png" alt="Boarding Ticket" class="ticket-canvas-img" draggable="false">
                </div>

                <div id="ticket-text-overlay" class="ticket-view-layer">
                    <div id="main-ticket-text">
                        <div class="print-field ribbon-pnr">${generatedPNR}</div>
                        <div class="print-field ribbon-train">${meta.trainNo} - ${meta.trainName}</div>
                        <div class="print-field ribbon-date">${formattedDate}</div>
                        <div class="print-field ribbon-class">${meta.ticketClass}</div>
                        
                        <div class="print-field body-from">${depName.toUpperCase()} (${depCode})</div>
                        <div class="print-field body-to">${arrName.toUpperCase()} (${arrCode})</div>
                        <div class="print-field body-distance">${pricing.km} KM</div>
                        
                        <div class="print-field footer-fare">${meta.currency} *${pricing.fare}/- / ${pricing.words} ${meta.wordsModifier}</div>
                        <div class="print-field footer-stamp">${timestampStr} &nbsp;&nbsp; ${counterID}</div>
                    </div>
                    <div id="stub-ticket-text">
                        <img src="qrcode.png" alt="QR Validation" class="print-field ticket-qr-code" draggable="false">
                        <div class="print-field ticket-barcode-field">*${generatedPNR.replace(/-/g, '')}*</div>
                        <div class="print-field stub-pnr">${generatedPNR}</div>
                        <div class="print-field stub-route">${depCode} &rarr; ${arrCode}</div>
                        <div class="print-field stub-class">${meta.trainNo}</div>
                    </div>
                </div>

                <div id="video-ticket-view" class="ticket-view-layer video-hidden">
                    <video id="transition-video-player" width="1360" height="612" preload="auto" muted playsinline>
                        <source src="ticketani.mp4" type="video/mp4">
                    </video>
                </div>

                <div id="perforation-glow-line" class="cut-guide-wire"></div>

            </div>
        </div>
    `;

// 1. Inject the html structure into the page frame
    document.body.insertAdjacentHTML('beforeend', ceremonyHTML);

    // 2. 🎬 THE FIXED TIMING DELAY:
    // Gives the browser a tiny window to paint the clear backdrop first, 
    // ensuring the 2.5s CSS transition curve actually triggers smoothly!
    setTimeout(() => {
        const overlay = document.getElementById('ceremony-overlay');
        if (overlay) overlay.classList.add('is-curtain-up');
    }, 50); // Bumped to 50ms just to be absolutely safe

    // 3. Float the ticket in after the background starts getting dark
    setTimeout(() => {
        document.getElementById('ticket-parent-wrapper').classList.add('is-floated-in');
        initializeTearMechanics();
    }, 1700);
};

// 3. Mouse Gesture Tracking Drag-and-Drop Tear Mechanics Engine
function initializeTearMechanics() {
    const triggerWire = document.getElementById('perforation-glow-line');
    const wrapper = document.getElementById('ticket-parent-wrapper');
    const staticLayer = document.getElementById('static-ticket-view');
    const videoLayer = document.getElementById('video-ticket-view');
    const videoPlayer = document.getElementById('transition-video-player');
    

    let isDragging = false;
    let startY = 0;
    const thresholdTravelDistance = 60; // Travel limit in pixels to confirm a deliberate tear action

    triggerWire.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevents browser image dragging/text highlighting
        isDragging = true;
        startY = e.clientY;
        triggerWire.classList.add('glow-extinguished'); // Immediately extinguish instructions
        document.body.style.cursor = 'pointer';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let currentDeltaY = e.clientY - startY;
        
        // Give soft visual feedback by slightly budging the wrapper container downward along with the cursor drag
        if (currentDeltaY > 0 && currentDeltaY < thresholdTravelDistance) {
            wrapper.style.transform = `translate(-50%, calc(-50% + ${currentDeltaY * 0.2}px))`;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.cursor = 'default';

        let totalTravel = e.clientY - startY;

        // Verify if drag limit parameters passed checkpoint metrics
        if (totalTravel >= thresholdTravelDistance) {
            // Success! Fire the immediate component swap handshake system
            triggerWire.style.display = 'none';
            staticLayer.classList.add('layer-fade-out');
            
            // Kill stub text instantly
            const stubTextEl = document.getElementById('stub-ticket-text');
            if (stubTextEl) stubTextEl.style.display = 'none';

            videoLayer.classList.remove('video-hidden');
            
            // Sync wrapper back to dead-center geometry positions for perfectly clean video alignment
            wrapper.style.transform = 'translate(-50%, -50%)';
            
            videoPlayer.play();

            // Intercept timeline end parameters to start background darkness fading cycles
            videoPlayer.onended = () => {
                if (window.location.search.includes('dev')) return; // Bypass redirect in Dev Mode
                
                document.getElementById('ceremony-overlay').classList.add('is-cinematic-dimming');
                
                // Final Redirect Handoff
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            };

        } else {
            // Drag failed to hit parameter threshold bounds -> Snaps back elegantly
            wrapper.style.transform = 'translate(-50%, -50%)';
            triggerWire.classList.remove('glow-extinguished');
        }
    });
}

/* ==========================================
   🛠️ DEV MODE SANDBOX FOR EASY TWEAKING
   ========================================== */
if (window.location.search.includes('dev')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("🛠️ Dev Mode Active: Bypassing setup flow...");
        
        // 1. Pre-fill local storage so checks pass
        localStorage.setItem('selected_country', 'japan');
        localStorage.setItem('departure_platform', 'tokyo-cen');
        localStorage.setItem('arrival_platform', 'kyoto-stn');
        
        // 2. Mock the dropdown DOM elements
        const mockSelects = `
            <select id="dep-select" style="display:none;"><option selected>Tokyo Central</option></select>
            <select id="arr-select" style="display:none;"><option selected>Kyoto Station</option></select>
        `;
        document.body.insertAdjacentHTML('beforeend', mockSelects);
        
        // 3. Launch ticket ceremony
        startTicketCeremony();
        
        // 4. Trigger auto-cut and loop
        setTimeout(() => {
            const triggerWire = document.getElementById('perforation-glow-line');
            const staticLayer = document.getElementById('static-ticket-view');
            const videoLayer = document.getElementById('video-ticket-view');
            const videoPlayer = document.getElementById('transition-video-player');
            const textOverlay = document.getElementById('ticket-text-overlay');
            const wrapper = document.getElementById('ticket-parent-wrapper');
            const stubText = document.getElementById('stub-ticket-text');
            
            if (triggerWire) triggerWire.style.display = 'none';
            if (staticLayer) staticLayer.classList.add('layer-fade-out');
            if (videoLayer) videoLayer.classList.remove('video-hidden');
            if (wrapper) wrapper.style.transform = 'translate(-50%, -50%)';
            
            if (videoPlayer) {
                // Ensure looping is done manually via JS to catch the restart point
                videoPlayer.loop = false;
                videoPlayer.playbackRate = 0.1; // Slow down (5x slower)
                
                // Slow down the CSS animation to match (2.5s * 5 = 12.5s duration)
                if (stubText) {
                    stubText.style.animationDuration = '12.5s';
                }
                
                // Kill stub text instantly
                if (stubText) stubText.style.display = 'none';
                
                // Replay video in a loop
                videoPlayer.addEventListener('ended', () => {
                    videoPlayer.currentTime = 0;
                    videoPlayer.play();
                });
                
                videoPlayer.play();
            }
        }, 1800); // Allow ticket float-in transition to finish
    });
}