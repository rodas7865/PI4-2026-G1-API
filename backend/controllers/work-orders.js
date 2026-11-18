const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM work_order ORDER BY work_order_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching work orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            clientId,
            patientId,
            nextAppointmentDate,
            patientExternalId,
            sex,
            age,
        } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_work_order($1::INTEGER,$2::VARCHAR(50),$3::DATE,$4::VARCHAR(150),$5::VARCHAR(20),$6::INTEGER)) AS work_order',
            [clientId, patientId, nextAppointmentDate, patientExternalId, sex, age]
        );
        res.status(201).json(result.rows[0].work_order);
    } catch (error) {
        console.error('Error creating work order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:workOrderId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM work_order WHERE work_order_id = $1',
            [req.params.workOrderId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching work order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:workOrderId', async (req, res) => {
    try {
        const {
            clientId,
            patientId,
            nextAppointmentDate,
            patientExternalId,
            sex,
            age,
        } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_work_order($1::INTEGER,$2::INTEGER,$3::VARCHAR(50),$4::DATE,$5::VARCHAR(150),$6::VARCHAR(20),$7::INTEGER)) AS work_order',
            [
                req.params.workOrderId,
                clientId,
                patientId,
                nextAppointmentDate,
                patientExternalId,
                sex,
                age,
            ]
        );
        if (!result.rows[0].work_order) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        res.json(result.rows[0].work_order);
    } catch (error) {
        console.error('Error updating work order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:workOrderId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_work_order($1::INTEGER)', [req.params.workOrderId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting work order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
