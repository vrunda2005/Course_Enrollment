import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Dashboard = () => {
    // Stats state
    const [topCourses, setTopCourses] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [enrollmentStatus, setEnrollmentStatus] = useState([]);
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, progressRes, deptRes, statusRes, overviewRes] = await Promise.all([
                    axios.get('/stats/top-courses'),
                    axios.get('/stats/student-progress'),
                    axios.get('/stats/departments'),
                    axios.get('/stats/enrollment-status'),
                    axios.get('/stats/overview')
                ]);
                setTopCourses(coursesRes.data);
                setStudentProgress(progressRes.data);
                setDepartments(deptRes.data);
                setEnrollmentStatus(statusRes.data);
                setOverview(overviewRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="dashboard">
            <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                📊 Loading dashboard data...
            </div>
        </div>
    );

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats-container">
                {/* Top Courses */}
                <div className="stat-box">
                    <h3>Top 10 Popular Courses</h3>
                    <table>
                        <thead>
                            <tr><th>Course</th><th>Code</th><th>Enrollments</th></tr>
                        </thead>
                        <tbody>
                            {topCourses.map((course, idx) => (
                                <tr key={course.course_id || idx}>
                                    <td>{course.title}</td>
                                    <td>{course.code}</td>
                                    <td>{course.enrollment_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Student Progress */}
                <div className="stat-box">
                    <h3>Student Progress (Recent)</h3>
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Dept</th><th>Credits</th><th>GPA</th></tr>
                        </thead>
                        <tbody>
                            {studentProgress.map((student, idx) => (
                                <tr key={student.student_id || idx}>
                                    <td>{student.first_name} {student.last_name}</td>
                                    <td>{student.department}</td>
                                    <td>{student.total_credits}</td>
                                    <td>{student.gpa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Departments Stats */}
                <div className="stat-box">
                    <h3>Departments Overview</h3>
                    <table>
                        <thead>
                            <tr><th>Department</th><th>Students</th><th>Courses</th><th>Enrollments</th></tr>
                        </thead>
                        <tbody>
                            {departments.map((dep, idx) => (
                                <tr key={dep.department_id || idx}>
                                    <td>{dep.name}</td>
                                    <td>{dep.student_count}</td>
                                    <td>{dep.course_count}</td>
                                    <td>{dep.enrollment_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Enrollment Status */}
                <div className="stat-box">
                    <h3>Enrollment Status Breakdown</h3>
                    <table>
                        <thead>
                            <tr><th>Status</th><th>Count</th></tr>
                        </thead>
                        <tbody>
                            {enrollmentStatus.map((item, idx) => (
                                <tr key={item.status || idx}>
                                    <td>{item.status}</td>
                                    <td>{item.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Overview Stats */}
                {overview && (
                    <div className="stat-box">
                        <h3>Overall Statistics</h3>
                        <ul>
                            <li>Total Students: {overview.total_students}</li>
                            <li>Total Courses: {overview.total_courses}</li>
                            <li>Total Enrollments: {overview.total_enrollments}</li>
                            <li>Average GPA: {overview && overview.average_gpa ? Number(overview.average_gpa).toFixed(2) : 'N/A'}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
