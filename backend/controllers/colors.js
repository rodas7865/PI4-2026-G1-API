const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM color ORDER BY color_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_color($1::VARCHAR(100))) AS color',
            [name]
        );
        res.status(201).json(result.rows[0].color);
    } catch (error) {
        console.error('Error creating color:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:colorId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM color WHERE color_id = $1',
            [req.params.colorId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Color not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching color:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:colorId', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_color($1::INTEGER,$2::VARCHAR(100))) AS color',
            [req.params.colorId, name]
        );
        if (!result.rows[0].color) {
            return res.status(404).json({ error: 'Color not found' });
        }
        res.json(result.rows[0].color);
    } catch (error) {
        console.error('Error updating color:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:colorId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_color($1::INTEGER)', [req.params.colorId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting color:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
