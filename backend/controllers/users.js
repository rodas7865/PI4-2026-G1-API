const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, password, email, accountStatus, accountType, contactInfo } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.query('SELECT row_to_json(create_user($1::VARCHAR(100),$2::VARCHAR(100),$3::VARCHAR(255),$4::VARCHAR(50),$5::VARCHAR(50),$6::VARCHAR(200)))::jsonb - \'password\'', [name, email, hashedPassword, accountStatus, accountType, contactInfo]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json(error);
    }   
});

module.exports = router;