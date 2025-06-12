# CheckCafe ☕

> A comprehensive café management and social check-in platform with real-time features

## 🏗️ Architecture Overview

CheckCafe is a full-stack application consisting of multiple services working together:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Admin Dashboard │    │   Web Portal    │
│  (React Native) │    │    (Next.js)     │    │   (React.js)    │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          └──────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │        Nginx            │
                    │   (Reverse Proxy)       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Backend API         │
                    │   (Node.js/Express)     │
                    │    + Socket.IO          │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       MongoDB           │
                    │      (Database)         │
                    └─────────────────────────┘
```

## 📁 Project Structure

```
check-cafe/
├── 📱 mobile/                    # React Native App
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/            # App screens (customer/staff)
│   │   ├── navigators/         # Navigation setup
│   │   ├── services/           # API services & auth
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utilities & helpers
│   │   └── redux/              # State management
│   ├── android/                # Android native code
│   ├── assets/                 # Images, fonts, etc.
│   └── app.json               # Expo configuration
│
├── 🌐 checkafe-admin/           # Admin Dashboard (Next.js)
│   ├── app/
│   │   ├── (admin)/           # Admin routes
│   │   ├── (auth)/            # Authentication pages
│   │   └── (dashboard)/       # Shop owner dashboard
│   ├── components/            # UI components
│   ├── lib/                   # Utilities & store
│   └── public/               # Static assets
│
├── 🎨 fe/                       # Frontend Web Portal (React)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Application pages
│   │   ├── store/            # Redux store
│   │   ├── apis/             # API integration
│   │   └── utils/            # Helper functions
│   └── public/               # Static files
│
├── ⚙️ be/                       # Backend API (Node.js)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── middlewares/      # Express middlewares
│   │   ├── socket/           # Socket.IO handlers
│   │   ├── utils/            # Helper functions
│   │   └── configs/          # Configuration files
│   ├── uploads/              # File uploads
│   └── docs/                 # API documentation
│
├── 🐳 Docker Infrastructure
│   ├── docker-compose.yml    # Service orchestration
│   ├── nginx.conf           # Reverse proxy config
│   ├── README-DOCKER.md     # Docker deployment guide
│   └── ssl/                 # SSL certificates
│
├── 📊 Database
│   ├── dump_checkafe/       # Database backup
│   └── seeds/               # Sample data
│
└── 📋 Documentation
    ├── README.md            # This file
    └── comand/              # Command scripts
```

## 🚀 Core Features

### 📱 Mobile Application
- **User Authentication** - Login/register with JWT
- **Café Discovery** - Browse and search cafés
- **Social Check-ins** - Check into cafés and share experiences
- **Real-time Notifications** - Push notifications via Expo
- **Friend System** - Add friends and see their activities
- **Reviews & Ratings** - Rate and review café experiences
- **Location Services** - GPS-based café discovery
- **QR Code Scanning** - Quick café check-ins

### 🌐 Admin Dashboard
- **Café Management** - CRUD operations for café data
- **User Management** - Monitor and manage users
- **Analytics Dashboard** - Real-time business insights
- **Content Moderation** - Review and approve content
- **Promotion Management** - Create and manage deals
- **Theme Customization** - Café branding options
- **Transaction Monitoring** - Payment and booking tracking

### 🎨 Web Portal
- **Public Café Directory** - Browse cafés online
- **Menu Display** - Café menus and pricing
- **Reservation System** - Online table booking
- **Brand Management** - Café owner tools
- **Marketing Tools** - Promotional campaigns

### ⚙️ Backend API
- **RESTful API** - Comprehensive endpoint coverage
- **Real-time Features** - Socket.IO for live updates
- **File Management** - Image upload via Cloudinary
- **Payment Integration** - PayOS payment processing
- **Push Notifications** - Expo push notification service
- **Analytics Tracking** - User behavior analytics
- **Security** - JWT authentication & authorization

## 🔧 Technology Stack

### Frontend
- **Mobile**: React Native 0.79, Expo SDK 53
- **Admin**: Next.js 14, TypeScript, Tailwind CSS
- **Web**: React 18, Redux Toolkit, Material-UI

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: Cloudinary
- **Payments**: PayOS Integration

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **External Access**: Cloudflare Tunnel
- **Monitoring**: Health checks & logging
- **SSL**: Let's Encrypt support

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (for local development)
- **MongoDB** (if running locally)
- **Android Studio/Xcode** (for mobile development)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/SoramYO/check-cafe
cd check-cafe
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the applications**
- **API**: http://localhost/api/v1/health
- **Admin**: http://localhost (with Host: admin.checkafe.online)
- **API Docs**: http://localhost/api-docs

### 📱 Mobile Development

1. **Navigate to mobile directory**
```bash
cd mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
# For development build
npm run android

