# 🚀 **MEWAYZ - Creator Economy Platform**

> **The Ultimate Platform for Creators to Monetize, Grow, and Scale Their Digital Business**

[![UI8 Core 2.0](https://img.shields.io/badge/Design-UI8%20Core%202.0-blue)](https://ui8.net)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)

## 🎨 **UI8 Core 2.0 Design System**

This platform features a **complete UI8 Core 2.0 design system** implementation, providing:

- ✨ **Modern Color Palette**: UI8 Core 2.0 primary colors (#6366f1)
- 🎯 **Professional Typography**: Inter font with proper hierarchy
- 📐 **Consistent Spacing**: UI8 spacing system throughout
- 🌟 **Modern Shadows**: Subtle, professional shadow effects
- 🔄 **Smooth Transitions**: 200ms transitions on all interactions
- 📱 **Responsive Design**: Mobile-first approach

## 🚀 **Features**

### **Creator Economy Focus**
- 🎯 **Creator Dashboard**: Manage your digital business
- 💰 **Monetization Tools**: Multiple revenue streams
- 👥 **Team Collaboration**: Built-in team management
- 📊 **Analytics**: Track your growth and performance
- 🔗 **Social Integration**: Connect your social platforms

### **Modern Authentication**
- 🔐 **Secure Login**: Email/password authentication
- 🌐 **Social Login**: Google and GitHub integration
- 🛡️ **Password Management**: Enhanced security features
- 📧 **Magic Links**: Passwordless authentication

### **Team Management**
- 👥 **Team Creation**: Easy team setup and management
- 👤 **Member Management**: Invite and manage team members
- 🔄 **Role-based Access**: Granular permissions
- 📈 **Team Analytics**: Track team performance

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with UI8 Core 2.0 design system
- **Authentication**: NextAuth.js with multiple providers
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker with Docker Compose
- **UI Components**: Custom UI8 Core 2.0 components

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### **1. Clone the Repository**
```bash
git clone https://github.com/ins72/mewayz-platform.git
cd mewayz-platform
```

### **2. Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mewayz"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:4002"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### **3. Docker Deployment (Recommended)**
```bash
# Start the platform
docker-compose up -d

# The platform will be available at:
# http://localhost:4002
```

### **4. Manual Setup (Alternative)**
```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

## 🎨 **Design System**

### **UI8 Core 2.0 Components**

```css
/* Primary Button */
.btn-ui8-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-ui8 shadow-ui8-md hover:shadow-ui8-lg transition-all duration-200;
}

/* Card Component */
.card-ui8 {
  @apply bg-white rounded-ui8-lg shadow-ui8-lg border border-gray-100 p-6 hover:shadow-ui8-xl transition-shadow duration-200;
}

/* Form Input */
input {
  @apply rounded-ui8 border border-gray-300 px-4 py-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200;
}
```

### **Color Palette**
- **Primary**: `#6366f1` (UI8 Core 2.0 Blue)
- **Secondary**: `#64748b` (Slate Gray)
- **Accent**: `#f59e0b` (Amber)
- **Success**: `#10b981` (Emerald)
- **Error**: `#ef4444` (Red)

## 📱 **Screenshots**

### **Landing Page**
![Landing Page](docs/screenshots/landing.png)

### **Dashboard**
![Dashboard](docs/screenshots/dashboard.png)

### **Authentication**
![Authentication](docs/screenshots/auth.png)

## 🔧 **Development**

### **Project Structure**
```
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── shared/         # Shared UI components
│   └── team/           # Team management components
├── pages/              # Next.js pages
├── styles/             # Global styles
├── lib/                # Utility functions
├── prisma/             # Database schema
└── docs/               # Documentation
```

### **Available Scripts**
```bash
# Development
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:push         # Push schema to database
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Type checking
npm run type-check      # Run TypeScript compiler
```

## 🚀 **Deployment**

### **Docker Deployment**
```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose up -d
```

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Railway Deployment**
1. Connect your GitHub repository to Railway
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **UI8 Core 2.0**: Design system inspiration and components
- **BoxyHQ**: Original SaaS Starter Kit foundation
- **Next.js Team**: Amazing React framework
- **Tailwind CSS**: Utility-first CSS framework
- **Prisma**: Modern database toolkit

## 📞 **Support**

- 📧 **Email**: support@mewayz.com
- 💬 **Discord**: [Join our community](https://discord.gg/mewayz)
- 📖 **Documentation**: [docs.mewayz.com](https://docs.mewayz.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/ins72/mewayz-platform/issues)

---

**Built with ❤️ for the Creator Economy**

[MEWAYZ Platform](https://mewayz.com) | [UI8 Core 2.0](https://ui8.net) | [Documentation](https://docs.mewayz.com)
