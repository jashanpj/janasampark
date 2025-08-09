# JanaSampark Survey Management - Development Guide

## Quick Start Development Guide

This guide will help you get the Survey Management System running on your local machine for development.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **PostgreSQL** (running locally or accessible remotely)
- **npm** (comes with Node.js)

## Step-by-Step Setup

### 1. Clone and Navigate to Project

```bash
cd /Users/mohammedshanidh/Documents/GitHub/janasampark/survey-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database
If you haven't created the database yet:

```bash
createdb janasampark_db
```

Or using psql:
```sql
CREATE DATABASE janasampark_db;
```

### 4. Environment Configuration

The `.env` file is already configured with:
```env
DATABASE_URL="postgresql://mohammedshanidh@localhost:5432/janasampark_db?schema=public"
JWT_SECRET="janasampark-super-secret-jwt-key-for-development-only"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="janasampark-nextauth-secret-for-development-only"
```

**Note**: If your PostgreSQL setup requires a password, update the DATABASE_URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/janasampark_db?schema=public"
```

### 5. Initialize Database Schema

Run Prisma migrations to create the database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Testing the Application

### 1. Register a New User

1. Open browser and go to: http://localhost:3000
2. Click "Register here" link
3. Fill in the registration form:
   - **Name**: Your full name
   - **Username**: Choose a unique username
   - **Password**: Create a secure password
   - **Phone**: 10-digit phone number
   - **Local Body**: Select from dropdown (N.Paravur, Varappuzha, etc.)
   - **Role**: Ward Member or Ward Secretary
   - **Ward Number**: 1-100

### 2. Login

1. Go to login page: http://localhost:3000/login
2. Enter your username and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### 3. Create a Survey

1. From dashboard, click "Add New Survey"
2. Fill in survey details:
   - Personal information (Name, Age, Phone)
   - Demographics (Education, Job)
   - Political affiliation
   - Religion and Caste
   - Sex
3. Click "Create Survey"

### 4. Manage Surveys

- **View**: Click on any survey card in dashboard
- **Edit**: Click "Edit" button on survey details page
- **Delete**: Click "Delete" button (with confirmation)

## Common Commands

### Database Management

```bash
# View database in Prisma Studio (GUI)
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# Check database status
npx prisma db pull
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Troubleshooting

### 1. Database Connection Error

If you see "Can't reach database server":
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL (macOS)
brew services start postgresql

# Or
pg_ctl start
```

### 2. Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### 3. Login Redirect Issue

If login doesn't redirect to dashboard:
- Clear browser cookies for localhost
- Hard refresh the page (Cmd+Shift+R on Mac)
- Check browser console for errors

### 4. Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Prisma cache
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

## Testing API Endpoints

### Using curl

```bash
# Test Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"test123","password":"Test@123","phone":"9876543210","localBody":"N.Paravur","role":"WARD_MEMBER","wardNumber":5}'

# Test Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test123","password":"Test@123"}'
```

## Local Bodies Available

The system supports these 7 local bodies:
1. N.Paravur
2. Varappuzha
3. Kottuvally
4. Ezhikkara
5. Chittattukara
6. Vadakkekara
7. Chendamangalam

## Development Tips

1. **Hot Reload**: The dev server automatically reloads when you make changes
2. **Database GUI**: Use `npx prisma studio` to view/edit database directly
3. **API Testing**: Check network tab in browser DevTools for API responses
4. **Error Logs**: Check terminal running `npm run dev` for server-side errors

## Project Structure

```
survey-management/
├── app/                  # Next.js pages and API routes
│   ├── api/             # Backend API endpoints
│   ├── dashboard/       # Dashboard page
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   └── surveys/        # Survey management pages
├── lib/                 # Utility functions
│   ├── auth.ts         # Authentication logic
│   ├── constants.ts    # App constants (local bodies, etc.)
│   └── prisma.ts       # Database client
├── prisma/             # Database configuration
│   └── schema.prisma   # Database schema
└── .env                # Environment variables
```

## Support

For any issues or questions:
1. Check the terminal for error messages
2. Look at browser console (F12 → Console tab)
3. Verify database connection with `npx prisma studio`
4. Ensure all dependencies are installed with `npm install`

---

**Happy Development! 🚀**