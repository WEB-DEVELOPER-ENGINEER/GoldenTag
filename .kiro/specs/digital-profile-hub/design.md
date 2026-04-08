# Design Document

## Overview

The Digital Profile Hub is a full-stack web application built with a modern tech stack featuring a React-based frontend and a Node.js/Express backend with PostgreSQL database. The system follows a three-tier architecture with clear separation between presentation, business logic, and data layers. Users interact with a responsive single-page application that communicates with RESTful APIs for all data operations. The application emphasizes real-time preview capabilities, secure authentication, and flexible content management.

## Architecture

### System Architecture

The application follows a client-server architecture with the following layers:

**Frontend Layer:**
- React 18+ with TypeScript for type safety
- React Router for client-side routing
- Context API or Redux for state management
- Tailwind CSS for responsive styling
- Real-time preview using React state synchronization

**Backend Layer:**
- Node.js with Express framework
- RESTful API design
- JWT-based authentication
- Middleware for authentication, validation, and error handling
- File upload handling with Multer
- QR code generation using qrcode library

**Data Layer:**
- PostgreSQL relational database
- Prisma ORM for type-safe database access
- File storage using cloud storage service (AWS S3 or similar)
- Database migrations for schema versioning

**Infrastructure:**
- HTTPS for all communications
- CORS configuration for cross-origin requests
- Rate limiting for API protection
- Environment-based configuration

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Public     │  │     User     │  │    Admin     │  │
│  │   Profile    │  │   Dashboard  │  │    Panel     │  │
│  │   Viewer     │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Shared Components & Services              │  │
│  │  (Auth, API Client, Theme, Preview)               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)               │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │    Profile   │  │    Admin     │  │
│  │   Routes     │  │    Routes    │  │   Routes     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                 │  │
│  │  (Services, Validators, File Handlers)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Data Access Layer                    │  │
│  │  (Prisma ORM, Repositories)                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Users   │  │ Profiles │  │  Links   │  ...        │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

**Authentication Components:**
- `LoginForm`: Email/password and social login interface
- `RegisterForm`: User registration with validation
- `AuthProvider`: Context provider for authentication state
- `ProtectedRoute`: Route wrapper requiring authentication

**User Dashboard Components:**
- `Dashboard`: Main container for user management interface
- `ProfileEditor`: Form-based profile customization interface
- `LinkManager`: Interface for adding, editing, reordering links
- `ThemeCustomizer`: Color, font, and layout selection interface
- `PreviewPanel`: Real-time profile preview display
- `FileUploader`: Component for image and PDF uploads
- `PopupEditor`: Interface for creating promotional pop-ups
- `QRCodeGenerator`: Component for generating and downloading QR codes

**Public Profile Components:**
- `ProfilePage`: Public-facing profile display
- `LinkList`: Rendered list of user links with icons
- `ContactInfo`: Display of phone numbers and emails
- `FileDownloads`: List of downloadable PDFs
- `PopupMessage`: Dismissible promotional message overlay

**Admin Components:**
- `AdminDashboard`: Main admin interface
- `UserList`: Paginated table of all users
- `UserDetails`: Detailed view of individual user data
- `UserActions`: Controls for account management

### Backend API Endpoints

**Authentication Endpoints:**
```
POST   /api/auth/register          - Create new user account
POST   /api/auth/login             - Authenticate user
POST   /api/auth/logout            - End user session
POST   /api/auth/social/:provider  - Social authentication
GET    /api/auth/me                - Get current user info
```

**Profile Endpoints:**
```
GET    /api/profiles/:username     - Get public profile data
PUT    /api/profiles/me            - Update own profile
GET    /api/profiles/me/preview    - Get profile preview data
POST   /api/profiles/me/avatar     - Upload profile picture
POST   /api/profiles/me/background - Upload background image
PUT    /api/profiles/me/theme      - Update theme settings
```

**Link Endpoints:**
```
GET    /api/links                  - Get user's links
POST   /api/links                  - Create new link
PUT    /api/links/:id              - Update link
DELETE /api/links/:id              - Delete link
PUT    /api/links/reorder          - Update link order
```

