const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Game rooms and state
const games = new Map();
const players = new Map();

const wavelengthQuestions = [
  { left: 'Tell Mom', right: 'Tell Dad' },
  { left: 'Eat with Salad', right: 'Eat with Potato Chips' },
  { left: 'Morning Person', right: 'Night Owl' },
  { left: 'Beach Vacation', right: 'Mountain Cabin' },
  { left: 'Action Movies', right: 'Romantic Comedies' },
  { left: 'Coffee', right: 'Tea' },
  { left: 'Early Bird', right: 'Procrastinator' },
  { left: 'Video Games', right: 'Board Games' },
  { left: 'City Living', right: 'Small Town' },
  { left: 'Dogs', right: 'Cats' },
  { left: 'Sweet Treats', right: 'Salty Snacks' },
  { left: 'Winter', right: 'Summer' },
];

const colors = ['#FF6B9D', '#C44569', '#FFA502', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB6C1'];

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomQuestion() {
  return wavelengthQuestions[Math.floor(Math.random() * wavelengthQuestions.length)];
}

function getRandomPointerPosition() {
  return Math.floor(Math.random() * 180); // 0-179 degrees for semicircle
}

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  socket.on('create_avatar', ({ playerName, gameCode }) => {
    const color = getRandomColor();
    const avatarId = socket.id;

    players.set(avatarId, {
      id: avatarId,
      name: playerName,
      color: color,
      gameCode: gameCode,
      socketId: socket.id,
      score: 0
    });

    socket.join(gameCode);
    socket.avatarId = avatarId;
    socket.playerName = playerName;
    socket.gameCode = gameCode;

    // Initialize game if it doesn't exist
    if (!games.has(gameCode)) {
      games.set(gameCode, {
        code: gameCode,
        players: [],
        currentPlayerIndex: 0,
        scores: {},
        gameState: 'waiting', // waiting, wheelSpin, clueWriting, guessing, scoreReveal, gameOver
        currentQuestion: null,
        currentClue: '',
        pointerPosition: null,
        guessPosition: null,
      });
    }

    const game = games.get(gameCode);
    const player = players.get(avatarId);
    
    if (!game.players.find(p => p.id === avatarId)) {
      game.players.push({
        id: avatarId,
        name: playerName,
        color: color,
        score: 0
      });
      game.scores[playerName] = 0;
    }

    // Broadcast updated player list
    io.to(gameCode).emit('players_updated', {
      players: game.players,
      scores: game.scores
    });

    socket.emit('avatar_created', {
      avatarId: avatarId,
      color: color,
      gameCode: gameCode
    });
  });

  socket.on('start_game', ({ gameCode }) => {
    const game = games.get(gameCode);
    if (game && game.players.length >= 2) {
      game.gameState = 'wheelSpin';
      game.currentPlayerIndex = 0;
      startNewRound(gameCode);
    }
  });

  socket.on('spin_wheel', ({ gameCode }) => {
    const game = games.get(gameCode);
    if (game) {
      game.pointerPosition = getRandomPointerPosition();
      game.gameState = 'clueWriting';
      
      io.to(gameCode).emit('wheel_spun', {
        pointerPosition: game.pointerPosition,
        currentPlayerName: game.players[game.currentPlayerIndex].name
      });
    }
  });

  socket.on('submit_clue', ({ gameCode, clue }) => {
    const game = games.get(gameCode);
    if (game) {
      game.currentClue = clue;
      game.gameState = 'guessing';
      
      io.to(gameCode).emit('clue_submitted', {
        clue: clue,
        guessingPlayerName: game.players[(game.currentPlayerIndex + 1) % game.players.length].name
      });
    }
  });

  socket.on('submit_guess', ({ gameCode, guessPosition }) => {
    const game = games.get(gameCode);
    if (game) {
      game.guessPosition = guessPosition;
      game.gameState = 'scoreReveal';
      
      const points = calculatePoints(game.pointerPosition, guessPosition);
      const guessingPlayerName = game.players[(game.currentPlayerIndex + 1) % game.players.length].name;
      
      if (points > 0) {
        game.scores[guessingPlayerName] += points;
      }
      
      io.to(gameCode).emit('score_revealed', {
        pointerPosition: game.pointerPosition,
        guessPosition: guessPosition,
        points: points,
        currentScores: game.scores
      });
    }
  });

  socket.on('next_round', ({ gameCode }) => {
    const game = games.get(gameCode);
    if (game) {
      const maxScore = Math.max(...Object.values(game.scores));
      
      if (maxScore >= 15) {
        game.gameState = 'gameOver';
        io.to(gameCode).emit('game_over', {
          scores: game.scores
        });
      } else {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        startNewRound(gameCode);
      }
    }
  });

  socket.on('reset_game', ({ gameCode }) => {
    const game = games.get(gameCode);
    if (game) {
      game.gameState = 'waiting';
      game.currentPlayerIndex = 0;
      game.scores = {};
      game.players.forEach(p => {
        game.scores[p.name] = 0;
      });
      
      io.to(gameCode).emit('game_reset', {
        scores: game.scores,
        players: game.players
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    if (socket.gameCode && games.has(socket.gameCode)) {
      const game = games.get(socket.gameCode);
      game.players = game.players.filter(p => p.id !== socket.avatarId);
      
      if (game.players.length === 0) {
        games.delete(socket.gameCode);
      } else {
        io.to(socket.gameCode).emit('players_updated', {
          players: game.players,
          scores: game.scores
        });
      }
    }
    
    players.delete(socket.avatarId);
  });
});

function startNewRound(gameCode) {
  const game = games.get(gameCode);
  if (game) {
    game.currentQuestion = getRandomQuestion();
    game.gameState = 'wheelSpin';
    game.currentClue = '';
    game.pointerPosition = null;
    game.guessPosition = null;
    
    io.to(gameCode).emit('round_started', {
      currentQuestion: game.currentQuestion,
      currentPlayerName: game.players[game.currentPlayerIndex].name,
      currentPlayerColor: game.players[game.currentPlayerIndex].color
    });
  }
}

function calculatePoints(pointerPosition, guessPosition) {
  const difference = Math.abs(pointerPosition - guessPosition);
  
  // Exact match = 4 points
  if (difference === 0) return 4;
  
  // Within 1 position = 3 points (pointer positions 0-179)
  if (difference === 1 || difference === 179) return 3; // 179 wraps around
  
  // 2 positions away = 2 points
  if (difference === 2 || difference === 178) return 2;
  
  return 0;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Wavelength server running on port ${PORT}`);
});
