// server/controllers/enrollmentsController.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all enrollments
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT e.*, 
             s.first_name, s.last_name, s.email,
             c.title as course_title, c.code as course_code, c.credits
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
      ORDER BY e.enrollment_date DESC
      LIMIT 100
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Enroll student (calls stored procedure)
router.post('/', async (req, res) => {
    const { student_id, course_id } = req.body;
    if (!student_id || !course_id) {
        return res.status(400).json({ error: 'Student ID and Course ID are required' });
    }
    try {
        await db.query('CALL register_student($1, $2)', [student_id, course_id]);
        res.json({ message: 'Enrollment successful' });
    } catch (err) {
        console.error(err);
        // Postgres error codes or custom messages from procedure
        if (err.message.includes('Student already enrolled') || err.code === 'P0001') {
            // P0001 is default for RAISE EXCEPTION
            if (err.message.includes('Student already enrolled')) {
                return res.status(409).json({ error: 'Student already enrolled in this course' });
            }
            if (err.message.includes('Course not found')) {
                return res.status(404).json({ error: 'Course not found' });
            }
        }

        res.status(500).json({ error: 'Enrollment failed: ' + err.message });
    }
});

// Update enrollment (status/grade)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, grade } = req.body;
    try {
        const result = await db.query(`
      UPDATE enrollments
      SET status = COALESCE($1, status),
          grade = COALESCE($2, grade)
      WHERE enrollment_id = $3
      RETURNING *
    `, [status, grade, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json({
            message: 'Enrollment updated successfully. Trigger will auto-update student credits!',
            enrollment: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete enrollment (drop course)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM enrollments WHERE enrollment_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json({ message: 'Course dropped successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
