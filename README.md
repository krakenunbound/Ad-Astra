# Ad Astra

A modern web-based space trading and exploration game.

## Overview
**Journey to the Stars** - A fully-featured space trading and exploration game with:
- 🚀 **Interactive Galaxy Map** with zoom, pan, and auto-centering
- 📱 **Responsive Design** - works on desktop, tablet, and mobile
- 🎮 **Account System** - create characters and save progress
- 🛸 **Multiple Ship Classes** - Scout, Trader, Fighter, Explorer, Hauler
- 💰 **Dynamic Economy** - trade legal goods and risky contraband
- ⚔️ **Turn-Based Combat** - fight pirates and aliens
- 🎲 **Random Events** - encounters during space travel
- ⛽ **Fuel Management** - plan routes and refuel at stations
- 🎵 **Dynamic Audio** - context-aware music and sound effects
- 👨‍💼 **Admin Controls** - galaxy management tools

## Project Structure
```
/ad-astra/
├── index.html              # Main game entry point
├── css/
│   ├── main.css           # Core styles
│   └── ui.css             # UI component styles
├── js/
│   ├── main.js            # Application initialization
│   ├── auth.js            # Authentication & account management
│   ├── game-state.js      # Core game state management
│   ├── galaxy.js          # Galaxy generation & management
│   ├── ship.js            # Ship classes & stats
│   ├── combat.js          # Combat system
│   ├── trading.js         # Trading mechanics
│   ├── events.js          # Random events system
│   ├── ui.js              # UI rendering & updates
│   ├── admin.js           # Admin/sysop controls
│   └── utils.js           # Helper functions
├── docs/
│   ├── CHANGELOG.md       # Version history & changes
│   ├── MANUAL.md          # User manual
│   └── TODO.md            # Next steps & roadmap
└── assets/
    ├── sounds/            # Sound effects (future)
    └── images/            # Simple graphics (future)
```

## Local Testing
**⚠️ Important:** The game requires an HTTP server due to ES6 module CORS restrictions.

### Quick Start:
```bash
# Navigate to game directory
cd "path/to/ad-astra"

# Start Python HTTP server
python -m http.server 8000

# Open browser to:
http://localhost:8000/index.html
```

### Features:
- No build process needed - pure HTML/CSS/JS
- Uses localStorage for data persistence
- Works on desktop and mobile browsers
- Fully playable offline once loaded

## Future Deployment
- Backend: Node.js/Express or Python Flask
- Database: PostgreSQL or MongoDB
- Authentication: JWT tokens
- Real-time: WebSockets for multiplayer

## Tech Stack
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- localStorage for local persistence
- Modular ES6 modules
