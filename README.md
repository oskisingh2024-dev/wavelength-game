# Wavelength Game 🎮

A real-time multiplayer Wavelength game where two players connect over the internet to play together. Players are on different devices, enter the same game code to connect, and sync through a central server.

## ✨ Features

- 🎨 **Beautiful UI** - Cute animated blob avatars with random colors
- 🎡 **Semicircle Wheel** - 180-degree spectrum for guessing
- 🔄 **Real-time Sync** - Instant updates between devices via Socket.io
- 📱 **Mobile Friendly** - Works on phones, tablets, and computers
- 🌐 **Multiplayer** - Play with friends anywhere in the world
- 🏆 **Scoring System** - 4 points (exact), 3 points (±1°), 2 points (±2°)
- 🎯 **To 15 Points** - First player to reach 15 wins!

## 🚀 Quick Start (5 Minutes)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/wavelength-game.git
cd wavelength-game

# 2. Install dependencies
npm install

# 3. Start server
npm start

# 4. Open in browser
# Both devices: http://YOUR_IP:3000
# Find IP with: ifconfig (Mac/Linux) or ipconfig (Windows)

# 5. Enter same game code on both devices
# Game will auto-sync!
```

### Deploy Online

Deploy to Netlify (frontend) + Railway (backend) in ~15 minutes.

See [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) for complete instructions.

## 📋 How to Play

1. **Create Avatar** - Enter your name (gets random color)
2. **Join Game** - Both players enter the same game code
3. **Spin Wheel** - Active player spins the wheel pointer
4. **Write Clue** - Active player writes a clue about the spectrum
5. **Guess** - Other player guesses where on the wheel (0-179°)
6. **Score** - Get points based on how close you are:
   - ✅ Exact match = **4 points**
   - ✅ Within 1° = **3 points**
   - ✅ Within 2° = **2 points**
   - ❌ More than 2° away = **0 points**
7. **Win** - First to reach 15 points wins! 🏆

## 🎮 Game Modes

### Local (Same WiFi)
- Both devices on same WiFi
- Enter IP:3000 from `npm start`
- Great for testing

### Online (Internet)
- Deploy to Netlify + Railway
- Get Netlify URL (https://yoursite.netlify.app)
- Both visit same URL from anywhere
- Great for friends far away

## 📁 Project Structure

```
wavelength-game/
├── index.html          # Frontend (Vue/React-like vanilla JS)
├── server.js           # Express + Socket.io backend
├── package.json        # Node.js dependencies
├── netlify.toml        # Netlify configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🔧 Tech Stack

### Frontend
- HTML5
- CSS3 (Tailwind)
- Vanilla JavaScript
- Socket.io Client

### Backend
- Node.js
- Express
- Socket.io
- CORS

## 📚 Setup Guides

- **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** - How to set up on GitHub
- **[NETLIFY_SETUP.md](./NETLIFY_SETUP.md)** - Deploy to Netlify + Railway
- **[DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)** - Compare deployment options
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute local setup
- **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** - File organization

## 🌐 Deploy with One Click

### Netlify (Frontend)
```
https://netlify.com
→ New site from Git
→ Select this repo
→ Deploy! 🚀
```

### Railway (Backend)
```
https://railway.app
→ New Project
→ Deploy from GitHub
→ Select this repo
→ Deploy! 🚀
```

Both provide free tiers with generous limits!

## 🎮 Game Code

Both players must enter the **same game code**:

**Example:**
- Player 1: Code = "GAME123"
- Player 2: Code = "GAME123" ← Same!
- Both hit "Join Game" → Sync happens automatically

## 🔌 Socket.io Events

### Client → Server
- `create_avatar` - Join game with name
- `start_game` - Begin game (2+ players required)
- `spin_wheel` - Spin the pointer
- `submit_clue` - Send clue text
- `submit_guess` - Send guess position (0-179°)
- `next_round` - Continue to next round

### Server → Client
- `avatar_created` - Avatar initialized with color
- `players_updated` - Player list changed
- `round_started` - New round begins
- `wheel_spun` - Wheel landed on position
- `clue_submitted` - Clue received, waiting for guess
- `score_revealed` - Points awarded, scores updated
- `game_over` - Winner determined

## ⚙️ Configuration

### Change Winning Score

Edit `server.js`:
```javascript
if (maxScore >= 15) {  // Change 15 to your number
  // Game over
}
```

### Add More Questions

Edit `server.js`:
```javascript
const wavelengthQuestions = [
  { left: 'Your question', right: 'Your question' },
  // Add more...
];
```

### Change Avatar Colors

Edit `server.js`:
```javascript
const colors = ['#FF6B9D', '#C44569', ...];  // Add hex colors
```

### Change Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000
```

## 🐛 Troubleshooting

### "Socket connection failed"
- Check backend is running
- Verify Socket.io URL is correct in index.html
- Check browser console (F12) for errors

### "Players not syncing"
- Both must enter **same** game code
- Both must be on same URL (localhost or deployed)
- Check server is running

### "Port 3000 already in use"
- Change port in server.js
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### "Cannot find module 'express'"
- Run `npm install`

## 📝 License

MIT License - Feel free to use for learning/fun!

## 🤝 Contributing

Found a bug? Have a feature request?

1. Create an Issue on GitHub
2. Fork the repo
3. Make changes
4. Submit Pull Request

## 💬 Questions?

- Check the README in each guide file
- Look at browser console (F12) for error messages
- Check server terminal output
- Read inline code comments

## 🎉 Have Fun!

Invite friends, share your game code, and enjoy Wavelength! 

---

Made with ❤️ for multiplayer fun
