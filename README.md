# Digital Profile Hub

A full-stack web application that enables users to create customizable digital profile pages serving as centralized hubs for their online presence. Similar to Linktree, users can aggregate multiple links, contact information, and media in a single shareable profile accessible via unique URLs and QR codes.

## Features

- **User Authentication**: Secure email/password registration and login with JWT tokens
- **Profile Customization**: Upload profile pictures, customize backgrounds, themes, colors, and fonts
- **Link Management**: Add, edit, reorder, and delete links with platform integrations (LinkedIn, GitHub, Twitter, etc.)
- **Contact Information**: Add multiple phone numbers and email addresses with labels
- **File Uploads**: Upload and share PDF documents (portfolios, CVs, etc.)
- **QR Code Generation**: Generate downloadable QR codes for easy profile sharing
- **Pop-up Messages**: Create customizable promotional messages for profile visitors
- **Real-time Preview**: See changes instantly before publishing
- **Admin Panel**: Manage users and monitor system activity
- **Responsive Design**: Mobile-first design that works on all devices
- **Security**: HTTPS, JWT authentication, rate limiting, input validation

## Tech Stack

### Frontend
- React 18+ with TypeScript
- React Router for routing
- Tailwind CSS for styling
- Vite for build tooling
- Vitest for testing

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Multer for file uploads
- QRCode library for QR generation

## Project Structure

```
digital-profile-hub/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   ├── deployment/         # Deployment configurations
│   └── scripts/            # Backend scripts
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # React components
│       ├── contexts/       # React contexts
│       └── pages/          # Page components
├── scripts/                # Build and deployment scripts
├── .kiro/specs/           # Feature specifications
│   └── digital-profile-hub/
│       ├── requirements.md # Requirements document
│       ├── design.md      # Design document
│       └── tasks.md       # Implementation tasks
├── DEPLOYMENT.md          # Deployment guide
├── ENVIRONMENT_SETUP.md   # Environment configuration guide
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd digital-profile-hub
   ```

2. **Set up the database**:
   ```bash
   # Create PostgreSQL database
   createdb digital_profile_hub
   ```

3. **Configure backend environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Configure frontend environment**:
   ```bash
   cd frontend
   cp .env.example .env
   # Usually no changes needed for local development
   ```

5. **Install backend dependencies and run migrations**:
   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run prisma:generate
   ```

6. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

7. **Start development servers**:
   
   Backend (in one terminal):
   ```bash
   cd backend
   npm run dev
   ```
   
   Frontend (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - Health check: http://localhost:3000/health

### Running Tests

**Backend tests**:
```bash
cd backend
npm test
```

**Frontend tests**:
```bash
cd frontend
npm test
```

## Production Deployment

For detailed production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Start

1. **Configure environment**:
   ```bash
   # Backend
   cp backend/.env.production.example backend/.env.production
   # Edit with production values
   
   # Frontend
   cp frontend/.env.production.example frontend/.env.production
   # Edit with production API URL
   ```

2. **Build application**:
   ```bash
   ./scripts/build-production.sh
   ```

3. **Deploy to server**:
   ```bash
   export DEPLOY_USER="www-data"
   export DEPLOY_HOST="yourdomain.com"
   export DEPLOY_PATH="/var/www/digital-profile-hub"
   
   ./scripts/deploy.sh
   ```

For complete deployment instructions including server setup, SSL configuration, and troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Environment Configuration

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed information about configuring environment variables for development and production.

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile Endpoints
- `GET /api/profiles/:username` - Get public profile
- `PUT /api/profiles/me` - Update own profile
- `POST /api/profiles/me/avatar` - Upload profile picture
- `POST /api/profiles/me/background` - Upload background image

### Link Endpoints
- `GET /api/links` - Get user's links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `PUT /api/links/reorder` - Reorder links

### Contact Endpoints
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Add contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### File Endpoints
- `POST /api/files/upload` - Upload PDF
- `GET /api/files/:id` - Get file metadata
- `DELETE /api/files/:id` - Delete file

### QR Code Endpoints
- `GET /api/qrcode` - Generate QR code
- `GET /api/qrcode/download` - Download QR code

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Follow React best practices
- Use functional components with hooks

### Testing

- Unit tests with Jest (backend) and Vitest (frontend)
- Property-based tests with fast-check
- Integration tests for API endpoints
- Component tests for React components

### Database Migrations

```bash
# Create new migration
cd backend
npm run prisma:migrate

# Apply migrations in production
npm run prisma:migrate:deploy

# Open Prisma Studio
npm run prisma:studio
```

## Security

- HTTPS enforced in production
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- File upload validation
- SQL injection prevention via Prisma ORM

## Performance

- Optimized production builds
- Static asset caching
- Database query optimization
- Image optimization
- Gzip compression
- CDN-ready architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
- Review the [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) guide
- Consult the specification documents in `.kiro/specs/digital-profile-hub/`

## Acknowledgments

Built with modern web technologies and best practices for security, performance, and user experience.

---

**Version**: 1.0.0  
**Last Updated**: 2024
