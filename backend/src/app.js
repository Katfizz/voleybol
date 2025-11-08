const express = require('express');
const cors = require('cors');
const userRoutes = require('./api/users.routes');
const authRoutes = require('./api/auth.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.send('Voleyball App Backend is running!');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
