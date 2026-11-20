const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT material_id, name FROM material ORDER BY material_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_material($1::VARCHAR(100)))::jsonb',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:materialId', async (req, res) => {
    try {
        const { materialId } = req.params;
        const result = await db.query(
            'SELECT material_id, name FROM material WHERE material_id = $1',
            [materialId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching material:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:materialId', async (req, res) => {
    try {
        const { materialId } = req.params;
        const { name } = req.body;

        const result = await db.query(
            'SELECT row_to_json(fn_update_material($1, $2::VARCHAR(100)))::jsonb AS material',
            [materialId, name]
        );

        if (!result.rows[0]?.material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.json(result.rows[0].material);
    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:materialId', async (req, res) => {
    try {
        const { materialId } = req.params;
        await db.query('CALL sp_remove_material($1)', [materialId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;