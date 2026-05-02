const eventModel = require('../models/eventModel');

const getAllEvents = async (req, res) => {
    try {
        const events = await eventModel.list();
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const createEvent = async (req, res) => {
    const { title, description, date, location, event_type, max_capacity } = req.body;

    if (!title || !date || !location || !event_type || !max_capacity) {
        return res.status(400).json({ message: 'title, date, location, event_type, and max_capacity are required.' });
    }

    if (!eventModel.VALID_TYPES.includes(event_type)) {
        return res.status(400).json({ message: 'Invalid event_type.' });
    }

    try {
        const event = await eventModel.create({
            title,
            description,
            date,
            location,
            event_type,
            max_capacity,
            user_id: req.session.userId,
        });
        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateEvent = async (req, res) => {
    const { event_id } = req.params;

    try {
        const existing = await eventModel.findById(event_id);
        if (!existing) return res.status(404).json({ message: 'Event not found.' });

        if (existing.user_id !== req.session.userId) {
            return res.status(403).json({ message: 'You can only edit your own events.' });
        }

        if (req.body.event_type && !eventModel.VALID_TYPES.includes(req.body.event_type)) {
            return res.status(400).json({ message: 'Invalid event_type.' });
        }

        const updated = await eventModel.update(event_id, req.body);
        res.status(200).json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteEvent = async (req, res) => {
    const { event_id } = req.params;

    try {
        const existing = await eventModel.findById(event_id);
        if (!existing) return res.status(404).json({ message: 'Event not found.' });

        if (existing.user_id !== req.session.userId) {
            return res.status(403).json({ message: 'You can only delete your own events.' });
        }

        const deleted = await eventModel.deleteEvent(event_id);
        res.status(200).json(deleted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getUserEvents = async (req, res) => {
    const { user_id } = req.params;
    try {
        const events = await eventModel.listByUser(user_id);
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getAllEvents, createEvent, updateEvent, deleteEvent, getUserEvents };