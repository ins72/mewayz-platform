# Deployment Guide

## Overview

This guide covers deploying the Idurar ERP CRM system to various environments including development, staging, and production.

## Prerequisites

- Node.js 20.9.0 or higher
- MongoDB (local or cloud)
- npm 10.2.4 or higher
- Git

## Environment Setup

### Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idurar-merged
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Update the values according to your environment

4. **Start the application**
   ```bash
   npm run dev
   ```

### Production Environment

#### Option 1: Traditional Deployment

1. **Prepare the server**
   ```bash
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install MongoDB
   sudo apt-get install -y mongodb
   ```

2. **Deploy the application**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd idurar-merged

   # Install dependencies
   npm run install:all

   # Build the application
   npm run build

   # Start the application
   npm start
   ```

#### Option 2: Docker Deployment

1. **Create Dockerfile for backend**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY backend/package*.json ./
   RUN npm ci --only=production
   COPY backend/ .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create Dockerfile for frontend**
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY frontend/package*.json ./
   RUN npm ci
   COPY frontend/ .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/out /usr/share/nginx/html
   EXPOSE 80
   ```

3. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     mongodb:
       image: mongo:latest
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password
       volumes:
         - mongodb_data:/data/db
       ports:
         - "27017:27017"

     backend:
       build:
         context: .
         dockerfile: Dockerfile.backend
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://admin:password@mongodb:27017/idurar-erp-crm
       depends_on:
         - mongodb
       ports:
         - "5000:5000"

     frontend:
       build:
         context: .
         dockerfile: Dockerfile.frontend
       ports:
         - "80:80"
       depends_on:
         - backend

   volumes:
     mongodb_data:
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

#### Option 3: Cloud Deployment

##### Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

##### Railway (Backend)

1. **Connect your repository to Railway**
2. **Set environment variables**
3. **Deploy automatically**

##### Heroku

1. **Create Procfile for backend**
   ```
   web: npm start
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/idurar-erp-crm
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO=admin@yourdomain.com
RESEND_API_KEY=your_resend_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_IDURAR_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_IDURAR_API_KEY=your_api_key_here
```

## SSL/HTTPS Setup

### Using Let's Encrypt

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot
   ```

2. **Obtain SSL certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Monitoring and Logging

### PM2 (Process Manager)

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'idurar-backend',
         script: './backend/src/server.js',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production'
         }
       }
     ]
   };
   ```

3. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Logging

Configure logging to capture errors and performance metrics:

```javascript
// backend/src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Backup Strategy

### Database Backup

1. **Automated MongoDB backup**
   ```bash
   # Create backup script
   #!/bin/bash
   mongodump --uri="mongodb://localhost:27017/idurar-erp-crm" --out=/backup/$(date +%Y%m%d_%H%M%S)
   ```

2. **Schedule with cron**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup-script.sh
   ```

### File Backup

For file uploads and static assets:

```bash
# Backup uploads directory
rsync -av /app/uploads/ /backup/uploads/
```

## Performance Optimization

### Backend

1. **Enable compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Implement caching**
   ```javascript
   const cache = require('node-cache');
   const cacheInstance = new cache({ stdTTL: 600 });
   ```

3. **Database indexing**
   ```javascript
   // Create indexes for frequently queried fields
   db.clients.createIndex({ "email": 1 });
   db.invoices.createIndex({ "client": 1, "date": -1 });
   ```

### Frontend

1. **Optimize images**
   ```javascript
   // Use Next.js Image component
   import Image from 'next/image';
   ```

2. **Implement lazy loading**
   ```javascript
   // Use React.lazy for code splitting
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

3. **Enable caching**
   ```javascript
   // Configure service worker for caching
   ```

## Security Considerations

1. **Environment variables**: Never commit sensitive data
2. **HTTPS**: Always use SSL in production
3. **Rate limiting**: Implement API rate limiting
4. **Input validation**: Validate all user inputs
5. **SQL injection**: Use parameterized queries
6. **XSS protection**: Sanitize user inputs
7. **CORS**: Configure CORS properly
8. **Authentication**: Use secure JWT tokens

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongodb
   # Restart MongoDB
   sudo systemctl restart mongodb
   ```

3. **Memory issues**
   ```bash
   # Monitor memory usage
   htop
   # Increase Node.js memory limit
   node --max-old-space-size=4096 src/server.js
   ```

### Log Analysis

```bash
# View application logs
tail -f /var/log/idurar/app.log

# View error logs
tail -f /var/log/idurar/error.log

# Monitor system resources
htop
iostat
``` 