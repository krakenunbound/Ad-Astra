# Ad Astra - Change Log

## Version 0.5.0 - The "Multiplayer Ready" Update (2025-11-20)

### 🎮 Major Features - Multiplayer Foundation

#### Seeded Galaxy Generation
- **Deterministic Universe**: All players now share the same galaxy when using the same seed
  - Added `SeededRandom` class using Mulberry32 algorithm for reproducible randomization
  - Galaxy seed stored in `galaxy.data.seed` for reproducibility
  - All sectors, planets, stations, and warp connections generated deterministically
  - Same seed produces identical galaxy across all clients
  - **Files Modified**: utils.js (+75 lines), galaxy.js (+55 lines)

#### Daily Turn Reset System
- **Fixed Turn Limits**: Replaced continuous turn regeneration with daily reset boundary
  - Players now get full turn allotment once per day at UTC midnight
  - Added `checkDailyReset()` method to detect calendar day boundaries
  - Tracks last reset with `lastDailyReset` date string format
  - Shows "New day! Your turns have been reset" notification to players
  - Prevents turn exploitation in multiplayer scenarios
  - Backwards compatible with existing saves
  - **Files Modified**: game-state.js (+35 lines), main.js (+10 lines)

#### Dynamic Daily Pricing
- **Deterministic Daily Market**: Prices change each day but remain consistent across all players
  - Implemented `Galaxy.generateDailyPrice()` for on-demand price calculation
  - Uses `date + planetName + commodity` as seed for price generation
  - Prices regenerate at UTC midnight using deterministic algorithm
  - Supply still persists between transactions (creates market dynamics)
  - Prevents route memorization while maintaining multiplayer fairness
  - **Files Modified**: galaxy.js (+40 lines), trading.js (+15 lines)

#### Warp Lane Restrictions
- **Strategic Navigation**: Players can only travel through connected warp lanes
  - Enforced warp network validation before fuel consumption
  - Added validation in `warpToSector()` method
  - Galaxy map shows "⚠️ No warp lane!" tooltip for unreachable sectors
  - Unreachable sectors highlighted with `.no-warp-lane` CSS class
  - Only warp lines visible on map indicate available travel routes
  - Creates strategic gameplay requiring route planning
  - **Files Modified**: main.js (+6 lines), ui.js (+20 lines)

### 📊 Technical Improvements

#### New Classes & Methods
- `Utils.SeededRandom` class with methods:
  - `int(min, max)` - Generate random integer
  - `float(min, max)` - Generate random float
  - `choice(array)` - Choose random array element
  - `chance(probability)` - Test probability
  - `shuffle(array)` - Fisher-Yates shuffle
  - `weighted(choices)` - Weighted random selection

- `Galaxy.generateDailyPrice(planet, commodity, dateString)` - Static method for daily pricing
- `Galaxy.getPlanetPrices(planet, dateString)` - Get all commodity prices for a planet
- `GameState.checkDailyReset()` - Check and perform daily turn reset

#### Data Structure Changes
- Galaxy data now includes `seed` field for reproducibility
- Player data now includes `lastDailyReset` date string field
- Prices no longer stored in planet economy (calculated on-demand)

### 🚀 Multiplayer Readiness

**Status**: ~70% ready for multiplayer deployment

✅ **Complete**:
- Shared deterministic universe (all players see same galaxy)
- Fair turn limits with daily reset
- Dynamic economy with daily price changes
- Strategic navigation via warp lane network

⏳ **Requires Backend** (Future):
- Server-side turn validation
- Transaction verification and logging
- Real-time player position sync
- WebSocket communication
- Player authentication system

### 📝 Documentation

- Added **SYSTEM_ANALYSIS.md**: Detailed analysis of all 5 core systems
  - Current implementation details with line references
  - What works well vs. what needs changes
  - Impact analysis for each feature
  - Critical issues and recommendations

- Added **IMPLEMENTATION_GUIDE.md**: Code examples and testing guide
  - Function call chains for each system
  - Before/after code snippets
  - Data structure examples
  - Complete testing checklist

### 🔧 Breaking Changes

**None** - All changes are backwards compatible with existing saves. The system will automatically initialize new fields (`lastDailyReset`, galaxy `seed`) for existing players.

### 🎯 How This Prepares for Multiplayer

1. **Shared Universe**: All players exploring the same galaxy ensures fairness and enables trade/combat
2. **Daily Resets**: Prevents turn hoarding and creates daily competitive rhythm
3. **Dynamic Pricing**: Daily market changes keep gameplay fresh without allowing route exploitation
4. **Warp Networks**: Forces strategic planning and creates natural chokepoints for player interaction

### 🐛 Known Limitations

- No server-side validation yet (client-side only)
- Players can still modify localStorage (requires backend to prevent cheating)
- Supply changes are local (will need server sync for multiplayer)
- No real-time player tracking yet

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
