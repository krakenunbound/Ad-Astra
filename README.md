# Ad Astra

A modern web-based reimagining of the classic BBS game TradeWars 2002.

## Overview
Turn-based multiplayer space trading and combat game with:
- Account creation & character management
- Ship customization (cargo, weapons, shields)
- Galaxy exploration and trading
- Random encounters and events
- Simple but modern graphics
- Admin/sysop controls for galaxy management

## Project Structure
```
/tradewars-reimagined/
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
1. Open `index.html` in a web browser
2. No build process needed - pure HTML/CSS/JS
3. Uses localStorage for data persistence

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
