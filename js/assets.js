// Ad Astra - Asset Management System
// Handles loading and displaying images, animations, and placeholders

import { Utils } from './utils.js';

class AssetManager {
    constructor() {
        this.assetsPath = 'assets/images/';
        this.animationsPath = 'assets/animations/';
        this.loadedImages = new Map();
        this.fallbackEnabled = true; // Use placeholders if images not found
    }

    // Get ship image
    getShipImage(shipClass) {
        const filename = `ship_${shipClass.toLowerCase().replace(/\s+/g, '_')}.webp`;
        return this.loadImage(filename, this.createShipPlaceholder(shipClass));
    }

    // Get planet image
    getPlanetImage(planetType) {
        const filename = `planet_${planetType.toLowerCase().replace(/\s+/g, '_')}.webp`;
        return this.loadImage(filename, this.createPlanetPlaceholder(planetType));
    }

    // Get station image
    getStationImage(stationClass) {
        const filename = `station_${stationClass.toLowerCase().replace(/\s+/g, '_')}.webp`;
        return this.loadImage(filename, this.createStationPlaceholder(stationClass));
    }

    // Get enemy image
    getEnemyImage(enemyType) {
        const filename = `enemy_${enemyType.toLowerCase().replace(/\s+/g, '_')}.webp`;
        return this.loadImage(filename, this.createEnemyPlaceholder(enemyType));
    }

    // Get commodity icon
    getCommodityIcon(commodity) {
        const filename = `commodity_${commodity.toLowerCase().replace(/\s+/g, '_')}.webp`;
        return this.loadImage(filename, this.createCommodityPlaceholder(commodity));
    }

    // Get animation
    getAnimation(animationType) {
        const filename = `${animationType.toLowerCase().replace(/\s+/g, '_')}.webm`;
        return this.loadAnimation(filename);
    }

    // Load image with fallback to placeholder
    loadImage(filename, placeholder) {
        if (this.loadedImages.has(filename)) {
            return this.loadedImages.get(filename);
        }

        const path = this.assetsPath + filename;

        // Check if file exists (will use placeholder if not)
        const img = new Image();
        img.onerror = () => {
            if (this.fallbackEnabled) {
                img.src = placeholder;
            }
        };

        // Try to load actual image
        img.src = path;

        this.loadedImages.set(filename, img.src);
        return img.src;
    }

    // Load animation
    loadAnimation(filename) {
        const path = this.animationsPath + filename;
        return path; // Return path, video element will handle loading
    }

