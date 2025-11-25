import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const EnrollmentForm = ({ onSuccess }) => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [studentStats, setStudentStats] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [studentsRes, coursesRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/students'),
                    axios.get('http://localhost:3000/api/courses')
                ]);
                setStudents(studentsRes.data);
                setCourses(coursesRes.data);
            } catch (err) {
                console.error('Error fetching options:', err);
            }
        };
        fetchOptions();
    }, []);

    const fetchStudentStats = async (studentId) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/stats/student-progress`);
            const stats = res.data.find(s => s.student_id === studentId);
            setStudentStats(stats);
        } catch (err) {
            console.error('Error fetching student stats:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setStudentStats(null);

        if (!selectedStudent || !selectedCourse) {
            setError('Please select both student and course');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/enrollments', {
                student_id: selectedStudent,
                course_id: selectedCourse
            });
            setMessage(response.data.message);
            // Reset selection
            setSelectedCourse('');
            // Refresh student stats to show updated credits/GPA via trigger
            await fetchStudentStats(selectedStudent);

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Enrollment failed');
        }
    };

    return (
        <div className="enrollment-form">
            <h2>Enroll Student</h2>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            {studentStats && (
                <div className="success">
                    Updated Credits: {studentStats.total_credits} | GPA: {studentStats.gpa}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Student:</label>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        <option value="">Select Student</option>
                        {students.map(s => (
                            <option key={s.student_id} value={s.student_id}>
                                {s.first_name} {s.last_name} ({s.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Course:</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c.course_id} value={c.course_id}>
                                {c.title} ({c.code}) - {c.credits} Credits
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit">Enroll</button>
            </form>
        </div>
    );
};

export default EnrollmentForm;