**Contact Endpoints:**
```
GET    /api/contacts               - Get user's contact info
POST   /api/contacts               - Add contact info
PUT    /api/contacts/:id           - Update contact info
DELETE /api/contacts/:id           - Delete contact info
```

**File Endpoints:**
```
POST   /api/files/upload           - Upload PDF file
GET    /api/files/:id              - Get file metadata
DELETE /api/files/:id              - Delete file
GET    /api/files/:id/download     - Download file
```

**Popup Endpoints:**
```
GET    /api/popup                  - Get user's popup settings
PUT    /api/popup                  - Update popup settings
```

**QR Code Endpoints:**
```
GET    /api/qrcode                 - Generate QR code for profile
GET    /api/qrcode/download        - Download QR code image
```

**Admin Endpoints:**
```
GET    /api/admin/users            - List all users (paginated)
GET    /api/admin/users/:id        - Get user details
PUT    /api/admin/users/:id        - Update user account
DELETE /api/admin/users/:id        - Deactivate user account
POST   /api/admin/users/:id/activate - Reactivate user account
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  profile: Profile;
}
```

### Profile Model
```typescript
interface Profile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  backgroundType: 'color' | 'image';
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  theme: Theme;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  links: Link[];
  contacts: Contact[];
  files: File[];
  popup: Popup | null;
}
```

### Theme Model
```typescript
interface Theme {
  id: string;
  profileId: string;
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  layout: 'centered' | 'left' | 'right';
  buttonStyle: 'rounded' | 'square' | 'pill';
}
```

### Link Model
```typescript
interface Link {
  id: string;
  profileId: string;
  type: 'platform' | 'custom';
  platform: string | null; // 'linkedin', 'github', etc.
  title: string;
  url: string;
  icon: string | null;
  order: number;
  isVisible: boolean;
  createdAt: Date;
}
```

### Contact Model
```typescript
interface Contact {
  id: string;
  profileId: string;
  type: 'email' | 'phone';
  value: string;
  label: string | null; // 'Work', 'Personal', etc.
  order: number;
  createdAt: Date;
}
```

### File Model
```typescript
interface File {
  id: string;
  profileId: string;
  filename: string;
  originalName: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  order: number;
  createdAt: Date;
}
```

