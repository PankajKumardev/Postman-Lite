# Postman Lite

A lightweight alternative to Postman for API testing and development.

## Features

- API request testing with all HTTP methods
- Request history tracking
- Collections for organizing requests
- User authentication (Email/Password and Google OAuth)
- Responsive design for desktop and mobile use

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT for authentication
- Zod for validation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Set the following variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `AUTH_SECRET` - Secret key for JWT token signing
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - For Google OAuth (optional)

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Set the `VITE_API_BASE` variable to point to your backend server (default: http://localhost:3000)

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Requests
- `POST /api/requests/save` - Save a request to history
- `GET /api/requests/saved` - Get saved requests with pagination

### Collections
- `POST /api/collections` - Create a new collection
- `GET /api/collections` - Get all collections for user
- `GET /api/collections/:id` - Get a specific collection
- `PUT /api/collections/:id` - Update a collection
- `DELETE /api/collections/:id` - Delete a collection
- `POST /api/collections/:id/requests` - Create a request in a collection
- `GET /api/collections/:id/requests` - Get all requests in a collection
- `PUT /api/collections/:id/requests/:requestId` - Update a request in a collection
- `DELETE /api/collections/:id/requests/:requestId` - Delete a request from a collection

## Project Structure

```
postman-lite/
├── backend/
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── index.ts    # Main server entry point
│   │   └── ...
│   ├── prisma/         # Prisma schema and migrations
│   ├── .env            # Environment variables
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── lib/        # Utility functions and API clients
│   │   ├── App.tsx     # Main app component
│   │   └── ...
│   ├── .env            # Environment variables
│   └── ...
└── README.md
```

## Development

Both frontend and backend use TypeScript for type safety. The project follows modern development practices with:

- ESLint for code quality
- Prettier for code formatting
- Husky for git hooks
- Conventional commits for changelog generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes following conventional commit format
5. Push to the branch
6. Create a Pull Request

## License

MIT License - see LICENSE file for details.