import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ first_name: '', last_name: '', email: '', department_id: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/students');
            setStudents(res.data);
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
        fetchStudents();
        fetchDepartments();
    }, []);

    const handleEdit = (student) => {
        setEditing(student.student_id);
        setForm({
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            department_id: student.department_id || ''
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await axios.delete(`/students/${id}`);
            setMessage('Student deleted');
            fetchStudents();
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
                const res = await axios.put(`/students/${editing}`, form);
                setMessage('Student updated');
                // Update local state directly to reflect changes immediately
                setStudents(students.map(s => s.student_id === editing ? res.data : s));
            } else {
                const res = await axios.post('/students', form);
                setMessage('Student created');
                // Add new student to local state
                setStudents([res.data, ...students]);
            }
            setEditing(null);
            setForm({ first_name: '', last_name: '', email: '', department_id: '' });
            // fetchStudents(); // Optional: if we want to re-fetch everything, but local update is faster
        } catch (err) {
            console.error('Save error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Save failed');
        }
    };

    return (
        <div className="student-management">
            <h2>Student Management</h2>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit} className="enrollment-form">
                <div className="form-group">
                    <label>First Name</label>
                    <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
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
            <table>
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Dept</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.student_id}>
                            <td>{s.first_name} {s.last_name}</td>
                            <td>{s.email}</td>
                            <td>{s.department_name || ''}</td>
                            <td>
                                <button onClick={() => handleEdit(s)}>Edit</button>
                                <button onClick={() => handleDelete(s.student_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Students;
