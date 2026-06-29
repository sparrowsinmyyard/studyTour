// Global Pomodoro Variables to track our cycles in memory core
let savedWorkDuration = 0;
let savedBreakDuration = 0;
let savedCyclesCount = 0;
let selectedCountryPomo = ""; 

// Master DRY Multi-Step Data Structure (Shared Architecture Pattern)
const JOURNEY_DATA_POMO = {
    "japan": {
        name: "Japan",
        flagBg: "linear-gradient(135deg, rgba(255,255,255,0.85) 40%, rgba(188,0,45,0.12) 100%)"
    },
    "india": {
        name: "India",
        flagBg: "linear-gradient(135deg, rgba(255,153,51,0.12) 0%, rgba(255,255,255,0.85) 50%, rgba(19,136,8,0.12) 100%)"
    },
    "france": {
        name: "France",
        flagBg: "linear-gradient(135deg, rgba(0,35,149,0.1) 0%, rgba(255,255,255,0.85) 50%, rgba(239,65,53,0.1) 100%)"
    }
};

// Initialize the structural interface dynamically via JS injection
function injectPomoModal() {
    const pomoHTML = `
        <div id="pomo-setup-modal" class="pomo-modal-overlay">
            <div class="pomo-setup-card" id="main-pomo-card">
                <button class="pomo-modal-close" id="pomo-close-btn">&times;</button>
                
                <div id="pomo-dynamic-content" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40px;">
                    <h2 class="pomo-setup-title">Set Focus Sessions</h2>
                    
                    <div class="pomo-picker-deck">
                        <div class="pomo-column">
                            <button class="pomo-arrow" onclick="adjustPomo('work', 1)">&and;</button>
                            <input type="number" id="pomo-work" value="25" min="1" max="59" onfocus="clearZeroPomo(this)" onblur="validatePomoInput(this)">
                            <span class="pomo-label">WORK</span>
                            <button class="pomo-arrow" onclick="adjustPomo('work', -1)">&or;</button>
                        </div>
                        
                        <div class="pomo-column">
                            <button class="pomo-arrow" onclick="adjustPomo('break', 1)">&and;</button>
                            <input type="number" id="pomo-break" value="05" min="1" max="59" onfocus="clearZeroPomo(this)" onblur="validatePomoInput(this)">
                            <span class="pomo-label">SHORT BREAK</span>
                            <button class="pomo-arrow" onclick="adjustPomo('break', -1)">&or;</button>
                        </div>
                        
                        <div class="pomo-column">
                            <button class="pomo-arrow" onclick="adjustPomo('cycles', 1)">&and;</button>
                            <input type="number" id="pomo-cycles" value="04" min="1" max="99" onfocus="clearZeroPomo(this)" onblur="validatePomoInput(this)">
                            <span class="pomo-label">CYCLES</span>
                            <button class="pomo-arrow" onclick="adjustPomo('cycles', -1)">&or;</button>
                        </div>
                    </div>
                    
                    <button class="start-btn" id="pomo-submit-btn" style="padding: 15px 35px;" onclick="goToPomoCountrySelection()">
                        select your country <span class="btn-arrow">&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', pomoHTML);
}

// Fire the HTML layout constructor instantly
injectPomoModal();

// Grab our newly injected elements from the DOM
const pomoModal = document.getElementById('pomo-setup-modal');
const pomoBtn = document.getElementById('pomo-btn');
const pomoCloseBtn = document.getElementById('pomo-close-btn');

// Wake setup deck up on layout click
if (pomoBtn) {
    pomoBtn.addEventListener('click', () => { pomoModal.classList.add('is-active'); });
}

// Close setup deck on close button hit
pomoCloseBtn.addEventListener('click', () => {
    pomoModal.classList.remove('is-active');
    wipePomoSessionData();
});

pomoModal.addEventListener('click', (e) => {
    if (e.target === pomoModal) {
        pomoModal.classList.remove('is-active');
        wipePomoSessionData();
    }
});

function wipePomoSessionData() {
    // 1. Delete all unique Pomodoro values from browser storage
    localStorage.removeItem('pomo_work');
    localStorage.removeItem('pomo_break');
    localStorage.removeItem('pomo_cycles');
    localStorage.removeItem('selected_country');
    
    // 2. Reset the live tracking variable
    selectedCountryPomo = "";
    
    // 3. Revert your pomodoro card background tint back to pristine glass
    const cardElement = document.getElementById('main-pomo-card');
    if (cardElement) {
        cardElement.style.background = "rgba(255, 255, 255, 0.4)";
    }
    
    console.log("🧹 Pomodoro track forgotten and session fully wiped clean!");
}

/* STEP ADVANCEMENT: View 2 - Pomodoro Country Engine */
window.goToPomoCountrySelection = function() {
    // Collect and store focus metrics first
    savedWorkDuration = parseInt(document.getElementById('pomo-work').value) || 25;
    savedBreakDuration = parseInt(document.getElementById('pomo-break').value) || 5;
    savedCyclesCount = parseInt(document.getElementById('pomo-cycles').value) || 4;

    localStorage.setItem('pomo_work', savedWorkDuration);
    localStorage.setItem('pomo_break', savedBreakDuration);
    localStorage.setItem('pomo_cycles', savedCyclesCount);

    const container = document.getElementById('pomo-dynamic-content');
    
    container.innerHTML = `
        <h2 class="pomo-setup-title">Select Passport</h2>
        
        <div class="country-picker-deck">
            <div class="country-card" id="pomo-card-japan" onclick="previewPomoCountryTheme('japan')">
                <div class="country-flag-icon circular-jp"></div>
                <span class="country-title-tag">Japan</span>
            </div>
            
            <div class="country-card" id="pomo-card-india" onclick="previewPomoCountryTheme('india')">
                <div class="country-flag-icon circular-in"></div>
                <span class="country-title-tag">India</span>
            </div>
            
            <div class="country-card" id="pomo-card-france" onclick="previewPomoCountryTheme('france')">
                <div class="country-flag-icon circular-fr"></div>
                <span class="country-title-tag">France</span>
            </div>
        </div>
        
        <button class="start-btn" id="pomo-country-submit-btn" style="padding: 15px 35px;" disabled onclick="lockPomoCountryAndProceed()">
            continue to platforms <span class="btn-arrow">&rarr;</span>
        </button>
    `;
};

/* POMO LIVE CONTRAST THEME TOGGLE */
window.previewPomoCountryTheme = function(countryKey) {
    selectedCountryPomo = countryKey;
    const cardElement = document.getElementById('main-pomo-card');
    
    // 1. Strip active markers from other options
    document.querySelectorAll('#pomo-dynamic-content .country-card').forEach(card => card.classList.remove('is-selected'));
    
    // 2. Map glowing selection border around the choice
    document.getElementById(`pomo-card-${countryKey}`).classList.add('is-selected');
    
    // 3. Update parent glass component styling layers instantly
    cardElement.style.background = JOURNEY_DATA_POMO[countryKey].flagBg;
    cardElement.style.backdropFilter = "blur(40px)";
    
    // 4. Enable routing trigger
    document.getElementById('pomo-country-submit-btn').removeAttribute('disabled');
};

window.lockPomoCountryAndProceed = function() {
    localStorage.setItem('selected_country', selectedCountryPomo);
    console.log(`🚂 Pomodoro Country Locked: ${selectedCountryPomo}`);
    renderPlatformGrid(selectedCountryPomo, 'pomo-dynamic-content');
};

// Up & Down Arrow Adjustment Utility Function
window.adjustPomo = function(targetColumn, stepValue) {
    const pomoMap = {
        'work': { el: document.getElementById('pomo-work'), min: 1, max: 59 },
        'break': { el: document.getElementById('pomo-break'), min: 1, max: 59 },
        'cycles': { el: document.getElementById('pomo-cycles'), min: 1, max: 99 }
    };
    
    let currentInput = pomoMap[targetColumn].el;
    let currentValue = parseInt(currentInput.value) || 0;
    let newValue = currentValue + stepValue;
    
    if (newValue < pomoMap[targetColumn].min) newValue = pomoMap[targetColumn].max;
    if (newValue > pomoMap[targetColumn].max) newValue = pomoMap[targetColumn].min;
    
    currentInput.value = String(newValue).padStart(2, '0');
};

// Pads keyboard typed numbers and checks constraints on text-focus loss
window.validatePomoInput = function(inputElement) {
    let val = parseInt(inputElement.value) || 0;
    let min = parseInt(inputElement.getAttribute('min'));
    let max = parseInt(inputElement.getAttribute('max'));
    
    if (val < min) val = min;
    if (val > max) val = max;
    
    inputElement.value = String(val).padStart(2, '0');
};

window.clearZeroPomo = function(inputElement) {
    inputElement.value = '';
};