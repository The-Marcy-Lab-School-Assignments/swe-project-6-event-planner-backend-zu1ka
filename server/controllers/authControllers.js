const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await userModel.create(username, password);
        req.session.userId = user.user_id;
        res.status(201).json(user);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Username already taken.' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await userModel.findByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        req.session.userId = user.user_id;
        res.status(200).json({ user_id: user.user_id, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getMe = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json(null);
    }
    try {
        const user = await userModel.findById(req.session.userId);
        if (!user) return res.status(401).json(null);
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const logout = (req, res) => {
    req.session = null;
    res.status(200).json({ message: 'Logged out.' });
};

module.exports = { register, login, getMe, logout };