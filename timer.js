let savedHours = 0;
let savedMinutes = 0;
let savedSeconds = 0;

function injectTimerModal() {
    const modalHTML = `
        <div id="timer-setup-modal" class="timer-modal-overlay">
            <div class="timer-setup-card">
                <button class="timer-modal-close" id="timer-close-btn">&times;</button>
                <h2 class="timer-setup-title">Set Journey Duration</h2>
                
                <div class="time-picker-deck">
                    <!-- Hours Column -->
                    <div class="picker-column">
                        <button class="picker-arrow" onclick="adjustTime('hrs', 1)">&and;</button>
                        <input type="number" id="input-hrs" value="00" min="0" max="23" onblur="padInputValue(this)">
                        <span class="picker-label">hours</span>
                        <button class="picker-arrow" onclick="adjustTime('hrs', -1)">&or;</button>
                    </div>
                    
                    <div class="time-separator">:</div>
                    
                    <!-- Minutes Column -->
                    <div class="picker-column">
                        <button class="picker-arrow" onclick="adjustTime('mins', 1)">&and;</button>
                        <input type="number" id="input-mins" value="00" min="0" max="59" onblur="padInputValue(this)">
                        <span class="picker-label">minutes</span>
                        <button class="picker-arrow" onclick="adjustTime('mins', -1)">&or;</button>
                    </div>
                    
                    <div class="time-separator">:</div>
                    
                    <!-- Seconds Column -->
                    <div class="picker-column">
                        <button class="picker-arrow" onclick="adjustTime('secs', 1)">&and;</button>
                        <input type="number" id="input-secs" value="00" min="0" max="59" onblur="padInputValue(this)">
                        <span class="picker-label">seconds</span>
                        <button class="picker-arrow" onclick="adjustTime('secs', -1)">&or;</button>
                    </div>
                </div>
                
                <button class="start-btn" id="stations-submit-btn" style="padding: 15px 35px;">
                    select your stations <span class="btn-arrow">&rarr;</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

injectTimerModal();

const timerModal = document.getElementById('timer-setup-modal');
const timerBtn = document.getElementById('timer-btn');
const timerCloseBtn = document.getElementById('timer-close-btn');
const stationsSubmitBtn = document.getElementById('stations-submit-btn');

timerBtn.addEventListener('click', () => {
    timerModal.classList.add('is-active');
});

timerCloseBtn.addEventListener('click', () => {
    timerModal.classList.remove('is-active');
});

timerModal.addEventListener('click', (e) => {
    if (e.target === timerModal) {
        timerModal.classList.remove('is-active');
    }
});

window.adjustTime = function(unit, value) {
    const inputMap = {
        'hrs': { el: document.getElementById('input-hrs'), max: 23 },
        'mins': { el: document.getElementById('input-mins'), max: 59 },
        'secs': { el: document.getElementById('input-secs'), max: 59 }
    };
    
    let currentInput = inputMap[unit].el;
    let currentValue = parseInt(currentInput.value) || 0;
    let newValue = currentValue + value;
    
    // Boundary checks
    if (newValue < 0) newValue = inputMap[unit].max;
    if (newValue > inputMap[unit].max) newValue = 0;
    
    currentInput.value = String(newValue).padStart(2, '0');
};

window.padInputValue = function(inputElement) {
    let val = parseInt(inputElement.value) || 0;
    let max = parseInt(inputElement.getAttribute('max'));
    
    if (val < 0) val = 0;
    if (val > max) val = max;
    
    inputElement.value = String(val).padStart(2, '0');
};

stationsSubmitBtn.addEventListener('click', () => {
    savedHours = parseInt(document.getElementById('input-hrs').value) || 0;
    savedMinutes = parseInt(document.getElementById('input-mins').value) || 0;
    savedSeconds = parseInt(document.getElementById('input-secs').value) || 0;
    
    console.log(`🚂 Ticket Time Lock Confirmed! saved in JS memory core -> ${savedHours}:${savedMinutes}:${savedSeconds}`);
    alert(`Time Saved: ${String(savedHours).padStart(2,'0')}:${String(savedMinutes).padStart(2,'0')}:${String(savedSeconds).padStart(2,'0')}!\nReady to build the Station Selector next!`);
});