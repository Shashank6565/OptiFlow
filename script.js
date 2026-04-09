// --- STATE & CONFIGURATION ---
let lanes = [
    { id: 'N', name: 'North', volume: 0, colorClass: 'text-neon-blue', borderClass: 'border-neon-blue', bgClass: 'bg-neon-blue', hex: '#00f0ff' },
    { id: 'E', name: 'East',  volume: 0, colorClass: 'text-neon-red', borderClass: 'border-neon-red', bgClass: 'bg-neon-red', hex: '#ff003c' },
    { id: 'S', name: 'South', volume: 0, colorClass: 'text-neon-green', borderClass: 'border-neon-green', bgClass: 'bg-neon-green', hex: '#39ff14' },
    { id: 'W', name: 'West',  volume: 0, colorClass: 'text-neon-purple', borderClass: 'border-neon-purple', bgClass: 'bg-neon-purple', hex: '#b026ff' }
];

let cycleQueue = [];
let currentActiveLaneIndex = 0;
let timeRemaining = 0;
let cycleInterval = null;
let currentMode = 'auto'; 
let manualActiveLane = null;

// --- REAL-TIME CLOCK ---
function updateClock() {
    const clockEl = document.getElementById('live-clock');
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('en-IN', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// --- STATE MANAGEMENT ---
function setMode(mode) {
    currentMode = mode;
    const btnAuto = document.getElementById('btn-auto');
    const btnManual = document.getElementById('btn-manual');
    const manualPanel = document.getElementById('manual-controls');
    const statusText = document.getElementById('system-status-text');
    const timerDisplay = document.getElementById('live-timer');
    const timerLabel = document.getElementById('timer-label');

    if (mode === 'auto') {
        btnAuto.className = "px-4 py-1.5 rounded bg-neon-blue text-void text-[10px] font-black uppercase tracking-tighter transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]";
        btnManual.className = "px-4 py-1.5 rounded text-gray-500 text-[10px] font-black uppercase tracking-tighter transition-all hover:text-white";
        manualPanel.classList.add('hidden');
        statusText.innerText = "DAA Engine Running";
        statusText.className = "text-xs text-neon-blue";
        timerLabel.innerText = "s";
        manualActiveLane = null;
        startTrafficCycle(); 
    } else {
        btnManual.className = "px-4 py-1.5 rounded bg-neon-red text-white text-[10px] font-black uppercase tracking-tighter transition-all shadow-[0_0_10px_rgba(255,0,60,0.4)]";
        btnAuto.className = "px-4 py-1.5 rounded text-gray-500 text-[10px] font-black uppercase tracking-tighter transition-all hover:text-white";
        manualPanel.classList.remove('hidden');
        statusText.innerText = "MANUAL OVERRIDE";
        statusText.className = "text-xs font-bold text-neon-red animate-pulse";
        
        if(cycleInterval) clearInterval(cycleInterval);
        timerDisplay.innerText = "∞";
        timerLabel.innerText = "";
        
        if(!manualActiveLane) manualActiveLane = 'N'; 
        renderDashboardUI();
    }
}

function forceGreen(laneId) {
    if (currentMode !== 'manual') return;
    manualActiveLane = laneId;
    renderDashboardUI();
}

// --- DAA ENGINE ---
function fetchYoloData() {
    lanes.forEach(lane => {
        lane.volume = Math.floor(Math.random() * 80) + 5; 
    });
}

function calculatePhaseQueue() {
    const totalVehicles = lanes.reduce((sum, lane) => sum + lane.volume, 0);
    const maxCycleTime = 120; 
    
    cycleQueue = lanes.map(lane => ({...lane}));

    cycleQueue.forEach(lane => {
        let calculatedTime = Math.floor((lane.volume / totalVehicles) * maxCycleTime);
        lane.allocatedTime = Math.max(10, calculatedTime); 
    });

    cycleQueue.sort((a, b) => b.volume - a.volume);
}

function startTrafficCycle() {
    if (currentMode === 'manual') return;
    if (cycleInterval) clearInterval(cycleInterval);
    
    fetchYoloData();
    calculatePhaseQueue();
    
    currentActiveLaneIndex = 0;
    timeRemaining = cycleQueue[currentActiveLaneIndex].allocatedTime;
    
    renderDashboardUI();
    
    cycleInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('live-timer').innerText = timeRemaining.toString().padStart(2, '0');
        
        if(timeRemaining <= 0) {
            currentActiveLaneIndex++;
            if(currentActiveLaneIndex >= cycleQueue.length) {
                startTrafficCycle();
            } else {
                timeRemaining = cycleQueue[currentActiveLaneIndex].allocatedTime;
                renderDashboardUI();
            }
        }
    }, 1000);
}

