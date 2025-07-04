const router = require("express").Router();
const Issue = require("../models/issue");
const User = require("../models/user");
const { upload } = require("../config/upload");
const path = require('path');

// Create new issue
router.post("/create", async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      location, 
      priority, 
      submittedBy 
    } = req.body;

    // Validation
    if (!title || !description || !category || !location || !submittedBy) {
      return res.status(400).json({ 
        message: "All required fields must be provided." 
      });
    }

    if (!location.state || !location.district || !location.mandal || 
        !location.village || !location.address || !location.pincode) {
      return res.status(400).json({ 
        message: "Complete location details (state, district, mandal, village, address, pincode) are required." 
      });
    }

    // Verify user exists
    const user = await User.findById(submittedBy.userId);
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid user ID." 
      });
    }

    const newIssue = new Issue({
      title,
      description,
      category,
      location,
      priority: priority || 'medium',
      submittedBy
    });

    await newIssue.save();

    res.status(201).json({
      message: "Issue submitted successfully!",
      issue: {
        id: newIssue._id,
        title: newIssue.title,
        category: newIssue.category,
        status: newIssue.status,
        assignedDepartment: newIssue.assignedTo.department,
        createdAt: newIssue.createdAt
      }
    });
  } catch (err) {
    console.error("Issue creation error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Get all issues (for admin)
router.get("/all", async (req, res) => {
  try {
    // Simple API key check (replace with proper auth later)
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'admin-secret-key-123') {
      return res.status(401).json({ 
        message: "Unauthorized. Admin access required." 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('submittedBy.userId', 'name email')
      .populate('assignedTo.officialId', 'name email department');

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      message: "Issues retrieved successfully",
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalIssues: total
      },
      issues
    });
  } catch (err) {
    console.error("Issues fetch error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Get all issues (for government officials and admin)
router.get("/", async (req, res) => {
  try {
    // Advanced filtering with location and social features
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;
    const sortBy = req.query.sortBy || 'newest';
    
    // Location filters
    const state = req.query.state;
    const district = req.query.district;
    const mandal = req.query.mandal;
    const village = req.query.village;
    
    // Social filters
    const trending = req.query.trending;
    const minLikes = req.query.minLikes;
    const minComments = req.query.minComments;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    // Location filtering
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;
    if (mandal) filter['location.mandal'] = mandal;
    if (village) filter['location.village'] = village;
    
    // Social filtering
    if (trending === 'true') filter['trending.isTrending'] = true;
    if (minLikes) filter['socialStats.likes'] = { $gte: parseInt(minLikes) };
    if (minComments) filter['socialStats.comments'] = { $gte: parseInt(minComments) };

    const skip = (page - 1) * limit;

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'trending':
        sortCriteria = { 'trending.trendingScore': -1, 'socialStats.score': -1 };
        break;
      case 'popular':
        sortCriteria = { 'socialStats.score': -1 };
        break;
      case 'mostLiked':
        sortCriteria = { 'socialStats.likes': -1 };
        break;
      case 'mostCommented':
        sortCriteria = { 'socialStats.comments': -1 };
        break;
      case 'priority':
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        sortCriteria = { priority: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const issues = await Issue.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Add reporter name to each issue
    const issuesWithReporter = issues.map(issue => ({
      ...issue,
      reporterName: issue.submittedBy?.name || 'Anonymous'
    }));

    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        totalIssues: total
      },
      issues: issuesWithReporter
    });
  } catch (err) {
    console.error("Issues fetch error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Get issues by user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ 
        message: "User not found." 
      });
    }

    const issues = await Issue.find({ 'submittedBy.userId': userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "User issues retrieved successfully",
      count: issues.length,
      issues
    });
  } catch (err) {
    console.error("User issues fetch error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Get single issue details
router.get("/:issueId", async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId)
      .populate('submittedBy.userId', 'name email userType')
      .populate('assignedTo.officialId', 'name email department')
      .populate('updates.updatedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    res.status(200).json({
      message: "Issue details retrieved successfully",
      issue
    });
  } catch (err) {
    console.error("Issue fetch error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Update issue status (for officials/admin)
router.put("/:issueId/status", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status, comment, updatedBy, department } = req.body;

    // Basic validation
    if (!status || !updatedBy) {
      return res.status(400).json({ 
        success: false,
        message: "Status and updatedBy are required." 
      });
    }

    const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status value. Must be one of: pending, in-progress, resolved, rejected" 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: "Issue not found." 
      });
    }

    // Store previous status
    const previousStatus = issue.status;

    // Update status and add status history entry
    issue.status = status;
    
    // Initialize statusHistory if it doesn't exist
    if (!issue.statusHistory) {
      issue.statusHistory = [];
    }
    
    issue.statusHistory.push({
      status: status,
      comment: comment || `Status changed from ${previousStatus} to ${status}`,
      updatedBy: updatedBy,
      department: department || 'Government',
      date: new Date()
    });

    // If resolved, add resolution details
    if (status === 'resolved') {
      issue.resolutionDetails = {
        resolvedAt: new Date(),
        resolvedBy: updatedBy,
        resolutionNotes: comment || 'Issue marked as resolved',
        department: department || 'Government'
      };
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Issue status updated successfully",
      issue: {
        id: issue._id,
        status: issue.status,
        updatedAt: issue.updatedAt,
        statusHistory: issue.statusHistory
      }
    });
  } catch (err) {
    console.error("Issue status update error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Get statistics (for dashboard)
router.get("/stats/overview", async (req, res) => {
  try {
    // Simple API key check
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'admin-secret-key-123') {
      return res.status(401).json({ 
        message: "Unauthorized. Admin access required." 
      });
    }

    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const pendingIssues = await Issue.countDocuments({ 
      status: { $in: ['submitted', 'in-review', 'in-progress'] } 
    });
    const urgentIssues = await Issue.countDocuments({ priority: 'urgent' });

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent issues (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentIssues = await Issue.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.status(200).json({
      message: "Statistics retrieved successfully",
      stats: {
        overview: {
          total: totalIssues,
          resolved: resolvedIssues,
          pending: pendingIssues,
          urgent: urgentIssues,
          recent: recentIssues,
          resolutionRate: totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0
        },
        byCategory: issuesByCategory,
        byStatus: issuesByStatus
      }
    });
  } catch (err) {
    console.error("Statistics fetch error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Social interaction endpoints

// Like/Unlike an issue
router.post("/:issueId/like", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ 
        message: "User ID and name are required." 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    // Check if user already liked
    const existingLike = issue.likes.find(like => like.userId.toString() === userId);
    
    if (existingLike) {
      // Unlike - remove the like
      issue.likes = issue.likes.filter(like => like.userId.toString() !== userId);
      await issue.save();
      
      res.status(200).json({
        message: "Issue unliked successfully",
        liked: false,
        likeCount: issue.socialStats.likes
      });
    } else {
      // Like - add the like
      issue.likes.push({
        userId,
        userName,
        likedAt: new Date()
      });
      await issue.save();
      
      res.status(200).json({
        message: "Issue liked successfully",
        liked: true,
        likeCount: issue.socialStats.likes
      });
    }
  } catch (err) {
    console.error("Like/Unlike error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Add comment to an issue
router.post("/:issueId/comment", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId, userName, userEmail, comment } = req.body;

    if (!userId || !userName || !comment) {
      return res.status(400).json({ 
        message: "User ID, name, and comment are required." 
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({ 
        message: "Comment must be less than 500 characters." 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    issue.comments.push({
      userId,
      userName,
      userEmail,
      comment: comment.trim(),
      commentedAt: new Date(),
      likes: []
    });

    await issue.save();

    res.status(201).json({
      message: "Comment added successfully",
      commentCount: issue.socialStats.comments,
      comment: issue.comments[issue.comments.length - 1]
    });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Vote on an issue (upvote/downvote)
router.post("/:issueId/vote", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId, userName, voteType } = req.body;

    if (!userId || !userName || !voteType) {
      return res.status(400).json({ 
        message: "User ID, name, and vote type are required." 
      });
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ 
        message: "Vote type must be 'upvote' or 'downvote'." 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    // Remove existing vote by this user
    issue.votes = issue.votes.filter(vote => vote.userId.toString() !== userId);
    
    // Add new vote
    issue.votes.push({
      userId,
      userName,
      voteType,
      votedAt: new Date()
    });

    await issue.save();

    res.status(200).json({
      message: "Vote recorded successfully",
      upvotes: issue.socialStats.upvotes,
      downvotes: issue.socialStats.downvotes,
      score: issue.socialStats.score
    });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Share an issue
router.post("/:issueId/share", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId, userName, platform = 'internal' } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ 
        message: "User ID and name are required." 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    issue.shares.push({
      userId,
      userName,
      platform,
      sharedAt: new Date()
    });

    await issue.save();

    res.status(200).json({
      message: "Issue shared successfully",
      shareCount: issue.socialStats.shares
    });
  } catch (err) {
    console.error("Share error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Increment view count
router.post("/:issueId/view", async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        message: "Issue not found." 
      });
    }

    issue.socialStats.views += 1;
    await issue.save();

    res.status(200).json({
      message: "View recorded",
      views: issue.socialStats.views
    });
  } catch (err) {
    console.error("View error:", err);
    res.status(500).json({ 
      message: "Server error. Please try again later." 
    });
  }
});

// Get trending issues
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const state = req.query.state;
    const district = req.query.district;

    const filter = { 'trending.isTrending': true };
    if (state) filter['location.state'] = state;
    if (district) filter['location.district'] = district;

    const trendingIssues = await Issue.find(filter)
      .sort({ 'trending.trendingScore': -1, 'socialStats.score': -1 })
      .limit(limit)
      .lean();

    const issuesWithReporter = trendingIssues.map(issue => ({
      ...issue,
      reporterName: issue.submittedBy?.name || 'Anonymous'
    }));

    res.status(200).json({
      success: true,
      message: "Trending issues retrieved successfully",
      issues: issuesWithReporter,
      count: issuesWithReporter.length
    });
  } catch (err) {
    console.error("Trending issues error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Get location-based statistics
router.get("/location-stats", async (req, res) => {
  try {
    const { state, district, mandal } = req.query;

    const matchFilter = {};
    if (state) matchFilter['location.state'] = state;
    if (district) matchFilter['location.district'] = district;
    if (mandal) matchFilter['location.mandal'] = mandal;

    const stats = await Issue.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          pendingIssues: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          },
          totalLikes: { $sum: "$socialStats.likes" },
          totalComments: { $sum: "$socialStats.comments" },
          totalShares: { $sum: "$socialStats.shares" },
          avgEngagement: { $avg: "$socialStats.score" }
        }
      }
    ]);

    const locationStats = stats[0] || {
      totalIssues: 0,
      pendingIssues: 0,
      resolvedIssues: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      avgEngagement: 0
    };

    res.status(200).json({
      success: true,
      message: "Location statistics retrieved successfully",
      stats: locationStats
    });
  } catch (err) {
    console.error("Location stats error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// ===============================
// FILE UPLOAD ENDPOINTS
// ===============================

// Upload files for an issue (citizen reporting)
router.post("/:issueId/upload", upload.array('files', 5), async (req, res) => {
  try {
    const { issueId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No files uploaded" 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: "Issue not found" 
      });
    }

    // Add files to issue attachments
    const newAttachments = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadDate: new Date()
    }));

    issue.attachments.push(...newAttachments);
    await issue.save();

    res.status(200).json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      attachments: newAttachments
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during file upload" 
    });
  }
});

// Upload progress photos (government officials)
router.post("/:issueId/progress-photos", upload.array('photos', 5), async (req, res) => {
  try {
    const { issueId } = req.params;
    const { progressIndex, description, uploadedBy } = req.body;
    const photos = req.files;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No photos uploaded" 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: "Issue not found" 
      });
    }

    if (!issue.resolutionDetails.workProgress || !issue.resolutionDetails.workProgress[progressIndex]) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid progress entry" 
      });
    }

    // Add photos to the specific work progress entry
    const newPhotos = photos.map(photo => ({
      filename: photo.filename,
      originalName: photo.originalname,
      description: description || '',
      uploadDate: new Date(),
      uploadedBy: uploadedBy
    }));

    issue.resolutionDetails.workProgress[progressIndex].photos.push(...newPhotos);
    await issue.save();

    res.status(200).json({
      success: true,
      message: `${photos.length} photo(s) uploaded successfully`,
      photos: newPhotos
    });
  } catch (err) {
    console.error("Progress photo upload error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during photo upload" 
    });
  }
});

