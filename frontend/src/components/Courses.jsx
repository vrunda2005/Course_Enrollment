import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Courses = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', code: '', credits: '', department_id: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const handleEdit = (course) => {
        setEditing(course.course_id);
        setForm({
            title: course.title,
            code: course.code,
            credits: course.credits,
            department_id: course.department_id || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            await axios.delete(`/courses/${id}`);
            setMessage('Course deleted');
            fetchCourses();
        } catch (err) {
            console.error('Delete error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Delete failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            if (editing) {
                await axios.put(`/courses/${editing}`, form);
                setMessage('Course updated');
            } else {
                await axios.post('/courses', form);
                setMessage('Course created');
            }
            setEditing(null);
            setForm({ title: '', code: '', credits: '', department_id: '' });
            fetchCourses();
        } catch (err) {
            console.error('Save error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Save failed');
        }
    };

    return (
        <div className="course-management">
            <h2>Course Management</h2>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            {user?.role === 'admin' && (
                <form onSubmit={handleSubmit} className="enrollment-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Code</label>
                        <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Credits</label>
                        <input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            value={form.department_id}
                            onChange={e => setForm({ ...form, department_id: e.target.value })}
                        >
                            <option value="">Select Department (Optional)</option>
                            {departments.map(dept => (
                                <option key={dept.department_id} value={dept.department_id}>
                                    {dept.name} ({dept.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">{editing ? 'Update' : 'Create'}</button>
                </form>
            )}
            <table>
                <thead>
                    <tr><th>Title</th><th>Code</th><th>Credits</th>{user?.role === 'admin' && <th>Actions</th>}</tr>
                </thead>
                <tbody>
                    {courses.map(c => (
                        <tr key={c.course_id}>
                            <td>{c.title}</td>
                            <td>{c.code}</td>
                            <td>{c.credits}</td>
                            {user?.role === 'admin' && (
                                <td>
                                    <button onClick={() => handleEdit(c)}>Edit</button>
                                    <button onClick={() => handleDelete(c.course_id)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Courses;
