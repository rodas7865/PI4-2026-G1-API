const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM '); //FIX Query
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { id, name, description } = req.body;//
        const result = await db.query('SELECT row_to_json(fn_create_app_user($1::VARCHAR(100),$2::VARCHAR(100),$3::VARCHAR(255)))::jsonb - \'password\'', [id, name, description]);
        //Fix query function and fields
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json(error);
    }   
});

router.get('/:noteId', async (req, res) => {
    try {
        const {noteId} = req.params;

        const result = await db.query(`SELECT * FROM role WHERE role_id = $1`, [noteId]);
        //Check query fields
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:noteId', async (req, res) => {
    try {
        const {noteId} = req.params;
        const { name, description } = req.body;

        const result = await db.query('SELECT row_to_json(fn_update_app_user($1::VARCHAR(100),$2::VARCHAR(100),$3::VARCHAR(100),$4::VARCHAR(255),$5::VARCHAR(50),$6::VARCHAR(50),$7::VARCHAR(200)))::jsonb - \'password\'', [noteId, name, description ]);
        //Query is wrong
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:noteId', async (req, res) => {
    try {
        const {noteId} = req.params;

        const result = await db.query('EXECUTE sp_remove_app_user($1::INTEGER)', [noteId]);
        //Fix Process
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;