// Ad Astra - UI Management
// ui.js - UI rendering and update functions

import { Utils } from './utils.js';
import ShipManager from './ship.js';

export class UI {
    constructor() {
        this.currentView = 'sector';
        this.messageContainer = document.getElementById('message-container');
    }

    // Switch between screens
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        const targetScreen = document.getElementById(`${screenId}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'block';
        } else {
            console.error(`Screen not found: ${screenId}-screen`);
        }
    }

    // Switch between view panels
    showView(viewId) {
        document.querySelectorAll('.view-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        const targetPanel = document.getElementById(`${viewId}-view`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.style.display = 'block';

            // Special handling for galaxy view
            if (viewId === 'galaxy') {
                if (window.game && window.game.galaxy && window.game.galaxy.data && window.game.gameState && window.game.gameState.gameData) {
                    this.renderGalaxyMap(window.game.galaxy.data, window.game.gameState.gameData.currentSector, window.game.gameState.gameData.ship);
                } else {
                    console.warn('Galaxy data not ready for rendering yet.');
                    const mapContainer = document.getElementById('galaxy-map');
                    if (mapContainer) mapContainer.innerHTML = '<p style="padding: 20px; color: var(--text-secondary);">Loading galaxy data...</p>';
                }
            }
        } else {
            console.error(`View not found: ${viewId}-view`);
        }
        this.currentView = viewId;
    }

    // Render Galaxy Map with zoom and pan
    renderGalaxyMap(galaxyData, currentSectorId, ship = null) {
        const container = document.getElementById('galaxy-map');
        if (!container || !galaxyData) return;

        container.innerHTML = '';
        const sectors = galaxyData.sectors;

        // Initialize zoom state if not exists
        if (!this.galaxyMapState) {
            this.galaxyMapState = {
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
                isDragging: false,
                lastX: 0,
                lastY: 0
            };
        }

        // Create inner container for zoom/pan
        const mapInner = document.createElement('div');
        mapInner.id = 'galaxy-map-inner';
        mapInner.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            transform-origin: center center;
        `;
        container.appendChild(mapInner);

        // Draw connections first (so they are behind nodes)
        const drawnConnections = new Set();

        Object.values(sectors).forEach(sector => {
            sector.warps.forEach(targetId => {
                // Avoid drawing twice
                const connectionId = [sector.id, targetId].sort().join('-');
                if (drawnConnections.has(connectionId)) return;
                drawnConnections.add(connectionId);

                const target = sectors[targetId];
                this.drawConnection(mapInner, sector, target);
            });
        });

        // Find current sector for centering
        const currentSector = sectors[currentSectorId];

        // Draw sector nodes
        Object.values(sectors).forEach(sector => {
            const node = document.createElement('div');
            node.className = 'sector-node';

            // Assign star type for visual variety (deterministic based on sector ID)
            const starTypes = ['star-red-giant', 'star-red-dwarf', 'star-yellow', 'star-white-dwarf', 'star-blue-giant'];
            const starTypeIndex = sector.id % starTypes.length;
            node.classList.add(starTypes[starTypeIndex]);

            // Position (0-100 coordinate system)
            // Adjust offset based on star size
            const sizeOffset = sector.id == currentSectorId ? 25 : (starTypeIndex === 0 ? 9 : starTypeIndex === 3 ? 4 : 6);
            node.style.left = `calc(${sector.x}% - ${sizeOffset}px)`;
            node.style.top = `calc(${sector.y}% - ${sizeOffset}px)`;

            // Styling based on content
            if (sector.id == currentSectorId) {
                node.classList.add('current');
                node.style.zIndex = '30';
            }

            const hasPlanet = sector.contents.some(c => c.type === 'planet');
            const hasStation = sector.contents.some(c => c.type === 'station');

            if (hasPlanet) node.classList.add('has-planet');
            if (hasStation) node.classList.add('has-station');

            // Tooltip
            let tooltip = `Sector ${sector.id}`;
            if (hasPlanet) tooltip += '\n🪐 Planet';
            if (hasStation) tooltip += '\n⛽ Station';
            if (sector.id == currentSectorId) tooltip += '\n📍 You are here';

            // Calculate distance and fuel
            let fuelCost = 0;
            let travelTime = 0;
            let isReachable = true;
            let hasWarpLane = false;

            if (ship && sector.id != currentSectorId) {
                const currentSector = galaxyData.sectors[currentSectorId];
                if (currentSector) {
                    // Check if there's a warp lane connection
                    hasWarpLane = currentSector.warps.includes(sector.id);

                    const dist = Utils.distance(currentSector.x, currentSector.y, sector.x, sector.y);
                    fuelCost = ShipManager.calculateFuelCost(dist);
                    travelTime = ShipManager.calculateTravelTime(dist, ship.speed);

                    tooltip += `\n⛽ Fuel Cost: ${fuelCost}`;
                    tooltip += `\n⏱️ Travel Time: ${(travelTime / 1000).toFixed(1)}s`;

                    // Check warp lane first
                    if (!hasWarpLane) {
                        isReachable = false;
                        node.classList.add('unreachable');
                        node.classList.add('no-warp-lane');
                        tooltip += '\n⚠️ No warp lane!';
                    } else if (fuelCost > ship.fuel) {
                        isReachable = false;
                        node.classList.add('unreachable');
                        tooltip += '\n⚠️ Not enough fuel!';
                    } else {
                        node.classList.add('reachable');
                    }
                }
            }

            node.title = tooltip;

            // Click to warp
            node.onclick = () => {
                if (window.game) {
                    if (sector.id == currentSectorId) return;

                    // Check warp lane first
                    if (!hasWarpLane && sector.id != currentSectorId) {
                        window.game.ui.showError('No warp lane to this sector! You can only travel to connected sectors.');
                        return;
                    }

                    if (!isReachable) {
                        window.game.ui.showError('Not enough fuel to reach this sector!');
                        return;
                    }

                    if (confirm(`Warp to Sector ${sector.id}?\nCost: ${fuelCost} Fuel\nTime: ${(travelTime / 1000).toFixed(1)}s`)) {
                        window.game.warpToSector(sector.id);
                    }
                }
            };

            mapInner.appendChild(node);
        });

        // Auto-center on current location
        if (currentSector) {
            // Calculate offset to center current sector
            // Convert sector position (0-100%) to center of container
            const centerX = 50 - currentSector.x;
            const centerY = 50 - currentSector.y;

            this.galaxyMapState.offsetX = centerX;
            this.galaxyMapState.offsetY = centerY;
        }

        // Apply initial transform
        this.updateGalaxyMapTransform(mapInner);

        // Add zoom controls overlay
        this.addGalaxyMapControls(container);

        // Add event listeners for zoom and pan
        this.setupGalaxyMapInteraction(container, mapInner);
    }

