// Ad Astra - Admin Controls
// admin.js - Sysop/admin panel functionality

import { Utils, CONSTANTS } from './utils.js';

export class AdminPanel {
    constructor(gameState, galaxy) {
        this.gameState = gameState;
        this.galaxy = galaxy;
    }

    // Generate new galaxy
    generateGalaxy(size) {
        if (size < CONSTANTS.GALAXY.MIN_SIZE || size > CONSTANTS.GALAXY.MAX_SIZE) {
            return {
                success: false,
                error: `Galaxy size must be between ${CONSTANTS.GALAXY.MIN_SIZE} and ${CONSTANTS.GALAXY.MAX_SIZE}`
            };
        }

        const confirmed = confirm(`Generate new galaxy with ${size} sectors? This will reset all player positions!`);
        if (!confirmed) {
            return { success: false, error: 'Cancelled by user' };
        }

        this.galaxy.generate(size);
        this.gameState.settings.galaxySize = size;
        this.gameState.save();

        // Reset all players to starting sector
        const usernames = this.gameState.auth.getAllUsernames();
        for (const username of usernames) {
            const playerData = Utils.storage.get(`player_${username}`);
            if (playerData) {
                playerData.currentSector = CONSTANTS.STARTING_SECTOR;
                Utils.storage.set(`player_${username}`, playerData);
            }
        }

        return { success: true, size: size };
    }

    // Update game settings
    updateSettings(settings) {
        const errors = [];

        if (settings.turnsPerDay) {
            if (settings.turnsPerDay < 10 || settings.turnsPerDay > 500) {
                errors.push('Turns per day must be between 10 and 500');
            } else {
                this.gameState.settings.turnsPerDay = settings.turnsPerDay;
            }
        }

        if (errors.length > 0) {
            return { success: false, errors: errors };
        }

        this.gameState.save();
        return { success: true };
    }

    // Get game statistics
    getGameStats() {
        const users = this.gameState.auth.getAllUsernames();
        const galaxyStats = this.galaxy.getStats();

        const playerStats = users.map(username => {
            const playerData = Utils.storage.get(`player_${username}`);
            return {
                username: username,
                pilotName: playerData?.pilotName || 'N/A',
                credits: playerData?.credits || 0,
                sector: playerData?.currentSector || 0,
                lastLogin: playerData?.lastLogin || 0
            };
        }).filter(p => p.pilotName !== 'N/A');

        // Sort by credits
        playerStats.sort((a, b) => b.credits - a.credits);

        return {
            totalPlayers: playerStats.length,
            totalUsers: users.length,
            galaxy: galaxyStats,
            topPlayers: playerStats.slice(0, 10),
            settings: this.gameState.settings
        };
    }

    // Give credits to player (admin cheat)
    giveCredits(username, amount) {
        const playerData = Utils.storage.get(`player_${username}`);
        if (!playerData) {
            return { success: false, error: 'Player not found' };
        }

        playerData.credits += amount;
        Utils.storage.set(`player_${username}`, playerData);

        return { success: true, newBalance: playerData.credits };
    }

    // Teleport player to sector
    teleportPlayer(username, sectorId) {
        const playerData = Utils.storage.get(`player_${username}`);
        if (!playerData) {
            return { success: false, error: 'Player not found' };
        }

        if (!this.galaxy.getSector(sectorId)) {
            return { success: false, error: 'Invalid sector' };
        }

        playerData.currentSector = sectorId;
        Utils.storage.set(`player_${username}`, playerData);

        return { success: true };
    }

    // Reset player data
    resetPlayer(username) {
        const confirmed = confirm(`Reset ${username}'s character? This cannot be undone!`);
        if (!confirmed) {
            return { success: false, error: 'Cancelled' };
        }

        Utils.storage.remove(`player_${username}`);
        return { success: true };
    }

    // Refresh economy prices
    refreshEconomy() {
        this.galaxy.updateEconomy();
        return { success: true, message: 'Economy prices updated' };
    }

    // Export game data
    exportData() {
        const data = {
            galaxy: this.galaxy.data,
            settings: this.gameState.settings,
            users: {},
            timestamp: Date.now()
        };

        const usernames = this.gameState.auth.getAllUsernames();
        for (const username of usernames) {
            const playerData = Utils.storage.get(`player_${username}`);
            if (playerData) {
                data.users[username] = playerData;
            }
        }

        return data;
    }

    // Import game data
    importData(data) {
        try {
            if (data.galaxy) {
                Utils.storage.set('galaxy', data.galaxy);
                this.galaxy.load();
            }

            if (data.settings) {
                Utils.storage.set('gameSettings', data.settings);
            }

            if (data.users) {
                for (const [username, playerData] of Object.entries(data.users)) {
                    Utils.storage.set(`player_${username}`, playerData);
                }
            }

            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    // Get server maintenance mode status (future feature)
    getMaintenanceMode() {
        return Utils.storage.get('maintenanceMode', false);
    }

    // Set maintenance mode
    setMaintenanceMode(enabled) {
        Utils.storage.set('maintenanceMode', enabled);
        return { success: true, enabled: enabled };
    }
    // Get all players with full data
    getAllPlayers() {
        const usernames = this.gameState.auth.getAllUsernames();
        return usernames.map(username => {
            const playerData = Utils.storage.get(`player_${username}`);
            if (!playerData) return null;
            return {
                username: username,
                pilotName: playerData.pilotName,
                credits: playerData.credits,
                turns: playerData.turns,
                sector: playerData.currentSector,
                hull: playerData.ship.hull,
                fuel: playerData.ship.fuel
            };
        }).filter(p => p !== null);
    }

    // Get single player data
    getPlayer(username) {
        const playerData = Utils.storage.get(`player_${username}`);
        if (!playerData) return null;

        return {
            username: username,
            pilotName: playerData.pilotName,
            credits: playerData.credits,
            turns: playerData.turns,
            sector: playerData.currentSector,
            hull: playerData.ship.hull,
            fuel: playerData.ship.fuel
        };
    }

    // Update player data
    updatePlayer(username, updates) {
        const playerData = Utils.storage.get(`player_${username}`);
        if (!playerData) {
            return { success: false, error: 'Player not found' };
        }

        if (updates.credits !== undefined) playerData.credits = updates.credits;
        if (updates.turns !== undefined) playerData.turns = updates.turns;
        if (updates.sector !== undefined) playerData.currentSector = updates.sector;
        if (updates.hull !== undefined) playerData.ship.hull = updates.hull;
        if (updates.fuel !== undefined) playerData.ship.fuel = updates.fuel;

        Utils.storage.set(`player_${username}`, playerData);
        return { success: true };
    }

    // Delete player
    deletePlayer(username) {
        // Remove player data
        Utils.storage.remove(`player_${username}`);

        // Remove from auth system (this requires accessing AuthSystem internals or adding a method there)
        // For now, we'll just remove the user from the auth list if possible, or just the data
        // Ideally AuthSystem should have a deleteUser method.
        // Let's check if we can access the auth users list directly or via a method.
        // The AuthSystem is passed in gameState.auth

        if (this.gameState.auth.adminDeleteAccount) {
            this.gameState.auth.adminDeleteAccount(username);
        } else {
            // Fallback if adminDeleteAccount doesn't exist
            const users = Utils.storage.get('users', {});
            delete users[username];
            Utils.storage.set('users', users);
        }

        return { success: true };
    }
}

export default AdminPanel;
