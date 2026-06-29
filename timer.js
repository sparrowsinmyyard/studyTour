// Initialize stored variables
let savedHours = 0;
let savedMinutes = 0;
let savedSeconds = 0;
let selectedCountry = ""; 

// 🎨 MASTER BRIGHT DATA STRUCTURE (NOW PERFECTLY MATCHES POMODORO'S LUXURY LOOK)
const JOURNEY_DATA = {
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

function injectTimerModal() {
    const modalHTML = `
        <div id=\"timer-setup-modal\" class=\"timer-modal-overlay\">
            <div class="timer-setup-card" id="main-setup-card">
                <button class=\"timer-modal-close\" id=\"timer-close-btn\">&times;</button>
                
                <div id="modal-dynamic-content" style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 40px;">
                    <h2 class=\"timer-setup-title\">Set Journey Duration</h2>
                    
                    <div class=\"time-picker-deck\">
                        <div class=\"picker-column\">
                            <button class=\"picker-arrow\" onclick=\"adjustTime('hrs', 1)\">&and;</button>
                            <input type=\"number\" id=\"input-hrs\" value=\"00\" min=\"0\" max=\"23\" onfocus=\"clearZero(this)\" onblur=\"padInputValue(this)\">
                            <span class=\"picker-label\">hours</span>
                            <button class=\"picker-arrow\" onclick=\"adjustTime('hrs', -1)\">&or;</button>
                        </div>
                        
                        <div class=\"time-separator\">:</div>
                        
                        <div class=\"picker-column\">
                            <button class=\"picker-arrow\" onclick=\"adjustTime('mins', 1)\">&and;</button>
                            <input type=\"number\" id=\"input-mins\" value=\"00\" min=\"0\" max=\"59\" onfocus=\"clearZero(this)\" onblur=\"padInputValue(this)\">
                            <span class=\"picker-label\">minutes</span>
                            <button class=\"picker-arrow\" onclick=\"adjustTime('mins', -1)\">&or;</button>
                        </div>
                        
                        <div class=\"time-separator\">:</div>
                        
                        <div class=\"picker-column\">
                            <button class=\"picker-arrow\" onclick=\"adjustTime('secs', 1)\">&and;</button>
                            <input type=\"number\" id=\"input-secs\" value=\"00\" min=\"0\" max=\"59\" onfocus=\"clearZero(this)\" onblur=\"padInputValue(this)\">
                            <span class=\"picker-label\">seconds</span>
                            <button class=\"picker-arrow\" onclick=\"adjustTime('secs', -1)\">&or;</button>
                        </div>
                    </div>
                    
                    <button class=\"start-btn\" id=\"timer-submit-btn\" style=\"padding: 15px 35px;\" onclick=\"goToCountrySelection()\">
                        select your country <span class=\"btn-arrow\">&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

injectTimerModal();

// Grab elements
const timerModal = document.getElementById('timer-setup-modal');
const timerBtn = document.getElementById('timer-btn');
const timerCloseBtn = document.getElementById('timer-close-btn');

if (timerBtn) {
    timerBtn.addEventListener('click', () => { timerModal.classList.add('is-active'); });
}

timerCloseBtn.addEventListener('click', () => {
    timerModal.classList.remove('is-active');
    wipeTimerSessionData();
});

timerModal.addEventListener('click', (e) => {
    if (e.target === timerModal) {
        timerModal.classList.remove('is-active');
        wipeTimerSessionData();
    }
});

function wipeTimerSessionData() {
    localStorage.removeItem('timer_hours');
    localStorage.removeItem('timer_minutes');
    localStorage.removeItem('timer_seconds');
    localStorage.removeItem('selected_country');
    selectedCountry = "";
    const cardDeck = document.getElementById('main-setup-card');
    if (cardDeck) {
        cardDeck.style.background = "rgba(255, 255, 255, 0.4)";
    }
}

window.goToCountrySelection = function() {
    savedHours = parseInt(document.getElementById('input-hrs').value) || 0;
    savedMinutes = parseInt(document.getElementById('input-mins').value) || 0;
    savedSeconds = parseInt(document.getElementById('input-secs').value) || 0;

    localStorage.setItem('timer_hours', savedHours);
    localStorage.setItem('timer_minutes', savedMinutes);
    localStorage.setItem('timer_seconds', savedSeconds);

    const container = document.getElementById('modal-dynamic-content');
    container.innerHTML = `
        <h2 class="timer-setup-title">Select Passport</h2>
        <div class="country-picker-deck">
            <div class="country-card" id="card-japan" onclick="previewCountryTheme('japan')">
                <div class="country-flag-icon circular-jp"></div>
                <span class="country-title-tag">Japan</span>
            </div>
            <div class="country-card" id="card-india" onclick="previewCountryTheme('india')">
                <div class="country-flag-icon circular-in"></div>
                <span class="country-title-tag">India</span>
            </div>
            <div class="country-card" id="card-france" onclick="previewCountryTheme('france')">
                <div class="country-flag-icon circular-fr"></div>
                <span class="country-title-tag">France</span>
            </div>
        </div>
        <button class="start-btn" id="country-submit-btn" style="padding: 15px 35px;" disabled onclick="lockCountryAndProceed()">
            continue to platforms <span class="btn-arrow">&rarr;</span>
        </button>
    `;
};

window.previewCountryTheme = function(countryKey) {
    selectedCountry = countryKey;
    const cardElement = document.getElementById('main-setup-card');
    document.querySelectorAll('#modal-dynamic-content .country-card').forEach(card => card.classList.remove('is-selected'));
    document.getElementById(`card-${countryKey}`).classList.add('is-selected');
    
    cardElement.style.background = JOURNEY_DATA[countryKey].flagBg;
    cardElement.style.backdropFilter = "blur(40px)";
    document.getElementById('country-submit-btn').removeAttribute('disabled');
};

window.lockCountryAndProceed = function() {
    localStorage.setItem('selected_country', selectedCountry);
    renderPlatformGrid(selectedCountry, 'modal-dynamic-content');
};

window.adjustTime = function(unit, value) {
    const inputMap = {
        'hrs': { el: document.getElementById('input-hrs'), max: 23 },
        'mins': { el: document.getElementById('input-mins'), max: 59 },
        'secs': { el: document.getElementById('input-secs'), max: 59 }
    };
    let currentInput = inputMap[unit].el;
    let currentValue = parseInt(currentInput.value) || 0;
    let newValue = currentValue + value;

    if (newValue < 0) newValue = inputMap[unit].max;
    if (newValue > inputMap[unit].max) newValue = 0;
    currentInput.value = String(newValue).padStart(2, '0');
};

window.clearZero = function(inputElement) {
    if (parseInt(inputElement.value) === 0) {
        inputElement.value = '';
    }
};

window.padInputValue = function(inputElement) {
    let val = inputElement.value;
    if (val === '') {
        inputElement.value = '00';
        return;
    }
    let parsedVal = parseInt(val) || 0;
    let max = parseInt(inputElement.getAttribute('max'));
    if (parsedVal < 0) parsedVal = 0;
    if (parsedVal > max) parsedVal = max;
    inputElement.value = String(parsedVal).padStart(2, '0');
};