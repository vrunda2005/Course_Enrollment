# Course Enrollment Optimization System

A full-stack web application for managing student enrollments, courses, and departments with advanced database optimization features including triggers, stored procedures, and materialized views.

## 🚀 Features

- **Student Management**: Create, read, update, and delete student records
- **Course Management**: Manage course catalog with credits and department associations
- **Enrollment System**: Enroll students in courses with automatic credit tracking
- **Department Organization**: Organize courses and students by academic departments
- **Real-time Statistics**: Dashboard with enrollment metrics, GPA tracking, and analytics
- **Database Triggers**: Automatic credit calculation when enrollments change
- **Stored Procedures**: Optimized enrollment registration with validation
- **Database Views**: Pre-computed analytics for performance optimization

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **PostgreSQL 15** - Relational database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL Alpine** - Lightweight database image

## 📊 Database Architecture

### Tables

#### `departments`
- `department_id` (UUID, Primary Key)
- `name` (VARCHAR, Unique)
- `code` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)

#### `students`
- `student_id` (UUID, Primary Key)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `enrollment_date` (DATE)
- `department_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

#### `courses`
- `course_id` (UUID, Primary Key)
- `title` (VARCHAR)
- `code` (VARCHAR, Unique)
- `credits` (INTEGER)
- `department_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)

#### `enrollments`
- `enrollment_id` (UUID, Primary Key)
- `student_id` (UUID, Foreign Key)
- `course_id` (UUID, Foreign Key)
- `enrollment_date` (DATE)
- `grade` (VARCHAR) - A, B, C, D, F
- `status` (VARCHAR) - ENROLLED, COMPLETED, DROPPED
- `created_at` (TIMESTAMP)
- Unique constraint on (student_id, course_id)

#### `student_credits`
- `student_id` (UUID, Primary Key)
- `total_credits` (INTEGER)
- `last_updated` (TIMESTAMP)

### Database Optimization Features

#### Triggers
- **`update_total_credits()`**: Automatically recalculates student credits when enrollments are inserted, updated, or deleted

#### Stored Procedures
- **`register_student(p_student_id, p_course_id)`**: Validates and registers a student in a course with business logic

#### Functions
- **`calculate_gpa(p_student_id)`**: Computes GPA based on completed courses and grades

#### Views
- **`view_top_courses`**: Most enrolled courses ranked by popularity
- **`view_student_progress`**: Student credits and GPA summary
- **`view_course_popularity`**: Course enrollment trends by department with average grades

## 🔌 API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID with enrollments
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Enroll student in course (uses stored procedure)
- `PUT /api/enrollments/:id` - Update enrollment status/grade
- `DELETE /api/enrollments/:id` - Drop course

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Statistics
- `GET /api/stats/overview` - Overall system statistics
- `GET /api/stats/top-courses` - Top 10 most enrolled courses
- `GET /api/stats/student-progress` - Student progress summary
- `GET /api/stats/departments` - Department-wise statistics
- `GET /api/stats/enrollment-status` - Enrollment status breakdown

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL 15+ (for local setup)
- Docker and Docker Compose (for containerized setup)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   cd /home/vrunda/Projects/CourseEnrollmentOptimization
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5433

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Option 2: Local Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   PORT=3000
   DB_USER=vrunda
   DB_HOST=localhost
   DB_NAME=course_enrollment
   DB_PASSWORD=password123
   DB_PORT=5433
   ```

4. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb course_enrollment

   # Run schema
   psql -d course_enrollment -f ../db/schema.sql

   # Run procedures and triggers
   psql -d course_enrollment -f ../db/procedures.sql

   # Run views
   psql -d course_enrollment -f ../db/views.sql

   # Seed data (optional)
   psql -d course_enrollment -f ../db/seed.sql
   ```

