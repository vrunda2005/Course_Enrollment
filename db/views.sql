-- Reporting Views

-- 1. Top Courses: Most enrolled courses
CREATE OR REPLACE VIEW view_top_courses AS
SELECT 
    c.course_id,
    c.title,
    c.code,
    COUNT(e.student_id) AS enrollment_count
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.title, c.code
ORDER BY enrollment_count DESC;

-- 2. Student Progress: Credits and GPA
CREATE OR REPLACE VIEW view_student_progress AS
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    d.name AS department,
    COALESCE(sc.total_credits, 0) AS total_credits,
    calculate_gpa(s.student_id) AS gpa
FROM students s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN student_credits sc ON s.student_id = sc.student_id;

-- 3. Course Popularity: Enrollment trends (simplified as we don't have historical terms in this schema, 
-- but we can group by department or just show general popularity)
CREATE OR REPLACE VIEW view_course_popularity AS
SELECT 
    d.name AS department,
    c.title AS course,
    COUNT(e.student_id) AS total_students,
    AVG(CASE 
        WHEN e.grade = 'A' THEN 4.0
        WHEN e.grade = 'B' THEN 3.0
        WHEN e.grade = 'C' THEN 2.0
        WHEN e.grade = 'D' THEN 1.0
        WHEN e.grade = 'F' THEN 0.0
        ELSE NULL 
    END) AS average_gpa
FROM courses c
JOIN departments d ON c.department_id = d.department_id
JOIN enrollments e ON c.course_id = e.course_id
WHERE e.status = 'COMPLETED'
GROUP BY d.name, c.title
ORDER BY total_students DESC;
