// server/controllers/departmentsController.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all departments
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM departments ORDER BY department_id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get department by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM departments WHERE department_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new department
router.post('/', async (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
    }
    try {
        const result = await db.query(`
      INSERT INTO departments (name, code)
      VALUES ($1, $2)
      RETURNING *
    `, [name, code]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update department
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, code } = req.body;
    try {
        const result = await db.query(`
      UPDATE departments
      SET name = COALESCE($1, name),
          code = COALESCE($2, code)
      WHERE department_id = $3
      RETURNING *
    `, [name, code, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete department
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM departments WHERE department_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