5. **Start the backend server**
   ```bash
   node index.js
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open http://localhost:5173 in your browser

## 📁 Project Structure

```
CourseEnrollmentOptimization/
├── backend/                    # Express.js backend
│   ├── controllers/           # Route controllers
│   │   ├── coursesController.js
│   │   ├── departmentsController.js
│   │   ├── enrollmentsController.js
│   │   ├── statsController.js
│   │   └── studentsController.js
│   ├── middleware/            # Custom middleware
│   │   └── errorHandler.js
│   ├── db.js                  # Database connection pool
│   ├── index.js               # Express app entry point
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Courses.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EnrollmentForm.jsx
│   │   │   └── Students.jsx
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # Styles
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── db/                         # Database scripts
│   ├── schema.sql             # Table definitions
│   ├── procedures.sql         # Stored procedures & triggers
│   ├── views.sql              # Database views
│   └── seed.sql               # Sample data
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

## 💡 Usage Examples

### Creating a Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "department_id": ""
  }'
```

### Creating a Course
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Systems",
    "code": "CS301",
    "credits": 3,
    "department_id": ""
  }'
```

### Enrolling a Student
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "uuid-here",
    "course_id": "uuid-here"
  }'
```

## 🎯 Key Features Explained

### Automatic Credit Tracking
When a student enrolls in or drops a course, the database trigger automatically updates the `student_credits` table. This demonstrates:
- Database triggers for data consistency
- Materialized aggregates for performance
- Event-driven architecture

### Stored Procedure for Enrollment
The `register_student()` procedure encapsulates business logic:
- Validates course existence
- Checks for duplicate enrollments
- Ensures data integrity
- Provides consistent error handling

### Database Views for Analytics
Pre-computed views optimize dashboard queries:
- `view_top_courses` - Instant access to popular courses
- `view_student_progress` - Quick GPA and credit lookups
- `view_course_popularity` - Department-wise analytics

### GPA Calculation
The `calculate_gpa()` function computes student GPA based on:
- Completed courses only
- Credit-weighted average
- Standard 4.0 scale (A=4.0, B=3.0, C=2.0, D=1.0, F=0.0)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=3000                      # Backend server port
DB_USER=vrunda                 # PostgreSQL username
DB_HOST=localhost              # Database host
DB_NAME=course_enrollment      # Database name
DB_PASSWORD=password123        # Database password
DB_PORT=5433                   # PostgreSQL port
```

### Docker Configuration

The `docker-compose.yml` defines two services:
- **db**: PostgreSQL 15 database with automatic schema initialization
- **backend**: Express.js API server (optional, can run locally)

Database runs on port 5433 to avoid conflicts with local PostgreSQL installations.

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on the correct port (5433 for Docker, 5432 for local)
- Verify credentials in `.env` file match your database setup
- Check if database `course_enrollment` exists

### Port Conflicts
- Backend default: 3000 (change with `PORT` env variable)
- Frontend default: 5173 (Vite's default)
- Database: 5433 (mapped from container's 5432)

### CORS Errors
The backend enables CORS for all origins in development. For production, configure specific origins in `backend/index.js`.

### Trigger Not Firing
If student credits aren't updating automatically:
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trg_update_credits';

-- Manually recalculate if needed
DELETE FROM student_credits;
-- Trigger will repopulate on next enrollment change
```

## 📝 Sample Data

The `db/seed.sql` script generates:
- 5 departments (CS, EE, ME, CE, BA)
- 50 courses across departments
- 1000 students
- ~5000 enrollments with random grades

## 🔐 Security Considerations

- **SQL Injection Protection**: All queries use parameterized statements
- **Input Validation**: Required fields validated on backend
- **UUID Primary Keys**: Prevents enumeration attacks
- **Unique Constraints**: Email and course codes must be unique
- **Foreign Key Constraints**: Maintains referential integrity
- **Cascade Deletes**: Enrollments deleted when student is removed

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control (Admin, Faculty, Student)
- [ ] Course prerequisites and scheduling
- [ ] Semester/term management
- [ ] Email notifications for enrollment
- [ ] Advanced search and filtering
- [ ] Export data to CSV/PDF
- [ ] API rate limiting
- [ ] Comprehensive test suite
- [ ] Production deployment guide

## 📄 License

This project is created for educational purposes.

## 👥 Authors

- Vrunda - Full Stack Development

## 🙏 Acknowledgments

- PostgreSQL documentation for trigger and procedure examples
- React and Express.js communities
- Docker for containerization best practices
