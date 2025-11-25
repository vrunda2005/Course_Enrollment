// server/controllers/coursesController.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT c.*, d.name as department_name, d.code as department_code,
             COUNT(e.enrollment_id) as enrollment_count
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      GROUP BY c.course_id, d.name, d.code
      ORDER BY c.title
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get course by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
      SELECT c.*, d.name as department_name,
             COUNT(e.enrollment_id) as enrollment_count
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN enrollments e ON c.course_id = e.course_id
      WHERE c.course_id = $1
      GROUP BY c.course_id, d.name
    `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new course
router.post('/', async (req, res) => {
    const { title, code, credits, department_id } = req.body;
    const deptId = department_id === '' ? null : department_id;

    console.log('[CREATE COURSE] Request:', { title, code, credits, department_id: deptId });

    if (!title || !code || !credits) {
        return res.status(400).json({ error: 'Title, code, and credits are required' });
    }
    try {
        const result = await db.query(`
      INSERT INTO courses (title, code, credits, department_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, code, credits, deptId]);
        console.log('[CREATE COURSE] Success:', result.rows[0].course_id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[CREATE COURSE] Error:', err.message, 'Code:', err.code);
        if (err.code === '23505') {
            res.status(409).json({ error: 'Course code already exists', detail: err.detail });
        } else if (err.code === '23503') {
            res.status(400).json({ error: 'Invalid department ID', detail: err.detail });
        } else if (err.code === '22P02') {
            res.status(400).json({ error: 'Invalid UUID format for department ID', detail: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create course', detail: err.message });
        }
    }
});

// Update course
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, code, credits, department_id } = req.body;
    const deptId = department_id === '' ? null : department_id;

    console.log('[UPDATE COURSE] Request:', { id, title, code, credits, department_id: deptId });

    try {
        const result = await db.query(`
      UPDATE courses
      SET title = COALESCE($1, title),
          code = COALESCE($2, code),
          credits = COALESCE($3, credits),
          department_id = $4
      WHERE course_id = $5
      RETURNING *
    `, [title, code, credits, deptId, id]);
        if (result.rows.length === 0) {
            console.log('[UPDATE COURSE] Not found:', id);
            return res.status(404).json({ error: 'Course not found' });
        }
        console.log('[UPDATE COURSE] Success:', id);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[UPDATE COURSE] Error:', err.message, 'Code:', err.code);
        if (err.code === '22P02') {
            res.status(400).json({ error: 'Invalid UUID format', detail: err.message });
        } else {
            res.status(500).json({ error: 'Failed to update course', detail: err.message });
        }
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('[DELETE COURSE] Request:', id);
    try {
        const result = await db.query('DELETE FROM courses WHERE course_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            console.log('[DELETE COURSE] Not found:', id);
            return res.status(404).json({ error: 'Course not found' });
        }
        console.log('[DELETE COURSE] Success:', id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('[DELETE COURSE] Error:', err.message, 'Code:', err.code);
        res.status(500).json({ error: 'Failed to delete course', detail: err.message });
    }
});

module.exports = router;
