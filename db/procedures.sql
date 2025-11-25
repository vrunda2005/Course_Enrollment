-- Function to update total credits for a student
CREATE OR REPLACE FUNCTION update_total_credits()
RETURNS TRIGGER AS $$
DECLARE
    affected_student_id UUID;
    remaining_enrollments INTEGER;
BEGIN
    -- Determine which student_id to use based on operation type
    -- For DELETE, use OLD.student_id; for INSERT/UPDATE, use NEW.student_id
    IF (TG_OP = 'DELETE') THEN
        affected_student_id := OLD.student_id;
    ELSE
        affected_student_id := NEW.student_id;
    END IF;
    
    -- Check if student has any remaining enrollments
    SELECT COUNT(*) INTO remaining_enrollments
    FROM enrollments
    WHERE student_id = affected_student_id;
    
    -- If no enrollments remain, delete the student_credits record
    IF remaining_enrollments = 0 THEN
        DELETE FROM student_credits WHERE student_id = affected_student_id;
    ELSE
        -- Update the student_credits table
        -- We recalculate from scratch to ensure consistency
        INSERT INTO student_credits (student_id, total_credits, last_updated)
        SELECT 
            affected_student_id, 
            COALESCE(SUM(c.credits), 0),
            CURRENT_TIMESTAMP
        FROM enrollments e
        JOIN courses c ON e.course_id = c.course_id
        WHERE e.student_id = affected_student_id AND e.status IN ('COMPLETED', 'ENROLLED')
        ON CONFLICT (student_id) DO UPDATE
        SET 
            total_credits = EXCLUDED.total_credits,
            last_updated = EXCLUDED.last_updated;
    END IF;
    
    -- Return appropriate record based on operation
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire on enrollment changes
CREATE TRIGGER trg_update_credits
AFTER INSERT OR UPDATE OR DELETE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_total_credits();

-- Procedure to register a student in a course
CREATE OR REPLACE PROCEDURE register_student(
    p_student_id UUID,
    p_course_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_credits INTEGER;
    v_current_credits INTEGER;
BEGIN
    -- Check if course exists
    SELECT credits INTO v_credits FROM courses WHERE course_id = p_course_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Course not found';
    END IF;

    -- Check if already enrolled
    IF EXISTS (SELECT 1 FROM enrollments WHERE student_id = p_student_id AND course_id = p_course_id) THEN
        RAISE NOTICE 'Student already enrolled in this course';
        RETURN;
    END IF;

    -- Insert enrollment
    INSERT INTO enrollments (student_id, course_id, status)
    VALUES (p_student_id, p_course_id, 'ENROLLED');
    
    RAISE NOTICE 'Student registered successfully';
END;
$$;

-- Function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_gpa(p_student_id UUID)
RETURNS NUMERIC(3, 2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_points NUMERIC := 0;
    v_total_credits INTEGER := 0;
    v_gpa NUMERIC(3, 2);
BEGIN
    SELECT 
        SUM(
            CASE grade
                WHEN 'A' THEN 4.0 * c.credits
                WHEN 'B' THEN 3.0 * c.credits
                WHEN 'C' THEN 2.0 * c.credits
                WHEN 'D' THEN 1.0 * c.credits
                ELSE 0
            END
        ),
        SUM(CASE WHEN grade IN ('A', 'B', 'C', 'D', 'F') THEN c.credits ELSE 0 END)
    INTO v_total_points, v_total_credits
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE e.student_id = p_student_id AND e.status = 'COMPLETED';

    IF v_total_credits = 0 THEN
        RETURN 0.00;
    END IF;

    v_gpa := v_total_points / v_total_credits;
    RETURN ROUND(v_gpa, 2);
END;
$$;
