const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM client ORDER BY client_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { userId, nif, address } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_client($1::INTEGER,$2::VARCHAR(30),$3::VARCHAR(250))) AS client',
            [userId, nif, address]
        );
        res.status(201).json(result.rows[0].client);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:clientId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM client WHERE client_id = $1',
            [req.params.clientId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:clientId', async (req, res) => {
    try {
        const { userId, nif, address } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_client($1::INTEGER,$2::INTEGER,$3::VARCHAR(30),$4::VARCHAR(250))) AS client',
            [req.params.clientId, userId, nif, address]
        );
        if (!result.rows[0].client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(result.rows[0].client);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:clientId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_client($1::INTEGER)', [req.params.clientId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
