# Postman Lite

> A lightweight, modern alternative to Postman for API testing and development. Built with React, TypeScript, and Node.js.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://postmanlite.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

### Core Functionality

- **🔥 API Request Testing** - Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- **📝 Request Builder** - Intuitive interface for building API requests with headers and JSON body
- **📊 Response Viewer** - View responses in Raw, Formatted JSON, or HTML Preview modes
- **⚡ Real-time Execution** - Send requests and get instant responses with detailed status codes

### Organization & Management

- **📁 Collections** - Organize related API requests into collections
- **🗂️ Request History** - Automatic tracking of all sent requests with timestamps
- **💾 Save to Collection** - Save requests directly to collections for reuse
- **📤 Import/Export** - Import and export collections in JSON format
- **🔍 Search & Filter** - Find requests quickly across history and collections

### Advanced Features

- **🎨 Dual Theme** - Light and dark mode support with seamless switching
- **👤 User Authentication** - Secure email/password authentication with JWT
- **🔐 OAuth Integration** - Google OAuth 2.0 support for quick sign-in
- **📱 Responsive Design** - Fully responsive UI works on desktop, tablet, and mobile
- **⚙️ Request Duplication** - Quickly duplicate requests within collections
- **🚦 Status Visualization** - Color-coded status indicators (200s green, 400s orange, 500s red)
- **📋 Copy to Clipboard** - Quick copy for responses and request details

### Bulk Operations

- **✅ Bulk Select** - Select multiple requests at once
- **🚀 Bulk Execute** - Run multiple requests simultaneously
- **✏️ Bulk Edit** - Update multiple requests with same changes
- **🗑️ Bulk Delete** - Delete multiple requests in one action

### Developer Experience

- **🔄 CORS Proxy** - Built-in proxy to bypass CORS restrictions
- **📊 Collection Statistics** - View total collections and requests count
- **🎯 Request Validation** - Zod-based validation for request data
- **⌨️ Keyboard Shortcuts** - Quick actions with keyboard shortcuts
- **🔔 Toast Notifications** - Real-time feedback for all actions

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| **React 19**        | UI framework with modern hooks and concurrent features |
| **TypeScript**      | Type-safe development                                  |
| **Vite**            | Lightning-fast build tool and dev server               |
| **Tailwind CSS v4** | Utility-first CSS with custom theming                  |
| **shadcn/ui**       | Beautiful, accessible component library                |
| **React Router v6** | Client-side routing                                    |
| **Lucide React**    | Modern icon library                                    |
| **Zod**             | Schema validation                                      |

### Backend

| Technology        | Purpose                                 |
| ----------------- | --------------------------------------- |
| **Node.js**       | JavaScript runtime                      |
| **Express 5**     | Web framework                           |
| **TypeScript**    | Type-safe server code                   |
| **Prisma ORM**    | Database toolkit with type-safe queries |
| **PostgreSQL**    | Relational database                     |
| **JWT**           | Stateless authentication                |
| **bcrypt**        | Password hashing                        |
| **Axios**         | HTTP client for proxying requests       |
| **Zod**           | Runtime validation                      |
| **Cookie Parser** | Cookie handling                         |

### DevOps & Deployment

- **Vercel** - Frontend and backend deployment
- **Vercel Postgres** - Managed PostgreSQL database
- **GitHub** - Version control and CI/CD

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PankajKumardev/Postman-Lite.git
cd Postman-Lite
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Configure .env file with:
# - DATABASE_URL (PostgreSQL connection string)
# - AUTH_SECRET (random secret for JWT)
# - GOOGLE_CLIENT_ID (optional, for OAuth)
# - GOOGLE_CLIENT_SECRET (optional, for OAuth)

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure .env.local with:
# VITE_API_BASE=http://localhost:3000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/postman"

