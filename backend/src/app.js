const express = require('express');
const cors = require('cors');
const userRoutes = require('./api/users.routes');
const authRoutes = require('./api/auth.routes');
const categoryRoutes = require('./api/category.routes');
const profileRoutes = require('./api/profile.routes');
const eventRoutes = require('./api/event.routes');

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
app.use('/api/categories', categoryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);

module.exports = app;
