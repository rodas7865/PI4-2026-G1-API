const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM work_type');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching work types:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_work_type($1::VARCHAR(100),$2::VARCHAR(256))) AS work_type',
            [name, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating work type:', error);
        res.status(500).json(error);
    }   
});

router.get('/:workTypeId', async (req, res) => {
    try {
        const {workTypeId} = req.params;

        const result = await db.query('SELECT * FROM work_type WHERE work_type_id = $1', [workTypeId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching work type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:workTypeId', async (req, res) => {
    try {
        const {workTypeId} = req.params;
        const { name, description } = req.body;

        const result = await db.query(
            'SELECT row_to_json(fn_update_work_type($1::INTEGER,$2::VARCHAR(100),$3::VARCHAR(256))) AS work_type',
            [workTypeId, name, description]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating work type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:workTypeId', async (req, res) => {
    try {
        const {workTypeId} = req.params;

        await db.query('CALL sp_remove_work_type($1::INTEGER)', [workTypeId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting work type:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;