// Upload documents (bills, contracts, etc.)
router.post("/:issueId/documents", upload.array('documents', 5), async (req, res) => {
  try {
    const { issueId } = req.params;
    const { progressIndex, documentType, uploadedBy } = req.body;
    const documents = req.files;

    if (!documents || documents.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No documents uploaded" 
      });
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ 
        success: false,
        message: "Issue not found" 
      });
    }

    if (!issue.resolutionDetails.workProgress || !issue.resolutionDetails.workProgress[progressIndex]) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid progress entry" 
      });
    }

    // Add documents to the specific work progress entry
    const newDocuments = documents.map(doc => ({
      filename: doc.filename,
      originalName: doc.originalname,
      documentType: documentType || 'other',
      uploadDate: new Date(),
      uploadedBy: uploadedBy
    }));

    issue.resolutionDetails.workProgress[progressIndex].documents.push(...newDocuments);
    await issue.save();

    res.status(200).json({
      success: true,
      message: `${documents.length} document(s) uploaded successfully`,
      documents: newDocuments
    });
  } catch (err) {
    console.error("Document upload error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error during document upload" 
    });
  }
});

// Serve uploaded files
router.get("/files/:folder/:filename", (req, res) => {
  try {
    const { folder, filename } = req.params;
    const allowedFolders = ['issues', 'progress', 'documents'];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid folder" 
      });
    }

    const filePath = path.join(__dirname, '../../uploads', folder, filename);
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ 
          success: false,
          message: "File not found" 
        });
      }
    });
  } catch (err) {
    console.error("File serve error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error serving file" 
    });
  }
});

