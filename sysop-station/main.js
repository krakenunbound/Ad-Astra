// Ad Astra Sysop Station - Main Process
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let pythonServer = null;
let tunnelProcess = null;
let serverLogs = [];
let tunnelUrl = null;

// Configuration - UPDATE THESE PATHS!
const CONFIG = {
    gamePath: 'G:\\Ad Astra',  // Path to your game folder
    pythonCommand: 'python',
    serverPort: 8000,
    tunnelSubdomain: 'adastra',  // Your custom subdomain
    maxLogs: 500
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        title: 'Ad Astra Sysop Station',
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
}

// Start Python HTTP server
function startPythonServer() {
    if (pythonServer) {
        addLog('warn', 'Python server already running');
        return;
    }

    addLog('info', `Starting Flask server (server.py)...`);

    pythonServer = spawn(CONFIG.pythonCommand, ['server.py'], {
        cwd: CONFIG.gamePath,
        shell: true
    });

    pythonServer.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        addLog('server', msg);
        
        // Detect Flask server started
        if (msg.includes('Running on')) {
            addLog('success', `[OK] Flask server running at http://localhost:${CONFIG.serverPort}`);
            sendToRenderer('server-status', { python: true, tunnel: !!tunnelUrl });
        }
    });

    pythonServer.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        addLog('server', msg);
        
        // Flask also outputs startup info to stderr
        if (msg.includes('Running on')) {
            addLog('success', `[OK] Flask server running at http://localhost:${CONFIG.serverPort}`);
            sendToRenderer('server-status', { python: true, tunnel: !!tunnelUrl });
        }
    });

    pythonServer.on('close', (code) => {
        addLog('warn', `Python server stopped (code: ${code})`);
        pythonServer = null;
        sendToRenderer('server-status', { python: false, tunnel: !!tunnelUrl });
    });
}

// Start localtunnel
function startTunnel() {
    if (tunnelProcess) {
        addLog('warn', 'Tunnel already running');
        return;
    }

    addLog('info', 'Starting localtunnel...');

    const args = ['--port', CONFIG.serverPort.toString()];
    if (CONFIG.tunnelSubdomain) {
        args.push('--subdomain', CONFIG.tunnelSubdomain);
    }

    tunnelProcess = spawn('lt', args, { shell: true });

    tunnelProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        
        // Extract URL from output
        const urlMatch = msg.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            tunnelUrl = urlMatch[0];
            addLog('success', `✓ Tunnel active: ${tunnelUrl}`);
            sendToRenderer('tunnel-url', tunnelUrl);
            sendToRenderer('server-status', { python: !!pythonServer, tunnel: true });
        } else {
            addLog('tunnel', msg);
        }
    });

    tunnelProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        addLog('tunnel', msg);
    });

    tunnelProcess.on('close', (code) => {
        addLog('warn', `Tunnel stopped (code: ${code})`);
        tunnelProcess = null;
        tunnelUrl = null;
        sendToRenderer('server-status', { python: !!pythonServer, tunnel: false });
    });
}

// Stop servers
function stopServers() {
    if (pythonServer) {
        addLog('info', 'Stopping Python server...');
        
        // On Windows, need to kill the entire process tree
        // because spawn with shell:true creates a cmd.exe wrapper
        if (process.platform === 'win32') {
            // Force kill the process tree
            exec(`taskkill /F /T /PID ${pythonServer.pid}`, (error) => {
                if (error) {
                    addLog('warn', `Error killing Python server: ${error.message}`);
                } else {
                    addLog('info', 'Python server stopped');
                }
            });
        } else {
            pythonServer.kill('SIGTERM');
        }
        
        pythonServer = null;
    }

    if (tunnelProcess) {
        addLog('info', 'Stopping tunnel...');
        
        if (process.platform === 'win32') {
            exec(`taskkill /F /T /PID ${tunnelProcess.pid}`, (error) => {
                if (error) {
                    addLog('warn', `Error killing tunnel: ${error.message}`);
                } else {
                    addLog('info', 'Tunnel stopped');
                }
            });
        } else {
            tunnelProcess.kill('SIGTERM');
        }
        
        tunnelProcess = null;
        tunnelUrl = null;
    }

    sendToRenderer('server-status', { python: false, tunnel: false });
}

// Add log entry
function addLog(type, message) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        message: message
    };

    serverLogs.push(logEntry);

    // Keep only last N logs
    if (serverLogs.length > CONFIG.maxLogs) {
        serverLogs.shift();
    }

    sendToRenderer('log-entry', logEntry);
}

// Send data to renderer
function sendToRenderer(channel, data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, data);
    }
}

// Read game data from localStorage
function getGameData() {
    try {
        // Path to Chromium's localStorage for the game
        // This is a simplified version - actual path may vary
        const localStoragePath = path.join(
            app.getPath('userData'),
            'Local Storage',
            'leveldb'
        );

        // For now, return mock data - real implementation would parse leveldb
        return {
            players: [],
            multiplayer: {}
        };
    } catch (error) {
        addLog('error', `Failed to read game data: ${error.message}`);
        return null;
    }
}

// IPC Handlers
ipcMain.on('start-servers', () => {
    startPythonServer();
    setTimeout(() => startTunnel(), 2000); // Wait 2s for Python to start
});

ipcMain.on('stop-servers', () => {
    stopServers();
});

ipcMain.on('get-logs', (event) => {
    event.reply('logs', serverLogs);
});

ipcMain.on('get-game-data', (event) => {
    const data = getGameData();
    event.reply('game-data', data);
});

ipcMain.on('clear-logs', () => {
    serverLogs = [];
    addLog('info', 'Logs cleared');
});

// App lifecycle
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopServers();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopServers();
});