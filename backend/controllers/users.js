const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM app_user');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, email, password, contactInfo, accountStatus, accountType,  } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.query('SELECT row_to_json(fn_create_app_user($1::VARCHAR(100),$2::VARCHAR(100),$3::VARCHAR(255),$4::VARCHAR(50),$5::VARCHAR(50),$6::VARCHAR(200)))::jsonb - \'password\'', [name, email, hashedPassword, contactInfo, accountStatus, accountType ]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json(error);
    }   
});

router.get('/:userId', async (req, res) => {
    try {
        const {userId} = req.params;

        const result = await db.query(`SELECT to_jsonb(u) - 'password' AS "user" FROM app_user u WHERE user_id = $1`, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:userId', async (req, res) => {
    try {
        const {userId} = req.params;
        const { name, email, password, contactInfo, accountStatus, accountType,  } = req.body;

        const result = await db.query('SELECT row_to_json(fn_update_app_user($1::VARCHAR(100),$2::VARCHAR(100),$3::VARCHAR(100),$4::VARCHAR(255),$5::VARCHAR(50),$6::VARCHAR(50),$7::VARCHAR(200)))::jsonb - \'password\'', [userId, name, email, password, contactInfo, accountStatus, accountType ]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:userId', async (req, res) => {
    try {
        const {userId} = req.params;

        const result = await db.query('EXECUTE sp_remove_app_user($1::INTEGER)', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;