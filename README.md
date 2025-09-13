# Looma Email Dashboard 📧

A modern, full-stack email management application built for the Code with Kiro hackathon. Looma provides a comprehensive dashboard for managing Gmail emails with advanced analytics, calendar integration, and a beautiful, responsive interface.

![Looma Dashboard](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## ✨ Features

### 🎯 Core Functionality

- **Gmail Integration**: Seamless email fetching and management via Google Gmail API
- **Real-time Analytics**: Comprehensive email statistics and visual charts
- **Calendar Integration**: Google Calendar events display and management
- **Advanced Search**: Powerful email search, filtering, and sorting capabilities
- **Bulk Operations**: Mark multiple emails as read, delete, or organize
- **Dark/Light Theme**: Persistent theme toggle with smooth transitions

### 🚀 Advanced Features

- **Dashboard Analytics**: Visual representation of email patterns and statistics
- **Priority Detection**: Intelligent email priority classification
- **Keyboard Shortcuts**: Power-user keyboard navigation and actions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization and refresh functionality
- **Accessibility**: WCAG compliant components and navigation

### 🔐 Security & Authentication

- **Google OAuth2**: Secure authentication with Google accounts
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption for user credentials
- **CORS Protection**: Configured cross-origin resource sharing

## 🏗️ Architecture

### Frontend (React + Vite)

- **Framework**: React 19.1.1 with modern hooks patterns
- **Build Tool**: Vite 7.1.2 for fast development and optimized builds
- **Styling**: Tailwind CSS 4.1.12 with custom design system
- **Animations**: Framer Motion for smooth UI transitions
- **Icons**: Lucide React for consistent iconography
- **Routing**: React Router DOM for single-page application navigation
- **State Management**: Context API for theme and application state
- **Notifications**: React Hot Toast for user feedback

### Backend (Node.js + Express)

- **Runtime**: Node.js with Express 5.1.0
- **Database**: PostgreSQL with pg driver
- **Authentication**: JWT tokens + Google OAuth2
- **APIs**: Google Gmail and Calendar integration
- **Security**: bcrypt for password hashing, CORS enabled

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Cloud Console account
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd looma-email-dashboard
```

### 2. Google API Setup

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Gmail API
   - Google Calendar API
   - Google+ API (for OAuth)

#### Create OAuth2 Credentials

1. Navigate to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Configure the consent screen:
   - Application name: "Looma Email Dashboard"
   - Authorized domains: `localhost` (for development)
4. Create OAuth2 client:
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback`
     - `http://localhost:5173/auth/callback` (for frontend)

#### Download Credentials

1. Download the credentials JSON file
2. Rename it to `credentials.json`
3. Place it in the project root directory

### 3. Database Setup

#### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE looma;

# Create user (optional)
CREATE USER looma_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE looma TO looma_user;
```

### 4. Backend Setup

#### Install Dependencies

```bash
cd Backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `Backend` directory:

```env
# Database Configuration
USER=postgres
HOST=localhost
DATABASE=looma
PORT=5432
PASSWORD=your_database_password

# JWT Secret (generate a secure random string)
JWT_KEY=your_super_secure_jwt_secret_key_here

# Optional: OpenAI API (if using AI features)
OPEN_AI_API=your_openai_api_key_here
```

#### Start Backend Server

```bash
npm start
```

The backend server will start on `http://localhost:3000`

### 5. Frontend Setup

#### Install Dependencies

```bash
cd Frontend
npm install
```

#### Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔧 Configuration

### Google OAuth Setup

1. Place your `credentials.json` file in the project root
2. The application will automatically handle OAuth flow
3. Users will be redirected to Google for authentication
4. Tokens are securely stored and managed

### Database Schema

The application will automatically create necessary tables on first run. Key tables include:

- `users`: User account information
- `email_cache`: Cached email data for performance
- `user_preferences`: Theme and settings storage

### Environment Variables

#### Backend (.env)

```env
# Required
USER=postgres                    # Database username
HOST=localhost                   # Database host
DATABASE=looma                   # Database name
PORT=5432                       # Database port
PASSWORD=your_db_password       # Database password
JWT_KEY=your_jwt_secret         # JWT signing key

# Optional
OPEN_AI_API=your_openai_key     # For AI features
```

## 📱 Usage

### Getting Started

1. Open the application at `http://localhost:5173`
2. Click "Sign in with Google" to authenticate
3. Grant necessary permissions for Gmail and Calendar access
4. Start managing your emails with the dashboard

### Key Features Usage

#### Email Management

- **View Emails**: Browse your inbox with pagination
- **Search**: Use the search bar to find specific emails
- **Filter**: Apply filters by date, sender, or status
- **Bulk Actions**: Select multiple emails for batch operations
- **Priority Detection**: Emails are automatically categorized by importance

#### Dashboard Analytics

- **Email Statistics**: View sent/received counts and trends
- **Visual Charts**: Analyze email patterns over time
- **Calendar Events**: See upcoming events from Google Calendar
- **Quick Actions**: Access frequently used features

#### Keyboard Shortcuts

- `Ctrl/Cmd + K`: Open command palette
- `J/K`: Navigate between emails
- `Enter`: Open selected email
- `D`: Delete selected email
- `R`: Mark as read/unread

## 🛠️ Development

### Project Structure

```
looma-email-dashboard/
├── Frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route components
│   │   ├── context/          # React Context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # Styling and themes
│   ├── public/               # Static assets
│   └── package.json
├── Backend/                   # Node.js server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── config/           # Configuration files
│   │   └── app.js           # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json
├── credentials.json          # Google API credentials
└── README.md
```

### Available Scripts

#### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

#### Backend

```bash
npm start        # Start server with nodemon
npm test         # Run tests (when implemented)
```

### Code Standards

- **JavaScript**: ES6+ features, async/await patterns
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with custom design tokens
- **API**: RESTful conventions with proper status codes
- **Security**: Input validation, CORS, JWT authentication

## 🚀 Deployment

### Production Build

#### Frontend

```bash
cd Frontend
npm run build
```

#### Backend

```bash
cd Backend
# Set NODE_ENV=production in your environment
npm start
```

### Environment Setup

1. Set up PostgreSQL database on your hosting platform
2. Configure environment variables for production
3. Update Google OAuth redirect URIs for your domain
4. Deploy frontend to static hosting (Vercel, Netlify)
5. Deploy backend to cloud platform (Heroku, Railway, DigitalOcean)

### Security Considerations

- Use HTTPS in production
- Set secure JWT secrets
- Configure CORS for your domain
- Enable database SSL connections
- Set up proper error logging

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Test your changes thoroughly
5. Commit with descriptive messages: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Quality

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design
- Test across different browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Code with Kiro Hackathon**: For the inspiration and platform
- **Google APIs**: For Gmail and Calendar integration
- **React Community**: For the amazing ecosystem
- **Tailwind CSS**: For the utility-first styling approach
- **Kiro AI**: For development acceleration and code quality

## 📞 Support

For support, questions, or feature requests:

- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**Built with ❤️ for the Code with Kiro Hackathon**

_Looma Email Dashboard - Streamlining email management with modern web technologies_
