# Ad Astra - Change Log

## Version 0.7.0 - The "Strategic Expansion" Update (2025-11-20)

### 🎮 Major Features - Complete Strategic Layer

#### Navigation Computer System
- **Advanced Pathfinding**: BFS-based shortest path calculation between any two sectors
  - Calculate routes with full fuel and turn cost analysis
  - Visual path display showing complete jump sequence
  - Fuel sufficiency checking before travel
  - **Route Planner**: Input destination sector, get optimal path instantly
  - **Nearest Location Finder**: Find closest planets, stations, military ports, or black markets
  - **Trade Route Optimizer**: Automatically finds most profitable trade routes
    - Calculates profit-per-jump ratio for efficiency
    - Shows investment, revenue, and profit margins
    - Considers cargo capacity and available supply
  - **Files Added**: navigation.js (new module, ~334 lines)

#### Computer Intel System
- **Comprehensive Intelligence Gathering**: Full sector and galaxy analysis
  - **Current Sector Analysis**: Shows connections, contents, nearby locations
  - **Galaxy Statistics**: Complete overview of all sectors, ports, planets
  - **Scan History**: Tracks last 50 sector scans automatically
  - **Bookmarks**: Save important sector locations with custom names and notes
  - **Sector Notes**: Add personal notes to any sector for future reference
  - Port type distribution analysis
  - Connectivity metrics (average/min/max connections per sector)
  - **Files Added**: computer.js (new module, ~323 lines)

#### Fighter Deployment System
- **Tactical Sector Defense**: Deploy fighters and mines for protection
  - **Deploy Fighters**: 50 credits each, max 50 per sector
    - Automatically defend sectors from intruders
    - 50% accuracy, 5 damage per fighter
    - Retrieve fighters when needed (returns to cargo)
  - **Deploy Mines**: 100 credits each, max 20 per sector
    - 30% chance to trigger on enemy entry
    - 25 damage per mine
    - Mines destroyed after triggering
  - **Fighter Command Center**: View all deployments across galaxy
  - Strategic value display (total credits invested)
  - Location-based management
  - **Files Added**: fighters.js (new module, ~394 lines)

#### Colonization System
- **Planet Creation & Management**: Build your own empire
  - **Genesis Torpedoes**: Create new colony planets (10,000 credits)
    - Generates random planet type (Desert, Forest, Industrial, Ocean, Rocky, Urban)
    - Each colony has specialty commodity for trading
    - Basic economy automatically generated
  - **Passive Income**: Colonies generate credits over time
    - Base: 100 credits per day
    - Collects based on real-time elapsed (supports offline growth)
    - "Collect All Income" button for easy management
  - **Colony Upgrades**: Four upgrade paths with exponential costs
    - **Population**: Increases colony size (+5,000 per level)
    - **Income**: Increases daily credit generation (+50 per level)
    - **Defense**: Strengthens colony defenses (future integration)
    - **Production**: Boosts economy supply (future integration)
    - Upgrade cost: 1000 × 2^level credits
  - **Colony Limits**: Maximum 5 colonies per player
  - **Abandon Colonies**: 50% refund of genesis cost
  - **Colony Stats Dashboard**: View total population, income, earnings
  - **Files Added**: colonization.js (new module, ~364 lines)

### 🎨 User Interface Enhancements

#### Computer Interface
- **New Navigation Tab**: Access via top bar "Computer" button
- **Five Sub-Tabs**: Navigation, Intel, Bookmarks, Fighters, Colonies
- **Tabbed Interface**: Smooth transitions between Computer functions
- **Real-Time Data**: All displays update dynamically
- **Comprehensive Displays**:
  - Route calculation with visual path display
  - Location search results with distance and jump count
  - Trade route finder with profit analysis
  - Galaxy statistics overview
  - Bookmark management with remove functionality
  - Fighter deployment summary by sector
  - Colony list with income tracking
  - Colony statistics dashboard
- **Files Modified**: index.html (+124 lines), ui.css (+588 lines), main.js (+715 lines)

### 📊 Technical Improvements

