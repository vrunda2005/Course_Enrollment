#!/bin/bash

echo "========================================="
echo "Course Enrollment Database Setup (Fixed)"
echo "========================================="
echo ""

# Database credentials from .env
DB_USER="vrunda"
DB_PASSWORD="1234"
DB_NAME="course_enrollment"
DB_HOST="localhost"

echo "This script will set up the database with proper permissions."
echo "You will be prompted for your sudo password ONCE."
echo ""

# Run all postgres commands together to minimize sudo prompts
sudo -u postgres psql <<EOF
-- Drop and recreate database to start fresh
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;

-- Connect to the new database
\c $DB_NAME

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER SCHEMA public OWNER TO $DB_USER;

-- Exit
\q
EOF

if [ $? -ne 0 ]; then
    echo "Error: Failed to create database. Please check your PostgreSQL installation."
    exit 1
fi

echo ""
echo "✓ Database created and permissions granted"
echo ""

echo "Running SQL scripts..."
echo ""

echo "Step 1: Running schema.sql..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f schema.sql
if [ $? -ne 0 ]; then
    echo "Error running schema.sql"
    exit 1
fi

echo "Step 2: Running procedures.sql..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f procedures.sql
if [ $? -ne 0 ]; then
    echo "Error running procedures.sql"
    exit 1
fi

echo "Step 3: Running seed.sql..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f seed.sql
if [ $? -ne 0 ]; then
    echo "Error running seed.sql"
    exit 1
fi

echo "Step 4: Running views.sql..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f views.sql
if [ $? -ne 0 ]; then
    echo "Error running views.sql"
    exit 1
fi

echo ""
echo "========================================="
echo "✓ Database setup complete!"
echo "========================================="
echo ""
echo "Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT COUNT(*) as student_count FROM students;" -t

echo ""
echo "Your application is ready!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "Note: Your backend server (node index.js) is already running."
echo "      Just refresh your browser to see the data!"
