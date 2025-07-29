# Complete Local Setup Guide

## 🚀 **Comprehensive Business Platform - Local Development**

This guide will help you set up and run all the cloned projects locally on your machine, with no external dependencies.

## 📋 **Prerequisites**

### **Required Software**
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **Docker Desktop** - [Download](https://docker.com/)
- **Git** - [Download](https://git-scm.com/)

### **Optional Software**
- **Flutter** (for mobile app) - [Download](https://flutter.dev/)
- **PHP** (for Laravel) - [Download](https://php.net/)
- **Composer** (for PHP dependencies) - [Download](https://getcomposer.org/)

## 🛠️ **Quick Setup**

### **Option 1: Automated Setup (Recommended)**

1. **Run the complete setup script:**
   ```bash
   setup-local-complete.bat
   ```

2. **Start all services:**
   ```bash
   start-all-services.bat
   ```

### **Option 2: Manual Setup**

Follow the step-by-step instructions below.

## 📁 **Project Structure**

```
New folder/
├── idurar-merged/           # Main enhanced platform
├── mewayz_9913/            # Enterprise platform (FastAPI + React)
├── mewayz_good/            # E-commerce platform (FastAPI + Next.js)
├── meway/                  # SaaS platform (FastAPI + React)
├── mewayz_dashboard/       # Analytics platform (Laravel + React)
├── mewayz_3814/           # Mobile app (Flutter)
├── laravel/               # Laravel framework
├── BioDrop/               # Social media platform
├── onelink/               # Link-in-bio tool
└── odoo-temp/             # Odoo ERP system
```

## 🗄️ **Database Setup**

### **MongoDB (Local)**
- **Host**: localhost:27017
- **Username**: admin
- **Password**: password
- **Databases**:
  - `idurar-erp-crm` - Main platform
  - `mewayz_9913` - Enterprise platform
  - `mewayz_good` - E-commerce platform
  - `meway` - SaaS platform

### **SQLite (Laravel)**
- **File**: `mewayz_dashboard/backend/database/database.sqlite`
- **Auto-created** during setup

## 🌐 **Service URLs**

### **Main Platform (Enhanced Idurar ERP CRM)**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

### **Mewayz 9913 (Enterprise Platform)**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

### **Mewayz Good (E-commerce Platform)**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8002
- **API Documentation**: http://localhost:8002/docs

### **Meway (SaaS Platform)**
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### **Mewayz Dashboard (Analytics Platform)**
- **Frontend**: http://localhost:3004
- **Backend API**: http://localhost:8004
- **API Documentation**: http://localhost:8004/api

### **Mewayz 3814 (Mobile App)**
- **Web App**: http://localhost:3005 (if Flutter installed)

## 🔧 **Individual Service Setup**

### **1. Idurar ERP CRM (Main Platform)**

```bash
cd idurar-merged

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### **2. Mewayz 9913 (Enterprise Platform)**

```bash
cd mewayz_9913

# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### **3. Mewayz Good (E-commerce Platform)**

```bash
cd mewayz_good

# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### **4. Meway (SaaS Platform)**

```bash
cd meway

# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### **5. Mewayz Dashboard (Analytics Platform)**

```bash
cd mewayz_dashboard

# Backend
cd backend
composer install
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8004

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### **6. Mewayz 3814 (Mobile App)**

```bash
cd mewayz_3814
flutter pub get
flutter run -d chrome
```

## 🔄 **Integration Features**

### **Enhanced Idurar ERP CRM**
- **Multi-tenant Architecture**: Workspace management
- **Advanced Analytics**: Real-time business intelligence
- **AI Integration**: OpenAI-powered automation
- **E-commerce System**: Complete product management
- **Social Media Management**: Multi-platform integration
- **Marketing Automation**: Campaign management
- **Template Marketplace**: Professional templates
- **Gamification**: User engagement features

### **Cross-Platform Features**
- **Real-time Collaboration**: WebSocket-based live updates
- **Unified Authentication**: JWT across all platforms
- **Shared Database**: MongoDB for data consistency
- **API Integration**: RESTful APIs for all services
- **Mobile Support**: Cross-platform mobile app

## 🚀 **Development Workflow**

### **1. Start Development Environment**
```bash
# Start all services
start-all-services.bat

# Or start individually
cd idurar-merged
npm run dev
```

### **2. Access Platforms**
- Open http://localhost:3000 for main platform
- Explore individual platforms at their URLs
- Test integrations and features

### **3. Development**
- All services run locally with hot reload
- No external dependencies required
- Complete offline development environment
- Integrated debugging and logging

### **4. Database Management**
```bash
# Access MongoDB
mongodb://admin:password@localhost:27017

# Access Laravel database
cd mewayz_dashboard/backend
php artisan tinker
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process_id> /F
```

#### **MongoDB Connection Issues**
```bash
# Restart MongoDB container
docker restart mongodb-local

# Check MongoDB logs
docker logs mongodb-local
```

#### **Python Dependencies**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt
```

#### **Node.js Dependencies**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **Service Status Check**
```bash
# Check all running services
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :8000
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :8004
```

## 📊 **Performance Monitoring**

### **Resource Usage**
- **MongoDB**: ~200MB RAM
- **Node.js Services**: ~100MB RAM each
- **Python Services**: ~150MB RAM each
- **PHP Service**: ~100MB RAM
- **Total**: ~1.5GB RAM for all services

### **Optimization Tips**
- Use SSD for better database performance
- Increase Node.js memory limit if needed
- Monitor Docker container resources
- Use production builds for testing

## 🔒 **Security Notes**

### **Local Development Only**
- All services run on localhost
- No external internet access required
- Default credentials for development only
- Change passwords for production use

### **Environment Variables**
- All sensitive data in .env files
- Never commit .env files to version control
- Use strong passwords in production
- Enable HTTPS in production

## 📈 **Scaling Considerations**

### **For Production**
- Use production databases (MongoDB Atlas, etc.)
- Implement proper authentication
- Enable HTTPS and security headers
- Use load balancers for multiple instances
- Implement monitoring and logging
- Use CDN for static assets

### **For Development**
- All services can run on single machine
- Use Docker for consistent environments
- Implement hot reload for development
- Use local databases for speed

## 🎯 **Next Steps**

### **1. Explore Platforms**
- Start with main platform at http://localhost:3000
- Explore individual platforms
- Test integrations between services

### **2. Customize Features**
- Modify components and styles
- Add new features and modules
- Integrate additional services

### **3. Development**
- Use integrated development environment
- Implement new features
- Test and debug applications

### **4. Deployment**
- Prepare for production deployment
- Configure production databases
- Implement security measures

## 📞 **Support**

### **Documentation**
- Each platform has its own documentation
- Check individual README files
- Review API documentation

### **Issues**
- Check troubleshooting section
- Review service logs
- Verify environment setup

### **Development**
- All code is available for modification
- Use version control for changes
- Follow best practices for each technology

---

**🎉 You now have a complete, local development environment with all the cloned projects running and integrated!**

**Happy coding!** 🚀 