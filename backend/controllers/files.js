const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM file ORDER BY file_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.user?.user;
        if (userId == null) {
            return res.status(401).json({ error: 'Authenticated user required' });
        }
        const { workId, filename, fileType, base64, isPublic } = req.body;
        const contents = Buffer.from(base64, 'base64');
        const result = await db.query(
            'SELECT row_to_json(fn_create_file($1::INTEGER,$2::INTEGER,$3::VARCHAR(200),$4::VARCHAR(50),$5::BYTEA,$6::BOOLEAN)) AS file',
            [workId, userId, filename, fileType, contents, isPublic]
        );
        res.status(201).json(result.rows[0].file);
    } catch (error) {
        console.error('Error creating file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:fileId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM file WHERE file_id = $1',
            [req.params.fileId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:fileId', async (req, res) => {
    try {
        const userId = req.user?.user;
        if (userId == null) {
            return res.status(401).json({ error: 'Authenticated user required' });
        }
        const { workId, filename, fileType, base64, isPublic } = req.body;
        const contents = Buffer.from(base64, 'base64');
        const result = await db.query(
            'SELECT row_to_json(fn_update_file($1::INTEGER,$2::INTEGER,$3::INTEGER,$4::VARCHAR(200),$5::VARCHAR(50),$6::BYTEA,$7::BOOLEAN)) AS file',
            [req.params.fileId, workId, userId, filename, fileType, contents, isPublic]
        );
        if (!result.rows[0].file) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(result.rows[0].file);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:fileId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_file($1::INTEGER)', [req.params.fileId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
