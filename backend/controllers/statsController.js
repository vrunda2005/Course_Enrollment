// server/controllers/statsController.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get Top Courses Stats
router.get('/top-courses', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM view_top_courses LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Student Progress Stats
router.get('/student-progress', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM view_student_progress LIMIT 20');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Department Statistics
router.get('/departments', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                d.department_id,
                d.name,
                d.code,
                (SELECT COUNT(*)::int FROM students s WHERE s.department_id = d.department_id) as student_count,
                (SELECT COUNT(*)::int FROM courses c WHERE c.department_id = d.department_id) as course_count,
                (SELECT COUNT(*)::int FROM enrollments e 
                 JOIN students s ON e.student_id = s.student_id 
                 WHERE s.department_id = d.department_id) as enrollment_count
            FROM departments d
            ORDER BY student_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Enrollment Status Breakdown
router.get('/enrollment-status', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT status, COUNT(*) as count
      FROM enrollments
      GROUP BY status
      ORDER BY count DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Overall Statistics
router.get('/overview', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM departments) as total_departments,
        (SELECT ROUND(AVG(calculate_gpa(student_id)), 2) FROM students) as average_gpa
    `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
