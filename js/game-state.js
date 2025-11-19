// Ad Astra - Game State Management
// game-state.js - Core game state and save/load functionality

import { Utils, CONSTANTS } from './utils.js';

export class GameState {
    constructor() {
        this.currentUser = null;
        this.gameData = null;
        this.galaxy = null;
        this.settings = null;
        this.load();
    }

    // Load game data from localStorage
    load() {
        this.currentUser = Utils.storage.get('currentUser');
        this.settings = Utils.storage.get('gameSettings', this.getDefaultSettings());

        if (this.currentUser) {
            this.gameData = Utils.storage.get(`player_${this.currentUser}`);
            this.galaxy = Utils.storage.get('galaxy');
        }
    }

    // Save current state to localStorage
    save() {
        if (this.currentUser && this.gameData) {
            Utils.storage.set(`player_${this.currentUser}`, this.gameData);
        }
        if (this.galaxy) {
            Utils.storage.set('galaxy', this.galaxy);
        }
        if (this.settings) {
            Utils.storage.set('gameSettings', this.settings);
        }
    }

    // Get default game settings
    getDefaultSettings() {
        return {
            turnsPerDay: CONSTANTS.DEFAULT_TURNS_PER_DAY,
            galaxySize: CONSTANTS.GALAXY.DEFAULT_SIZE,
            lastTurnRegen: Date.now()
        };
    }

    // Create new player data
    createPlayer(username, pilotName) {
        const playerData = {
            username: username,
            pilotName: pilotName,
            credits: CONSTANTS.STARTING_CREDITS,
            turns: CONSTANTS.DEFAULT_TURNS_PER_DAY,
            maxTurns: CONSTANTS.MAX_TURNS,
            currentSector: CONSTANTS.STARTING_SECTOR,
            ship: Utils.clone(CONSTANTS.STARTING_SHIP),
            cargo: {},
            stats: {
                sectorsVisited: 1,
                creditsEarned: 0,
                combatsWon: 0,
                combatsLost: 0,
                tradesCompleted: 0,
                eventsEncountered: 0
            },
            lastLogin: Date.now(),
            lastTurnRegen: Date.now(),
            created: Date.now()
        };

        return playerData;
    }

    // Set current user and load their data
    setCurrentUser(username) {
        this.currentUser = username;
        Utils.storage.set('currentUser', username);
        this.gameData = Utils.storage.get(`player_${username}`);
    }

    // Clear current user session
    logout() {
        this.save();
        this.currentUser = null;
        this.gameData = null;
        Utils.storage.remove('currentUser');
    }

    // Regenerate turns based on time passed
    regenerateTurns() {
        if (!this.gameData) return;

        const { turnsToAdd } = Utils.getTurnsRegenTime(
            this.gameData.lastTurnRegen,
            this.settings.turnsPerDay
        );

        if (turnsToAdd > 0) {
            this.gameData.turns = Math.min(
                this.gameData.turns + turnsToAdd,
                this.gameData.maxTurns
            );
            this.gameData.lastTurnRegen = Date.now();
            this.save();
        }
    }

    // Spend turns
    spendTurns(amount) {
        if (!this.gameData) return false;

        if (this.gameData.turns >= amount) {
            this.gameData.turns -= amount;
            this.save();
            return true;
        }
        return false;
    }

    // Add/remove credits
    modifyCredits(amount) {
        if (!this.gameData) return false;

        const newAmount = this.gameData.credits + amount;
        if (newAmount < 0) return false;

        this.gameData.credits = newAmount;
        if (amount > 0) {
            this.gameData.stats.creditsEarned += amount;
        }
        this.save();
        return true;
    }

    // Move to different sector
    moveToSector(sectorId) {
        if (!this.gameData || !this.galaxy) return false;

        const currentSector = this.galaxy.sectors[this.gameData.currentSector];
        if (!currentSector || !currentSector.warps.includes(sectorId)) {
            return false; // Invalid warp
        }

        if (!this.spendTurns(1)) {
            return false; // Not enough turns
        }

        this.gameData.currentSector = sectorId;
        this.gameData.stats.sectorsVisited++;
        this.save();
        return true;
    }

