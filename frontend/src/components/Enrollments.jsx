import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import EnrollmentForm from './EnrollmentForm';
import { useAuth } from '../context/AuthContext';

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const fetchEnrollments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/enrollments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEnrollments(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch enrollments');
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to drop this course?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/enrollments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchEnrollments();
        } catch (err) {
            console.error(err);
            alert('Failed to drop course');
        }
    };

    return (
        <div className="enrollments-page">
            <EnrollmentForm onSuccess={fetchEnrollments} />

            <div className="enrollments-list">
                <h2>Current Enrollments</h2>
                {error && <p className="error">{error}</p>}
                <table>
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Course</th>
                            <th>Credits</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map(e => (
                            <tr key={e.enrollment_id}>
                                <td>{e.first_name} {e.last_name}</td>
                                <td>{e.course_title} ({e.course_code})</td>
                                <td>{e.credits}</td>
                                <td>{e.status}</td>
                                <td>{e.grade || '-'}</td>
                                <td>{new Date(e.enrollment_date).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => handleDelete(e.enrollment_id)}>Drop</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Enrollments;
