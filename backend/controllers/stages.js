const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM stage ORDER BY stage_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_stage($1::VARCHAR(100),$2::VARCHAR(256))) AS stage',
            [name, description]
        );
        res.status(201).json(result.rows[0].stage);
    } catch (error) {
        console.error('Error creating stage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:stageId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM stage WHERE stage_id = $1',
            [req.params.stageId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stage not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching stage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:stageId', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_stage($1::INTEGER,$2::VARCHAR(100),$3::VARCHAR(256))) AS stage',
            [req.params.stageId, name, description]
        );
        if (!result.rows[0].stage) {
            return res.status(404).json({ error: 'Stage not found' });
        }
        res.json(result.rows[0].stage);
    } catch (error) {
        console.error('Error updating stage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:stageId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_stage($1::INTEGER)', [req.params.stageId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting stage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
