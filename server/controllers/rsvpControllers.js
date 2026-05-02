const rsvpModel = require('../models/rsvpModel');

const createRsvp = async (req, res) => {
    const { event_id } = req.params;
    const user_id = req.session.userId;

    try {
        const rsvp = await rsvpModel.create(user_id, event_id);
        res.status(201).json(rsvp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteRsvp = async (req, res) => {
    const { event_id } = req.params;
    const user_id = req.session.userId;

    try {
        const rsvp = await rsvpModel.deleteRsvp(user_id, event_id);
        res.status(200).json(rsvp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getUserRsvps = async (req, res) => {
    const { user_id } = req.params;
    try {
        const events = await rsvpModel.listEventsByUser(user_id);
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { createRsvp, deleteRsvp, getUserRsvps };