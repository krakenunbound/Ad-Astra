// Ad Astra - Music Loader
// music-loader.js - Dynamically discovers music files in the assets/audio/music folder

export class MusicLoader {
    constructor() {
        this.musicPath = 'assets/audio/music/';
        this.categories = ['menu', 'exploration', 'combat', 'docked'];
        this.discoveredTracks = {};
        this.maxVariants = 20; // Check up to theme_category20.mp3
    }

    /**
     * Discover all available music files by attempting to load them
     * Returns a promise that resolves with the discovered tracks
     */
    async discoverTracks() {
        console.log('🎵 Discovering music files...');
        const discovered = {};

        for (const category of this.categories) {
            discovered[category] = [];

            // Try default file first (theme_category.mp3)
            const defaultFile = `theme_${category}.mp3`;
            const defaultExists = await this.checkFileExists(this.musicPath + defaultFile);

            if (defaultExists) {
                discovered[category].push({
                    key: category,
                    name: this.formatName(category),
                    path: this.musicPath + defaultFile,
                    description: this.getDescription(category),
                    variant: 0 // Default variant
                });
                console.log(`✅ Found: ${defaultFile}`);
            }

            // Try numbered variants (theme_category1.mp3, theme_category2.mp3, etc.)
            for (let i = 1; i <= this.maxVariants; i++) {
                const variantFile = `theme_${category}${i}.mp3`;
                const variantExists = await this.checkFileExists(this.musicPath + variantFile);

                if (variantExists) {
                    discovered[category].push({
                        key: `${category}${i}`,
                        name: `${this.formatName(category)} ${i}`,
                        path: this.musicPath + variantFile,
                        description: `${this.getDescription(category)} (Variant ${i})`,
                        variant: i
                    });
                    console.log(`✅ Found: ${variantFile}`);
                } else if (i === 1) {
                    // If variant 1 doesn't exist, assume no more variants
                    break;
                }
            }
        }

        this.discoveredTracks = discovered;
        this.logDiscoverySummary(discovered);
        return this.buildAvailableTracks(discovered);
    }

    /**
     * Check if a file exists by attempting to load it
     */
    async checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            return false;
        }
    }

    /**
     * Build the availableTracks object for AudioSystem
     */
    buildAvailableTracks(discovered) {
        const availableTracks = {};

        for (const category in discovered) {
            const tracks = discovered[category];

            for (const track of tracks) {
                availableTracks[track.key] = {
                    name: track.name,
                    path: track.path,
                    description: track.description,
                    category: category,
                    variant: track.variant
                };
            }
        }

        return availableTracks;
    }

    /**
     * Format category name for display
     */
    formatName(category) {
        const names = {
            menu: 'Menu Theme',
            exploration: 'Exploration Theme',
            combat: 'Combat Theme',
            docked: 'Docked Theme'
        };
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Get description for category
     */
    getDescription(category) {
        const descriptions = {
            menu: 'Calm and welcoming',
            exploration: 'Adventure and discovery',
            combat: 'Intense and action-packed',
            docked: 'Peaceful station ambience'
        };
        return descriptions[category] || 'Background music';
    }

    /**
     * Log discovery summary
     */
    logDiscoverySummary(discovered) {
        let totalTracks = 0;
        console.log('\n🎵 Music Discovery Summary:');
        console.log('═══════════════════════════');

        for (const category in discovered) {
            const count = discovered[category].length;
            totalTracks += count;

            if (count > 0) {
                console.log(`📁 ${this.formatName(category)}: ${count} track${count > 1 ? 's' : ''}`);
                discovered[category].forEach(track => {
                    console.log(`   • ${track.name}`);
                });
            } else {
                console.log(`📁 ${this.formatName(category)}: No tracks found`);
            }
        }

        console.log('═══════════════════════════');
        console.log(`✨ Total tracks discovered: ${totalTracks}`);
        console.log('');
    }

    /**
     * Get all tracks for a specific category
     */
    getTracksForCategory(category) {
        return this.discoveredTracks[category] || [];
    }

    /**
     * Get random track from category
     */
    getRandomTrackFromCategory(category) {
        const tracks = this.getTracksForCategory(category);
        if (tracks.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * tracks.length);
        return tracks[randomIndex];
    }

    /**
     * Get all track keys (for default playlist)
     */
    getAllTrackKeys() {
        const keys = [];
        for (const category in this.discoveredTracks) {
            this.discoveredTracks[category].forEach(track => {
                keys.push(track.key);
            });
        }
        return keys;
    }

    /**
     * Get track count
     */
    getTrackCount() {
        let count = 0;
        for (const category in this.discoveredTracks) {
            count += this.discoveredTracks[category].length;
        }
        return count;
    }
}

export default MusicLoader;