# Authentication
AUTH_SECRET="your-super-secret-jwt-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=3000
NODE_ENV="development"
```

### Frontend (.env.local for development)

```env
VITE_API_BASE=http://localhost:3000
```

### Frontend (.env.production for production)

```env
VITE_API_BASE=https://your-backend-url.vercel.app
```

## 📁 Project Structure

```
Postman-Lite/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── collections.ts    # Collection management
│   │   │   ├── requests.ts       # Request history
│   │   │   └── proxy.ts          # CORS proxy
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── RequestBuilder.tsx
│   │   │   ├── ResponsePreview.tsx
│   │   │   ├── JsonEditor.tsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── CollectionsPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts            # API client
│   │   │   └── utils.ts          # Utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/signup           # Create new account
POST   /api/auth/login            # Login with email/password
POST   /api/auth/logout           # Logout current user
GET    /api/auth/me               # Get current user info
GET    /api/auth/google           # Initiate Google OAuth
GET    /api/auth/google/callback  # OAuth callback
GET    /api/auth/providers        # Get OAuth providers status
```

### Requests

```
POST   /api/requests/save         # Save request to history
GET    /api/requests/saved        # Get saved requests (paginated)
```

### Collections

```
GET    /api/collections           # Get all collections
POST   /api/collections           # Create collection
GET    /api/collections/stats     # Get collection statistics
POST   /api/collections/import    # Import collection
GET    /api/collections/:id       # Get specific collection
PUT    /api/collections/:id       # Update collection
DELETE /api/collections/:id       # Delete collection
GET    /api/collections/:id/export # Export collection

# Collection Requests
GET    /api/collections/:id/requests                    # Get all requests
POST   /api/collections/:id/requests                    # Create request
PUT    /api/collections/:id/requests/:requestId         # Update request
DELETE /api/collections/:id/requests/:requestId         # Delete request
POST   /api/collections/:id/requests/:requestId/execute # Execute request
POST   /api/collections/:id/requests/:requestId/duplicate # Duplicate request

# Bulk Operations
POST   /api/collections/:id/requests/bulk-execute  # Execute multiple
DELETE /api/collections/:id/requests/bulk-delete   # Delete multiple
PUT    /api/collections/:id/requests/bulk-update   # Update multiple
```

### Proxy

```
POST   /api/proxy                 # Proxy API requests (CORS bypass)
GET    /api/proxy/health          # Proxy health check
```

## 🎨 Features in Detail

### Request Builder

- Dropdown method selector (GET, POST, PUT, DELETE, etc.)
- URL input with validation
- Headers management (key-value pairs)
- JSON body editor with syntax validation
- Send button with loading state
- Save to History and Save to Collection options

### Response Preview

- **Raw Mode**: View unformatted response data
- **Preview Mode**:
  - JSON formatting with syntax highlighting
  - HTML rendering in iframe
  - Text preview
- Response headers display
- Status code with color coding
- Copy to clipboard functionality

### Collections Management

- Create, update, and delete collections
- Add requests to collections
- Execute requests from collections
- Duplicate requests
- Import/Export collections as JSON
- Bulk operations (select, execute, edit, delete)
- Search and filter requests
- Collection statistics

### History Tracking

- Automatic save of all sent requests
- Timestamps for each request
- Method and URL display
- Status code tracking
- Click to view full request/response details
- Navigate to detailed view

### User Authentication

- Email/password registration and login
- Google OAuth integration
- JWT-based session management
- Secure HTTP-only cookies
- Guest mode (limited features)
- User profile display

## 🎯 Roadmap

- [ ] Environment variables support
- [ ] GraphQL support
- [ ] WebSocket testing
- [ ] Team collaboration features
- [ ] Request chaining
- [ ] Test scripts/assertions
- [ ] Mock server
- [ ] API documentation generation
- [ ] Performance testing
- [ ] Request scheduling

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Ensure responsive design
- Follow existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Pankaj Kumar**

- GitHub: [@PankajKumardev](https://github.com/PankajKumardev)
- Portfolio: [pankajk.tech](https://pankajk.tech)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Prisma](https://www.prisma.io/) for the amazing ORM

## 📞 Support

If you have any questions or need help, feel free to:

- Open an issue on GitHub
- Reach out via email

---

Made with ❤️ by Pankaj Kumar