    // Update galaxy map transform
    updateGalaxyMapTransform(mapInner) {
        const state = this.galaxyMapState;
        mapInner.style.transform = `translate(${state.offsetX}%, ${state.offsetY}%) scale(${state.zoom})`;
    }

    // Add zoom controls
    addGalaxyMapControls(container) {
        const controls = document.createElement('div');
        controls.id = 'galaxy-map-controls';
        controls.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            z-index: 100;
        `;

        const buttonStyle = `
            background: var(--bg-medium);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            width: 40px;
            height: 40px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;

        // Zoom in button
        const zoomIn = document.createElement('button');
        zoomIn.innerHTML = '+';
        zoomIn.style.cssText = buttonStyle;
        zoomIn.title = 'Zoom In';
        zoomIn.onclick = () => this.zoomGalaxyMap(0.2);

        // Zoom out button
        const zoomOut = document.createElement('button');
        zoomOut.innerHTML = '−';
        zoomOut.style.cssText = buttonStyle;
        zoomOut.title = 'Zoom Out';
        zoomOut.onclick = () => this.zoomGalaxyMap(-0.2);

        // Reset button
        const reset = document.createElement('button');
        reset.innerHTML = '⌂';
        reset.style.cssText = buttonStyle;
        reset.title = 'Reset View';
        reset.onclick = () => this.resetGalaxyMapView();

        controls.appendChild(zoomIn);
        controls.appendChild(zoomOut);
        controls.appendChild(reset);

        container.appendChild(controls);
    }

