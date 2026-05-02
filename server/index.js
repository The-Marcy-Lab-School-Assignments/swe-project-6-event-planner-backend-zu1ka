require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const path = require('path');

const logRoutes = require('./middleware/logRoutes');
const checkAuthentication = require('./middleware/checkAuthentication');

const authControllers = require('./controllers/authControllers');
const userControllers = require('./controllers/userControllers');
const eventControllers = require('./controllers/eventControllers');
const rsvpControllers = require('./controllers/rsvpControllers');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(logRoutes);
app.use(express.json());
app.use(
    cookieSession({
        name: 'session',
        secret: process.env.SESSION_SECRET || 'supersecret',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
    })
);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.post('/api/auth/register', authControllers.register);
app.post('/api/auth/login', authControllers.login);
app.get('/api/auth/me', authControllers.getMe);
app.delete('/api/auth/logout', authControllers.logout);

app.patch('/api/users/:user_id', checkAuthentication, userControllers.updateUser);
app.delete('/api/users/:user_id', checkAuthentication, userControllers.deleteUser);

app.get('/api/events', eventControllers.getAllEvents);
app.post('/api/events', checkAuthentication, eventControllers.createEvent);
app.patch('/api/events/:event_id', checkAuthentication, eventControllers.updateEvent);
app.delete('/api/events/:event_id', checkAuthentication, eventControllers.deleteEvent);
app.get('/api/users/:user_id/events', eventControllers.getUserEvents);

app.post('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.createRsvp);
app.delete('/api/events/:event_id/rsvps', checkAuthentication, rsvpControllers.deleteRsvp);
app.get('/api/users/:user_id/rsvps', rsvpControllers.getUserRsvps);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});