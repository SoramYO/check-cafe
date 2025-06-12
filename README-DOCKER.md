# CheckCafe Docker Deployment

## 🐳 Architecture Overview

```
Mobile App ←→ Nginx ←→ Backend API (Socket.IO)
Admin Panel ←→ Nginx ←→ Backend API
                ↓
            MongoDB
```

## 📁 Project Structure

```
check-cafe/
├── docker-compose.yml    # Main orchestration
├── nginx.conf           # Nginx configuration
├── ssl/                 # SSL certificates (optional)
├── be/                  # Backend API
├── checkafe-admin/      # Admin dashboard
└── mobile/              # React Native app
```

## 🚀 Quick Start

### 1. Environment Setup
Create `.env` file with:
```env
# JWT Secrets
JWT_SECRET=your_jwt_secret_here
ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# Cloudflare Tunnel (optional)
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token

# Socket.IO Configuration
CLIENT_URL=https://api.checkafe.online,https://admin.checkafe.online,http://localhost:5173,http://localhost:3002
SOCKET_CORS_ORIGINS=https://api.checkafe.online,https://admin.checkafe.online,http://localhost:5173,http://localhost:3002
```

### 2. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Service Endpoints

| Service | Internal Port | External Access | Description |
|---------|---------------|-----------------|-------------|
| MongoDB | 27017 | localhost:27017 | Database |
| Backend | 3000 | via Nginx | API + Socket.IO |
| Admin | 3002 | via Nginx | Dashboard |
| Nginx | 80/443 | localhost:80 | Load Balancer |

## 🔌 Socket.IO Configuration

### Backend Features:
- ✅ **Mobile App Support** - No CORS restrictions for apps
- ✅ **Dynamic CORS** - Multiple origins via environment
- ✅ **WebSocket + Polling** - Fallback support
- ✅ **Health Checks** - Ping/pong mechanism
- ✅ **Broadcast Messages** - To all connected users

### Nginx WebSocket Proxy:
- Route: `/socket.io/`
- Support: WebSocket upgrade headers
- Timeout: 24 hours for persistent connections

## 📱 Mobile App Connection

### Development:
```javascript
const socket = io('http://192.168.100.207:80', {
  auth: { token: userToken },
  transports: ['websocket', 'polling']
});
```

### Production:
```javascript
const socket = io('https://api.checkafe.online', {
  auth: { token: userToken },
  transports: ['websocket', 'polling']
});
```

## 🔧 Development Workflow

### Backend Changes:
```bash
# Rebuild backend only
docker-compose up -d --build backend

# View backend logs
docker-compose logs -f backend
```

### Admin Changes:
```bash
# Rebuild admin only  
docker-compose up -d --build admin

# View admin logs
docker-compose logs -f admin
```

### Nginx Config Changes:
```bash
# Restart nginx with new config
docker-compose restart nginx

# Test nginx config
docker-compose exec nginx nginx -t
```

## 🐛 Troubleshooting

### Check Service Health:
```bash
# All services status
docker-compose ps

# Service logs
docker-compose logs [service_name]

# Enter service container
docker-compose exec [service_name] sh
```

### Common Issues:

**Socket.IO Connection Failed:**
- Check CORS origins in environment variables
- Verify WebSocket headers in nginx config
- Test direct backend connection (bypass nginx)

**Mobile App Can't Connect:**
- Ensure `CLIENT_URL` includes mobile app domains
- Check if firewall blocking ports 80/443
- Test with curl: `curl -I http://localhost/health`

**Database Connection:**
- Wait for MongoDB health check to pass
- Check network connectivity: `docker network ls`
- Verify credentials in environment

## 📊 Monitoring

### Health Checks:
- **Backend**: `GET /api/v1/health`
- **Nginx**: `GET /health`  
- **MongoDB**: Internal health check
- **Socket.IO**: Ping/pong mechanism

### Logs Location:
```bash
# Container logs
docker-compose logs -f backend
docker-compose logs -f nginx
docker-compose logs -f admin

# Nginx access logs (inside container)
docker-compose exec nginx tail -f /var/log/nginx/access.log
```

## 🔒 SSL Setup (Optional)

1. **Get SSL Certificate:**
```bash
# Using Let's Encrypt
certbot certonly --standalone -d api.checkafe.online
certbot certonly --standalone -d admin.checkafe.online
```

2. **Copy Certificates:**
```bash
cp /etc/letsencrypt/live/api.checkafe.online/* ./ssl/
```

3. **Update nginx.conf:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    # ... rest of config
}
```

## 🚀 Production Deployment

### Recommended Setup:
1. **Domain Setup**: Point domains to server IP
2. **SSL Certificates**: Use Let's Encrypt or Cloudflare
3. **Environment Variables**: Store securely
4. **Monitoring**: Set up health checks
5. **Backup**: Regular MongoDB backups

### Security Considerations:
- Use strong JWT secrets
- Enable firewall rules
- Regular security updates
- Monitor access logs
- Rate limiting (can add to nginx)

## 📞 Support

For issues:
1. Check service logs first
2. Verify environment variables
3. Test individual components
4. Check network connectivity
5. Review nginx configuration 