// ===============================
// GOVERNMENT WORKFLOW ENDPOINTS
// ===============================

// Sanction budget for an issue
router.put("/:issueId/sanction-budget", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { amount, sanctionedBy, billNumber, financialYear } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Update budget sanctioning details
    issue.resolutionDetails.budgetSanctioned = {
      amount: amount,
      sanctionedBy: sanctionedBy,
      sanctionDate: new Date(),
      billNumber: billNumber,
      financialYear: financialYear
    };

    // Add to status history
    issue.statusHistory.push({
      status: 'in-progress',
      comment: `Budget sanctioned: ₹${amount} (Bill: ${billNumber})`,
      updatedBy: sanctionedBy,
      department: 'Finance'
    });

    issue.status = 'in-progress';
    await issue.save();

    res.status(200).json({
      success: true,
      message: "Budget sanctioned successfully",
      budgetDetails: issue.resolutionDetails.budgetSanctioned
    });
  } catch (err) {
    console.error("Budget sanction error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Add work progress update
router.post("/:issueId/work-progress", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { stage, description, completionPercentage, updatedBy } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Initialize work progress array if not exists
    if (!issue.resolutionDetails.workProgress) {
      issue.resolutionDetails.workProgress = [];
    }

    // Add new work progress entry
    const progressEntry = {
      stage: stage,
      description: description,
      completionPercentage: completionPercentage || 0,
      photos: [],
      documents: [],
      updatedAt: new Date(),
      updatedBy: updatedBy
    };

    issue.resolutionDetails.workProgress.push(progressEntry);

    // Add to status history
    issue.statusHistory.push({
      status: issue.status,
      comment: `Work progress: ${stage} - ${description} (${completionPercentage}% complete)`,
      updatedBy: updatedBy,
      department: issue.assignedTo.department
    });

    // Update status based on completion
    if (completionPercentage >= 100) {
      issue.status = 'resolved';
      issue.resolutionDetails.resolvedAt = new Date();
      issue.resolutionDetails.resolvedBy = updatedBy;
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Work progress updated successfully",
      progressEntry: progressEntry
    });
  } catch (err) {
    console.error("Work progress error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Update contractor details
router.put("/:issueId/contractor", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { name, contactNumber, registrationNumber, estimatedCost, expectedCompletionDate } = req.body;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Update contractor details
    issue.resolutionDetails.contractor = {
      name: name,
      contactNumber: contactNumber,
      registrationNumber: registrationNumber
    };

    if (estimatedCost) {
      issue.resolutionDetails.estimatedCost = estimatedCost;
    }

    if (expectedCompletionDate) {
      issue.resolutionDetails.expectedCompletionDate = new Date(expectedCompletionDate);
    }

    // Add to status history
    issue.statusHistory.push({
      status: issue.status,
      comment: `Contractor assigned: ${name} (Reg: ${registrationNumber})`,
      updatedBy: req.body.updatedBy || 'Government Official',
      department: issue.assignedTo.department
    });

    await issue.save();

    res.status(200).json({
      success: true,
      message: "Contractor details updated successfully",
      contractor: issue.resolutionDetails.contractor
    });
  } catch (err) {
    console.error("Contractor update error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

// Get detailed issue for government dashboard
router.get("/:issueId/government-details", async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(issueId)
      .populate('submittedBy.userId', 'name email phone')
      .populate('assignedTo.officialId', 'name email department');

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      success: true,
      message: "Issue details retrieved successfully",
      issue: issue
    });
  } catch (err) {
    console.error("Government details error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later." 
    });
  }
});

module.exports = router;
