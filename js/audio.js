// Ad Astra - Audio System
// audio.js - Manages background music and sound effects

export class AudioSystem {
    constructor() {
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentTrack = null;
        this.sounds = {};
        this.music = {};

        // Placeholder paths - User needs to add these files to assets/audio/
        this.tracks = {
            menu: 'assets/audio/music/theme_menu.mp3',
            exploration: 'assets/audio/music/theme_exploration.mp3',
            combat: 'assets/audio/music/theme_combat.mp3',
            docked: 'assets/audio/music/theme_docked.mp3'
        };

        this.sfxFiles = {
            warp: 'assets/audio/sfx/warp.mp3',
            laser: 'assets/audio/sfx/laser.mp3',
            explosion: 'assets/audio/sfx/explosion.mp3',
            click: 'assets/audio/sfx/click.mp3',
            alert: 'assets/audio/sfx/alert.mp3',
            success: 'assets/audio/sfx/success.mp3',
            error: 'assets/audio/sfx/error.mp3'
        };

        this.initialized = false;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio System Initialized');
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    // Play a music track
    playMusic(theme) {
        if (!this.initialized) return;

        const path = this.tracks[theme];
        if (!path) {
            console.warn(`Theme not found: ${theme}`);
            return;
        }

        // Don't restart if already playing
        if (this.currentTrack === theme && this.music[theme] && !this.music[theme].paused) {
            console.log(`Music already playing: ${theme}`);
            return;
        }

        // Stop current
        this.stopMusic();

        console.log(`🎵 Playing music: ${theme} (${path})`);

        // Create audio element for music (easier for streaming/looping)
        const audio = new Audio(path);
        audio.loop = true; // Ensure looping is enabled
        audio.volume = this.musicVolume;
        audio.preload = 'auto';

        // Handle loading errors gracefully (since files might be missing)
        audio.onerror = (e) => {
            console.warn(`⚠️ Audio file missing or failed to load: ${path}`);
            console.warn('Please add music files to assets/audio/music/ directory');
            console.warn('Music will be silent until audio files are added');
        };

        // Log when music actually starts playing
        audio.onplay = () => {
            console.log(`✅ Music started: ${theme}`);
        };

        // CRITICAL: If music ends, restart it immediately (backup for loop failure)
        audio.onended = () => {
            console.log(`⚠️ Music ended unexpectedly: ${theme} - Restarting...`);
            if (this.currentTrack === theme) {
                // Restart the same track
                setTimeout(() => {
                    if (this.currentTrack === theme) {
                        console.log(`🔄 Restarting music: ${theme}`);
                        audio.currentTime = 0;
                        audio.play().catch(e => console.warn('Failed to restart music:', e));
                    }
                }, 100);
            }
        };

        try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`Music playback started successfully: ${theme}`);
                    })
                    .catch(e => {
                        console.log('Audio play blocked (waiting for user interaction):', e.message);
                    });
            }
            this.music[theme] = audio;
            this.currentTrack = theme;
        } catch (e) {
            console.warn('Failed to play music', e);
        }
    }

    // Stop current music
    stopMusic() {
        if (this.currentTrack && this.music[this.currentTrack]) {
            this.music[this.currentTrack].pause();
            this.music[this.currentTrack].currentTime = 0;
            this.currentTrack = null;
        }
    }

    // Play a sound effect
    playSfx(name) {
        if (!this.initialized) return;

        const path = this.sfxFiles[name];
        if (!path) return;

        const audio = new Audio(path);
        audio.volume = this.sfxVolume;

        audio.onerror = () => {
            // Suppress errors for missing sfx
        };

        try {
            audio.play().catch(() => { });
        } catch (e) {
            // Ignore
        }
    }

    // Set volume (0.0 to 1.0)
    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        if (this.currentTrack && this.music[this.currentTrack]) {
            this.music[this.currentTrack].volume = this.musicVolume;
        }
        console.log(`🔊 Music volume set to: ${Math.round(this.musicVolume * 100)}%`);
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        console.log(`🔊 SFX volume set to: ${Math.round(this.sfxVolume * 100)}%`);
    }

    // Get list of available tracks
    getTrackList() {
        console.log('🎵 Available Music Tracks:');
        Object.entries(this.tracks).forEach(([name, path]) => {
            console.log(`  - ${name}: ${path}`);
        });
        console.log('\n🔊 Available Sound Effects:');
        Object.entries(this.sfxFiles).forEach(([name, path]) => {
            console.log(`  - ${name}: ${path}`);
        });
        return { music: this.tracks, sfx: this.sfxFiles };
    }

    // Get current playback status
    getStatus() {
        return {
            initialized: this.initialized,
            currentTrack: this.currentTrack,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isPlaying: this.currentTrack && this.music[this.currentTrack] && !this.music[this.currentTrack].paused
        };
    }
}

export default AudioSystem;