### Popup Model
```typescript
interface Popup {
  id: string;
  profileId: string;
  isEnabled: boolean;
  message: string;
  duration: number | null; // milliseconds, null for persistent
  backgroundColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and User Management Properties

**Property 1: Valid registration creates authenticated session**
*For any* valid registration credentials (email and password meeting format and strength requirements), submitting registration should create a new user account and establish an authenticated session that redirects to the dashboard.
**Validates: Requirements 1.1, 1.4, 1.5**

**Property 2: Invalid credentials are rejected**
*For any* invalid login credentials (wrong email or password), login attempts should be rejected with an error message and no session should be established.
**Validates: Requirements 2.2**

**Property 3: Passwords are securely hashed**
*For any* user account created, the stored password should be hashed (not plaintext) and should verify correctly against the original password.
**Validates: Requirements 2.4**

### Profile Customization Properties

**Property 4: Image uploads are validated and stored**
*For any* valid image file (JPEG, PNG, or WebP within size limits), uploading as a profile picture should store the image and display it on the profile page, replacing any previous image.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 5: Invalid files are rejected**
*For any* invalid file (wrong type or exceeding size limit), upload attempts should be rejected with an error message and no file should be stored.
**Validates: Requirements 3.5**

**Property 6: Background preferences are applied and persisted**
*For any* background setting (color or image), applying the background should display it on the profile page and persist it across page reloads.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Property 7: Theme customizations are applied and persisted**
*For any* theme settings (colors, fonts, layout), applying the theme should update all profile elements accordingly and persist the settings across page reloads.
**Validates: Requirements 5.1, 5.2, 5.3, 5.5**

**Property 8: Mode toggle updates colors appropriately**
*For any* profile with a theme, toggling between light and dark mode should update all color values while maintaining readability and contrast ratios that meet accessibility standards.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Real-time Preview Properties

**Property 9: Preview updates reflect all changes**
*For any* profile modification (theme, content, links, etc.), the preview should update immediately to match the change without requiring a page reload.
**Validates: Requirements 7.1, 7.3**

**Property 10: Preview matches published profile**
*For any* profile with pending changes, publishing should make the public profile identical to the preview state.
**Validates: Requirements 7.2, 7.5**

### Link Management Properties

**Property 11: Link CRUD operations work correctly**
*For any* link (platform or custom), creating should add it to the profile, editing should update it, deleting should remove it, and all changes should persist and display on the public profile.
**Validates: Requirements 8.1, 8.2, 8.3, 8.5**

**Property 12: Link reordering updates display order**
*For any* set of links, reordering them should update the display order on the profile page to match the new order.
**Validates: Requirements 8.4**

**Property 13: Platform links display correct branding**
*For any* supported platform (LinkedIn, YouTube, Medium, GitHub, Substack, Twitter, Instagram, TikTok), creating a platform link should display the correct platform icon, styling, and navigate to the correct URL format.
**Validates: Requirements 9.1, 9.3, 9.4, 9.5**

**Property 14: Custom links accept valid URLs**
*For any* valid URL and title, creating a custom link should accept the input, display the link with the provided title, and navigate to the specified URL when clicked.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

**Property 15: URL validation rejects invalid formats**
*For any* invalid URL format, attempting to create a custom link should reject the input with an error message.
**Validates: Requirements 10.2**

### Contact Information Properties

**Property 16: Contact information is validated and stored**
*For any* valid phone number or email address with optional label, adding the contact should validate the format, store it, and display it with the label on the profile.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4**

**Property 17: Multiple contacts are supported**
*For any* user profile, adding multiple phone numbers and email addresses should store and display all of them on the profile.
**Validates: Requirements 11.5**

### File Upload Properties

**Property 18: PDF uploads are validated and accessible**
*For any* valid PDF file within size limits, uploading should validate the file type, store it, create a downloadable link with the provided title, and allow visitors to view or download the file.
**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

**Property 19: PDF deletion removes file and link**
*For any* uploaded PDF, deleting it should remove both the file from storage and its associated link from the profile.
**Validates: Requirements 12.5**

### Popup Message Properties

**Property 20: Popup visibility is controlled by enable/disable**
*For any* popup message, enabling it should display the popup to visitors when they open the profile, and disabling it should hide the popup from the profile.
**Validates: Requirements 13.3, 13.4**

**Property 21: Popup dismissal allows normal viewing**
*For any* displayed popup, closing it should dismiss the message and allow normal profile viewing.
**Validates: Requirements 13.5**

### Profile URL Properties

**Property 22: Profile URLs are unique**
*For any* set of user accounts, each should have a unique profile URL with no collisions, and accessing a profile URL should display the correct user's profile with all current customizations.
**Validates: Requirements 14.1, 14.2, 14.3, 14.5**

**Property 23: Custom URL slugs can be set**
*For any* available custom URL slug, setting it as a profile URL should make the profile accessible at that URL.
**Validates: Requirements 14.4**

### QR Code Properties

**Property 24: QR codes encode profile URLs**
*For any* user profile, generating a QR code should create a scannable code that encodes the profile URL in a common image format.
**Validates: Requirements 15.1, 15.2**

**Property 25: QR codes update with URL changes**
*For any* profile with a changed URL, the QR code should be regenerated to encode the new URL.
**Validates: Requirements 15.4**

### Admin Panel Properties

**Property 26: Admin panel displays all users with metadata**
*For any* set of registered users, the admin panel should display all users with their metadata (email, signup date, last activity) and allow viewing detailed information for each user.
**Validates: Requirements 17.1, 17.2, 17.3**

**Property 27: Admin search filters users correctly**
*For any* search criteria, the admin panel should return only users matching the criteria.
**Validates: Requirements 17.4**

**Property 28: Admin access is restricted**
*For any* non-admin user, attempting to access the admin panel should be denied.
**Validates: Requirements 17.5**

**Property 29: Account deactivation prevents access**
*For any* user account, deactivating it should prevent login and hide the profile page from public access.
**Validates: Requirements 18.1, 18.2**

**Property 30: Account reactivation restores access**
*For any* deactivated account, reactivating it should restore login access and profile visibility.
**Validates: Requirements 18.3**

**Property 31: Admin actions are logged**
*For any* admin action (deactivate, reactivate, modify), the action should be logged with timestamp and admin identifier for audit purposes.
**Validates: Requirements 18.4**

### Security Properties

**Property 32: Sensitive data is encrypted**
*For any* sensitive user data stored in the database, it should be encrypted using industry-standard encryption methods.
**Validates: Requirements 20.2**

**Property 33: File uploads are scanned**
*For any* file upload, the file should be scanned for malicious content before being stored.
**Validates: Requirements 20.3**

## Error Handling

### Validation Errors

The system implements comprehensive input validation at multiple layers:

**Frontend Validation:**
- Real-time form validation with user-friendly error messages
- File type and size validation before upload
- URL format validation
- Email and phone number format validation
- Password strength indicators

**Backend Validation:**
- Request payload validation using validation middleware
- Database constraint validation
- Business rule validation in service layer
- Sanitization of user inputs to prevent injection attacks

**Error Response Format:**
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Authentication Errors

- Invalid credentials: 401 Unauthorized
- Expired session: 401 Unauthorized with redirect to login
- Insufficient permissions: 403 Forbidden
- Missing authentication: 401 Unauthorized

### File Upload Errors

- Invalid file type: 400 Bad Request
- File too large: 413 Payload Too Large
- Malicious content detected: 400 Bad Request
- Storage failure: 500 Internal Server Error

### Database Errors

- Unique constraint violation: 409 Conflict
- Foreign key violation: 400 Bad Request
- Connection timeout: 503 Service Unavailable
- Transaction rollback on any error

### Rate Limiting

- API rate limits per user/IP
- File upload limits per time period
- Failed login attempt throttling
- 429 Too Many Requests response

## Testing Strategy

### Unit Testing

The application will use Jest as the testing framework for both frontend and backend unit tests.

**Backend Unit Tests:**
- Service layer business logic
- Validation functions
- Utility functions (QR code generation, file processing)
- Database query functions
- Authentication middleware
- Error handling middleware

**Frontend Unit Tests:**
- Component rendering with various props
- Form validation logic
- State management functions
- API client functions
- Utility functions

**Example unit test cases:**
- Test that duplicate email registration is rejected
- Test that light/dark mode toggle applies correct default colors
- Test that platform link creation displays correct icon for each supported platform
- Test that QR code download provides image in PNG format
- Test that admin panel access is denied for non-admin users

### Property-Based Testing

The application will use fast-check as the property-based testing library for JavaScript/TypeScript.

**Configuration:**
- Each property-based test MUST run a minimum of 100 iterations
- Each property-based test MUST be tagged with a comment referencing the correctness property from this design document
- Tag format: `// Feature: digital-profile-hub, Property {number}: {property_text}`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Property test coverage:**
- Authentication flows with generated credentials
- Profile customization with generated themes and content
- Link management with generated URLs and titles
- File uploads with generated file data
- Contact information with generated phone/email formats
- Admin operations with generated user data
- URL uniqueness with generated usernames
- Data persistence across operations

**Example property tests:**
- Property 1: Generate random valid credentials, register, verify account creation and authentication
- Property 6: Generate random background settings, apply them, reload profile, verify persistence
- Property 12: Generate random link orders, reorder links, verify display order matches
- Property 22: Generate multiple user accounts, verify all URLs are unique and route correctly
- Property 29: Generate user account, deactivate it, verify login fails and profile is hidden

### Integration Testing

- API endpoint testing with supertest
- Database integration tests with test database
- File upload and storage integration
- Authentication flow end-to-end tests
- Admin panel operations

### End-to-End Testing

- User registration and profile creation flow
- Profile customization and publishing flow
- Link management workflow
- QR code generation and download
- Admin user management workflow

### Test Data Management

- Use factories for generating test data
- Seed test database with realistic data
- Clean up test data after each test
- Use separate test database from development

### Continuous Integration

- Run all tests on every commit
- Enforce test coverage thresholds
- Run security scans on dependencies
- Automated deployment on passing tests
