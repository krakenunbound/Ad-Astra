// Ad Astra - Galaxy Generation
// galaxy.js - Galaxy creation, sector management, and exploration

import { Utils, CONSTANTS } from './utils.js';

export class Galaxy {
    constructor() {
        this.data = null;
    }

    // Generate a new galaxy
    generate(size = CONSTANTS.GALAXY.DEFAULT_SIZE) {
        console.log(`Generating galaxy with ${size} sectors...`);

        const sectors = {};

        // Create all sectors
        for (let i = 1; i <= size; i++) {
            sectors[i] = this.createSector(i, size);
        }

        // Connect sectors with warps
        this.connectSectors(sectors, size);

        this.data = {
            size: size,
            sectors: sectors,
            created: Date.now()
        };

        // Save to storage
        Utils.storage.set('galaxy', this.data);

        console.log('Galaxy generated successfully!');
        return this.data;
    }

    // Create a single sector
    createSector(id, galaxySize) {
        const sector = {
            id: id,
            x: Utils.random.float(0, 100),
            y: Utils.random.float(0, 100),
            warps: [],
            contents: []
        };

        // Add a planet?
        if (Math.random() < CONSTANTS.GALAXY.PLANET_CHANCE) {
            sector.contents.push(this.generatePlanet());
        }

        // Add a station?
        if (Math.random() < CONSTANTS.GALAXY.STATION_CHANCE) {
            sector.contents.push(this.generateStation());
        }

        // Add debris/asteroids?
        if (Math.random() < 0.2 && sector.contents.length === 0) {
            sector.contents.push({
                type: 'debris',
                name: 'Asteroid Field',
                description: 'Scattered asteroids that could be mined for resources'
            });
        }

        return sector;
    }

    // Generate a planet with economy
    generatePlanet() {
        const planetTypes = [
            { name: 'Desert', specialty: 'Ore' },
            { name: 'Forest', specialty: 'Organics' },
            { name: 'Industrial', specialty: 'Equipment' },
            { name: 'Ocean', specialty: 'Organics' },
            { name: 'Rocky', specialty: 'Ore' },
            { name: 'Urban', specialty: 'Equipment' }
        ];

        const type = Utils.random.choice(planetTypes);
        const planetNames = [
            'Alpha Prime', 'Beta Station', 'Gamma Outpost', 'Delta World',
            'Epsilon Colony', 'Zeta Haven', 'Theta Base', 'Nova Terra',
            'Proxima', 'Kepler Station', 'Titan Outpost', 'Europa Base'
        ];

        const planet = {
            type: 'planet',
            name: `${Utils.random.choice(planetNames)} ${Utils.random.int(1, 999)}`,
            planetType: type.name,
            specialty: type.specialty,
            economy: {},
            population: Utils.random.int(1000, 1000000),
            techLevel: Utils.random.int(1, 10)
        };

        // Generate economy prices
        for (const commodity of CONSTANTS.COMMODITIES) {
            // Contraband is rare and illegal
            if (commodity === 'Contraband') {
                // Only 20% of planets deal in contraband
                if (Math.random() > 0.2) continue;
            }

            const economyData = CONSTANTS.ECONOMY[commodity];
            let price = economyData.basePrice;

            // Specialty items are cheaper
            if (commodity === type.specialty) {
                price *= 0.7;
            } else {
                price *= Utils.random.float(0.8, 1.5);
            }

            planet.economy[commodity] = {
                buyPrice: Math.round(price * Utils.random.float(1.1, 1.3)),
                sellPrice: Math.round(price * Utils.random.float(0.7, 0.9)),
                supply: Utils.random.int(50, 500)
            };
        }

        return planet;
    }

    // Generate a space station
    generateStation() {
        const stationNames = [
            'Trading Post', 'Repair Dock', 'Outpost', 'Waystation',
            'Hub', 'Depot', 'Terminal', 'Gateway'
        ];

        return {
            type: 'station',
            name: `${Utils.random.choice(stationNames)} ${Utils.random.int(1, 99)}`,
            services: ['repair', 'refuel', 'upgrade'],
            repairCost: 5, // per hull point
            refuelCost: 2  // per fuel unit
        };
    }

