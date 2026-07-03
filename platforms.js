/* ==========================================
   VIEW 3: PLATFORM DATA & ENGINE (REPAIRED)
   ========================================== */

// Station database containing human-readable names and gorgeous ambient visual backgrounds
const STATION_DATA = {
    "japan": {
        departures: [
            { id: "tokyo-cen", name: "Tokyo Central", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80')" },
            { id: "nagoya-cen", name: "Nagoya Central", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80')" },
            { id: "akita-stn", name: "Akita Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=600&q=80')" }
        ],
        arrivals: [
            { id: "kyoto-stn", name: "Kyoto Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80')" },
            { id: "takayama-alp", name: "Takayama Alpine", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80')" },
            { id: "aomori-harb", name: "Aomori Harbor", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80')" }
        ]
    },
    "france": {
        departures: [
            { id: "paris-lyon", name: "Paris Gare de Lyon", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80')" },
            { id: "strasbourg", name: "Strasbourg Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80')" },
            { id: "tours", name: "Tours Centre", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=600&q=80')" }
        ],
        arrivals: [
            { id: "marseille", name: "Marseille Saint-Charles", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1569587112025-0d460e81a126?auto=format&fit=crop&w=600&q=80')" },
            { id: "colmar", name: "Colmar Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1584999534798-5f4dc63b48db?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" },
            { id: "orleans", name: "Orléans Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80')" }
        ]
    },
    "india": {
        departures: [
            { id: "lucknow", name: "Lucknow Charbagh", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1708428461116-e9c31a6374a9?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" },
            { id: "kalka", name: "Kalka", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://media.istockphoto.com/id/1223612773/photo/the-kalka-to-shimla-railway-is-a-2-ft-6-in-narrow-gauge-railway-in-north-india-which.jpg?s=612x612&w=0&k=20&c=vYxFBTbvcLcivcYjtFB-S_P7ETUwgIj0mAk84l9uC1g=')" },
            { id: "vasco", name: "Vasco da Gama Goa", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }
        ],
        arrivals: [
            { id: "kathgodam", name: "Kathgodam Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1601821139990-9fc929db79ce?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" },
            { id: "shimla", name: "Shimla Toy Train", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1657894736581-ccc35d62d9e2?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" },
            { id: "hubbali", name: "Hubbali Station", img: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=448&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }
        ]
    }
};

// This function gets called when they click "Continue to Platforms"
window.renderPlatformGrid = function(countryKey, containerId) {
    const container = document.getElementById(containerId);
    const countryInfo = STATION_DATA[countryKey];

    // Generate the HTML for the dropdowns
    let depOptions = `<option value="" disabled selected>Select Departure...</option>`;
    countryInfo.departures.forEach(stn => {
        depOptions += `<option value="${stn.id}" data-img="${stn.img}">${stn.name}</option>`;
    });

    let arrOptions = `<option value="" disabled selected>Select Arrival...</option>`;
    countryInfo.arrivals.forEach(stn => {
        arrOptions += `<option value="${stn.id}" data-img="${stn.img}">${stn.name}</option>`;
    });

    container.innerHTML = `
        <h2 class="timer-setup-title">Select Your Platforms</h2>
        
        <div class="platform-split-grid">
            <div class="platform-column">
                <h3 class="platform-header">Departure</h3>
                <select class="platform-select" id="dep-select" onchange="updateStationImage('dep')">
                    ${depOptions}
                </select>
                <div class="station-image-frame" id="dep-image"></div>
            </div>
            
            <div class="platform-column">
                <h3 class="platform-header">Arrival</h3>
                <select class="platform-select" id="arr-select" onchange="updateStationImage('arr')">
                    ${arrOptions}
                </select>
                <div class="station-image-frame" id="arr-image"></div>
            </div>
        </div>
        
        <button class="start-btn" id="final-ticket-btn" style="padding: 15px 35px;" disabled onclick="generateFinalTicket()">
            generate ticket <span class="btn-arrow">&rarr;</span>
        </button>
    `;
};

// Real-time Image Renderer
window.updateStationImage = function(type) {
    const selectEl = document.getElementById(`${type}-select`);
    const imageFrame = document.getElementById(`${type}-image`);
    
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const imageString = selectedOption.getAttribute('data-img');
    
    imageFrame.style.backgroundImage = imageString;
    imageFrame.classList.add('is-loaded');

    // Check if both options are checked to activate the ticket builder button
    const depVal = document.getElementById('dep-select').value;
    const arrVal = document.getElementById('arr-select').value;
    if (depVal && arrVal) {
        document.getElementById('final-ticket-btn').removeAttribute('disabled');
    }
};

// specific function inside .. alert?
window.generateFinalTicket = function() {
    const departureStation = document.getElementById('dep-select').value;
    const arrivalStation = document.getElementById('arr-select').value;

    // Permanent application log storage commit calls
    localStorage.setItem('departure_platform', departureStation);
    localStorage.setItem('arrival_platform', arrivalStation);

    console.log(`🎟️ Core logs committed. Launching Ceremony Sequence...`);
    
    // 🔥 Fire the new cinematic ticket presentation system!
    startTicketCeremony();
};