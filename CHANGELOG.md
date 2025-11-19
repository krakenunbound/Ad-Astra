# Ad Astra - Change Log

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