// --- UI RENDERING ---
function renderDashboardUI() {
    const metricsContainer = document.getElementById('lane-metrics-container');
    const resultsContainer = document.getElementById('cycle-results-container');
    const overrideButtons = document.getElementById('override-buttons');
    
    metricsContainer.innerHTML = '';
    resultsContainer.innerHTML = '';
    if(currentMode === 'manual') overrideButtons.innerHTML = '';

    let displayQueue = (currentMode === 'manual') ? lanes : cycleQueue;

    // 1. Render Top Metrics Cards
    lanes.forEach(lane => {
        metricsContainer.innerHTML += `
            <div class="bg-surface-dark p-6 rounded-lg relative overflow-hidden border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
                <div class="absolute top-0 right-0 p-2 opacity-5">
                    <span class="text-6xl font-black font-headline">${lane.id}</span>
                </div>
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Cam ${lane.id} [${lane.name}]</p>
                <div class="flex flex-col">
                    <span class="font-headline text-5xl font-extrabold ${lane.colorClass} mb-1" style="text-shadow: 0 0 10px ${lane.hex}40;">${lane.volume}</span>
                    <span class="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Vehicles Detected</span>
                </div>
            </div>
        `;

        if (currentMode === 'manual') {
            let isActive = (manualActiveLane === lane.id);
            let btnClass = isActive ? `${lane.bgClass} text-void font-black shadow-[0_0_10px_${lane.hex}]` : `bg-void text-gray-500 border border-white/10 hover:border-white/30 hover:text-white`;
            
            overrideButtons.innerHTML += `
                <button onclick="forceGreen('${lane.id}')" class="px-3 py-2 rounded text-xs tracking-widest uppercase transition-all ${btnClass}">
                    ${lane.id} Green
                </button>
            `;
        }
    });

    // 2. Render Sequence Queue
    displayQueue.forEach((lane, index) => {
        let isActive = (currentMode === 'manual') ? (manualActiveLane === lane.id) : (index === currentActiveLaneIndex);
        let opacityClass = isActive ? "opacity-100 bg-void shadow-[0_0_15px_rgba(0,0,0,0.5)]" : "opacity-30";
        let activeGlow = isActive ? `border-l-[4px] ${lane.borderClass}` : `border-l-4 border-white/5`;
        let timeDisplay = (currentMode === 'manual') ? (isActive ? '∞' : '0s') : `${lane.allocatedTime}s`;

        resultsContainer.innerHTML += `
            <div class="p-3 rounded ${activeGlow} flex justify-between items-center transition-all ${opacityClass} border border-white/5">
                <div class="flex items-center gap-4">
                    <div class="w-6 h-6 rounded bg-white/5 flex items-center justify-center border border-white/10">
                        <span class="${lane.colorClass} font-black text-[10px]" style="text-shadow: 0 0 5px ${lane.hex};">${index + 1}</span>
                    </div>
                    <div>
                        <p class="text-xs font-black text-white uppercase tracking-tight">Lane ${lane.id}</p>
                        <p class="text-[9px] text-gray-500">${isActive ? 'ACTIVE GREEN' : 'QUEUED'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-lg font-headline font-extrabold ${isActive ? lane.colorClass : 'text-gray-600'}">${timeDisplay}</span>
                </div>
            </div>
        `;
    });
}

// --- TAB NAVIGATION & CHARTS ---
function switchTab(tabName) {
    const dashboardTab = document.getElementById('tab-dashboard');
    const analyticsTab = document.getElementById('tab-analytics');
    const navDash = document.getElementById('nav-dashboard');
    const navAnal = document.getElementById('nav-analytics');
    const headerTitle = document.getElementById('header-title');

    const activeNavStyle = "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-neon-blue bg-neon-blue/10 border-r-2 border-neon-blue font-manrope text-sm font-medium tracking-tight transition-all";
    const inactiveNavStyle = "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 border-r-2 border-transparent font-manrope text-sm font-medium tracking-tight transition-all";

    if(tabName === 'dashboard') {
        dashboardTab.classList.remove('hidden');
        analyticsTab.classList.add('hidden');
        navDash.className = activeNavStyle;
        navAnal.className = inactiveNavStyle;
        headerTitle.innerText = "System Core Overview";
    } else {
        dashboardTab.classList.add('hidden');
        analyticsTab.classList.remove('hidden');
        navAnal.className = activeNavStyle;
        navDash.className = inactiveNavStyle;
        headerTitle.innerText = "Data Analytics Engine";
        initCharts(); 
    }
}

let chartInstance = null;
function initCharts() {
    const ctx = document.getElementById('volumeBarChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const now = new Date();
    const currentHour = now.getHours();
    const dynamicLabels = [];
    
    for(let i = 6; i >= 0; i--) {
        let hour = currentHour - i;
        if (hour < 0) hour += 24; 
        dynamicLabels.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    const simulatedData = [150, 200, 450, 850, 1200, 900, Math.floor(Math.random() * 400 + 400)];

    Chart.defaults.color = '#8d9198';
    Chart.defaults.font.family = 'Inter';

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dynamicLabels,
            datasets: [{
                label: 'Total Traffic Volume',
                data: simulatedData,
                backgroundColor: 'rgba(0, 240, 255, 0.8)', // Neon blue fill
                borderColor: '#00f0ff', // Neon blue border
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#00f0ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            animation: false, 
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'Vehicle Count', color: '#6b7280' }
                },
                x: { 
                    grid: { display: false },
                    title: { display: true, text: 'Time of Day (IST)', color: '#6b7280' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#e5e7eb' }
                }
            }
        }
    });
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    // Set initial button state colors
    document.getElementById('btn-auto').className = "px-4 py-1.5 rounded bg-neon-blue text-void text-[10px] font-black uppercase tracking-tighter transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]";
    startTrafficCycle();
});