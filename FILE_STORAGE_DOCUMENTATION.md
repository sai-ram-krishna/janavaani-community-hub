# 📁 JANAVAANI File Storage System Documentation

## 🗂️ **Storage Architecture**

### **Database Storage (MongoDB)**
- **Database**: `janavaani-db`
- **Collection**: `issues`
- **Location**: `mongodb://localhost:27017/janavaani-db`

### **File Storage (Local File System)**
```
📁 project-root/
├── 📁 uploads/
│   ├── 📁 issues/          # Citizen-uploaded files when reporting issues
│   │   ├── photo-1234567890.jpg
│   │   ├── document-1234567890.pdf
│   │   └── ...
│   ├── 📁 progress/        # Government work progress photos
│   │   ├── progress-1234567890.jpg
│   │   ├── work-site-1234567890.jpg
│   │   └── ...
│   └── 📁 documents/       # Government documents (bills, contracts, etc.)
│       ├── bill-1234567890.pdf
│       ├── contract-1234567890.pdf
│       └── ...
```

## 📋 **Issue Data Structure**

### **1. Basic Issue Information**
```javascript
{
  _id: ObjectId("..."),
  title: "Road Repair Needed",
  description: "Main road has large potholes...",
  category: "roads",
  status: "pending",
  priority: "medium",
  
  // Location details
  location: {
    state: "Andhra Pradesh",
    district: "Guntur",
    mandal: "Tenali",
    village: "Kollipara",
    address: "Main Road",
    pincode: "522201"
  },
  
  // Who reported it
  submittedBy: {
    userId: ObjectId("..."),
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210"
  }
}
```

### **2. Citizen-Uploaded Files**
```javascript
{
  // Files uploaded when citizen reports issue
  attachments: [
    {
      filename: "pothole-20250702-123456789.jpg",    // Stored filename
      originalName: "IMG_001.jpg",                    // Original filename
      mimetype: "image/jpeg",
      size: 1024000,                                  // Size in bytes
      uploadDate: "2025-07-02T10:30:00.000Z"
    },
    {
      filename: "road-damage-20250702-123456790.jpg",
      originalName: "road_photo.jpg",
      mimetype: "image/jpeg",
      size: 2048000,
      uploadDate: "2025-07-02T10:30:00.000Z"
    }
  ]
}
```

### **3. Government Workflow Data**
```javascript
{
  // Department assignment
  assignedTo: {
    department: "roads",
    officialId: ObjectId("...")
  },
  
  // Government response details
  resolutionDetails: {
    // Budget sanctioning
    budgetSanctioned: {
      amount: 50000,
      sanctionedBy: "Highway Engineer",
      sanctionDate: "2025-07-02T11:00:00.000Z",
      billNumber: "BILL/2025/001",
      financialYear: "2024-25"
    },
    
    // Contractor details
    contractor: {
      name: "ABC Construction",
      contactNumber: "9876543210",
      registrationNumber: "REG/2024/001"
    },
    
    estimatedCost: 45000,
    expectedCompletionDate: "2025-08-15T00:00:00.000Z",
    
    // Work progress tracking
    workProgress: [
      {
        stage: "planning",
        description: "Site survey completed, materials estimated",
        completionPercentage: 25,
        updatedAt: "2025-07-03T09:00:00.000Z",
        updatedBy: ObjectId("..."),
        
        // Progress photos uploaded by government officials
        photos: [
          {
            filename: "survey-20250703-123456791.jpg",
            originalName: "site_survey.jpg",
            description: "Site survey and measurement",
            uploadDate: "2025-07-03T09:15:00.000Z",
            uploadedBy: ObjectId("...")
          }
        ],
        
        // Official documents
        documents: [
          {
            filename: "estimate-20250703-123456792.pdf",
            originalName: "cost_estimate.pdf",
            documentType: "bill",
            uploadDate: "2025-07-03T09:30:00.000Z",
            uploadedBy: ObjectId("...")
          }
        ]
      },
      {
        stage: "execution",
        description: "Road repair work in progress",
        completionPercentage: 75,
        updatedAt: "2025-07-10T14:00:00.000Z",
        updatedBy: ObjectId("..."),
        
        photos: [
          {
            filename: "work-progress-20250710-123456793.jpg",
            originalName: "work_site.jpg",
            description: "Road repair in progress",
            uploadDate: "2025-07-10T14:15:00.000Z",
            uploadedBy: ObjectId("...")
          }
        ]
      }
    ]
  }
}
```

