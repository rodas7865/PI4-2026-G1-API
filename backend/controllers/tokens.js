const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM app_user WHERE email = $1', [req.body.email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        console.log('User fetched from database:', user);

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ user: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated JWT token:', token);
        console.log('userid:', user.user_id);
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.send('Token created');

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;