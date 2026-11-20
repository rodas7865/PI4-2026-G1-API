const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
    try {
        const result = await db.query('SELECT * FROM app_role ORDER BY role_id');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_app_role($1::VARCHAR(100),$2::VARCHAR(256))) AS role',
            [name, description]
        );
        res.status(201).json(result.rows[0].role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:roleId', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM app_role WHERE role_id = $1',
            [req.params.roleId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:roleId', async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_app_role($1::INTEGER,$2::VARCHAR(100),$3::VARCHAR(256))) AS role',
            [req.params.roleId, name, description]
        );
        if (!result.rows[0].role) {
            return res.status(404).json({ error: 'Role not found' });
        }
        res.json(result.rows[0].role);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:roleId', async (req, res) => {
    try {
        await db.query('CALL sp_remove_app_role($1::INTEGER)', [req.params.roleId]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:roleId/permissions', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM role_permissions WHERE role_id = $1 ORDER BY permission_id',
            [req.params.roleId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:roleId/permissions', async (req, res) => {
    try {
        const { permissionId, canRead, canWrite } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_create_role_permissions($1::INTEGER,$2::INTEGER,$3::BOOLEAN,$4::BOOLEAN)) AS role_permission',
            [req.params.roleId, permissionId, canRead, canWrite]
        );
        res.status(201).json(result.rows[0].role_permission);
    } catch (error) {
        console.error('Error creating role permission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/:roleId/permissions', async (req, res) => {
    try {
        const { permissionId, canRead, canWrite } = req.body;
        const result = await db.query(
            'SELECT row_to_json(fn_update_role_permissions($1::INTEGER,$2::INTEGER,$3::BOOLEAN,$4::BOOLEAN)) AS role_permission',
            [req.params.roleId, permissionId, canRead, canWrite]
        );
        if (!result.rows[0].role_permission) {
            return res.status(404).json({ error: 'Role permission not found' });
        }
        res.json(result.rows[0].role_permission);
    } catch (error) {
        console.error('Error updating role permission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:roleId/permissions/:permissionId', async (req, res) => {
    try {
        await db.query(
            'CALL sp_remove_role_permissions($1::INTEGER,$2::INTEGER)',
            [req.params.roleId, req.params.permissionId]
        );
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting role permission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