    // Connect sectors with warp lanes
    connectSectors(sectors, size) {
        const sectorIds = Object.keys(sectors).map(Number);

        // First, create a spanning tree to ensure all sectors are reachable
        const visited = new Set([1]);
        const unvisited = new Set(sectorIds.filter(id => id !== 1));

        while (unvisited.size > 0) {
            // Find closest unvisited sector to any visited sector
            let minDist = Infinity;
            let bestPair = null;

            for (const vid of visited) {
                const v = sectors[vid];
                for (const uid of unvisited) {
                    const u = sectors[uid];
                    const dist = Utils.distance(v.x, v.y, u.x, u.y);
                    if (dist < minDist) {
                        minDist = dist;
                        bestPair = [vid, uid];
                    }
                }
            }

            if (bestPair) {
                const [vid, uid] = bestPair;
                this.addWarp(sectors[vid], sectors[uid]);
                visited.add(uid);
                unvisited.delete(uid);
            }
        }

        // Add additional random connections for more interesting navigation
        const additionalConnections = Math.floor(size * 0.5);
        for (let i = 0; i < additionalConnections; i++) {
            const id1 = Utils.random.choice(sectorIds);
            const id2 = Utils.random.choice(sectorIds);

            if (id1 !== id2 && !sectors[id1].warps.includes(id2)) {
                const dist = Utils.distance(
                    sectors[id1].x, sectors[id1].y,
                    sectors[id2].x, sectors[id2].y
                );

                // Only connect if reasonably close
                if (dist < 30) {
                    this.addWarp(sectors[id1], sectors[id2]);
                }
            }
        }
    }

    // Add bidirectional warp connection
    addWarp(sector1, sector2) {
        if (!sector1.warps.includes(sector2.id)) {
            sector1.warps.push(sector2.id);
        }
        if (!sector2.warps.includes(sector1.id)) {
            sector2.warps.push(sector1.id);
        }
    }

    // Load existing galaxy
    load() {
        this.data = Utils.storage.get('galaxy');
        return this.data;
    }

    // Get sector by ID
    getSector(id) {
        return this.data?.sectors[id] || null;
    }

    // Get sectors with planets
    getPlanetSectors() {
        if (!this.data) return [];

        return Object.values(this.data.sectors).filter(sector =>
            sector.contents.some(c => c.type === 'planet')
        );
    }

    // Get sectors with stations
    getStationSectors() {
        if (!this.data) return [];

        return Object.values(this.data.sectors).filter(sector =>
            sector.contents.some(c => c.type === 'station')
        );
    }

    // Find nearest sector with specific content type
    findNearest(fromSectorId, contentType) {
        if (!this.data) return null;

        const fromSector = this.getSector(fromSectorId);
        if (!fromSector) return null;

        let nearest = null;
        let minDist = Infinity;

        for (const sector of Object.values(this.data.sectors)) {
            if (sector.contents.some(c => c.type === contentType)) {
                const dist = Utils.distance(
                    fromSector.x, fromSector.y,
                    sector.x, sector.y
                );

                if (dist < minDist) {
                    minDist = dist;
                    nearest = sector;
                }
            }
        }

        return nearest;
    }

    // Get path between two sectors (simple BFS)
    findPath(startId, endId) {
        if (!this.data) return null;

        const queue = [[startId]];
        const visited = new Set([startId]);

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];

            if (current === endId) {
                return path;
            }

            const sector = this.getSector(current);
            if (!sector) continue;

            for (const warp of sector.warps) {
                if (!visited.has(warp)) {
                    visited.add(warp);
                    queue.push([...path, warp]);
                }
            }
        }

        return null; // No path found
    }

    // Update planet economy (fluctuate prices)
    updateEconomy() {
        if (!this.data) return;

        for (const sector of Object.values(this.data.sectors)) {
            for (const content of sector.contents) {
                if (content.type === 'planet') {
                    for (const commodity of CONSTANTS.COMMODITIES) {
                        const eco = content.economy[commodity];
                        const economyData = CONSTANTS.ECONOMY[commodity];

                        // Fluctuate prices slightly
                        eco.buyPrice = Math.round(
                            eco.buyPrice * Utils.random.float(0.95, 1.05)
                        );
                        eco.sellPrice = Math.round(
                            eco.sellPrice * Utils.random.float(0.95, 1.05)
                        );

                        // Clamp to reasonable ranges
                        const base = economyData.basePrice;
                        eco.buyPrice = Utils.clamp(eco.buyPrice, base * 0.5, base * 2);
                        eco.sellPrice = Utils.clamp(eco.sellPrice, base * 0.3, base * 1.5);
                    }
                }
            }
        }

        Utils.storage.set('galaxy', this.data);
    }

    // Get galaxy statistics
    getStats() {
        if (!this.data) return null;

        const sectors = Object.values(this.data.sectors);
        return {
            totalSectors: this.data.size,
            planetsCount: sectors.filter(s => s.contents.some(c => c.type === 'planet')).length,
            stationsCount: sectors.filter(s => s.contents.some(c => c.type === 'station')).length,
            debrisCount: sectors.filter(s => s.contents.some(c => c.type === 'debris')).length,
            emptySectors: sectors.filter(s => s.contents.length === 0).length,
            averageConnections: sectors.reduce((sum, s) => sum + s.warps.length, 0) / sectors.length
        };
    }
}

export default Galaxy;
