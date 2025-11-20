// Ad Astra - Main Application
// main.js - Initialize and coordinate all game systems

import { Utils } from './utils.js';
import AuthSystem from './auth.js';
import GameState from './game-state.js';
import Galaxy from './galaxy.js';
import ShipManager from './ship.js';
import EventSystem from './events.js';
import TradingSystem from './trading.js';
import CombatSystem from './combat.js';
import UI from './ui.js';
import AdminPanel from './admin.js';
import AudioSystem from './audio.js';
import MessageBoard from './messages.js';
import { NavigationComputer } from './navigation.js';
import { ComputerSystem } from './computer.js';
import { FighterSystem } from './fighters.js';
import { ColonizationSystem } from './colonization.js';
import MultiplayerSystem from './multiplayer.js';
import PvPSystem from './pvp.js';
import AssetManager from './assets.js';
import AlphaTesterSystem from './alpha-tester.js';

class Game {
    constructor() {
        // Initialize systems
        this.auth = new AuthSystem();
        this.gameState = new GameState();
        this.galaxy = new Galaxy();
        this.combat = new CombatSystem();
        this.ui = new UI();
        this.audio = new AudioSystem();
        this.messageBoard = new MessageBoard();
        this.admin = null;

        // New v0.7.0 systems
        this.navigation = null; // Initialized when galaxy is loaded
        this.computer = new ComputerSystem();
        this.fighters = new FighterSystem();
        this.colonization = new ColonizationSystem();

        // New v0.8.0 multiplayer systems
        this.multiplayer = new MultiplayerSystem();
        this.pvp = new PvPSystem(this.combat);
        this.assets = new AssetManager();
        this.alphaTester = new AlphaTesterSystem();

        // Current state
        this.currentPlanet = null;
        this.currentStation = null;
        this.currentLocation = null; // For message board
        this.pendingEvent = null;
        this.currentComputerTab = 'navigation'; // Track active computer tab
        this.alphaTesterVisible = false; // Alpha tester panel visibility

        // Initialize
        this.init();
    }

    init() {
        console.log('Ad Astra - Initializing...');

        // Create default admin account if needed
        this.auth.createDefaultAdmin();

        // Load galaxy if exists, otherwise generate
        if (!this.galaxy.load()) {
            console.log('No galaxy found, generating new one...');
            this.galaxy.generate();
        }

        // Initialize navigation computer with galaxy
        this.navigation = new NavigationComputer(this.galaxy);

        // Load multiplayer data
        this.multiplayer.load();

        // Load alpha tester data
        this.alphaTester.load();

        // Setup event listeners
        this.setupEventListeners();

        // Check if user is logged in AND has character data
        if (this.gameState.currentUser && this.gameState.gameData) {
            this.startGame();
        } else {
            this.ui.showScreen('auth');
            // Try to play menu music (might be blocked until interaction)
            // We'll retry on click
        }

        console.log('Initialization complete!');
    }