#### New Algorithms & Data Structures
- **BFS Pathfinding**: Efficient shortest path calculation
- **Seeded Random for Colonies**: Reproducible planet generation
- **Time-Based Income Calculation**: Accurate offline credit generation
- **Fighter/Mine Storage**: Sector-keyed defensive deployment tracking
- **Bookmark System**: Per-user persistent storage
- **Navigation History**: Auto-tracked scan history

#### Code Organization
- Four new independent ES6 modules
- Clean separation of concerns (navigation, computer, fighters, colonization)
- Each module self-contained with own load/save methods
- Consistent API design across all modules
- Proper error handling and validation throughout

### 🎯 Gameplay Impact

**Strategic Depth**:
- **Navigation Planning**: No more random exploration - calculate optimal routes
- **Trade Optimization**: Find profitable routes automatically
- **Territorial Control**: Defend key sectors with fighters and mines
- **Empire Building**: Establish colonies for passive income
- **Information Advantage**: Use computer intel to make informed decisions

**Economic Impact**:
- Colony income provides steady credit flow (100-500+ credits/day per colony)
- Fighter deployments require initial investment but protect assets
- Genesis torpedoes are expensive (10,000) but provide long-term value
- Trade route finder helps maximize profits per jump

**Tactical Options**:
- Deploy fighters to defend trade routes
- Place mines near valuable planets
- Bookmark profitable trading locations
- Track colony income and upgrade strategically
- Use intel to avoid defended sectors or find opportunities

### 🐛 Bug Fixes & Improvements

- Navigation computer properly integrates with existing warp lane system
- Colony planets show correct specialty bonuses in economy
- Fighter deployments persist across sessions
- Computer data saves per-user (multi-account support)
- Bookmark removal properly updates display
- Colony income calculations handle edge cases (first collection, long offline periods)

### 📝 Documentation

- Added v0.7.0 feature documentation
- Updated STATUS.md with new system descriptions
- Complete inline code documentation for all new modules
- Updated README with Strategic Expansion features

### 🔧 Breaking Changes

**None** - All changes are backwards compatible:
- New modules integrate seamlessly with existing systems
- Existing saves continue to work
- New features are optional (game playable without using Computer)
- No changes to core game mechanics (trading, combat, travel)

### 🎯 How This Prepares for Multiplayer

1. **Territorial Control**: Fighter deployments create contested space
2. **Economic Complexity**: Colonies add passive income and empire management
3. **Information Warfare**: Computer systems enable strategic intelligence gathering
4. **Trade Optimization**: Navigation tools help players find competitive advantages
5. **Strategic Depth**: Multiple systems interacting create emergent gameplay

### 🎮 TradeWars 2002 Features Implemented

This update implements the top 5 priority features from TradeWars 2002:
1. ✅ **Planet Creation & Colonization** - Genesis torpedoes, colony management, upgrades
2. ✅ **Fighter Deployment System** - Sector defense, mines, fighter command
3. ✅ **Port Classification System** - (Completed in v0.6.0)
4. ✅ **Pathfinding / Navigation Computer** - Route planning, location finding
5. ✅ **Computer Interface / Intel System** - Sector analysis, galaxy stats, bookmarks

### 🚀 Code Statistics

- **New Files**: 4 modules (navigation.js, computer.js, fighters.js, colonization.js)
- **Total New Code**: ~1,415 lines across new modules
- **UI Integration**: +715 lines in main.js, +124 lines in index.html, +588 lines in ui.css
- **Total LOC for v0.7.0**: ~2,842 new lines of code
- **Total Project Size**: Now ~7,000+ lines of JavaScript

### 🐛 Known Limitations

