# Ad Astra - Change Log

## Version 0.4.1 - Critical Fixes Patch (2025-11-19)

### Bug Fixes
- **Critical**: Fixed star type colors not displaying - all stars were blue instead of varied colors
  - Added `!important` to star type CSS properties to override base styles
  - Stars now correctly display as red, orange, yellow, white, and blue
  - Star sizes now correctly vary from 8px to 18px based on type
- **Critical**: Fixed music looping - music now restarts automatically if it ends
  - Added `onended` event handler with automatic restart
  - Music will loop continuously even if `audio.loop` fails
  - Better error logging for missing audio files
- **Enhancement**: Improved star type hover effects with unique glows per type

### Visual Improvements
- Current location marker increased to 50px (from 30px)
- Added pin emoji (📍) to current location with bounce animation
- Multi-layer glow effect on current location (4 shadow layers)
- Radial gradient background on current location for 3D effect
- Current location now 2.8x to 6.25x larger than any other sector

### Star Type Distribution
- Red Giants: 18px, bright red (#ff4444)
- Red Dwarfs: 10px, orange-red (#ff8866)
- Yellow Stars: 14px, yellow (#ffdd44)
- White Dwarfs: 8px, white (#ffffff)
- Blue Giants: 16px, blue (#4488ff)

### Technical Improvements
- Enhanced CSS specificity for star types
- Improved audio system reliability
- Better error handling for missing audio files

## Version 0.4.0 - The "Polish & Refinement" Update (2025-11-19)

### Major Features
- **Interactive Galaxy Map with Zoom & Pan**:
  - Mouse wheel zoom (0.5x to 5x range)
  - Touch/pinch zoom support for mobile devices
  - Click and drag to pan around the map
  - Auto-centering on current location when map opens
  - Zoom controls (+, -, reset buttons)
  - Smooth hardware-accelerated transforms
  
- **Enhanced Current Location Visibility**:
  - 50% larger current sector marker (30px)
  - Bright white border for contrast
  - Triple-layer glow effect (30px/60px/120px)
  - Faster, more obvious pulse animation (1.5s cycle, 1.4x scale)
  - Always rendered on top (z-index 25)

- **Responsive Design Implementation**:
  - Mobile-first CSS architecture
  - Auto-detection of screen orientation (portrait/landscape)
  - Breakpoints for mobile (< 600px), tablet (600-900px), desktop (> 1200px)
  - Fluid typography using clamp() functions
  - Touch-friendly button sizes
  - Adaptive layouts for all screen sizes

### Bug Fixes
- **Critical**: Fixed inverted buy/sell price logic in trade route finder
- **Critical**: Fixed turn deduction happening after transaction execution
- **Major**: Fixed cramped UI layout - game now uses full browser width
- **Major**: Fixed music looping issues with enhanced error handling
- **Minor**: Added missing fuel display to ship stats view
- **Minor**: Fixed confusing duplicate sector display in header
- **Cosmetic**: Updated all branding from "TradeWars Reimagined" to "Ad Astra"
- **Cosmetic**: Changed tagline to "Journey to the Stars"

### Audio System Improvements
- Enhanced music looping with better promise handling
- Added comprehensive logging with emoji indicators
- New methods: `getTrackList()` and `getStatus()`
- Volume change logging
- Better error messages for missing audio files

### UI/UX Improvements
- Removed duplicate sector ID from panel header
- Improved logout button visibility (red, bold)
- Better message log word wrapping
- Optimized spacing for mobile devices
- Landscape mode optimizations
- Ultra-wide screen support (max 1920px)

### Documentation
- Created comprehensive bug reports (BUG_REPORT.md, BUG_HUNT_REPORT.md)
- Added testing documentation (TESTING_SUMMARY.md)
- Created UI/Audio fixes guide (UI_AUDIO_FIXES.md)
- Added branding cleanup documentation (BRANDING_FIXES.md)
- Created galaxy map enhancements guide (GALAXY_MAP_ENHANCEMENTS.md)
- Updated session summary (SESSION_SUMMARY.md)
- Added HTTP server requirement to TESTING.md

### Technical Improvements
- Modular galaxy map state management
- Event-driven zoom and pan system
- Touch gesture support (pinch, drag)
- Improved CSS organization
- Better browser compatibility
- Performance optimizations

### Known Issues Fixed
- ✅ CORS restriction documented (requires HTTP server)
- ✅ Event fuel consumption behavior documented
- ✅ Police event weight inconsistency documented

## Version 0.3.0 - The "Deep Space" Update (2025-11-19)

### New Features
- **Advanced Fuel System**: Implemented fuel consumption for warp travel.
  - Ships now have fuel tanks and efficiency ratings.
  - Visual fuel range indicator on the Galaxy Map.
  - Refueling services available at Space Stations.
- **Expanded Ship Classes**: Added multiple playable ship types.
  - Different stats for Hull, Cargo, Speed, and Fuel Efficiency.
  - Unique ship names and descriptions.
- **Jump Gates**: Added a network of Jump Gates for long-distance travel.
  - Instant travel between distant sectors for a credit fee.
- **Black Market Economy**: Introduced illegal commodities and smuggling.
  - High-risk, high-reward trading.
  - **Police Inspections**: Random cargo scans with fines and confiscation for contraband.
- **Travel Mechanics**: Added "Travel Time" for warp jumps, replacing instant movement with a countdown.

## Version 0.2.0 - The "Ad Astra" Update (2025-11-19)

### New Features
- **Galaxy Map Visualization**: Added a fully interactive visual map of the galaxy.
  - Shows sectors, warp paths, planets, and stations.
  - Click nodes to warp instantly.
  - Responsive 1:1 aspect ratio for perfect alignment.
- **Audio System**: Implemented a dynamic audio engine.
  - Context-aware background music (Menu, Exploration, Combat).
  - Sound effects for interactions (Clicks, Warp, Lasers, Explosions).
- **Player Statistics**: Added a dedicated "Stats" view.
  - Tracks credits earned, combats won/lost, trades, and more.
- **Rebranding**: Officially renamed the project from "TradeWars Reimagined" to **"Ad Astra: Trade & Explore"**.

### Improvements
- **UI Navigation**: Fixed issues with screen transitions and added explicit display handling.
- **Game Initialization**: Added robust checks to prevent crashes when loading character data.
- **Documentation**: Updated all docs to reflect the new name and features.

## Version 0.1.0 - Initial Foundation (2025-11-18)

### Completed ✓
- Project structure and documentation
- README.md with project overview
- CHANGELOG.md for version tracking
- MANUAL.md for user documentation
- TODO.md for roadmap
- Core authentication system (auth.js)
- Game state management (game-state.js)
- Galaxy generation system (galaxy.js)
- Ship management system (ship.js)
- Random events system (events.js)
- Trading mechanics (trading.js)
- Combat system (combat.js)
- UI rendering system (ui.js)
- Admin control panel (admin.js)
- Main application controller (main.js)
- Full CSS styling (main.css, ui.css)
- HTML structure with all screens
- Utility functions and constants

### Features Implemented
- User registration and login
- Character creation
- Turn-based movement through sectors
- Procedural galaxy generation
- Planet economies with dynamic prices
- Trading system (buy/sell commodities)
- Random events during travel
- Turn-based combat
- Ship stats and cargo management
- Space stations for repairs/refueling
- Admin panel with galaxy controls
- Message log system
- localStorage persistence

### Known Issues
- Galaxy map visualization is placeholder
- No visual graphics yet (text-based)
- No sound effects
- No multiplayer features yet
- Combat needs balancing

### Notes
- Fully playable single-player version
- Modular architecture for easy expansion
- Ready for local testing
- Next step: balance testing and polish