    setupEventListeners() {
        // Global click listener for audio init
        document.addEventListener('click', () => {
            this.audio.init();
            this.audio.playSfx('click');

            // If on auth screen and no music playing, try playing menu theme
            if (document.getElementById('auth-screen').classList.contains('active') && !this.audio.currentTrack) {
                this.audio.playMusic('menu');
            }
        }, { once: false }); // Keep listening for clicks for sfx

        // Auth screen
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.ui.showAuthForm('register');
            return false;
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Show login clicked');
            this.ui.showAuthForm('login');
        });

        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());
        document.getElementById('create-character-btn').addEventListener('click', () => this.handleCreateCharacter());

        // Navigation
        document.getElementById('nav-ship').addEventListener('click', () => this.showShip());
        document.getElementById('nav-sector').addEventListener('click', () => this.showSector());
        document.getElementById('nav-galaxy').addEventListener('click', () => this.showGalaxy());
        document.getElementById('nav-computer').addEventListener('click', () => this.showComputer());
        document.getElementById('nav-trade').addEventListener('click', () => this.showTrade());
        document.getElementById('nav-stats').addEventListener('click', () => this.showStats());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Message Board
        document.getElementById('messageboard-back').addEventListener('click', () => this.showSector());
        document.getElementById('mb-post-new').addEventListener('click', () => this.showPostForm());
        document.getElementById('mb-filter-type').addEventListener('change', () => this.filterMessages());
        document.getElementById('mb-search').addEventListener('input', () => this.filterMessages());
        document.getElementById('mb-refresh').addEventListener('click', () => this.loadMessages());
        document.getElementById('mb-submit-post').addEventListener('click', () => this.submitPost());
        document.getElementById('mb-cancel-post').addEventListener('click', () => this.hidePostForm());
        document.getElementById('mb-submit-reply').addEventListener('click', () => this.submitReply());
        document.getElementById('mb-cancel-reply').addEventListener('click', () => this.hideReplyForm());

        // Character counters for message board
        document.getElementById('mb-post-subject').addEventListener('input', (e) => {
            document.getElementById('mb-subject-count').textContent = e.target.value.length;
        });
        document.getElementById('mb-post-body').addEventListener('input', (e) => {
            document.getElementById('mb-body-count').textContent = e.target.value.length;
        });
        document.getElementById('mb-reply-body').addEventListener('input', (e) => {
            document.getElementById('mb-reply-count').textContent = e.target.value.length;
        });

        // Computer Interface
        document.getElementById('comp-nav-navigation').addEventListener('click', () => this.switchComputerTab('navigation'));
        document.getElementById('comp-nav-intel').addEventListener('click', () => this.switchComputerTab('intel'));
        document.getElementById('comp-nav-bookmarks').addEventListener('click', () => this.switchComputerTab('bookmarks'));
        document.getElementById('comp-nav-fighters').addEventListener('click', () => this.switchComputerTab('fighters'));
        document.getElementById('comp-nav-colonies').addEventListener('click', () => this.switchComputerTab('colonies'));

        // Navigation Computer
        document.getElementById('nav-calculate-route').addEventListener('click', () => this.calculateRoute());
        document.getElementById('nav-find-planet').addEventListener('click', () => this.findNearest('planet'));
        document.getElementById('nav-find-station').addEventListener('click', () => this.findNearest('station'));
        document.getElementById('nav-find-military').addEventListener('click', () => this.findNearest('military'));
        document.getElementById('nav-find-blackmarket').addEventListener('click', () => this.findNearest('blackmarket'));
        document.getElementById('nav-find-trade').addEventListener('click', () => this.findTradeRoute());

        // Intel Computer
        document.getElementById('intel-analyze-galaxy').addEventListener('click', () => this.analyzeGalaxy());

        // Bookmarks
        document.getElementById('bookmark-add-btn').addEventListener('click', () => this.addBookmark());

        // Fighters
        document.getElementById('fighter-deploy-btn').addEventListener('click', () => this.deployFighters());
        document.getElementById('mine-deploy-btn').addEventListener('click', () => this.deployMines());
        document.getElementById('fighter-refresh').addEventListener('click', () => this.refreshFighters());

        // Colonies
        document.getElementById('colony-genesis-btn').addEventListener('click', () => this.launchGenesis());
        document.getElementById('colony-refresh').addEventListener('click', () => this.refreshColonies());
        document.getElementById('colony-collect-all').addEventListener('click', () => this.collectAllIncome());

        // Alpha Tester
        document.getElementById('nav-alpha-tester').addEventListener('click', () => this.toggleAlphaTester());
        document.getElementById('alpha-close').addEventListener('click', () => this.toggleAlphaTester());
        document.getElementById('alpha-export').addEventListener('click', () => this.exportAlphaResults());
        document.getElementById('alpha-clear').addEventListener('click', () => this.clearAlphaResults());

        // Message log
        document.getElementById('clear-log').addEventListener('click', () => this.ui.clearMessages());

        // Admin
        document.getElementById('show-admin-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });

        document.getElementById('admin-logout').addEventListener('click', () => this.ui.showScreen('game'));
        document.getElementById('admin-generate-galaxy').addEventListener('click', () => this.handleAdminGenerateGalaxy());
        document.getElementById('admin-save-settings').addEventListener('click', () => this.handleAdminSaveSettings());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.combat.combatActive) {
                this.combatFlee();
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const result = this.auth.login(username, password);

        if (result.success) {
            this.gameState.setCurrentUser(username);

            // Check if player has character
            if (!this.auth.hasCharacter(username)) {
                this.ui.showAuthForm('character-creation');
            } else {
                this.startGame();
            }
        } else {
            this.ui.showError(result.error);
        }
    }

    handleRegister() {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (password !== confirm) {
            this.ui.showError('Passwords do not match!');
            return;
        }

        const result = this.auth.register(username, password);

        if (result.success) {
            this.ui.showSuccess('Account created! Please login.');
            this.ui.showAuthForm('login');
        } else {
            this.ui.showError(result.error);
        }
    }

    handleCreateCharacter() {
        const pilotName = document.getElementById('pilot-name').value.trim();

        if (!pilotName || pilotName.length < 2) {
            this.ui.showError('Pilot name must be at least 2 characters!');
            return;
        }

        // Create player data
        const playerData = this.gameState.createPlayer(this.gameState.currentUser, pilotName);
        Utils.storage.set(`player_${this.gameState.currentUser}`, playerData);
        this.gameState.load();

        this.ui.showSuccess(`Welcome, Captain ${pilotName}!`);
        this.startGame();
    }

    startGame() {
        // Check for daily turn reset (replaces continuous regeneration)
        const wasReset = this.gameState.checkDailyReset();
        if (wasReset) {
            this.ui.addMessage('New day! Your turns have been reset.', 'success');
        }

        // Register player in multiplayer system
        this.multiplayer.registerPlayer(
            this.gameState.currentUser,
            this.gameState.gameData.name,
            this.gameState.gameData.ship,
            this.gameState.gameData.currentSector
        );

        this.ui.showScreen('game');
        this.ui.showView('sector');
        this.updateUI();
        this.ui.addMessage('Welcome to Ad Astra!', 'success');
        this.ui.addMessage(`You are in Sector ${this.gameState.gameData.currentSector}`, 'info');

        // Show multiplayer status
        const activePlayers = this.multiplayer.getActivePlayers().length;
        if (activePlayers > 1) {
            this.ui.addMessage(`${activePlayers} active players in the galaxy`, 'info');
        }

        // Start exploration music
        this.audio.playMusic('exploration');

        // Initialize admin if user is admin
        if (this.auth.isAdmin(this.gameState.currentUser)) {
            this.admin = new AdminPanel(this.gameState, this.galaxy);
        }
    }

    handleLogout() {
        this.gameState.logout();
        this.ui.showScreen('auth');
        this.ui.showAuthForm('login');
        this.ui.clearMessages();

        // Switch back to menu music
        this.audio.playMusic('menu');
    }

    updateUI() {
        this.ui.updateTopBar(this.gameState);

        if (this.ui.currentView === 'sector') {
            const sector = this.gameState.getCurrentSector();
            this.ui.displaySector(sector, this.gameState);
        } else if (this.ui.currentView === 'ship') {
            this.ui.displayShip(this.gameState.gameData.ship, this.gameState.gameData.cargo);
        } else if (this.ui.currentView === 'trade' && this.currentPlanet) {
            this.ui.displayTrading(this.currentPlanet, this.gameState);
        } else if (this.ui.currentView === 'combat') {
            const status = this.combat.getStatus(this.gameState.gameData.ship);
            this.ui.displayCombat(status);
        } else if (this.ui.currentView === 'stats') {
            this.ui.displayStats(this.gameState.gameData);
        }
    }

    showSector() {
        this.ui.showView('sector');
        this.updateUI();
    }

    showShip() {
        this.ui.showView('ship');
        this.updateUI();
    }

    showStats() {
        this.ui.showView('stats');
        setTimeout(() => this.updateUI(), 0);
    }

    showGalaxy() {
        this.ui.showView('galaxy');
        // Galaxy map rendering is handled by ui.showView special case
    }

    showTrade() {
        const sector = this.gameState.getCurrentSector();
        const planet = sector?.contents.find(c => c.type === 'planet');

        if (planet) {
            this.currentPlanet = planet;
            this.currentLocation = planet; // For message board
            this.ui.showView('trade');

            // Show message board button if planet has message board
            const mbBtn = document.getElementById('trade-messageboard-btn');
            if (mbBtn && planet.messageBoard) {
                mbBtn.style.display = 'block';
            }

            this.updateUI();
        } else {
            this.ui.showError('No trading post in this sector!');
        }
    }

    warpToSector(sectorId) {
        if (this.gameState.gameData.turns < 1) {
            this.ui.showError('Not enough turns!');
            this.audio.playSfx('error');
            return;
        }

        const currentSectorId = this.gameState.gameData.currentSector;
        const currentSector = this.galaxy.getSector(currentSectorId);
        const targetSector = this.galaxy.getSector(sectorId);

        if (!currentSector || !targetSector) {
            this.ui.showError('Invalid sector data!');
            return;
        }

        // Check if there's a warp lane connection (multiplayer requirement)
        if (!currentSector.warps.includes(sectorId)) {
            this.ui.showError('No warp lane to that sector! You can only travel to connected sectors.');
            this.audio.playSfx('error');
            return;
        }

        // Calculate distance and fuel
        const dist = Utils.distance(currentSector.x, currentSector.y, targetSector.x, targetSector.y);
        const fuelCost = ShipManager.calculateFuelCost(dist);
        const travelTime = ShipManager.calculateTravelTime(dist, this.gameState.gameData.ship.speed);

        // Check fuel
        if (this.gameState.gameData.ship.fuel < fuelCost) {
            this.ui.showError(`Not enough fuel! Need ${fuelCost}, have ${this.gameState.gameData.ship.fuel}`);
            this.audio.playSfx('error');
            return;
        }

        // Start travel sequence
        this.ui.showTravelOverlay(travelTime, sectorId);
        this.audio.playSfx('warp');

        let elapsed = 0;
        const updateInterval = setInterval(() => {
            elapsed += 100;
            const progress = Math.min(100, (elapsed / travelTime) * 100);
            const remaining = Math.max(0, travelTime - elapsed);
            this.ui.updateTravelOverlay(remaining, progress);
        }, 100);

        setTimeout(() => {
            clearInterval(updateInterval);
            this.ui.hideTravelOverlay();

            // Consume fuel
            ShipManager.useFuel(this.gameState.gameData.ship, fuelCost);

            // Check for random event
            const event = EventSystem.checkForEvent();
            if (event) {
                this.handleEvent(event);
                // If event is combat, switch music
                if (event.type === 'pirate' || event.type === 'aliens') {
                    this.audio.playMusic('combat');
                    this.audio.playSfx('alert');
                }
                // Even if event happens, we might still arrive? 
                // Original logic returned here, effectively cancelling the move if event happened.
                // But we already paid fuel and time. 
                // Let's say the event intercepts you *before* arrival or *at* arrival.
                // If it's an interception, you are stuck at previous sector or a "deep space" location?
                // For simplicity, let's stick to original logic: Event interrupts warp.
                // But we already consumed fuel. That's the risk!
                this.updateUI(); // Update to show fuel loss
                return;
            }

            if (this.gameState.moveToSector(sectorId)) {
                // Update multiplayer position
                this.multiplayer.updatePosition(
                    this.gameState.currentUser,
                    sectorId
                );

                this.ui.addMessage(`Warped to Sector ${sectorId}`, 'success');
                this.updateUI();
            } else {
                this.ui.showError('Cannot warp to that sector!');
            }
        }, travelTime);
    }

    handleEvent(event) {
        this.pendingEvent = event;
        this.ui.addMessage(event.title, 'warning');
        this.ui.addMessage(event.description, 'info');

        // Show choices
        let choicesHtml = '<div style="margin-top: 20px;"><strong>What do you do?</strong></div>';
        event.choices.forEach((choice, index) => {
            choicesHtml += `<button onclick="window.game.selectEventChoice(${index})" style="margin: 5px;">${choice.text}</button>`;
        });

        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = choicesHtml;
        eventDiv.style.cssText = 'background: var(--bg-medium); border: 2px solid var(--accent-yellow); padding: 20px; margin: 20px 0; border-radius: 8px;';

        const sectorInfo = document.getElementById('sector-info');
        sectorInfo.insertBefore(eventDiv, sectorInfo.firstChild);
    }

    selectEventChoice(choiceIndex) {
        if (!this.pendingEvent) return;

        const result = EventSystem.processChoice(this.pendingEvent, choiceIndex);
        const outcome = EventSystem.applyOutcome(this.gameState, result.outcome);

        this.ui.addMessage(outcome.message, outcome.success ? 'success' : 'warning');

        // Handle special outcomes
        if (outcome.changes.combat) {
            const enemy = EventSystem.generateEnemy();
            this.startCombat(enemy);
        } else if (outcome.changes.randomWarp) {
            const randomSector = Utils.random.int(1, this.galaxy.data.size);
            this.gameState.gameData.currentSector = randomSector;
            this.gameState.save();
            this.ui.addMessage(`Warped to random Sector ${randomSector}!`, 'warning');
        }

        this.pendingEvent = null;
        this.updateUI();
    }

    showTrading(planet) {
        this.currentPlanet = planet;
        this.ui.showView('trade');
        this.updateUI();
    }

    buyCommodity(commodity) {
        const qtyInput = document.getElementById(`trade-qty-${commodity}`);
        const quantity = parseInt(qtyInput.value) || 0;

        if (quantity <= 0) {
            this.ui.showError('Invalid quantity!');
            return;
        }

        const result = TradingSystem.buy(this.gameState, commodity, quantity, this.currentPlanet);

        if (result.success) {
            this.ui.addMessage(
                `Bought ${result.quantity} ${result.commodity} for ${Utils.format.credits(result.cost)}`,
                'success'
            );
            this.updateUI();
        } else {
            this.ui.showError(result.error);
        }
    }

    sellCommodity(commodity) {
        const qtyInput = document.getElementById(`trade-qty-${commodity}`);
        const quantity = parseInt(qtyInput.value) || 0;

        if (quantity <= 0) {
            this.ui.showError('Invalid quantity!');
            return;
        }

        const result = TradingSystem.sell(this.gameState, commodity, quantity, this.currentPlanet);

        if (result.success) {
            this.ui.addMessage(
                `Sold ${result.quantity} ${result.commodity} for ${Utils.format.credits(result.revenue)}`,
                'success'
            );
            this.updateUI();
        } else {
            this.ui.showError(result.error);
        }
    }

    dockAtStation(station) {
        this.currentStation = station;
        this.currentLocation = station; // For message board
        this.ui.addMessage(`Docked at ${station.name}${station.class ? ` (${station.icon} ${station.class})` : ''}`, 'info');

        // Switch to docked music and play success sound
        this.audio.playMusic('docked');
        this.audio.playSfx('success');

        // Show station options
        const options = [
            { text: '📋 Message Board', action: 'messageboard' },
            { text: '🔧 Repair Hull', action: 'repair' },
            { text: '⛽ Refuel', action: 'refuel' },
            { text: '🚪 Undock', action: 'undock' }
        ];

        let html = '<div style="margin-top: 20px;"><strong>Station Services:</strong></div>';
        if (station.description) {
            html += `<p style="color: #888; font-style: italic; margin: 10px 0;">${station.description}</p>`;
        }
        options.forEach(opt => {
            html += `<button onclick="window.game.stationAction('${opt.action}')" style="margin: 5px;">${opt.text}</button>`;
        });

        const sectorInfo = document.getElementById('sector-info');
        const serviceDiv = document.createElement('div');
        serviceDiv.innerHTML = html;
        serviceDiv.style.cssText = 'background: var(--bg-medium); border: 2px solid var(--accent-green); padding: 20px; margin: 20px 0; border-radius: 8px;';
        sectorInfo.insertBefore(serviceDiv, sectorInfo.firstChild);
    }

    stationAction(action) {
        if (action === 'messageboard') {
            this.showMessageBoard();
        } else if (action === 'repair') {
            const ship = this.gameState.gameData.ship;
            const hullNeeded = ship.hullMax - ship.hull;
            const cost = hullNeeded * this.currentStation.repairCost;

            if (cost > this.gameState.gameData.credits) {
                this.ui.showError('Not enough credits for full repair!');
                return;
            }

            this.gameState.repairShip(hullNeeded, 0);
            this.gameState.modifyCredits(-cost);
            this.ui.addMessage(`Ship repaired for ${Utils.format.credits(cost)}`, 'success');
            this.audio.playSfx('success');
            this.updateUI();
        } else if (action === 'refuel') {
            const ship = this.gameState.gameData.ship;
            const fuelNeeded = ship.fuelMax - ship.fuel;
            const cost = fuelNeeded * this.currentStation.refuelCost;

            if (cost > this.gameState.gameData.credits) {
                this.ui.showError('Not enough credits for full refuel!');
                this.audio.playSfx('error');
                return;
            }

            ship.fuel = ship.fuelMax;
            this.gameState.modifyCredits(-cost);
            this.gameState.save();
            this.ui.addMessage(`Ship refueled for ${Utils.format.credits(cost)}`, 'success');
            this.audio.playSfx('success');
            this.updateUI();
        } else if (action === 'undock') {
            this.currentStation = null;
            this.currentLocation = null;
            this.audio.playMusic('exploration');
            this.updateUI();
        }
    }

    startCombat(enemy) {
        this.combat.startCombat(this.gameState.gameData.ship, enemy);
        this.ui.showView('combat');
        this.audio.playMusic('combat');
        this.audio.playSfx('alert');
        this.updateUI();
    }

    combatAttack() {
        this.audio.playSfx('laser');
        const result = this.combat.playerAttack(this.gameState.gameData.ship);

        if (result.playerDestroyed) {
            this.ui.addMessage('Your ship was destroyed!', 'error');
            this.audio.playSfx('explosion');
            this.gameOver();
            return;
        }

        if (result.victory) {
            const enemy = this.combat.endCombat();
            const rewards = this.combat.calculateRewards(enemy, this.gameState.gameData.ship);

            this.gameState.modifyCredits(rewards.credits);
            this.gameState.updateStat('combatsWon', 1);

            this.audio.playSfx('explosion');
            setTimeout(() => this.audio.playSfx('success'), 1000);
            this.audio.playMusic('exploration');

            for (const [commodity, qty] of Object.entries(rewards.cargo)) {
                this.gameState.addCargo(commodity, qty);
            }

            this.ui.addMessage(`Victory! Earned ${Utils.format.credits(rewards.credits)}`, 'success');
            this.ui.showView('sector');
        }

        this.gameState.save();
        this.updateUI();
    }

    combatFlee() {
        const result = this.combat.attemptFlee(this.gameState.gameData.ship);

        if (result.escaped) {
            this.ui.showView('sector');
            this.ui.addMessage('Escaped from combat!', 'success');
        } else if (result.playerDestroyed) {
            this.ui.addMessage('Your ship was destroyed while fleeing!', 'error');
            this.gameOver();
            return;
        }

        this.gameState.save();
        this.updateUI();
    }

    gameOver() {
        this.ui.showError('GAME OVER - Your ship was destroyed!');
        setTimeout(() => {
            if (confirm('Create a new character?')) {
                Utils.storage.remove(`player_${this.gameState.currentUser}`);
                this.ui.showAuthForm('character-creation');
                this.ui.showScreen('auth');
            } else {
                this.handleLogout();
            }
        }, 1000);
    }



    // Admin functions
    handleAdminLogin() {
        const username = prompt('Admin username:');
        const password = prompt('Admin password:');

        if (!username || !password) return;

        const result = this.auth.login(username, password);

        if (result.success && result.isAdmin) {
            this.ui.showScreen('admin');
            this.admin = new AdminPanel(this.gameState, this.galaxy);
        } else {
            this.ui.showError('Invalid admin credentials!');
        }
    }

    handleAdminGenerateGalaxy() {
        const size = parseInt(document.getElementById('admin-galaxy-size').value);
        const result = this.admin.generateGalaxy(size);

        if (result.success) {
            alert(`Galaxy generated with ${result.size} sectors!`);
        } else {
            alert(`Error: ${result.error}`);
        }
    }

    handleAdminSaveSettings() {
        const turnsPerDay = parseInt(document.getElementById('admin-turns-per-day').value);
        const result = this.admin.updateSettings({ turnsPerDay });

        if (result.success) {
            alert('Settings saved!');
        } else {
            alert(`Errors:\n${result.errors.join('\n')}`);
        }
    }

    // ===== MESSAGE BOARD METHODS =====

    showMessageBoard() {
        if (!this.currentLocation || !this.currentLocation.messageBoard) {
            this.ui.showError('No message board available at this location');
            return;
        }

        this.ui.showView('messageboard');

        // Set title based on location
        const title = this.currentLocation.name + ' - Message Board';
        document.getElementById('messageboard-title').textContent = title;

        // Load messages
        this.loadMessages();
    }

    loadMessages() {
        if (!this.currentLocation) return;

        const locationId = `${this.currentLocation.type}_${this.currentLocation.name}`;

        // Get filters
        const typeFilter = document.getElementById('mb-filter-type').value;
        const searchTerm = document.getElementById('mb-search').value;

        const filters = {};
        if (typeFilter) filters.type = typeFilter;
        if (searchTerm) filters.searchTerm = searchTerm;

        // Get messages
        const messages = this.messageBoard.getMessages(locationId, filters);

        // Get stats
        const stats = this.messageBoard.getStats(locationId);

        // Render stats
        this.renderMessageStats(stats);

        // Render messages
        this.renderMessageList(messages);
    }

    renderMessageStats(stats) {
        const statsDiv = document.getElementById('messageboard-stats');
        let html = '<div class="stat-item">';
        html += '<span class="stat-label">Total Messages:</span>';
        html += `<span class="stat-value">${stats.total}</span>`;
        html += '</div>';

        html += '<div class="stat-item">';
        html += '<span class="stat-label">Last 24h:</span>';
        html += `<span class="stat-value">${stats.recentActivity}</span>`;
        html += '</div>';

        // Show type breakdown
        for (const [type, count] of Object.entries(stats.byType)) {
            if (count > 0) {
                const typeInfo = this.messageBoard.MESSAGE_TYPES[type];
                html += '<div class="stat-item">';
                html += `<span>${typeInfo.icon} ${typeInfo.name}:</span>`;
                html += `<span class="stat-value">${count}</span>`;
                html += '</div>';
            }
        }

        statsDiv.innerHTML = html;
    }

    renderMessageList(messages) {
        const listDiv = document.getElementById('messageboard-list');

        if (messages.length === 0) {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <div class="empty-state-text">No messages found</div>
                    <div class="empty-state-subtext">Be the first to post!</div>
                </div>
            `;
            return;
        }

        let html = '';
        messages.forEach(msg => {
            const typeInfo = this.messageBoard.MESSAGE_TYPES[msg.type];
            const date = new Date(msg.timestamp);
            const timeAgo = this.getTimeAgo(msg.timestamp);

            html += `<div class="message-item" onclick="window.game.viewMessage('${msg.id}')">`;
            html += `<div class="message-header">`;
            html += `<span class="message-type ${msg.type}">${typeInfo.icon} ${typeInfo.name}</span>`;
            if (msg.replies.length > 0) {
                html += `<span class="message-reply-count">💬 ${msg.replies.length}</span>`;
            }
            html += `</div>`;
            html += `<div class="message-subject">${Utils.escapeHtml(msg.subject)}</div>`;
            html += `<div class="message-meta">`;
            html += `<span class="message-author">By: ${Utils.escapeHtml(msg.author)}</span>`;
            html += `<span class="message-time">${timeAgo}</span>`;
            html += `</div>`;
            html += `<div class="message-preview">${Utils.escapeHtml(msg.body.substring(0, 100))}${msg.body.length > 100 ? '...' : ''}</div>`;
            html += `</div>`;
        });

        listDiv.innerHTML = html;
    }

    viewMessage(messageId) {
        if (!this.currentLocation) return;

        const locationId = `${this.currentLocation.type}_${this.currentLocation.name}`;
        const messages = this.messageBoard.getMessages(locationId);
        const message = messages.find(m => m.id === messageId);

        if (!message) {
            this.ui.showError('Message not found');
            return;
        }

        // Hide list, show detail
        document.getElementById('messageboard-list').style.display = 'none';
        document.getElementById('messageboard-controls').style.display = 'none';
        document.getElementById('messageboard-stats').style.display = 'none';

        const detailDiv = document.getElementById('messageboard-detail');
        detailDiv.style.display = 'block';

        // Render message
        const typeInfo = this.messageBoard.MESSAGE_TYPES[message.type];
        const date = new Date(message.timestamp);

        let html = `<div class="message-full">`;
        html += `<span class="message-type ${message.type}">${typeInfo.icon} ${typeInfo.name}</span>`;
        html += `<div class="message-subject">${Utils.escapeHtml(message.subject)}</div>`;
        html += `<div class="message-meta">`;
        html += `<span class="message-author">By: ${Utils.escapeHtml(message.author)}</span>`;
        html += `<span class="message-time">${date.toLocaleString()}</span>`;
        if (message.edited) {
            html += `<span style="color: #888;"> (edited)</span>`;
        }
        html += `</div>`;
        html += `<div class="message-body">${Utils.escapeHtml(message.body)}</div>`;

        // Actions
        html += `<div class="message-actions">`;
        html += `<button class="btn-primary" onclick="window.game.showReplyForm('${message.id}')">Reply</button>`;
        html += `<button class="btn-secondary" onclick="window.game.backToMessageList()">Back to List</button>`;
        if (message.author === this.gameState.currentUser) {
            html += `<button class="btn-secondary" onclick="window.game.deleteMessage('${message.id}')">Delete</button>`;
        }
        html += `</div>`;
        html += `</div>`;

        // Render replies
        if (message.replies.length > 0) {
            html += `<div class="message-replies">`;
            html += `<h4>${message.replies.length} ${message.replies.length === 1 ? 'Reply' : 'Replies'}</h4>`;
            message.replies.forEach(reply => {
                const replyDate = new Date(reply.timestamp);
                html += `<div class="reply-item">`;
                html += `<div class="reply-header">`;
                html += `<span class="message-author">${Utils.escapeHtml(reply.author)}</span>`;
                html += `<span class="message-time">${replyDate.toLocaleString()}</span>`;
                html += `</div>`;
                html += `<div class="reply-body">${Utils.escapeHtml(reply.body)}</div>`;
                html += `</div>`;
            });
            html += `</div>`;
        }

        detailDiv.innerHTML = html;
        this.currentMessageId = messageId;
    }

    backToMessageList() {
        document.getElementById('messageboard-list').style.display = 'block';
        document.getElementById('messageboard-controls').style.display = 'flex';
        document.getElementById('messageboard-stats').style.display = 'flex';
        document.getElementById('messageboard-detail').style.display = 'none';
        document.getElementById('messageboard-reply-form').style.display = 'none';
        this.currentMessageId = null;
        this.loadMessages();
    }

    filterMessages() {
        this.loadMessages();
    }

    showPostForm() {
        document.getElementById('messageboard-list').style.display = 'none';
        document.getElementById('messageboard-post-form').style.display = 'block';

        // Clear form
        document.getElementById('mb-post-type').value = 'GENERAL';
        document.getElementById('mb-post-subject').value = '';
        document.getElementById('mb-post-body').value = '';
        document.getElementById('mb-subject-count').textContent = '0';
        document.getElementById('mb-body-count').textContent = '0';
    }

    hidePostForm() {
        document.getElementById('messageboard-list').style.display = 'block';
        document.getElementById('messageboard-post-form').style.display = 'none';
    }

    submitPost() {
        const type = document.getElementById('mb-post-type').value;
        const subject = document.getElementById('mb-post-subject').value.trim();
        const body = document.getElementById('mb-post-body').value.trim();

        if (!subject || !body) {
            this.ui.showError('Please fill in both subject and message body');
            return;
        }

        const locationId = `${this.currentLocation.type}_${this.currentLocation.name}`;
        const author = this.gameState.gameData.name;

        const result = this.messageBoard.postMessage(locationId, author, type, subject, body);

        if (result.success) {
            this.ui.addMessage('Message posted successfully!', 'success');
            this.hidePostForm();
            this.loadMessages();
        } else {
            this.ui.showError(result.error);
        }
    }

    showReplyForm(messageId) {
        document.getElementById('messageboard-detail').style.display = 'none';
        document.getElementById('messageboard-reply-form').style.display = 'block';

        // Clear form
        document.getElementById('mb-reply-body').value = '';
        document.getElementById('mb-reply-count').textContent = '0';

        this.currentReplyMessageId = messageId;
    }

    hideReplyForm() {
        document.getElementById('messageboard-detail').style.display = 'block';
        document.getElementById('messageboard-reply-form').style.display = 'none';
    }

    submitReply() {
        const body = document.getElementById('mb-reply-body').value.trim();

        if (!body) {
            this.ui.showError('Please enter a reply message');
            return;
        }

        const locationId = `${this.currentLocation.type}_${this.currentLocation.name}`;
        const author = this.gameState.gameData.name;

        const result = this.messageBoard.replyToMessage(locationId, this.currentReplyMessageId, author, body);

        if (result.success) {
            this.ui.addMessage('Reply posted successfully!', 'success');
            this.hideReplyForm();
            this.viewMessage(this.currentReplyMessageId);
        } else {
            this.ui.showError(result.error);
        }
    }

    deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }

        const locationId = `${this.currentLocation.type}_${this.currentLocation.name}`;
        const result = this.messageBoard.deleteMessage(locationId, messageId, this.gameState.currentUser);

        if (result.success) {
            this.ui.addMessage('Message deleted', 'info');
            this.backToMessageList();
        } else {
            this.ui.showError(result.error);
        }
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return new Date(timestamp).toLocaleDateString();
    }

    // ===== COMPUTER INTERFACE METHODS =====

    showComputer() {
        this.ui.showView('computer');

        // Load computer data for current user
        this.computer.load(this.gameState.currentUser);

        // Display current sector intel by default
        this.displayCurrentSectorIntel();

        // Refresh all computer displays
        this.refreshComputerDisplays();
    }

    switchComputerTab(tabName) {
        this.currentComputerTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.comp-tab').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`comp-nav-${tabName}`).classList.add('active');

        // Update panels
        document.querySelectorAll('.comp-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`comp-${tabName}`).classList.add('active');

        // Refresh the active panel
        this.refreshComputerDisplays();
    }

    refreshComputerDisplays() {
        const tab = this.currentComputerTab;

        if (tab === 'navigation') {
            // Navigation panel is interactive, no auto-refresh needed
        } else if (tab === 'intel') {
            this.displayCurrentSectorIntel();
        } else if (tab === 'bookmarks') {
            this.displayBookmarks();
            this.displayNotes();
        } else if (tab === 'fighters') {
            this.displayFighterSummary();
        } else if (tab === 'colonies') {
            this.displayColonies();
            this.displayColonyStats();
        }
    }

    // Navigation Computer Methods
    calculateRoute() {
        const destSector = parseInt(document.getElementById('nav-dest-sector').value);

        if (!destSector || isNaN(destSector)) {
            this.ui.showError('Please enter a valid sector ID');
            return;
        }

        const currentSector = this.gameState.gameData.currentSector;
        const route = this.navigation.calculateRoute(currentSector, destSector, this.gameState.gameData.ship);

        const display = document.getElementById('nav-route-display');

        if (!route.success) {
            display.innerHTML = `<div class="route-info"><p style="color: #ff4444;">❌ ${route.error}</p></div>`;
            return;
        }

        const canAfford = route.canAfford ? '✅ Sufficient fuel' : '❌ Insufficient fuel';
        const pathStr = route.path.join(' → ');

        display.innerHTML = `
            <div class="route-info">
                <h5>Route Found!</h5>
                <p><strong>Jumps:</strong> ${route.jumps}</p>
                <p><strong>Distance:</strong> ${route.totalDistance} units</p>
                <p><strong>Fuel Needed:</strong> ${route.fuelNeeded} units ${canAfford}</p>
                <p><strong>Turns Required:</strong> ${route.turns}</p>
                <div class="route-path">${pathStr}</div>
            </div>
        `;

        this.audio.playSfx('success');
    }

    findNearest(type) {
        const currentSector = this.gameState.gameData.currentSector;
        let result;

        if (type === 'planet') {
            result = this.navigation.findNearest(currentSector, 'planet');
        } else if (type === 'station') {
            result = this.navigation.findNearest(currentSector, 'station');
        } else if (type === 'military') {
            result = this.navigation.findNearest(currentSector, 'station', { portClass: 'Military' });
        } else if (type === 'blackmarket') {
            result = this.navigation.findNearest(currentSector, 'station', { portClass: 'Black Market' });
        }

        const display = document.getElementById('nav-nearest-display');

        if (!result) {
            display.innerHTML = `<div class="location-info"><p style="color: #ff4444;">❌ No ${type} found</p></div>`;
            return;
        }

        const content = result.content;
        display.innerHTML = `
            <div class="location-info">
                <h5>${content.name || content.class || 'Unknown'}</h5>
                <p><strong>Sector:</strong> ${result.sector.id} (${result.sector.x}, ${result.sector.y})</p>
                <p><strong>Distance:</strong> ${Math.round(result.distance)} units</p>
                <p><strong>Jumps:</strong> ${result.jumps}</p>
                ${content.class ? `<p><strong>Class:</strong> ${content.class}</p>` : ''}
                ${content.planetType ? `<p><strong>Type:</strong> ${content.planetType}</p>` : ''}
                ${content.specialty ? `<p><strong>Specialty:</strong> ${content.specialty}</p>` : ''}
            </div>
        `;

        this.audio.playSfx('success');
    }

    findTradeRoute() {
        const maxJumps = parseInt(document.getElementById('nav-trade-jumps').value) || 10;
        const currentSector = this.gameState.gameData.currentSector;
        const ship = this.gameState.gameData.ship;

        const route = this.navigation.findTradeRoute(currentSector, ship, maxJumps);

        const display = document.getElementById('nav-trade-display');

        if (!route) {
            display.innerHTML = `<div class="trade-info"><p style="color: #ff4444;">❌ No profitable trade routes found within ${maxJumps} jumps</p></div>`;
            return;
        }

        display.innerHTML = `
            <div class="trade-info">
                <h5>Best Trade Route Found!</h5>
                <p><strong>Commodity:</strong> ${route.commodity}</p>
                <p><strong>Buy at:</strong> ${route.buy.planet.name} (Sector ${route.buy.sector.id})</p>
                <p><strong>Buy Price:</strong> ${Utils.format.credits(route.buy.price)} each</p>
                <p><strong>Available:</strong> ${route.buy.available} units</p>
                <p><strong>Sell at:</strong> ${route.sell.planet.name} (Sector ${route.sell.sector.id})</p>
                <p><strong>Sell Price:</strong> ${Utils.format.credits(route.sell.price)} each</p>
                <p><strong>Quantity:</strong> ${route.quantity} units</p>
                <p><strong>Investment:</strong> ${Utils.format.credits(route.investment)}</p>
                <p><strong>Revenue:</strong> ${Utils.format.credits(route.revenue)}</p>
                <p><strong>Profit:</strong> <span style="color: #00ff88; font-weight: bold;">${Utils.format.credits(route.profit)}</span></p>
                <p><strong>Profit Margin:</strong> ${route.profitMargin}%</p>
                <p><strong>Total Jumps:</strong> ${route.totalJumps}</p>
                <p><strong>Profit per Jump:</strong> ${Utils.format.credits(route.profitPerJump)}</p>
            </div>
        `;

        this.audio.playSfx('success');
    }

    // Intel Computer Methods
    displayCurrentSectorIntel() {
        const currentSector = this.gameState.gameData.currentSector;
        const analysis = this.navigation.analyzeSector(currentSector);

        const display = document.getElementById('intel-current-display');

        if (!analysis) {
            display.innerHTML = '<p>Unable to analyze current sector</p>';
            return;
        }

        let html = `
            <div class="intel-stat">
                <span class="intel-label">Sector ID:</span>
                <span class="intel-value">${analysis.id}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Warp Connections:</span>
                <span class="intel-value">${analysis.connections}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Contents:</span>
                <span class="intel-value">${analysis.contents.length} objects</span>
            </div>
        `;

        if (analysis.contents.length > 0) {
            html += '<h5 style="color: var(--accent-blue); margin-top: 15px;">Sector Contents:</h5>';
            analysis.contents.forEach(c => {
                html += `
                    <div class="intel-stat">
                        <span class="intel-label">${c.type}: ${c.name || c.class || 'Unknown'}</span>
                        <span class="intel-value">✓</span>
                    </div>
                `;
            });
        }

        html += `
            <h5 style="color: var(--accent-blue); margin-top: 15px;">Nearby (3 jumps):</h5>
            <div class="intel-stat">
                <span class="intel-label">Planets:</span>
                <span class="intel-value">${analysis.nearby.planets}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Stations:</span>
                <span class="intel-value">${analysis.nearby.stations}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Total Sectors:</span>
                <span class="intel-value">${analysis.nearby.total}</span>
            </div>
        `;

        display.innerHTML = html;
    }

    analyzeGalaxy() {
        const analysis = this.computer.analyzeGalaxy(this.galaxy);

        if (!analysis) {
            this.ui.showError('Unable to analyze galaxy');
            return;
        }

        const display = document.getElementById('intel-galaxy-display');

        let html = `
            <h5 style="color: var(--accent-green);">Galaxy Overview</h5>
            <div class="intel-stat">
                <span class="intel-label">Galaxy Size:</span>
                <span class="intel-value">${analysis.size} sectors</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Seed:</span>
                <span class="intel-value">${analysis.seed}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Created:</span>
                <span class="intel-value">${new Date(analysis.created).toLocaleDateString()}</span>
            </div>

            <h5 style="color: var(--accent-green); margin-top: 15px;">Sectors</h5>
            <div class="intel-stat">
                <span class="intel-label">Total:</span>
                <span class="intel-value">${analysis.sectors.total}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">With Content:</span>
                <span class="intel-value">${analysis.sectors.withContent}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Empty:</span>
                <span class="intel-value">${analysis.sectors.empty} (${analysis.sectors.percentEmpty}%)</span>
            </div>

            <h5 style="color: var(--accent-green); margin-top: 15px;">Contents</h5>
            <div class="intel-stat">
                <span class="intel-label">Planets:</span>
                <span class="intel-value">${analysis.contents.planets}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Stations:</span>
                <span class="intel-value">${analysis.contents.stations}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Debris Fields:</span>
                <span class="intel-value">${analysis.contents.debris}</span>
            </div>

            <h5 style="color: var(--accent-green); margin-top: 15px;">Connectivity</h5>
            <div class="intel-stat">
                <span class="intel-label">Average Connections:</span>
                <span class="intel-value">${analysis.connectivity.average}</span>
            </div>
            <div class="intel-stat">
                <span class="intel-label">Min/Max:</span>
                <span class="intel-value">${analysis.connectivity.min} / ${analysis.connectivity.max}</span>
            </div>
        `;

        display.innerHTML = html;
        this.audio.playSfx('success');
    }

    // Bookmarks Methods
    displayBookmarks() {
        const bookmarks = this.computer.bookmarks;
        const display = document.getElementById('bookmark-display');

        if (bookmarks.length === 0) {
            display.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No bookmarks yet</p>';
            return;
        }

        let html = '';
        bookmarks.forEach(bookmark => {
            html += `
                <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
                    <button class="bookmark-remove" onclick="window.game.removeBookmark('${bookmark.id}')">✕</button>
                    <div class="bookmark-name">${bookmark.name}</div>
                    <div class="bookmark-sector">Sector ${bookmark.sectorId}</div>
                    ${bookmark.notes ? `<div class="bookmark-notes">${bookmark.notes}</div>` : ''}
                    <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                        Added ${new Date(bookmark.created).toLocaleDateString()}
                    </div>
                </div>
            `;
        });

        display.innerHTML = html;
    }

    addBookmark() {
        const sectorId = parseInt(document.getElementById('bookmark-sector').value);
        const name = document.getElementById('bookmark-name').value.trim();
        const notes = document.getElementById('bookmark-notes').value.trim();

        if (!sectorId || isNaN(sectorId)) {
            this.ui.showError('Please enter a valid sector ID');
            return;
        }

        if (!name) {
            this.ui.showError('Please enter a bookmark name');
            return;
        }

        this.computer.addBookmark(sectorId, name, notes);
        this.computer.save(this.gameState.currentUser);

        this.ui.addMessage(`Bookmark "${name}" created for Sector ${sectorId}`, 'success');
        this.audio.playSfx('success');

        // Clear form
        document.getElementById('bookmark-sector').value = '';
        document.getElementById('bookmark-name').value = '';
        document.getElementById('bookmark-notes').value = '';

        this.displayBookmarks();
    }

    removeBookmark(bookmarkId) {
        if (!confirm('Remove this bookmark?')) return;

        this.computer.removeBookmark(bookmarkId);
        this.computer.save(this.gameState.currentUser);

        this.ui.addMessage('Bookmark removed', 'info');
        this.displayBookmarks();
    }

    displayNotes() {
        const currentSector = this.gameState.gameData.currentSector;
        const notes = this.computer.getNotes(currentSector);

        const display = document.getElementById('notes-display');

        if (notes.length === 0) {
            display.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No notes for current sector</p>';
            return;
        }

        let html = `<h5 style="color: var(--accent-blue); margin-bottom: 10px;">Sector ${currentSector} Notes:</h5>`;
        notes.forEach(note => {
            html += `
                <div class="note-item">
                    <div class="note-text">${note.text}</div>
                    <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                        ${new Date(note.timestamp).toLocaleString()}
                    </div>
                </div>
            `;
        });

        display.innerHTML = html;
    }

    // Fighter Methods
    deployFighters() {
        const quantity = parseInt(document.getElementById('fighter-quantity').value);

        if (!quantity || quantity <= 0) {
            this.ui.showError('Please enter a valid quantity');
            return;
        }

        const sectorId = this.gameState.gameData.currentSector;
        const owner = this.gameState.gameData.name;
        const credits = this.gameState.gameData.credits;

        const result = this.fighters.deployFighters(sectorId, owner, quantity, credits);

        if (result.success) {
            this.gameState.gameData.credits -= result.cost;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Deployed ${result.deployed} fighters in Sector ${sectorId} for ${Utils.format.credits(result.cost)}`, 'success');
            this.audio.playSfx('success');

            this.displayFighterSummary();
        } else {
            this.ui.showError(result.error);
        }
    }

    deployMines() {
        const quantity = parseInt(document.getElementById('mine-quantity').value);

        if (!quantity || quantity <= 0) {
            this.ui.showError('Please enter a valid quantity');
            return;
        }

        const sectorId = this.gameState.gameData.currentSector;
        const owner = this.gameState.gameData.name;
        const credits = this.gameState.gameData.credits;

        const result = this.fighters.deployMines(sectorId, owner, quantity, credits);

        if (result.success) {
            this.gameState.gameData.credits -= result.cost;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Deployed ${result.deployed} mines in Sector ${sectorId} for ${Utils.format.credits(result.cost)}`, 'success');
            this.audio.playSfx('success');

            this.displayFighterSummary();
        } else {
            this.ui.showError(result.error);
        }
    }

    refreshFighters() {
        this.displayFighterSummary();
        this.ui.addMessage('Fighter deployments refreshed', 'info');
    }

    displayFighterSummary() {
        const playerName = this.gameState.gameData.name;
        const summary = this.fighters.getPlayerFighterSummary(playerName);

        const display = document.getElementById('fighter-display');

        if (summary.totalFighters === 0 && summary.totalMines === 0) {
            display.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No fighters or mines deployed</p>';
            return;
        }

        let html = `
            <div style="padding: 15px; background: var(--bg-medium); border-radius: 4px; margin-bottom: 15px;">
                <h5 style="color: var(--accent-green);">Total Deployments</h5>
                <p><strong>Fighters:</strong> ${summary.totalFighters} (${Utils.format.credits(summary.totalFighters * this.fighters.FIGHTER_COST)} value)</p>
                <p><strong>Mines:</strong> ${summary.totalMines} (${Utils.format.credits(summary.totalMines * this.fighters.MINE_COST)} value)</p>
                <p><strong>Total Value:</strong> ${Utils.format.credits(summary.totalValue)}</p>
            </div>
            <h5 style="color: var(--accent-blue);">Deployment Locations</h5>
        `;

        summary.locations.forEach(loc => {
            html += `
                <div class="fighter-location">
                    <div class="fighter-location-info">
                        <div class="fighter-location-sector">Sector ${loc.sectorId}</div>
                        <div class="fighter-location-counts">
                            Fighters: ${loc.fighters} | Mines: ${loc.mines}
                        </div>
                    </div>
                </div>
            `;
        });

        display.innerHTML = html;
    }

    // Colony Methods
    launchGenesis() {
        const sectorId = this.gameState.gameData.currentSector;
        const owner = this.gameState.currentUser;
        const pilotName = this.gameState.gameData.name;
        const credits = this.gameState.gameData.credits;

        const result = this.colonization.createColony(this.galaxy, sectorId, owner, pilotName, credits);

        if (result.success) {
            this.gameState.gameData.credits -= result.cost;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Genesis torpedo launched! Created ${result.colony.planetName} in Sector ${sectorId}`, 'success');
            this.audio.playSfx('success');

            // Refresh sector view to show new planet
            if (this.ui.currentView === 'sector') {
                const sector = this.gameState.getCurrentSector();
                this.ui.displaySector(sector, this.gameState);
            }

            this.displayColonies();
            this.displayColonyStats();
        } else {
            this.ui.showError(result.error);
        }
    }

    refreshColonies() {
        this.displayColonies();
        this.displayColonyStats();
        this.ui.addMessage('Colony data refreshed', 'info');
    }

    displayColonies() {
        const owner = this.gameState.currentUser;
        const colonies = this.colonization.getPlayerColonies(owner);

        const display = document.getElementById('colony-display');

        if (colonies.length === 0) {
            display.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No colonies established yet</p>';
            return;
        }

        let html = '';

        colonies.forEach(colony => {
            const pendingIncome = this.colonization.getPendingIncome(owner);
            const timeSince = Date.now() - colony.lastCollection;
            const daysElapsed = (timeSince / (24 * 60 * 60 * 1000)).toFixed(2);

            html += `
                <div class="colony-item">
                    <div class="colony-header">
                        <div class="colony-name">${colony.planetName}</div>
                        <div class="colony-level">Level ${colony.level}</div>
                    </div>
                    <div class="colony-info">
                        <div class="colony-stat">
                            <div class="colony-stat-label">Sector</div>
                            <div class="colony-stat-value">${colony.sectorId}</div>
                        </div>
                        <div class="colony-stat">
                            <div class="colony-stat-label">Population</div>
                            <div class="colony-stat-value">${Utils.format.number(colony.population)}</div>
                        </div>
                        <div class="colony-stat">
                            <div class="colony-stat-label">Income/Day</div>
                            <div class="colony-stat-value">${Utils.format.credits(colony.income)}</div>
                        </div>
                        <div class="colony-stat">
                            <div class="colony-stat-label">Total Earned</div>
                            <div class="colony-stat-value">${Utils.format.credits(colony.totalEarned)}</div>
                        </div>
                        <div class="colony-stat">
                            <div class="colony-stat-label">Days Since Collection</div>
                            <div class="colony-stat-value">${daysElapsed}</div>
                        </div>
                    </div>
                    <div class="colony-actions">
                        <button onclick="window.game.collectColonyIncome('${colony.id}')">
                            Collect Income
                        </button>
                        <button class="upgrade" onclick="window.game.upgradeColony('${colony.id}', 'income')">
                            Upgrade Income
                        </button>
                        <button class="upgrade" onclick="window.game.upgradeColony('${colony.id}', 'population')">
                            Upgrade Population
                        </button>
                    </div>
                </div>
            `;
        });

        display.innerHTML = html;
    }

    collectColonyIncome(colonyId) {
        const owner = this.gameState.currentUser;
        const result = this.colonization.collectIncome(colonyId, owner);

        if (result.success) {
            this.gameState.gameData.credits += result.income;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Collected ${Utils.format.credits(result.income)} from colony (${result.daysElapsed} days)`, 'success');
            this.audio.playSfx('success');

            this.displayColonies();
            this.displayColonyStats();
        } else {
            this.ui.showError(result.error);
        }
    }

    collectAllIncome() {
        const owner = this.gameState.currentUser;
        const result = this.colonization.collectAllIncome(owner);

        if (result.success) {
            this.gameState.gameData.credits += result.totalIncome;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Collected ${Utils.format.credits(result.totalIncome)} from ${result.coloniesCollected} colonies`, 'success');
            this.audio.playSfx('success');

            this.displayColonies();
            this.displayColonyStats();
        } else {
            this.ui.showError('No income available to collect');
        }
    }

    upgradeColony(colonyId, upgradeType) {
        const owner = this.gameState.currentUser;
        const credits = this.gameState.gameData.credits;

        const result = this.colonization.upgradeColony(colonyId, owner, upgradeType, credits);

        if (result.success) {
            this.gameState.gameData.credits -= result.cost;
            this.gameState.save();
            this.updateUI();

            this.ui.addMessage(`Colony upgraded! ${upgradeType} now level ${result.newLevel}`, 'success');
            this.audio.playSfx('success');

            this.displayColonies();
            this.displayColonyStats();
        } else {
            this.ui.showError(result.error);
        }
    }

    displayColonyStats() {
        const owner = this.gameState.currentUser;
        const stats = this.colonization.getColonyStats(owner);

        const display = document.getElementById('colony-stats-display');

        let html = `
            <div class="colony-stats-grid">
                <div class="colony-stats-item">
                    <h5>Colonies</h5>
                    <div class="value">${stats.totalColonies} / ${stats.maxColonies}</div>
                </div>
                <div class="colony-stats-item">
                    <h5>Total Population</h5>
                    <div class="value">${Utils.format.number(stats.totalPopulation)}</div>
                </div>
                <div class="colony-stats-item">
                    <h5>Daily Income</h5>
                    <div class="value">${Utils.format.credits(stats.totalIncome)}</div>
                </div>
                <div class="colony-stats-item">
                    <h5>Pending Income</h5>
                    <div class="value" style="color: var(--accent-green);">${Utils.format.credits(stats.pendingIncome)}</div>
                </div>
                <div class="colony-stats-item">
                    <h5>Total Earned</h5>
                    <div class="value">${Utils.format.credits(stats.totalEarned)}</div>
                </div>
                <div class="colony-stats-item">
                    <h5>Average Level</h5>
                    <div class="value">${stats.averageLevel}</div>
                </div>
            </div>
        `;

        display.innerHTML = html;
    }

    // ===== ALPHA TESTER METHODS =====

    toggleAlphaTester() {
        const panel = document.getElementById('alpha-tester-panel');
        this.alphaTesterVisible = !this.alphaTesterVisible;

        if (this.alphaTesterVisible) {
            panel.classList.add('active');
            this.renderAlphaTester();
            this.audio.playSfx('click');
        } else {
            panel.classList.remove('active');
        }
    }

    renderAlphaTester() {
        const testList = document.getElementById('alpha-test-list');
        const completion = this.alphaTester.getCompletion();

        // Update completion percentage
        document.getElementById('alpha-completion').textContent = `${completion}% Complete`;

        let html = '';

        // Render each category
        for (const [categoryName, tests] of Object.entries(this.alphaTester.testCategories)) {
            // Count completion for this category
            const categoryTotal = tests.length;
            const categoryCompleted = tests.filter(test => this.alphaTester.getTest(test.id)).length;

            html += `
                <div class="test-category">
                    <div class="test-category-header" onclick="window.game.toggleCategory(this)">
                        <span class="test-category-name">${categoryName}</span>
                        <span class="test-category-count">${categoryCompleted}/${categoryTotal}</span>
                        <span class="test-category-arrow">▼</span>
                    </div>
                    <div class="test-items">
            `;

            // Render tests in category
            tests.forEach(test => {
                const result = this.alphaTester.getTest(test.id);
                const statusClass = result ? result.status : '';
                const notes = result ? result.notes : '';

                html += `
                    <div class="test-item ${statusClass}" data-test-id="${test.id}">
                        <div class="test-header">
                            <div class="test-name">${test.name}</div>
                            <div class="test-importance ${test.importance}">${test.importance}</div>
                        </div>
                        <div class="test-description">${test.test}</div>
                        <div class="test-expected">Expected: ${test.expected}</div>
                        <div class="test-actions">
                            <button class="test-btn test-btn-pass" onclick="window.game.recordTestResult('${test.id}', 'pass')">✅ Pass</button>
                            <button class="test-btn test-btn-fail" onclick="window.game.recordTestResult('${test.id}', 'fail')">❌ Fail</button>
                            <button class="test-btn test-btn-skip" onclick="window.game.recordTestResult('${test.id}', 'skip')">⏭️ Skip</button>
                        </div>
                        <div class="test-notes">
                            <textarea placeholder="Notes (required for fail/skip)..." onchange="window.game.updateTestNotes('${test.id}', this.value)">${notes}</textarea>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        testList.innerHTML = html;
    }

    toggleCategory(headerElement) {
        const category = headerElement.parentElement;
        category.classList.toggle('collapsed');
    }

    recordTestResult(testId, status) {
        const testItem = document.querySelector(`[data-test-id="${testId}"]`);
        const notesTextarea = testItem.querySelector('textarea');
        const notes = notesTextarea ? notesTextarea.value.trim() : '';

        // Require notes for fail/skip
        if ((status === 'fail' || status === 'skip') && !notes) {
            this.ui.showError('Please add notes explaining the issue');
            return;
        }

        // Record the test result
        this.alphaTester.recordTest(testId, status, notes);

        // Update UI
        testItem.classList.remove('pass', 'fail', 'skip');
        testItem.classList.add(status);

        // Update completion percentage
        const completion = this.alphaTester.getCompletion();
        document.getElementById('alpha-completion').textContent = `${completion}% Complete`;

        // Update category count
        const category = testItem.closest('.test-category');
        const categoryTests = category.querySelectorAll('.test-item');
        const categoryCompleted = category.querySelectorAll('.test-item.pass, .test-item.fail, .test-item.skip').length;
        const categoryCount = category.querySelector('.test-category-count');
        categoryCount.textContent = `${categoryCompleted}/${categoryTests.length}`;

        this.audio.playSfx('success');
    }

    updateTestNotes(testId, notes) {
        const result = this.alphaTester.getTest(testId);
        if (result) {
            this.alphaTester.recordTest(testId, result.status, notes);
        }
    }

    exportAlphaResults() {
        try {
            this.alphaTester.exportResults();
            this.ui.addMessage('Test results exported successfully', 'success');
            this.audio.playSfx('success');
        } catch (error) {
            this.ui.showError('Failed to export results: ' + error.message);
        }
    }

    clearAlphaResults() {
        if (!confirm('Clear all test results? This cannot be undone.')) {
            return;
        }

        this.alphaTester.clearResults();
        this.renderAlphaTester();
        this.ui.addMessage('All test results cleared', 'info');
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, creating Game instance...');
        window.game = new Game();
        console.log('Game instance created successfully:', window.game);
    } catch (error) {
        console.error('Failed to initialize game:', error);
        console.error('Error stack:', error.stack);
        alert('Failed to initialize game. Check console for details.');
    }
});