- Fighter auto-defense not yet integrated with ship movement
- Mine triggering not yet connected to warp system
- Colony defense upgrades don't affect fighter counts yet
- Colony production upgrades don't increase economy supply yet
- Bookmarks don't have quick-jump functionality yet
- Trade route finder requires cargo space (doesn't simulate empty holds)

### 🔮 Future Enhancements

- Integrate fighter auto-defense with ship movement
- Add mine triggers to warp jumps
- Connect colony defense to fighter auto-deployment
- Implement production upgrades affecting economy
- Add bookmark quick-navigation
- Sector ownership/control mechanics
- Player-vs-player fighter battles

---

## Version 0.6.0 - The "Communication & Commerce" Update (2025-11-20)

### 🎮 Major Features - Port-Based Communication

#### Message Board System
- **Player Communication**: Port and planet-based bulletin boards for player messages
  - Post messages with 7 different categories (General, Trade, Intel, Help, Bounty, Corporate, Warning)
  - Reply to messages with threaded conversations
  - Message filtering by type and search functionality
  - Auto-expiration after 7 days (100 message limit per location)
  - Edit messages within 1 hour of posting
  - Delete your own messages
  - Message statistics (total, recent activity, breakdown by type)
  - **Files Added**: messages.js (new module, ~230 lines)
  - **Files Modified**: main.js (+307 lines), index.html (+73 lines), ui.css (+436 lines)

#### Port Classification System
- **Specialized Trading Posts**: Six distinct port types with unique characteristics
  - **Mining Ports** ⛏️: Specialize in Ore, higher repair costs (6cr/hull)
  - **Agricultural Ports** 🌾: Specialize in Organics, standard costs
  - **Industrial Ports** 🏭: Specialize in Equipment, cheaper repairs (4cr/hull), offer upgrades
  - **Commercial Hubs** 🏢: General trading, all commodities, banking services
  - **Black Market** 💀: Contraband specialists, expensive repairs (8cr/hull), hidden locations
  - **Military Outposts** 🛡️: Best repairs (3cr/hull), cheapest fuel (1cr/unit), defended
  - Each port has unique icon, description, specialty bonuses, and service offerings
  - **Files Modified**: galaxy.js (+88 lines)

### 📊 Technical Improvements

#### New Features
- Message board accessible from both stations and planets
- Trade view now shows message board button when docked at planets
- Station services dynamically show port class and description
- Message boards use location-specific storage keys for organization
- Time-based message sorting and "time ago" display
- HTML escaping for user-generated content (security)

#### UI/UX Enhancements
- Complete message board interface with list, detail, and compose views
- Filter messages by type (7 categories)
- Search messages by keyword
- Real-time character counters for message composition
- Empty state handling with friendly prompts
- Message reply threading and display
- Responsive design for message board (mobile-friendly)
- Color-coded message type badges

#### Data Structure Changes
- Stations now include: `class`, `icon`, `description`, `specialties`, `tradingBonus`, `hidden`, `defended`, `messageBoard`
- Planets now include: `messageBoard` field
- Messages stored per-location with structure: `id`, `locationId`, `author`, `type`, `subject`, `body`, `timestamp`, `replies`, `tags`, `edited`

### 🎯 Gameplay Impact

**Enhanced Social Features**:
- Players can leave trade offers on message boards
- Share intel about profitable routes
- Post warnings about pirates or aliens
- Request help or offer bounties
- Form corporations and coordinate activities

**Strategic Port Selection**:
- Mining ports offer best prices for ore (20% bonus)
- Agricultural ports favor organics traders
- Industrial ports provide cheapest repairs and upgrades
- Black market ports essential for contraband trading (50% bonus!)
- Military outposts best for emergency repairs (cheapest)

### 🐛 Bug Fixes & Improvements

- Added `Utils.escapeHtml()` for secure rendering of user content
- Updated station repair/refuel costs to use port-specific values
- Improved station docking messages to show port class and icon
- Enhanced sector display with port classification information

### 📝 Documentation

- Updated to reflect v0.6.0 changes
- Added port classification documentation
- Added message board feature descriptions
- Updated feature completion status

### 🔧 Breaking Changes

**None** - All changes are backwards compatible. Existing galaxies will work but won't have the new port classifications until regenerated. Message boards are added automatically to all locations.

### 🎯 How This Prepares for Multiplayer

1. **Asynchronous Communication**: Players can leave messages when offline, enabling coordination across time zones
2. **Trade Coordination**: Message boards facilitate player-to-player trading arrangements
3. **Intel Sharing**: Players can share valuable information about routes, threats, and opportunities
4. **Social Dynamics**: Message boards create emergent player communities and rivalries
5. **Port Specialization**: Different port types create strategic choices and regional economies

### 🐛 Known Limitations

- Message boards are local to each port/planet (no galaxy-wide boards yet)
- No private messaging between players (all messages are public to that location)
- No message pinning or moderation tools yet
- Port classifications require galaxy regeneration for existing saves

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
