// server/controllers/studentsController.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all students
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT s.*, d.name as department_name, d.code as department_code
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY s.created_at DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get student by ID with enrollments
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const studentResult = await db.query(`
      SELECT s.*, d.name as department_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.department_id
      WHERE s.student_id = $1
    `, [id]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const enrollmentsResult = await db.query(`
      SELECT e.*, c.title, c.code, c.credits
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = $1
      ORDER BY e.enrollment_date DESC
    `, [id]);
        res.json({
            student: studentResult.rows[0],
            enrollments: enrollmentsResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new student
router.post('/', async (req, res) => {
    const { first_name, last_name, email, department_id } = req.body;
    const deptId = department_id === '' ? null : department_id;

    console.log('[CREATE STUDENT] Request:', { first_name, last_name, email, department_id: deptId });

    if (!first_name || !last_name || !email) {
        return res.status(400).json({ error: 'First name, last name, and email are required' });
    }
    try {
        const result = await db.query(`
      INSERT INTO students (first_name, last_name, email, department_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [first_name, last_name, email, deptId]);
        console.log('[CREATE STUDENT] Success:', result.rows[0].student_id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[CREATE STUDENT] Error:', err.message, 'Code:', err.code);
        if (err.code === '23505') {
            res.status(409).json({ error: 'Email already exists', detail: err.detail });
        } else if (err.code === '23503') {
            res.status(400).json({ error: 'Invalid department ID', detail: err.detail });
        } else if (err.code === '22P02') {
            res.status(400).json({ error: 'Invalid UUID format for department ID', detail: err.message });
        } else {
            res.status(500).json({ error: 'Failed to create student', detail: err.message });
        }
    }
});

// Update student
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, department_id } = req.body;
    const deptId = department_id === '' ? null : department_id;

    console.log('[UPDATE STUDENT] Request:', { id, first_name, last_name, email, department_id: deptId });

    try {
        const result = await db.query(`
      UPDATE students
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          email = COALESCE($3, email),
          department_id = $4
      WHERE student_id = $5
      RETURNING *
    `, [first_name, last_name, email, deptId, id]);
        if (result.rows.length === 0) {
            console.log('[UPDATE STUDENT] Not found:', id);
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch department name separately if needed
        const student = result.rows[0];
        if (student.department_id) {
            const deptResult = await db.query('SELECT name FROM departments WHERE department_id = $1', [student.department_id]);
            if (deptResult.rows.length > 0) {
                student.department_name = deptResult.rows[0].name;
            }
        }

        console.log('[UPDATE STUDENT] Success:', id);
        res.json(student);
    } catch (err) {
        console.error('[UPDATE STUDENT] Error:', err.message, 'Code:', err.code);
        if (err.code === '22P02') {
            res.status(400).json({ error: 'Invalid UUID format', detail: err.message });
        } else {
            res.status(500).json({ error: 'Failed to update student', detail: err.message });
        }
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('[DELETE STUDENT] Request:', id);
    try {
        const result = await db.query('DELETE FROM students WHERE student_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            console.log('[DELETE STUDENT] Not found:', id);
            return res.status(404).json({ error: 'Student not found' });
        }
        console.log('[DELETE STUDENT] Success:', id);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('[DELETE STUDENT] Error:', err.message, 'Code:', err.code);
        res.status(500).json({ error: 'Failed to delete student', detail: err.message });
    }
});

module.exports = router;
