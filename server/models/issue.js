const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'roads',
      'roads-transport',
      'water', 
      'electricity',
      'sanitation',
      'healthcare',
      'education',
      'infrastructure',
      'environment',
      'public-safety',
      'other'
    ]
  },
  location: {
    state: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    mandal: {
      type: String,
      required: true,
      trim: true
    },
    village: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/
    },
    fullAddress: {
      type: String,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'in-progress', 'resolved', 'rejected', 'under-review'],
    default: 'pending'
  },
  submittedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  assignedTo: {
    department: {
      type: String,
      enum: ['water', 'electricity', 'roads', 'sanitation', 'education', 'healthcare', 'police', 'municipal']
    },
    officialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'submitted', 'in-progress', 'resolved', 'rejected', 'under-review'],
      required: true
    },
    comment: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: String,
      required: true
    },
    department: {
      type: String,
      default: 'Government'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    message: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    newStatus: String
  }],
  resolutionDetails: {
    resolvedAt: Date,
    resolvedBy: String,
    resolutionNotes: String,
    department: String,
    // Government Response Details
    budgetSanctioned: {
      amount: Number,
      sanctionedBy: String,
      sanctionDate: Date,
      billNumber: String,
      financialYear: String
    },
    workProgress: [{
      stage: {
        type: String,
        enum: ['planning', 'approval', 'tender', 'execution', 'completion', 'inspection']
      },
      description: String,
      completionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      photos: [{
        filename: String,
        originalName: String,
        description: String,
        uploadDate: {
          type: Date,
          default: Date.now
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }],
      documents: [{
        filename: String,
        originalName: String,
        documentType: {
          type: String,
          enum: ['tender', 'contract', 'bill', 'receipt', 'approval', 'other']
        },
        uploadDate: {
          type: Date,
          default: Date.now
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }],
      updatedAt: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    estimatedCost: Number,
    actualCost: Number,
    contractor: {
      name: String,
      contactNumber: String,
      registrationNumber: String
    },
    expectedCompletionDate: Date,
    actualCompletionDate: Date
  },
  // Social Features
  socialStats: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 0 // calculated field: upvotes - downvotes + likes + comments
    }
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    userEmail: String,
    comment: {
      type: String,
      required: true,
      maxlength: 500
    },
    commentedAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: String,
    sharedAt: {
      type: Date,
      default: Date.now
    },
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'whatsapp', 'copy-link', 'internal'],
      default: 'internal'
    }
  }],
  trending: {
    isTrending: {
      type: Boolean,
      default: false
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    trendingStartDate: Date,
    engagementRate: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
issueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate social stats
  this.socialStats.likes = this.likes.length;
  this.socialStats.comments = this.comments.length;
  this.socialStats.shares = this.shares.length;
  this.socialStats.upvotes = this.votes.filter(vote => vote.voteType === 'upvote').length;
  this.socialStats.downvotes = this.votes.filter(vote => vote.voteType === 'downvote').length;
  
  // Calculate engagement score
  this.socialStats.score = this.socialStats.upvotes - this.socialStats.downvotes + 
                          this.socialStats.likes + (this.socialStats.comments * 2) + 
                          this.socialStats.shares;
  
  // Calculate trending score (engagement in last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentEngagement = [
    ...this.likes.filter(like => like.likedAt > last24Hours),
    ...this.comments.filter(comment => comment.commentedAt > last24Hours),
    ...this.votes.filter(vote => vote.votedAt > last24Hours),
    ...this.shares.filter(share => share.sharedAt > last24Hours)
  ].length;
  
  this.trending.trendingScore = recentEngagement;
  this.trending.engagementRate = this.socialStats.views > 0 ? 
    (this.socialStats.likes + this.socialStats.comments + this.socialStats.shares) / this.socialStats.views * 100 : 0;
  
  // Mark as trending if high engagement
  this.trending.isTrending = this.trending.trendingScore > 5 || this.trending.engagementRate > 10;
  
  if (this.trending.isTrending && !this.trending.trendingStartDate) {
    this.trending.trendingStartDate = new Date();
  }
  
  next();
});

// Auto-assign department based on category
issueSchema.pre('save', function(next) {
  if (!this.assignedTo.department) {
    const categoryToDepartment = {
      'roads': 'roads',
      'roads-transport': 'roads',
      'water': 'water',
      'electricity': 'electricity',
      'sanitation': 'sanitation',
      'healthcare': 'healthcare',
      'education': 'education',
      'infrastructure': 'municipal',
      'environment': 'municipal',
      'public-safety': 'municipal',
      'other': 'municipal'
    };
    this.assignedTo.department = categoryToDepartment[this.category] || 'municipal';
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