    // Create ship placeholder (SVG data URI)
    createShipPlaceholder(shipClass) {
        const colors = {
            'Scout': '#4a9eff',
            'Trader': '#44ff44',
            'Freighter': '#ffaa44',
            'Corvette': '#ff44ff',
            'Destroyer': '#ff4444',
            'Battleship': '#ffff44'
        };

        const color = colors[shipClass] || '#888';
        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#1a1a2e"/>
            <circle cx="100" cy="100" r="60" fill="${color}" opacity="0.3"/>
            <polygon points="100,40 120,80 100,70 80,80" fill="${color}"/>
            <rect x="90" y="70" width="20" height="60" fill="${color}"/>
            <polygon points="70,130 90,130 90,150" fill="${color}" opacity="0.7"/>
            <polygon points="130,130 110,130 110,150" fill="${color}" opacity="0.7"/>
            <text x="100" y="180" text-anchor="middle" fill="#fff" font-size="14">${shipClass}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Create planet placeholder
    createPlanetPlaceholder(planetType) {
        const colors = {
            'Desert': '#d4a574',
            'Forest': '#44aa44',
            'Industrial': '#888888',
            'Ocean': '#4488ff',
            'Rocky': '#999999',
            'Urban': '#cccccc'
        };

        const color = colors[planetType] || '#888';
        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="planetGrad">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#000;stop-opacity:0.5" />
                </radialGradient>
            </defs>
            <rect width="200" height="200" fill="#0a0a1a"/>
            <circle cx="100" cy="100" r="70" fill="url(#planetGrad)"/>
            <ellipse cx="100" cy="100" rx="70" ry="10" fill="#000" opacity="0.3"/>
            <text x="100" y="185" text-anchor="middle" fill="#fff" font-size="12">${planetType}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Create station placeholder
    createStationPlaceholder(stationClass) {
        const icons = {
            'Mining': '⛏️',
            'Agricultural': '🌾',
            'Industrial': '🏭',
            'Commercial Hub': '🏢',
            'Black Market': '💀',
            'Military': '🛡️'
        };

        const icon = icons[stationClass] || '🏗️';
        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#1a1a2e"/>
            <rect x="50" y="60" width="100" height="80" fill="#555" stroke="#888" stroke-width="2"/>
            <rect x="70" y="70" width="20" height="20" fill="#444"/>
            <rect x="110" y="70" width="20" height="20" fill="#444"/>
            <rect x="70" y="110" width="20" height="20" fill="#444"/>
            <rect x="110" y="110" width="20" height="20" fill="#444"/>
            <polygon points="100,40 120,60 80,60" fill="#666"/>
            <text x="100" y="170" text-anchor="middle" font-size="40">${icon}</text>
            <text x="100" y="190" text-anchor="middle" fill="#fff" font-size="11">${stationClass}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Create enemy placeholder
    createEnemyPlaceholder(enemyType) {
        const colors = {
            'Pirate': '#ff4444',
            'Alien': '#44ff88',
            'Mercenary': '#ffaa44'
        };

        const color = colors[enemyType] || '#ff4444';
        const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#1a1a2e"/>
            <circle cx="100" cy="100" r="50" fill="${color}" opacity="0.3"/>
            <polygon points="100,60 85,90 115,90" fill="${color}"/>
            <rect x="85" y="90" width="30" height="30" fill="${color}"/>
            <polygon points="70,120 85,120 85,140" fill="${color}" opacity="0.8"/>
            <polygon points="130,120 115,120 115,140" fill="${color}" opacity="0.8"/>
            <circle cx="90" cy="100" r="5" fill="#fff"/>
            <circle cx="110" cy="100" r="5" fill="#fff"/>
            <text x="100" y="180" text-anchor="middle" fill="#fff" font-size="14">${enemyType}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Create commodity placeholder
    createCommodityPlaceholder(commodity) {
        const icons = {
            'Organics': '🌾',
            'Equipment': '⚙️',
            'Ore': '⛏️',
            'Contraband': '💀'
        };

        const colors = {
            'Organics': '#44aa44',
            'Equipment': '#888888',
            'Ore': '#d4a574',
            'Contraband': '#ff4444'
        };

        const icon = icons[commodity] || '📦';
        const color = colors[commodity] || '#888';
        const svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" fill="#1a1a2e" rx="8"/>
            <circle cx="32" cy="32" r="24" fill="${color}" opacity="0.3"/>
            <text x="32" y="42" text-anchor="middle" font-size="32">${icon}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Get all required assets (for manifest)
    getAssetManifest() {
        return {
            ships: [
                { name: 'Scout', file: 'ship_scout.webp', desc: 'Fast, agile scout vessel with minimal cargo' },
                { name: 'Trader', file: 'ship_trader.webp', desc: 'Balanced trading ship, good cargo and speed' },
                { name: 'Freighter', file: 'ship_freighter.webp', desc: 'Large cargo hauler, slow but massive capacity' },
                { name: 'Corvette', file: 'ship_corvette.webp', desc: 'Fast combat ship with moderate firepower' },
                { name: 'Destroyer', file: 'ship_destroyer.webp', desc: 'Heavy combat vessel with strong weapons' },
                { name: 'Battleship', file: 'ship_battleship.webp', desc: 'Massive warship, ultimate firepower' }
            ],
            planets: [
                { name: 'Desert', file: 'planet_desert.webp', desc: 'Arid desert world with sand dunes' },
                { name: 'Forest', file: 'planet_forest.webp', desc: 'Lush green world covered in vegetation' },
                { name: 'Industrial', file: 'planet_industrial.webp', desc: 'Polluted factory world with smog' },
                { name: 'Ocean', file: 'planet_ocean.webp', desc: 'Water world with deep blue oceans' },
                { name: 'Rocky', file: 'planet_rocky.webp', desc: 'Barren rocky world with mountains' },
                { name: 'Urban', file: 'planet_urban.webp', desc: 'City-covered ecumenopolis world' }
            ],
            stations: [
                { name: 'Mining', file: 'station_mining.webp', desc: 'Mining platform with extractors', icon: '⛏️' },
                { name: 'Agricultural', file: 'station_agricultural.webp', desc: 'Farm station with hydroponics', icon: '🌾' },
                { name: 'Industrial', file: 'station_industrial.webp', desc: 'Manufacturing station with factories', icon: '🏭' },
                { name: 'Commercial Hub', file: 'station_commercial_hub.webp', desc: 'Trading hub with markets', icon: '🏢' },
                { name: 'Black Market', file: 'station_black_market.webp', desc: 'Hidden criminal outpost', icon: '💀' },
                { name: 'Military', file: 'station_military.webp', desc: 'Fortified military base', icon: '🛡️' }
            ],
            enemies: [
                { name: 'Pirate', file: 'enemy_pirate.webp', desc: 'Ragged pirate ship attacking traders' },
                { name: 'Alien', file: 'enemy_alien.webp', desc: 'Mysterious alien vessel, unknown origin' },
                { name: 'Mercenary', file: 'enemy_mercenary.webp', desc: 'Professional bounty hunter ship' }
            ],
            commodities: [
                { name: 'Organics', file: 'commodity_organics.webp', desc: 'Food, medicine, biological goods', icon: '🌾', size: '64x64' },
                { name: 'Equipment', file: 'commodity_equipment.webp', desc: 'Tools, machinery, technology', icon: '⚙️', size: '64x64' },
                { name: 'Ore', file: 'commodity_ore.webp', desc: 'Raw minerals and metals', icon: '⛏️', size: '64x64' },
                { name: 'Contraband', file: 'commodity_contraband.webp', desc: 'Illegal goods and substances', icon: '💀', size: '64x64' }
            ],
            animations: [
                { name: 'Warp Jump', file: 'warp_jump.webm', desc: 'Warp animation when jumping between sectors', duration: '2s' },
                { name: 'Explosion', file: 'explosion.webm', desc: 'Ship explosion when destroyed', duration: '1.5s' },
                { name: 'Laser Fire', file: 'laser_fire.webm', desc: 'Weapon firing animation', duration: '0.5s' },
                { name: 'Shield Hit', file: 'shield_hit.webm', desc: 'Shield impact effect', duration: '0.5s' },
                { name: 'Docking', file: 'docking.webm', desc: 'Ship docking at station animation', duration: '2s' },
                { name: 'Hyperdrive', file: 'hyperdrive.webm', desc: 'Hyperdrive activation background effect', duration: 'loop' }
            ],
            ui: [
                { name: 'Background Nebula', file: 'bg_nebula.webp', desc: 'Space background with colorful nebula' },
                { name: 'Background Stars', file: 'bg_stars.webp', desc: 'Starfield background tileable' },
                { name: 'Button Hover', file: 'ui_button_hover.webp', desc: 'Button hover effect overlay' },
                { name: 'Panel Border', file: 'ui_panel_border.webp', desc: 'Sci-fi panel border decoration' }
            ]
        };
    }
}

export default AssetManager;
