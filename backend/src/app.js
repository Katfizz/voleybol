const express = require('express');
const cors = require('cors');
const userRoutes = require('./api/users.routes');
const authRoutes = require('./api/auth.routes');
const categoryRoutes = require('./api/category.routes');
const profileRoutes = require('./api/profile.routes');
const eventRoutes = require('./api/event.routes');
const matchRoutes = require('./api/match.routes');
const attendanceRoutes = require('./api/attendance.routes');
const announcementRoutes = require('./api/announcement.routes');
const { handleHttpError } = require('./utils/errors');

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
app.use('/api/matches', matchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);

// Manejador de errores global (debe ir al final)
app.use(handleHttpError);

module.exports = app;