# For Expo Go
npm start
```

### 🌐 Web Development

```bash
# Admin Dashboard
cd checkafe-admin
npm install
npm run dev

# Frontend Portal
cd fe
npm install
npm start
```

## 🌐 Service Endpoints
┌────────────────────────────────────────────────────────────────────────────────┐  
|        Service       | Port    | External URL           |      Description     |
|----------------------|---------|------------------------|----------------------|
| **Backend API**      | 3000    | api.checkafe.online    | REST API + Socket.IO |
| **Admin Dashboard**  | 3002    | admin.checkafe.online  | Management interface |
| **Web Portal**       | 3001    | checkafe.online        | Public website       |
| **MongoDB**          | 27017   | localhost:27017        | Database             |
| **Nginx**            | 80/443  | localhost              | Load balancer        |
└────────────────────────────────────────────────────────────────────────────────┘ 
## 🔌 Real-time Features

### Socket.IO Configuration
- **Namespace**: `/` (default)
- **Events**: `friend_request`, `checkin_update`, `notification`
- **Authentication**: JWT token in handshake
- **CORS**: Configured for mobile app support

### Push Notifications
- **Service**: Expo Push Notifications
- **Types**: Friend requests, check-in likes, comments
- **Platform**: iOS & Android support

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login  
POST /api/v1/auth/refresh      # Token refresh
```

### Core Endpoints
```
GET    /api/v1/shops           # List cafés
POST   /api/v1/checkins        # Create check-in
GET    /api/v1/friends         # Friend management
POST   /api/v1/reviews         # Submit review
GET    /api/v1/notifications   # Get notifications
```

Full API documentation available at `/api-docs` when server is running.

## 🐛 Development

### Running Tests
```bash
# Backend tests
cd be && npm test

# Frontend tests  
cd fe && npm test

# Mobile tests
cd mobile && npm test
```

### Database Management
```bash
# Backup database
./scripts/backup-database.sh

# Restore database
./scripts/restore-database.sh

# Seed sample data
cd be && npm run seed
```

### Debugging
```bash
# View logs
docker-compose logs -f [service_name]

# Access container
docker-compose exec [service_name] sh

# Check service health
docker-compose ps
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **CORS Configuration** for cross-origin requests
- **Input Validation** using Joi schemas
- **Rate Limiting** on API endpoints
- **HTTPS Enforcement** in production
- **Environment Variables** for sensitive data

## 📈 Monitoring & Analytics

### Health Checks
- **Backend**: `/api/v1/health`
- **Database**: MongoDB connection status
- **External Services**: Cloudinary, PayOS connectivity

### Analytics Tracking
- **User Sessions** - Login/logout tracking
- **Activity Monitoring** - Page views, interactions
- **Performance Metrics** - Response times, error rates

## 🚀 Deployment

### Production Deployment
1. **Setup domain DNS** pointing to server
2. **Configure SSL certificates** (Let's Encrypt recommended)
3. **Set production environment variables**
4. **Deploy using Docker Compose**
5. **Setup monitoring and backups**

### Environment Variables
```env
# Required for all environments
JWT_SECRET=your-secret-here
DB_URL=mongodb://localhost:27017/checkafe

# Cloud services
CLOUDINARY_CLOUD_NAME=your-cloud-name
PAYOS_CLIENT_ID=your-payos-id

# Production only
CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token
```

## 📞 Support & Contributing

### Getting Help
1. **Check documentation** in each service directory
2. **Review Docker logs** for error diagnosis  
3. **Consult API documentation** at `/api-docs`
4. **Join our community** (if applicable)

### Contributing
1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow **ESLint configuration** for code style
- Write **tests** for new features
- Update **documentation** for API changes
- Use **conventional commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** for React Native development tools
- **Next.js Team** for the amazing framework
- **MongoDB** for the database solution
- **Cloudflare** for CDN and tunnel services
- **All contributors** who helped build this project

---

**Made with ❤️ by the CheckCafe Team**

For detailed deployment instructions, see [README-DOCKER.md](README-DOCKER.md) 