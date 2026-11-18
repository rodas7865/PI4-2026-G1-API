const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM worker ORDER BY worker_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching collaborators:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_worker($1::INTEGER,$2::INTEGER)) AS worker',
            [userId, roleId]
        );
        res.status(201).json(result.rows[0].worker);
    } catch (error) {
        console.error('Error creating collaborator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:workerId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM worker WHERE worker_id = $1',
            [req.params.workerId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching collaborator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:workerId', async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_worker($1::INTEGER,$2::INTEGER,$3::INTEGER)) AS worker',
            [req.params.workerId, userId, roleId]
        );
        if (!result.rows[0].worker) {
            return res.status(404).json({ error: 'Collaborator not found' });
        }
        res.json(result.rows[0].worker);
    } catch (error) {
        console.error('Error updating collaborator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:workerId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_worker($1::INTEGER)', [req.params.workerId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting collaborator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
