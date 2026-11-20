const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM note ORDER BY note_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.user?.user;
        if (userId == null) {
            return res.status(401).json({ error: 'Authenticated user required' });
        }
        const { workId, content, isPublic } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_note($1::INTEGER,$2::INTEGER,$3::VARCHAR(256),$4::BOOLEAN)) AS note',
            [workId, userId, content, isPublic]
        );
        res.status(201).json(result.rows[0].note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:noteId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM note WHERE note_id = $1',
            [req.params.noteId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:noteId', async (req, res) => {
    try {
        const userId = req.user?.user;
        if (userId == null) {
            return res.status(401).json({ error: 'Authenticated user required' });
        }
        const { workId, content, isPublic } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_note($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::VARCHAR(256),$5::BOOLEAN)) AS note',
            [req.params.noteId, workId, userId, content, isPublic]
        );
        if (!result.rows[0].note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(result.rows[0].note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:noteId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_note($1::INTEGER)', [req.params.noteId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
