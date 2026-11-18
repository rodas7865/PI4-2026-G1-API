const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM stage_record ORDER BY stage_record_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stage records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { workId, stageId, workerId, startDateTime, endDateTime, note } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_stage_record($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::TIMESTAMP,$5::TIMESTAMP,$6::VARCHAR(200))) AS stage_record',
            [workId, stageId, workerId, startDateTime, endDateTime, note]
        );
        res.status(201).json(result.rows[0].stage_record);
    } catch (error) {
        console.error('Error creating stage record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:stageRecordId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM stage_record WHERE stage_record_id = $1',
            [req.params.stageRecordId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stage record not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching stage record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:stageRecordId', async (req, res) => {
    try {
        const { workId, stageId, workerId, startDateTime, endDateTime, note } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_stage_record($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::INTEGER,$5::TIMESTAMP,$6::TIMESTAMP,$7::VARCHAR(200))) AS stage_record',
            [req.params.stageRecordId, workId, stageId, workerId, startDateTime, endDateTime, note]
        );
        if (!result.rows[0].stage_record) {
            return res.status(404).json({ error: 'Stage record not found' });
        }
        res.json(result.rows[0].stage_record);
    } catch (error) {
        console.error('Error updating stage record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:stageRecordId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_stage_record($1::INTEGER)', [req.params.stageRecordId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting stage record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
