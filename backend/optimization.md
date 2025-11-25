# Performance Optimization

## Query Analysis

To optimize performance, we analyze key queries using `EXPLAIN ANALYZE`.

### 1. Find all enrollments for a specific student
**Query:**
```sql
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE student_id = 'some-uuid';
```
**Optimization:**
- Created index `idx_enrollments_student` on `enrollments(student_id)`.
- **Impact:** Reduces scan from Sequential Scan (O(N)) to Index Scan (O(log N)).

### 2. Calculate GPA for a student
**Query:**
```sql
EXPLAIN ANALYZE SELECT * FROM enrollments WHERE student_id = 'some-uuid' AND status = 'COMPLETED';
```
**Optimization:**
- The index `idx_enrollments_student` helps here too.
- We could add a composite index `idx_enrollments_student_status` on `(student_id, status)` if filtering by status is frequent and selective.

### 3. Find popular courses (Aggregation)
**Query:**
```sql
EXPLAIN ANALYZE 
SELECT course_id, COUNT(*) 
FROM enrollments 
GROUP BY course_id;
```
**Optimization:**
- Created index `idx_enrollments_course` on `enrollments(course_id)`.
- **Impact:** Helps in grouping and joining with courses table.

## Applied Indexes
The following indexes were applied in `schema.sql`:

```sql
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

## Further Improvements
- **Materialized Views**: For complex reports like `view_course_popularity`, if data volume grows huge, we can use `MATERIALIZED VIEW` to cache results and refresh periodically.
- **Partitioning**: If `enrollments` table grows to millions, partition by `enrollment_date` (Year/Semester).
