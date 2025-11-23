// Ad Astra Sysop Station - Renderer Process
const { ipcRenderer, shell, clipboard } = require('electron');

let startTime = Date.now();
let serverStartTime = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sysop Station initialized');
    
    setupEventListeners();
    startClocks();
    loadInitialLogs();
    
    // Poll for game data every 5 seconds
    setInterval(updateGameData, 5000);
});

// Setup UI event listeners
function setupEventListeners() {
    document.getElementById('btn-start').addEventListener('click', () => {
        ipcRenderer.send('start-servers');
        serverStartTime = Date.now();
        addLogToUI('info', 'Starting servers...');
    });

    document.getElementById('btn-stop').addEventListener('click', () => {
        ipcRenderer.send('stop-servers');
        serverStartTime = null;
        addLogToUI('warn', 'Stopping servers...');
    });

    document.getElementById('btn-copy-url').addEventListener('click', copyTunnelUrl);
    document.getElementById('btn-open-game').addEventListener('click', openGame);
    document.getElementById('btn-clear-log').addEventListener('click', clearLog);
}

// IPC Listeners
ipcRenderer.on('server-status', (event, status) => {
    updateServerStatus(status);
});

ipcRenderer.on('tunnel-url', (event, url) => {
    updateTunnelUrl(url);
});

ipcRenderer.on('log-entry', (event, entry) => {
    addLogToUI(entry.type, entry.message, entry.timestamp);
});

ipcRenderer.on('logs', (event, logs) => {
    displayLogs(logs);
});

ipcRenderer.on('game-data', (event, data) => {
    updateGameStats(data);
});

// Update server status indicators
function updateServerStatus(status) {
    const pythonEl = document.getElementById('python-status');
    const tunnelEl = document.getElementById('tunnel-status');

    if (status.python) {
        pythonEl.textContent = 'ONLINE';
        pythonEl.className = 'status online';
    } else {
        pythonEl.textContent = 'OFFLINE';
        pythonEl.className = 'status offline';
    }

    if (status.tunnel) {
        tunnelEl.textContent = 'ONLINE';
        tunnelEl.className = 'status online';
    } else {
        tunnelEl.textContent = 'OFFLINE';
        tunnelEl.className = 'status offline';
    }
}

// Update tunnel URL display
function updateTunnelUrl(url) {
    const urlEl = document.getElementById('tunnel-url');
    urlEl.textContent = url;
    urlEl.style.cursor = 'pointer';
    urlEl.onclick = () => {
        shell.openExternal(url);
    };
}

// Copy tunnel URL to clipboard
function copyTunnelUrl() {
    const url = document.getElementById('tunnel-url').textContent;
    if (url && url !== 'N/A') {
        clipboard.writeText(url);
        addLogToUI('success', `Copied to clipboard: ${url}`);
    } else {
        addLogToUI('warn', 'No tunnel URL available');
    }
}

// Open game in browser
function openGame() {
    const url = 'http://localhost:8000';
    shell.openExternal(url);
    addLogToUI('info', 'Opened game in browser');
}

// Add log entry to UI
function addLogToUI(type, message, timestamp) {
    const logDisplay = document.getElementById('log-display');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const time = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    const typeLabel = type.toUpperCase().padEnd(6);

    entry.innerHTML = `
        <span class="timestamp">[${typeLabel}]</span>
        <span class="message">${escapeHtml(message)}</span>
    `;

    logDisplay.appendChild(entry);
    logDisplay.scrollTop = logDisplay.scrollHeight;

    // Keep only last 200 entries in DOM
    while (logDisplay.children.length > 200) {
        logDisplay.removeChild(logDisplay.firstChild);
    }
}

// Display all logs
function displayLogs(logs) {
    const logDisplay = document.getElementById('log-display');
    logDisplay.innerHTML = '';
    
    logs.forEach(log => {
        addLogToUI(log.type, log.message, log.timestamp);
    });
}

// Clear log
function clearLog() {
    ipcRenderer.send('clear-logs');
    document.getElementById('log-display').innerHTML = '';
    addLogToUI('info', 'Logs cleared');
}

// Load initial logs
function loadInitialLogs() {
    ipcRenderer.send('get-logs');
}

// Update game data/stats
function updateGameData() {
    ipcRenderer.send('get-game-data');
}

// Update game statistics display
function updateGameStats(data) {
    if (!data) return;

    // Update player list
    updatePlayerList(data.players || []);

    // Update stats
    document.getElementById('stat-total-players').textContent = data.totalPlayers || 0;
    document.getElementById('stat-active-now').textContent = data.activePlayers || 0;
    document.getElementById('stat-connections').textContent = data.connections || 0;
}

// Update player list display
function updatePlayerList(players) {
    const playerList = document.getElementById('player-list');
    const playerCount = document.getElementById('player-count');

    if (players.length === 0) {
        playerList.innerHTML = '<div class="no-data">No players connected</div>';
        playerCount.textContent = '(0)';
        return;
    }

    playerCount.textContent = `(${players.length})`;

    playerList.innerHTML = players.map(player => `
        <div class="player-item">
            <div>
                <div class="player-name">${escapeHtml(player.pilotName || player.username)}</div>
                <div class="player-info">
                    Sector: ${player.currentSector || 'Unknown'} | 
                    Credits: ${formatNumber(player.credits || 0)} | 
                    Turns: ${player.turns || 0}
                </div>
            </div>
            <div class="player-actions">
                <button class="btn-mini" onclick="viewPlayer('${player.username}')">VIEW</button>
                <button class="btn-mini" onclick="kickPlayer('${player.username}')">KICK</button>
            </div>
        </div>
    `).join('');
}

// Player actions
function viewPlayer(username) {
    addLogToUI('info', `Viewing player: ${username}`);
    // TODO: Show detailed player modal
}

function kickPlayer(username) {
    if (confirm(`Kick player ${username}?`)) {
        addLogToUI('warn', `Kicked player: ${username}`);
        // TODO: Implement kick functionality
    }
}

// Clock updates
function startClocks() {
    updateClocks();
    setInterval(updateClocks, 1000);
}

function updateClocks() {
    // Current time
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();

    // App uptime
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('uptime').textContent = `Uptime: ${formatTime(uptime)}`;

    // Server uptime
    if (serverStartTime) {
        const serverUptime = Math.floor((Date.now() - serverStartTime) / 1000);
        document.getElementById('stat-uptime').textContent = formatTime(serverUptime);
    }
}

// Utility functions
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for inline onclick handlers
window.viewPlayer = viewPlayer;
window.kickPlayer = kickPlayer;