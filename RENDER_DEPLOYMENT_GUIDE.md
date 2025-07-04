# 🚀 JANAVAANI Render.com Deployment Guide

## ✅ Current Status: Repository Connected to Render

### 📋 **Step-by-Step Render Configuration:**

#### **1. Service Configuration**
In your Render dashboard, configure these settings:

```
Service Type: Web Service
Name: janavaani-community-hub
Environment: Node
Region: Choose closest to your users
Branch: main
Build Command: npm install
Start Command: npm start
```

#### **2. Environment Variables**
Add these in the Render dashboard under "Environment":

```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/janavaani-db
JWT_SECRET = your-super-secret-jwt-key-here-minimum-32-characters
```

#### **3. Advanced Settings**
```
Auto-Deploy: Yes (Deploy on every push to main branch)
Health Check Path: /
```

### 🗄️ **Database Setup (MongoDB Atlas)**

#### **Step 1: Create MongoDB Atlas Account**
1. Go to https://cloud.mongodb.com
2. Sign up for free account
3. Create new cluster (free tier: M0)
4. Choose cloud provider and region

#### **Step 2: Database Configuration**
1. **Database Access**: Create database user
   - Username: `janavaani_user`
   - Password: Generate strong password
   - Database User Privileges: Read and write to any database

2. **Network Access**: Add IP addresses
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)
   - Or add Render's IP addresses

#### **Step 3: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<username>` and `<password>` with your credentials
5. Replace `<dbname>` with `janavaani-db`

Example connection string:
```
mongodb+srv://janavaani_user:YOUR_PASSWORD@cluster0.abcdef.mongodb.net/janavaani-db?retryWrites=true&w=majority
```

### 🔧 **JWT Secret Generation**
Generate a secure JWT secret (minimum 32 characters):
```
Use this example or generate your own:
janavaani-super-secret-jwt-key-2025-production-render-deployment
```

### 📱 **Post-Deployment Verification**

Once deployed, your app will be available at:
```
https://janavaani-community-hub.onrender.com
```

#### **Test These URLs:**
- **Homepage**: https://janavaani-community-hub.onrender.com/
- **Login**: https://janavaani-community-hub.onrender.com/login.html
- **Signup**: https://janavaani-community-hub.onrender.com/signup.html
- **API Health**: https://janavaani-community-hub.onrender.com/api/health

### 🐛 **Common Issues & Solutions**

#### **Build Fails:**
- Check if `package.json` has all dependencies
- Verify Node.js version compatibility

#### **Database Connection Fails:**
- Check MongoDB Atlas connection string
- Verify database user credentials
- Ensure IP whitelist includes 0.0.0.0/0

#### **App Doesn't Start:**
- Check environment variables are set
- Verify PORT is set to 10000
- Check server logs in Render dashboard

### 🔄 **Automatic Deployments**
Every time you push to the main branch of your GitHub repository, Render will automatically:
1. Pull latest code
2. Run `npm install`
3. Start the application
4. Update the live site

### 🎯 **Next Steps After Deployment:**
1. ✅ Configure environment variables
2. ✅ Set up MongoDB Atlas
3. ✅ Test all functionality
4. ✅ Share your live URL!

---

## 🎉 **Your JANAVAANI App Will Be Live Soon!**

**Expected URL**: https://janavaani-community-hub.onrender.com
**Deployment Time**: 5-10 minutes after configuration
**Auto-Deploy**: Enabled for future updates

Good luck with your deployment! 🚀
