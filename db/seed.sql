-- Seed Data Script

-- Departments
INSERT INTO departments (name, code) VALUES
('Computer Science', 'CS'),
('Electrical Engineering', 'EE'),
('Mechanical Engineering', 'ME'),
('Civil Engineering', 'CE'),
('Business Administration', 'BA');

-- Courses (Generate 50 courses)
INSERT INTO courses (title, code, credits, department_id)
SELECT 
    'Course ' || i,
    'C' || i,
    (floor(random() * 3 + 2)::int), -- Credits between 2 and 4
    (SELECT department_id FROM departments ORDER BY random() LIMIT 1)
FROM generate_series(1, 50) AS i;

-- Students (Generate 1000 students)
INSERT INTO students (first_name, last_name, email, department_id)
SELECT 
    'Student' || i,
    'Lastname' || i,
    'student' || i || '@example.com',
    (SELECT department_id FROM departments ORDER BY random() LIMIT 1)
FROM generate_series(1, 1000) AS i;

-- Enrollments (Generate 5000 enrollments)
-- We'll just insert raw data for speed, bypassing the procedure for bulk load, 
-- but we need to be careful about uniqueness.
INSERT INTO enrollments (student_id, course_id, grade, status)
SELECT 
    s.student_id,
    c.course_id,
    CASE floor(random() * 5)
        WHEN 0 THEN 'A'
        WHEN 1 THEN 'B'
        WHEN 2 THEN 'C'
        WHEN 3 THEN 'D'
        ELSE 'F'
    END,
    'COMPLETED'
FROM students s
CROSS JOIN courses c
WHERE random() < 0.1 -- Approx 10% chance of enrollment per student-course pair
ON CONFLICT DO NOTHING;

-- Update student credits based on initial load
-- (Since we bypassed the trigger for bulk insert or if we want to ensure consistency)
-- Actually, the trigger fires on INSERT, so if we do bulk INSERTs, it will fire row-by-row.
-- For very large bulk loads, we might disable triggers and run a batch update later.
-- For 5000 rows, it's fine.