    // Setup interaction handlers
    setupGalaxyMapInteraction(container, mapInner) {
        // Mouse wheel zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomGalaxyMap(delta);
        }, { passive: false });

        // Touch/pinch zoom
        let initialDistance = 0;
        let initialZoom = 1;

        container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                initialZoom = this.galaxyMapState.zoom;
            }
        });

        container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                const scale = currentDistance / initialDistance;
                this.galaxyMapState.zoom = Math.max(0.5, Math.min(5, initialZoom * scale));
                this.updateGalaxyMapTransform(mapInner);
            }
        }, { passive: false });

        // Pan with mouse drag
        container.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('sector-node')) return;
            this.galaxyMapState.isDragging = true;
            this.galaxyMapState.lastX = e.clientX;
            this.galaxyMapState.lastY = e.clientY;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.galaxyMapState.isDragging) return;
            const dx = e.clientX - this.galaxyMapState.lastX;
            const dy = e.clientY - this.galaxyMapState.lastY;

            // Convert pixel movement to percentage based on container size
            const rect = container.getBoundingClientRect();
            this.galaxyMapState.offsetX += (dx / rect.width) * 100;
            this.galaxyMapState.offsetY += (dy / rect.height) * 100;

            this.galaxyMapState.lastX = e.clientX;
            this.galaxyMapState.lastY = e.clientY;
            this.updateGalaxyMapTransform(mapInner);
        });

        document.addEventListener('mouseup', () => {
            this.galaxyMapState.isDragging = false;
            container.style.cursor = 'default';
        });
    }

    // Zoom function
    zoomGalaxyMap(delta) {
        this.galaxyMapState.zoom = Math.max(0.5, Math.min(5, this.galaxyMapState.zoom + delta));
        const mapInner = document.getElementById('galaxy-map-inner');
        if (mapInner) {
            this.updateGalaxyMapTransform(mapInner);
        }
    }

    // Reset view
    resetGalaxyMapView() {
        // Re-render to reset to current location
        if (window.game && window.game.galaxy && window.game.galaxy.data && window.game.gameState && window.game.gameState.gameData) {
            this.galaxyMapState = null; // Reset state
            this.renderGalaxyMap(window.game.galaxy.data, window.game.gameState.gameData.currentSector, window.game.gameState.gameData.ship);
        }
    }

    // Helper to draw a line between two sectors
    drawConnection(container, s1, s2) {
        const line = document.createElement('div');
        line.className = 'warp-line';

        // Calculate length and angle
        const dx = s2.x - s1.x;
        const dy = s2.y - s1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // Set position and dimensions
        // We use percentage for responsiveness
        // Note: This is an approximation that works well if the container is square-ish
        // For perfect lines in responsive containers, SVG is better, but this fits the current CSS approach

        line.style.width = `${distance}%`;
        line.style.left = `${s1.x}%`;
        line.style.top = `${s1.y}%`;
        line.style.transform = `rotate(${angle}deg)`;

        container.appendChild(line);
    }

    // Switch auth forms
    showAuthForm(formName) {
        document.querySelectorAll('.form-section').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });
        const targetForm = document.getElementById(`${formName}-form`) || document.getElementById(formName);
        if (targetForm) {
            targetForm.classList.add('active');
            targetForm.style.display = 'block';
        } else {
            console.error(`Form not found: ${formName}`);
        }
    }

    // Update top bar info
    updateTopBar(gameState) {
        const summary = gameState.getPlayerSummary();
        if (!summary) return;

        document.getElementById('player-name-display').textContent = summary.pilotName;
        document.getElementById('credits-display').textContent =
            `Credits: ${Utils.format.credits(summary.credits)}`;
        document.getElementById('turns-display').textContent =
            `Turns: ${summary.turns}`;
    }

    // Display sector information
    displaySector(sector, gameState) {
        const sectorInfo = document.getElementById('sector-info');
        const sectorActions = document.getElementById('sector-actions');

        if (!sector) {
            sectorInfo.innerHTML = '<p>Invalid sector</p>';
            sectorActions.innerHTML = '';
            return;
        }

        // Build sector info HTML
        let html = `<h3>Sector ${sector.id}</h3>`;
        html += `<p class="text-secondary">Coordinates: (${sector.x.toFixed(1)}, ${sector.y.toFixed(1)})</p>`;

        if (sector.contents.length === 0) {
            html += '<p>Empty space. Nothing of interest here.</p>';
        } else {
            html += '<div class="sector-contents">';
            sector.contents.forEach(content => {
                html += this.createContentCard(content);
            });
            html += '</div>';
        }

        sectorInfo.innerHTML = html;

        // Build action buttons
        sectorActions.innerHTML = '';

        // Warp buttons
        if (sector.warps && sector.warps.length > 0) {
            const warpDiv = document.createElement('div');
            warpDiv.style.width = '100%';
            warpDiv.innerHTML = '<h4 style="color: var(--accent-blue); margin-bottom: 10px;">Warp to:</h4>';

            sector.warps.forEach(warpId => {
                const btn = document.createElement('button');
                btn.textContent = `Sector ${warpId}`;
                btn.onclick = () => window.game.warpToSector(warpId);
                btn.disabled = gameState.gameData.turns < 1;
                warpDiv.appendChild(btn);
            });

            sectorActions.appendChild(warpDiv);
        }

        // Content-specific actions
        sector.contents.forEach(content => {
            if (content.type === 'planet') {
                const btn = document.createElement('button');
                btn.textContent = `Trade at ${content.name}`;
                btn.onclick = () => window.game.showTrading(content);
                sectorActions.appendChild(btn);
            } else if (content.type === 'station') {
                const btn = document.createElement('button');
                btn.textContent = `Dock at ${content.name}`;
                btn.onclick = () => window.game.dockAtStation(content);
                sectorActions.appendChild(btn);
            }
        });
    }

    // Create content card HTML
    createContentCard(content) {
        const icons = {
            planet: '🌍',
            station: '🛰️',
            debris: '☄️'
        };

        let html = '<div class="content-card">';
        html += `<div class="content-card-icon">${icons[content.type] || '❓'}</div>`;
        html += `<div class="content-card-title">${content.name}</div>`;

        if (content.type === 'planet') {
            html += `<div class="content-card-desc">${content.planetType} Planet</div>`;
            html += `<div class="content-card-desc">Pop: ${Utils.format.number(content.population)}</div>`;
        } else if (content.type === 'station') {
            html += `<div class="content-card-desc">Services Available</div>`;
        } else if (content.description) {
            html += `<div class="content-card-desc">${content.description}</div>`;
        }

        html += '</div>';
        return html;
    }

    // Display ship stats
    displayShip(ship, cargo) {
        const shipStats = document.getElementById('ship-stats');
        const cargoList = document.getElementById('cargo-list');

        let html = '<div class="ship-stats-grid">';

        // Hull
        html += '<div class="stat-item">';
        html += '<div class="stat-label">Hull Integrity</div>';
        html += `<div class="stat-value">${ship.hull}/${ship.hullMax}</div>`;
        html += `<div class="stat-bar"><div class="stat-bar-fill ${ship.hull < ship.hullMax * 0.3 ? 'low' : ''}" style="width: ${(ship.hull / ship.hullMax) * 100}%"></div></div>`;
        html += '</div>';

        // Shields
        html += '<div class="stat-item">';
        html += '<div class="stat-label">Shields</div>';
        html += `<div class="stat-value">${ship.shields}/${ship.shieldsMax}</div>`;
        html += `<div class="stat-bar"><div class="stat-bar-fill" style="width: ${(ship.shields / ship.shieldsMax) * 100}%"></div></div>`;
        html += '</div>';

        // Weapons
        html += '<div class="stat-item">';
        html += '<div class="stat-label">Weapons</div>';
        html += `<div class="stat-value">${ship.weapons}</div>`;
        html += '</div>';

        // Fuel
        html += '<div class="stat-item">';
        html += '<div class="stat-label">Fuel</div>';
        html += `<div class="stat-value">${ship.fuel}/${ship.fuelMax}</div>`;
        html += `<div class="stat-bar"><div class="stat-bar-fill ${ship.fuel < ship.fuelMax * 0.2 ? 'low' : ''}" style="width: ${(ship.fuel / ship.fuelMax) * 100}%"></div></div>`;
        html += '</div>';

        // Cargo
        const totalCargo = Object.values(cargo).reduce((sum, q) => sum + q, 0);
        html += '<div class="stat-item">';
        html += '<div class="stat-label">Cargo</div>';
        html += `<div class="stat-value">${totalCargo}/${ship.cargoMax}</div>`;
        html += `<div class="stat-bar"><div class="stat-bar-fill" style="width: ${(totalCargo / ship.cargoMax) * 100}%"></div></div>`;
        html += '</div>';

        html += '</div>';
        shipStats.innerHTML = html;

        // Display cargo
        if (Object.keys(cargo).length === 0) {
            cargoList.innerHTML = '<div class="cargo-empty">Cargo hold is empty</div>';
        } else {
            let cargoHtml = '';
            for (const [commodity, quantity] of Object.entries(cargo)) {
                cargoHtml += '<div class="cargo-item">';
                cargoHtml += `<span class="cargo-item-name">${commodity}</span>`;
                cargoHtml += `<span class="cargo-item-quantity">${quantity} units</span>`;
                cargoHtml += '</div>';
            }
            cargoList.innerHTML = cargoHtml;
        }
    }

    // Display trading interface
    displayTrading(planet, gameState) {
        const tradeInterface = document.getElementById('trade-interface');

        if (!planet || !planet.economy) {
            tradeInterface.innerHTML = '<p>No trading available here.</p>';
            return;
        }

        let html = `<h3>Trading at ${planet.name}</h3>`;
        html += `<p class="text-secondary">${planet.planetType} Planet - Tech Level ${planet.techLevel}</p>`;
        html += '<div class="trade-grid">';

        for (const [commodity, eco] of Object.entries(planet.economy)) {
            const playerHas = gameState.getCargoAmount(commodity);

            html += '<div class="commodity-card">';
            html += '<div class="commodity-header">';
            html += `<span class="commodity-name">${commodity}</span>`;
            html += '</div>';
            html += `<p style="color: var(--text-secondary); margin: 10px 0;">Supply: ${eco.supply} units</p>`;
            html += `<p style="color: var(--text-secondary);">You have: ${playerHas} units</p>`;
            html += '<div style="margin: 15px 0;">';
            html += `<div style="color: var(--accent-green);">Buy: ${Utils.format.credits(eco.buyPrice)}/unit</div>`;
            html += `<div style="color: var(--accent-yellow);">Sell: ${Utils.format.credits(eco.sellPrice)}/unit</div>`;
            html += '</div>';

            html += '<div class="commodity-controls">';
            html += `<input type="number" id="trade-qty-${commodity}" min="0" value="10" style="width: 60px;">`;
            html += `<button class="btn-buy" onclick="window.game.buyCommodity('${commodity}')">Buy</button>`;
            html += `<button class="btn-sell" onclick="window.game.sellCommodity('${commodity}')">Sell</button>`;
            html += '</div>';

            html += '</div>';
        }

        html += '</div>';
        tradeInterface.innerHTML = html;
    }

    // Display combat interface
    displayCombat(combatStatus) {
        const combatInterface = document.getElementById('combat-interface');

        if (!combatStatus || !combatStatus.active) {
            combatInterface.innerHTML = '<p>No combat active</p>';
            return;
        }

        let html = '<div class="combat-status">';

        // Player
        html += '<div class="combatant player">';
        html += '<div class="combatant-name">Your Ship</div>';
        html += '<div class="combatant-hp">';
        html += `<div>Hull: ${combatStatus.player.hull}/${combatStatus.player.hullMax}</div>`;
        html += '<div class="hp-bar">';
        html += `<div class="hp-bar-fill ${combatStatus.player.hullPercent < 30 ? 'low' : ''}" style="width: ${combatStatus.player.hullPercent}%">${combatStatus.player.hullPercent}%</div>`;
        html += '</div>';
        html += `<div style="margin-top: 10px;">Shields: ${combatStatus.player.shields}/${combatStatus.player.shieldsMax}</div>`;
        html += '<div class="hp-bar">';
        html += `<div class="hp-bar-fill" style="width: ${combatStatus.player.shieldsPercent}%">${combatStatus.player.shieldsPercent}%</div>`;
        html += '</div>';
        html += '</div>';
        html += '</div>';

        // Enemy
        html += '<div class="combatant enemy">';
        html += `<div class="combatant-name">${combatStatus.enemy.name}</div>`;
        html += '<div class="combatant-hp">';
        html += `<div>Hull: ${combatStatus.enemy.hull}/${combatStatus.enemy.hullMax}</div>`;
        html += '<div class="hp-bar">';
        html += `<div class="hp-bar-fill ${combatStatus.enemy.hullPercent < 30 ? 'low' : ''}" style="width: ${combatStatus.enemy.hullPercent}%">${combatStatus.enemy.hullPercent}%</div>`;
        html += '</div>';
        html += `<div style="margin-top: 10px;">Shields: ${combatStatus.enemy.shields}/${combatStatus.enemy.shieldsMax}</div>`;
        html += '<div class="hp-bar">';
        html += `<div class="hp-bar-fill" style="width: ${combatStatus.enemy.shieldsPercent}%">${combatStatus.enemy.shieldsPercent}%</div>`;
        html += '</div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';

        // Combat actions
        html += '<div class="combat-actions">';
        html += '<button onclick="window.game.combatAttack()">🔫 Attack</button>';
        html += '<button onclick="window.game.combatFlee()">🏃 Flee</button>';
        html += '</div>';

        // Combat log
        html += '<div class="combat-log">';
        combatStatus.log.forEach(entry => {
            html += `<div class="combat-message ${entry.type}">${entry.message}</div>`;
        });
        html += '</div>';

        combatInterface.innerHTML = html;
    }

    // Display player statistics
    displayStats(gameData) {
        const container = document.getElementById('stats-container');
        if (!container || !gameData) return;

        const stats = gameData.stats;
        const createdDate = new Date(gameData.created).toLocaleDateString();
        const lastLoginDate = new Date(gameData.lastLogin).toLocaleString();

        let html = '<div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">';

        // Helper to create stat card
        const createCard = (label, value, icon = '📊') => `
            <div class="stat-card" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                <div style="font-size: 24px; margin-bottom: 10px;">${icon}</div>
                <div style="color: var(--text-secondary); font-size: 0.9em;">${label}</div>
                <div style="font-size: 1.2em; font-weight: bold; color: var(--accent-blue);">${value}</div>
            </div>
        `;

        html += createCard('Pilot Name', gameData.pilotName, '👨‍🚀');
        html += createCard('Rank', 'Ensign', '⭐'); // Placeholder for rank system
        html += createCard('Credits', Utils.format.credits(gameData.credits), '💳');
        html += createCard('Turns Available', gameData.turns, '⏳');
        html += createCard('Sectors Visited', stats.sectorsVisited, '🌌');
        html += createCard('Credits Earned', Utils.format.credits(stats.creditsEarned), '💰');
        html += createCard('Trades Completed', stats.tradesCompleted, '🤝');
        html += createCard('Combats Won', stats.combatsWon, '⚔️');
        html += createCard('Combats Lost', stats.combatsLost, '💀');
        html += createCard('Events Encountered', stats.eventsEncountered, '🎲');
        html += createCard('Commission Date', createdDate, '📅');
        html += createCard('Last Active', lastLoginDate, '🕒');

        html += '</div>';
        container.innerHTML = html;
    }

    // Add message to log
    addMessage(message, type = 'info') {
        const msgDiv = document.createElement('div');
        msgDiv.className = `log-message ${type}`;
        msgDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.messageContainer.appendChild(msgDiv);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;

        // Limit to 100 messages
        while (this.messageContainer.children.length > 100) {
            this.messageContainer.removeChild(this.messageContainer.firstChild);
        }
    }

    // Clear message log
    clearMessages() {
        this.messageContainer.innerHTML = '';
    }

    // Show modal dialog
    showModal(title, body, buttons) {
        // Simple modal implementation using alert for now
        alert(`${title}\n\n${body}`);
    }

    // Show error message
    showError(message) {
        this.addMessage(message, 'error');
        alert(message);
    }

    // Show success message
    showSuccess(message) {
        this.addMessage(message, 'success');
    }

    // Show travel overlay
    showTravelOverlay(duration, destinationId) {
        let overlay = document.getElementById('travel-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'travel-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: var(--accent-blue);
                font-family: 'Orbitron', sans-serif;
            `;
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <h2 style="font-size: 2em; margin-bottom: 20px;">Warping to Sector ${destinationId}...</h2>
            <div style="font-size: 4em; font-weight: bold;" id="travel-countdown"></div>
            <div style="margin-top: 20px; width: 300px; height: 4px; background: #333; border-radius: 2px;">
                <div id="travel-progress" style="width: 0%; height: 100%; background: var(--accent-blue); transition: width 0.1s linear;"></div>
            </div>
        `;
        overlay.style.display = 'flex';
    }

    // Update travel countdown
    updateTravelOverlay(timeLeft, progress) {
        const overlay = document.getElementById('travel-overlay');
        if (!overlay) return;

        const countdown = document.getElementById('travel-countdown');
        const progressBar = document.getElementById('travel-progress');

        if (countdown) countdown.textContent = (timeLeft / 1000).toFixed(1) + 's';
        if (progressBar) progressBar.style.width = `${progress}%`;
    }

    // Hide travel overlay
    hideTravelOverlay() {
        const overlay = document.getElementById('travel-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
}

export default UI;
