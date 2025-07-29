# 🚀 Deployment Guide

This guide will help you deploy your TechVision landing page to various platforms.

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- Git repository (for some platforms)

## 🛠️ Quick Start

### 1. Build the Application

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### 2. Choose Your Deployment Platform

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

**Easiest method - Drag & Drop:**

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop your `build` folder
3. Your site is live instantly!

**Using Netlify CLI:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

**Using Git Integration:**

1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Deploy automatically on every push

### Option 2: Vercel

**Using Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Using Git Integration:**

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Deploy automatically

### Option 3: GitHub Pages

1. **Add homepage to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/repository-name"
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts to package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase:**
   ```bash
   firebase init hosting
   ```

4. **Set public directory to `build`**

5. **Deploy:**
   ```bash
   firebase deploy
   ```

### Option 5: AWS S3 + CloudFront

1. **Install AWS CLI and configure credentials**

2. **Create S3 bucket and enable static website hosting**

3. **Upload build files:**
   ```bash
   aws s3 sync build/ s3://your-bucket-name
   ```

4. **Set up CloudFront for CDN (optional)**

## 🎯 Using the Deployment Scripts

### For Windows Users:

```bash
deploy.bat
```

### For Mac/Linux Users:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SITE_NAME=TechVision
REACT_APP_API_URL=your_api_url_here
```

## 📱 Custom Domain Setup

### Netlify:
1. Go to Site Settings > Domain Management
2. Add custom domain
3. Update DNS records as instructed

### Vercel:
1. Go to Project Settings > Domains
2. Add custom domain
3. Update DNS records

### GitHub Pages:
1. Go to Repository Settings > Pages
2. Add custom domain
3. Create CNAME file in public folder

## 🔒 Security Headers

The `netlify.toml` file includes security headers:

- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 📊 Performance Optimization

The build process automatically:
- Minifies JavaScript and CSS
- Optimizes images
- Generates service worker (if configured)
- Creates gzipped files

## 🚨 Troubleshooting

### Build Fails:
- Check Node.js version (should be 14+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors in your code

### Deployment Fails:
- Verify build folder exists
- Check platform-specific requirements
- Review deployment logs

### Site Not Loading:
- Check custom domain DNS settings
- Verify build files are uploaded correctly
- Check platform status pages

## 📞 Support

If you encounter issues:

1. Check the platform's documentation
2. Review the README.md file
3. Check the deployment logs
4. Contact platform support

## 🎉 Success!

Once deployed, your site will be live and accessible to users worldwide!

---

**Happy Deploying! 🚀** 