### **4. Social Features Data**
```javascript
{
  // Social engagement statistics
  socialStats: {
    likes: 15,
    comments: 8,
    shares: 3,
    upvotes: 12,
    downvotes: 2,
    views: 150,
    score: 28  // Calculated engagement score
  },
  
  // Individual interactions
  likes: [
    {
      userId: ObjectId("..."),
      userName: "Jane Smith",
      likedAt: "2025-07-02T12:00:00.000Z"
    }
  ],
  
  comments: [
    {
      userId: ObjectId("..."),
      userName: "Mike Johnson",
      comment: "This road is very dangerous, needs immediate attention!",
      commentedAt: "2025-07-02T13:00:00.000Z"
    }
  ],
  
  votes: [
    {
      userId: ObjectId("..."),
      voteType: "upvote",
      votedAt: "2025-07-02T14:00:00.000Z"
    }
  ]
}
```

## 🔄 **File Upload Workflow**

### **1. Citizen Reports Issue (with photos)**
```
1. User fills issue form
2. Selects photos using file input
3. Issue data sent to: POST /api/issues/create
4. Issue created in database
5. Photos uploaded to: POST /api/issues/:issueId/upload
6. File metadata stored in issue.attachments[]
7. Physical files saved to: uploads/issues/
```

### **2. Government Updates Work Progress (with photos)**
```
1. Official fills progress form
2. Selects progress photos
3. Progress data sent to: POST /api/issues/:issueId/work-progress
4. Progress entry created in database
5. Photos uploaded to: POST /api/issues/:issueId/progress-photos
6. Photo metadata stored in workProgress[].photos[]
7. Physical files saved to: uploads/progress/
```

### **3. Government Uploads Documents (bills, contracts)**
```
1. Official uploads official documents
2. Documents sent to: POST /api/issues/:issueId/documents
3. Document metadata stored in workProgress[].documents[]
4. Physical files saved to: uploads/documents/
```

## 🌐 **File Access URLs**

### **Viewing Uploaded Files**
```
# Citizen issue photos
http://localhost:5000/uploads/issues/pothole-20250702-123456789.jpg

# Government progress photos  
http://localhost:5000/uploads/progress/work-progress-20250710-123456793.jpg

# Government documents
http://localhost:5000/uploads/documents/bill-20250703-123456792.pdf
```

### **API Endpoints for File Operations**
```
# Upload issue attachments (citizen)
POST /api/issues/:issueId/upload

# Upload progress photos (government)
POST /api/issues/:issueId/progress-photos

# Upload documents (government)
POST /api/issues/:issueId/documents

# Serve files
GET /api/issues/files/:folder/:filename
GET /uploads/:folder/:filename
```

## 📊 **File Specifications**

### **Allowed File Types**
- **Images**: JPG, JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX, XLS, XLSX

### **File Size Limits**
- **Per file**: 10MB maximum
- **Per upload**: 5 files maximum
- **Total storage**: Unlimited (local disk space)

### **Security Features**
- File type validation
- Size limits
- Unique filename generation
- Directory traversal protection
- File extension validation

## 💾 **Backup and Storage Considerations**

### **Database Backup**
```bash
# MongoDB backup
mongodump --db janavaani-db --out ./backups/

# Restore
mongorestore ./backups/janavaani-db/
```

### **File Storage Backup**
```bash
# Backup uploaded files
tar -czf files-backup.tar.gz uploads/

# File storage can be moved to cloud services like:
# - AWS S3
# - Google Cloud Storage  
# - Azure Blob Storage
```

## 🚀 **Production Recommendations**

### **For Production Deployment:**

1. **Use Cloud Storage**: Move files to AWS S3/Google Cloud
2. **CDN Integration**: Serve files through CloudFront/CloudFlare
3. **Database Hosting**: Use MongoDB Atlas or dedicated server
4. **File Compression**: Automatically compress images
5. **Virus Scanning**: Scan uploaded files for malware
6. **Access Control**: Implement file access permissions
7. **Backup Strategy**: Automated daily backups

### **Example Production Setup:**
```javascript
// Production file storage configuration
const cloudStorage = {
  provider: 'AWS_S3',
  bucket: 'janavaani-files',
  region: 'us-east-1',
  accessKey: process.env.AWS_ACCESS_KEY,
  secretKey: process.env.AWS_SECRET_KEY
};
```

---

**The complete file storage system is now implemented and ready for testing!** 🎉

Files are stored locally during development and can be easily migrated to cloud storage for production.
