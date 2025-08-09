# JanaSampark - Survey Management System

A mobile-friendly web application for ward-level survey management with user registration, authentication, and survey CRUD operations.

## Features

- **User Registration & Authentication**
  - Secure user registration with role selection (Ward Member/Ward Secretary)
  - JWT-based authentication with HTTP-only cookies
  - Protected routes with middleware
  
- **Survey Management**
  - Create comprehensive survey records with demographic data
  - View, edit, and delete surveys
  - Real-time data validation
  - Mobile-first responsive design

- **Data Fields**
  - Personal: Name, Age, Sex, Phone Number
  - Demographics: Education, Job, Religion, Caste
  - Political: Political Affiliation (LDF/UDF/NDA/CENTRAL/OTHERS)
  - Administrative: Local Body, Ward Number

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS (mobile-first responsive design)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT-based auth
- **Deployment**: Vercel-compatible

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd survey-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/janasampark_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database (for development)
   npx prisma db push
   
   # Or run migrations (for production)
   npx prisma migrate deploy
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Database Schema

### User Model
- `id`: Unique identifier (CUID)
- `name`: Full name
- `username`: Unique username
- `password`: Hashed password (bcrypt)
- `phone`: Phone number
- `role`: UserRole (WARD_MEMBER | WARD_SECRETARY)
- `wardNumber`: Ward number (1-100)
- `localBody`: Selected local body
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Survey Model
- `id`: Unique identifier (CUID)
- `name`: Person's full name
- `age`: Age (1-120)
- `education`: Education level
- `job`: Job/occupation
- `phone`: Phone number
- `politicalAffiliation`: Political affiliation
- `religion`: Religion
- `caste`: Caste category
- `sex`: Sex (MALE | FEMALE | OTHER)
- `createdBy`: Reference to User
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Surveys
- `GET /api/surveys` - List all surveys for logged-in user
- `POST /api/surveys` - Create new survey
- `GET /api/surveys/[id]` - Get single survey
- `PUT /api/surveys/[id]` - Update survey
- `DELETE /api/surveys/[id]` - Delete survey

## Pages Structure

```
/                    - Redirect to login or dashboard
/login              - User login page
/register           - User registration page
/dashboard          - Main dashboard with survey list
/surveys/new        - Create new survey
/surveys/[id]       - View survey details
/surveys/[id]/edit  - Edit survey
```

## Security Features

- **Password Security**: Bcrypt hashing with 10 salt rounds
- **JWT Authentication**: 7-day token expiry with HTTP-only cookies
- **Input Validation**: Server-side validation for all inputs
- **Protected Routes**: Middleware-based route protection
- **CSRF Protection**: SameSite cookie configuration
- **Data Sanitization**: Phone number formatting and validation

## Mobile Optimization

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Touch-Friendly UI**: Minimum 44x44px touch targets
- **Progressive Enhancement**: Works without JavaScript
- **Optimized Performance**: Server-side rendering for better mobile performance

## Development

### Build for production
```bash
npm run build
```

### Type checking
```bash
npm run type-check
```

### Database commands
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Generate new migration
npx prisma migrate dev
```

## Deployment

### Vercel Deployment

1. **Push to GitHub repository**

2. **Connect to Vercel**
   - Import project in Vercel dashboard
   - Configure environment variables
   - Deploy

3. **Environment Variables for Production**
   ```env
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_production_jwt_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_production_nextauth_secret
   ```

### Database Migration for Production
```bash
npx prisma migrate deploy
```

## Local Bodies Supported

The system supports the following 7 local bodies:
- N.Paravur
- Varappuzha
- Kottuvally
- Ezhikkara
- Chittattukara
- Vadakkekara
- Chendamangalam

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.
