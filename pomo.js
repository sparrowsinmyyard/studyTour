// Global Pomodoro Variables to track our cycles in memory core
let savedWorkDuration = 0;
let savedBreakDuration = 0;
let savedCyclesCount = 0;

// Initialize the structural interface dynamically via JS injection
function injectPomoModal() {
    const pomoHTML = `
        <div id="pomo-setup-modal" class="pomo-modal-overlay">
            <div class="pomo-setup-card">
                <button class="pomo-modal-close" id="pomo-close-btn">&times;</button>
                <h2 class="pomo-setup-title">Set Focus Sessions</h2>
                
                <div class="pomo-picker-deck">
                    <div class="pomo-column">
                        <button class="pomo-arrow" onclick="adjustPomo('work', 1)">&and;</button>
                        <input type="number" id="pomo-work" value="25" min="1" max="59" onblur="validatePomoInput(this)">
                        <span class="pomo-label">WORK</span>
                        <button class="pomo-arrow" onclick="adjustPomo('work', -1)">&or;</button>
                    </div>
                    
                    <div class="pomo-column">
                        <button class="pomo-arrow" onclick="adjustPomo('break', 1)">&and;</button>
                        <input type="number" id="pomo-break" value="05" min="1" max="59" onblur="validatePomoInput(this)">
                        <span class="pomo-label">SHORT BREAK</span>
                        <button class="pomo-arrow" onclick="adjustPomo('break', -1)">&or;</button>
                    </div>
                    
                    <div class="pomo-column">
                        <button class="pomo-arrow" onclick="adjustPomo('cycles', 1)">&and;</button>
                        <input type="number" id="pomo-cycles" value="04" min="1" max="99" onblur="validatePomoInput(this)">
                        <span class="pomo-label">CYCLES</span>
                        <button class="pomo-arrow" onclick="adjustPomo('cycles', -1)">&or;</button>
                    </div>
                </div>
                
                <button class="start-btn" id="pomo-submit-btn" style="padding: 15px 35px;">
                    select your stations <span class="btn-arrow">&rarr;</span>
                </button>
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
const pomoSubmitBtn = document.getElementById('pomo-submit-btn');

// Wake setup deck up on layout click
pomoBtn.addEventListener('click', () => {
    pomoModal.classList.add('is-active');
});

// Close setup deck on close button hit
pomoCloseBtn.addEventListener('click', () => {
    pomoModal.classList.remove('is-active');
});

// Close setup deck if clicking dark background layout frame
pomoModal.addEventListener('click', (e) => {
    if (e.target === pomoModal) {
        pomoModal.classList.remove('is-active');
    }
});

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
    
    // Smooth boundary looping
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

// 🎫 THE SUBMIT ACTION: Log internal cycle loop engine metrics and lock state
pomoSubmitBtn.addEventListener('click', () => {
    savedWorkDuration = parseInt(document.getElementById('pomo-work').value) || 25;
    savedBreakDuration = parseInt(document.getElementById('pomo-break').value) || 5;
    savedCyclesCount = parseInt(document.getElementById('pomo-cycles').value) || 4;
    
    console.log(`🚂 Pomodoro Sequence Locked in memory! -> Work: ${savedWorkDuration}m | Break: ${savedBreakDuration}m | Cycles: ${savedCyclesCount}`);
    alert(`Pomodoro Pattern Saved:\n${savedWorkDuration} mins Work ➔ ${savedBreakDuration} mins Break\nRepeating for ${savedCyclesCount} Cycles!`);
});