    // Get current sector data
    getCurrentSector() {
        if (!this.galaxy || !this.gameData) return null;
        return this.galaxy.sectors[this.gameData.currentSector];
    }

    // Add cargo to ship
    addCargo(commodity, quantity) {
        if (!this.gameData) return false;

        const currentCargo = Object.values(this.gameData.cargo).reduce((sum, q) => sum + q, 0);
        const spaceAvailable = this.gameData.ship.cargoMax - currentCargo;

        if (quantity > spaceAvailable) return false;

        this.gameData.cargo[commodity] = (this.gameData.cargo[commodity] || 0) + quantity;
        this.save();
        return true;
    }

    // Remove cargo from ship
    removeCargo(commodity, quantity) {
        if (!this.gameData || !this.gameData.cargo[commodity]) return false;

        if (this.gameData.cargo[commodity] < quantity) return false;

        this.gameData.cargo[commodity] -= quantity;
        if (this.gameData.cargo[commodity] === 0) {
            delete this.gameData.cargo[commodity];
        }
        this.save();
        return true;
    }

    // Get current cargo amount
    getCargoAmount(commodity) {
        if (!this.gameData) return 0;
        return this.gameData.cargo[commodity] || 0;
    }

    // Get total cargo
    getTotalCargo() {
        if (!this.gameData) return 0;
        return Object.values(this.gameData.cargo).reduce((sum, q) => sum + q, 0);
    }

    // Damage ship
    damageShip(amount) {
        if (!this.gameData) return false;

        // Shields absorb damage first
        if (this.gameData.ship.shields > 0) {
            const shieldDamage = Math.min(amount, this.gameData.ship.shields);
            this.gameData.ship.shields -= shieldDamage;
            amount -= shieldDamage;
        }

        // Remaining damage goes to hull
        if (amount > 0) {
            this.gameData.ship.hull = Math.max(0, this.gameData.ship.hull - amount);
        }

        this.save();
        return this.gameData.ship.hull > 0; // Return true if still alive
    }

    // Repair ship
    repairShip(hull = 0, shields = 0) {
        if (!this.gameData) return false;

        this.gameData.ship.hull = Math.min(
            this.gameData.ship.hull + hull,
            this.gameData.ship.hullMax
        );
        this.gameData.ship.shields = Math.min(
            this.gameData.ship.shields + shields,
            this.gameData.ship.shieldsMax
        );

        this.save();
        return true;
    }

    // Update stat
    updateStat(statName, value) {
        if (!this.gameData || !this.gameData.stats.hasOwnProperty(statName)) return false;

        this.gameData.stats[statName] += value;
        this.save();
        return true;
    }

    // Check if player is alive
    isAlive() {
        return this.gameData && this.gameData.ship.hull > 0;
    }

    // Get player info summary
    getPlayerSummary() {
        if (!this.gameData) return null;

        return {
            pilotName: this.gameData.pilotName,
            credits: this.gameData.credits,
            turns: this.gameData.turns,
            sector: this.gameData.currentSector,
            hull: this.gameData.ship.hull,
            hullMax: this.gameData.ship.hullMax,
            cargo: this.getTotalCargo(),
            cargoMax: this.gameData.ship.cargoMax
        };
    }

    // Export save data (for backup/transfer)
    exportSave() {
        return {
            gameData: this.gameData,
            galaxy: this.galaxy,
            settings: this.settings,
            timestamp: Date.now()
        };
    }

    // Import save data
    importSave(saveData) {
        try {
            this.gameData = saveData.gameData;
            this.galaxy = saveData.galaxy;
            this.settings = saveData.settings;
            this.save();
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }
}

export default GameState;
