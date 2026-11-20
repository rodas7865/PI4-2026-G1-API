const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM work');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching works:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            workOrderId,
            workTypeId,
            materialId,
            status,
            colorId,
            additionalInformation,
            nature,
        } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_work($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::VARCHAR(50),$5::INTEGER,$6::VARCHAR(200),$7::VARCHAR(20))) AS work',
            [workOrderId, workTypeId, materialId, status, colorId, additionalInformation, nature]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating work:', error);
        res.status(500).json(error);
    }   
});

router.get('/:workId', async (req, res) => {
    try {
        const {workId} = req.params;

        const result = await db.query('SELECT * FROM work WHERE work_id = $1', [workId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching work:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:workId', async (req, res) => {
    try {
        const {workId} = req.params;
        const {
            workOrderId,
            workTypeId,
            materialId,
            status,
            colorId,
            additionalInformation,
            nature,
        } = req.body;

        const result = await db.query(
            'SELECT row_to_json(fn_update_work($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::INTEGER,$5::VARCHAR(50),$6::INTEGER,$7::VARCHAR(200),$8::VARCHAR(20))) AS work',
            [workId, workOrderId, workTypeId, materialId, status, colorId, additionalInformation, nature]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating work:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:workId', async (req, res) => {
    try {
        const {workId} = req.params;

        await db.query('CALL sp_remove_work($1::INTEGER)', [workId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting work:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;