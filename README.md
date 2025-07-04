# JANAVAANI - Civic Issue Reporting System

## 🏛️ **System Overview**

JANAVAANI is a comprehensive civic issue reporting and management system that connects citizens with government officials for efficient issue resolution.

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- Modern web browser

### **Installation & Setup**

1. **Start the Server:**
   ```powershell
   cd server
   npm install
   npm start
   ```
   Server runs on: http://localhost:5000

2. **Access the Application:**
   - Homepage: http://localhost:5000/index.html
   - Direct file access: file:///c:/Users/saira/OneDrive/Desktop/GIT/client/index.html

## 👥 **User Roles & Access**

### **🏠 Citizens**
- **Signup/Login:** Standard user registration
- **Dashboard:** http://localhost:5000/dashboard.html
- **Features:**
  - Report new issues with hierarchical location selection
  - Track their submitted issues
  - View issue status updates
  - Manage profile information

### **🏛️ Government Officials**
- **Signup/Login:** Register with `userType: government` and specify department
- **Dashboard:** http://localhost:5000/government-dashboard.html (auto-redirect)
- **Features:**
  - View issues assigned to their department only
  - Update issue status (pending → in-progress → resolved/rejected)
  - Add comments and resolution notes
  - Filter and search department issues
  - Real-time statistics for their department

### **👤 System Admin**
- **Access:** http://localhost:5000/admin.html
- **Authentication:** Password: `admin123`
- **Features:**
  - View all registered users
  - Monitor user statistics
  - Search and filter users
  - Department and user type analytics

## 🔄 **System Flow**

### **Citizen Flow:**
1. **Sign up** → Select "Citizen" user type
2. **Login** → Redirected to citizen dashboard
3. **Report Issue** → Fill form with hierarchical location
4. **Track Issues** → View "My Issues" tab for status updates

### **Government Official Flow:**
1. **Sign up** → Select "Government" user type + specify department
2. **Login** → Redirected to government dashboard
3. **Manage Issues** → View only issues assigned to their department
4. **Update Status** → Change status and add comments
5. **Resolve Issues** → Mark as resolved with notes

## 🏢 **Department Structure**

Issues are automatically assigned to departments based on category:

| **Category** | **Assigned Department** |
|-------------|------------------------|
| Roads | Roads Department |
| Water | Water Department |
| Electricity | Electricity Department |
| Sanitation | Sanitation Department |
| Healthcare | Healthcare Department |
| Education | Education Department |
| Other | Municipal Department |

## 📍 **Location Hierarchy**

The system uses a 4-level location hierarchy:
- **State** → **District** → **Mandal** → **Village**
- Plus detailed address and pincode
- Data stored in `client/data/locations.json`

## 🔗 **API Endpoints**

### **Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/admin/users` - Get all users (admin only)

### **Issues:**
- `GET /api/issues` - Get all issues
- `POST /api/issues/create` - Create new issue
- `GET /api/issues/user/:userId` - Get user's issues
- `PUT /api/issues/:id/status` - Update issue status

## 📁 **File Structure**

```
JANAVAANI/
├── client/
│   ├── index.html              # Homepage
│   ├── login.html              # Login page
│   ├── signup.html             # Registration page
│   ├── dashboard.html          # Citizen dashboard
│   ├── government-dashboard.html # Government dashboard
│   ├── admin.html              # Admin dashboard
│   ├── scripts/
│   │   ├── login.js            # Login functionality
│   │   ├── signup.js           # Registration functionality
│   │   ├── dashboard.js        # Citizen dashboard logic
│   │   ├── government-dashboard.js # Government dashboard logic
│   │   └── location-selector.js # Location selection
│   ├── styles/
│   │   ├── styles.css          # Main styles
│   │   └── dashboard.css       # Dashboard styles
│   └── data/
│       └── locations.json      # Location hierarchy data
├── server/
│   ├── index.js               # Main server file
│   ├── models/
│   │   ├── user.js            # User model
│   │   └── issue.js           # Issue model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   └── issues.js          # Issue management routes
│   └── config/
│       └── db.js              # Database configuration
└── package.json
```

## 🔧 **Configuration**

### **Database:**
- MongoDB connection: `mongodb://localhost:27017/janavaani-db`
- Collections: `users`, `issues`

### **Security:**
- Admin API key: `admin-secret-key-123`
- Admin password: `admin123`

## 🧪 **Testing the System**

### **Test Citizen Flow:**
1. Go to: http://localhost:5000/signup.html
2. Register as citizen
3. Login → should redirect to dashboard.html
4. Report an issue with full location details
5. Check "My Issues" tab

### **Test Government Official Flow:**
1. Go to: http://localhost:5000/signup.html
2. Register as government official (specify department)
3. Login → should redirect to government-dashboard.html
4. View issues for your department
5. Update issue status and add comments

### **Test Admin Access:**
1. Go to: http://localhost:5000/admin.html
2. Enter password: `admin123`
3. View user statistics and manage users

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Server not starting:** Check if MongoDB is running
2. **Authentication issues:** Clear browser localStorage
3. **API errors:** Verify server is running on port 5000
4. **No issues showing:** Check browser console for errors

### **Reset User Data:**
```javascript
// Run in browser console
localStorage.clear();
```

## 🔄 **Status Workflow**

Issues follow this status progression:
1. **Pending** (initial status)
2. **In Progress** (official working on it)
3. **Resolved** (issue fixed)
4. **Rejected** (issue invalid/duplicate)

## 📊 **Features Implemented**

✅ **User Management:** Registration, login, role-based access  
✅ **Issue Reporting:** Hierarchical location, category selection  
✅ **Department Assignment:** Auto-assignment based on category  
✅ **Status Tracking:** Real-time updates with comments  
✅ **Government Dashboard:** Department-specific issue management  
✅ **Admin Panel:** User statistics and management  
✅ **Responsive Design:** Works on desktop and mobile  
✅ **Security:** Role-based authentication and access control  

## 🎯 **Ready for Production**

The system is now fully functional with:
- Secure authentication flows
- Department-based issue filtering
- Complete CRUD operations
- Real-time status updates
- Responsive user interfaces
- Comprehensive admin controls

**Your JANAVAANI civic issue reporting system is ready to help citizens and government officials collaborate effectively! 🎉**
