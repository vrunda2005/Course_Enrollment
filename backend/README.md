# Course Enrollment & Performance Optimization

This project implements a full-stack course enrollment system at Ahmedabad University. It includes a PostgreSQL database, a Node.js/Express backend, and a React frontend.

## Features

- **Database (PostgreSQL)**:
    - 3NF Schema (Students, Courses, Enrollments, Departments).
    - Stored Procedures & Triggers for business logic.
    - Optimized with Indexes.
- **Backend (Node.js/Express)**:
    - REST API for fetching data and enrolling students.
    - Connects to PostgreSQL.
- **Frontend (React + Vite)**:
    - **Dashboard**: Visualizes top courses and student progress.
    - **Enrollment Form**: Interface to enroll students in courses.

## Setup Instructions

### Prerequisites
- PostgreSQL
- Node.js (v18+)

### 1. Database Setup

**Quick Setup (Recommended):**
```bash
cd server
chmod +x setup_database_fixed.sh
./setup_database_fixed.sh
```
This script will:
- Create the `course_enrollment` database
- Set up proper permissions
- Run all SQL scripts (schema, procedures, seed data, views)
- Seed sample data (1000 students, 50 courses, 4868 enrollments)

**Manual Setup (Alternative):**
```bash
# Create database and grant permissions (requires sudo)
sudo -u postgres psql -c "CREATE DATABASE course_enrollment;"
sudo -u postgres psql -d course_enrollment -c "GRANT ALL ON SCHEMA public TO vrunda; ALTER SCHEMA public OWNER TO vrunda;"

# Run SQL scripts
cd server
PGPASSWORD=1234 psql -U vrunda -h localhost -d course_enrollment -f schema.sql
PGPASSWORD=1234 psql -U vrunda -h localhost -d course_enrollment -f procedures.sql
PGPASSWORD=1234 psql -U vrunda -h localhost -d course_enrollment -f seed.sql
PGPASSWORD=1234 psql -U vrunda -h localhost -d course_enrollment -f views.sql
```

### 2. Backend Setup
Navigate to the `server` directory:
```bash
cd server
npm install
```
Create a `.env` file in `server/` with your DB credentials (see `server/.env` for example).
Start the server:
```bash
node index.js
```
Server runs on `http://localhost:3000`.

### 3. Frontend Setup
Navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
```
Open the browser at the URL provided (usually `http://localhost:5173`).

## Usage
- **Dashboard**: View top courses and student progress stats.
- **Enroll Student**: Select a student and a course to enroll. The system checks for duplicates and updates credits automatically.

## File Structure
- `server/`: Node.js backend.
- `client/`: React frontend.
- `schema.sql`, `procedures.sql`, `views.sql`: Database scripts.
- `optimization.md`: Performance analysis.
