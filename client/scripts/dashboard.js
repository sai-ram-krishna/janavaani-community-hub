// Global variables
let currentUser = null;
let userIssues = [];
let allBrowseIssues = []; // Store all fetched browse issues
let filteredBrowseIssues = []; // Store filtered browse issues

// ===============================
// LOCALITY AND SOCIAL FEATURES
// ===============================

// Global variables for locality and social features
let currentLocalityFilter = {
    state: '',
    district: '',
    mandal: '',
    village: ''
};
let userInteractions = {
    likes: new Set(),
    votes: new Map(), // issueId -> 'upvote'/'downvote'
    comments: new Map() // issueId -> comment count
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    try {
        checkAuthentication();
        loadUserData();
        setupEventListeners();
        console.log('✅ Dashboard initialization complete');
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
    }
});

// Check if user is authenticated
function checkAuthentication() {
    console.log('🔐 Checking authentication...');
    const userData = localStorage.getItem('janavaani_user');
    if (!userData) {
        console.log('❌ No user data found, redirecting to login');
        alert('Please login to access the dashboard.');
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userData);
        console.log('✅ User authenticated:', currentUser.name);
        console.log('🔍 User data full object:', currentUser);
        console.log('🔍 Available user properties:', Object.keys(currentUser));
        console.log('🔍 User ID variations:', {
            id: currentUser.id,
            _id: currentUser._id,
            userId: currentUser.userId
        });
        
        // Redirect government officials to their department dashboard
        if (currentUser.userType === 'government') {
            console.log('🏛️ Government user detected, redirecting...');
            window.location.href = 'government-dashboard.html';
            return;
        }
        
        document.getElementById('userName').textContent = `Welcome, ${currentUser.name}`;
        console.log('✅ User name set in UI');
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('janavaani_user');
        window.location.href = 'login.html';
    }
}

// ===============================
// CORE DASHBOARD FUNCTIONS
// ===============================

// Load user data and statistics
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Load user issues
        await loadUserIssues();
        
        // Update statistics
        updateStatistics();
        
        // Load profile info
        loadProfileInfo();
        
        // Initialize locality data
        await loadLocalityData();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading data. Please refresh the page.', 'error');
    }
}

// Load user's issues
async function loadUserIssues() {
    try {
        showLoading(true);
        
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/user/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            userIssues = data.issues || [];
            displayUserIssues(userIssues);
        } else {
            console.error('Failed to load issues');
            userIssues = [];
        }
    } catch (error) {
        console.error('Error loading issues:', error);
        userIssues = [];
    } finally {
        showLoading(false);
    }
}

// Update statistics
function updateStatistics() {
    const totalIssues = userIssues.length;
    const pendingIssues = userIssues.filter(issue => 
        issue.status === 'pending' || issue.status === 'under-review'
    ).length;
    const resolvedIssues = userIssues.filter(issue => 
        issue.status === 'resolved' || issue.status === 'closed'
    ).length;
    
    document.getElementById('totalIssues').textContent = totalIssues;
    document.getElementById('pendingIssues').textContent = pendingIssues;
    document.getElementById('resolvedIssues').textContent = resolvedIssues;
}

// Load profile information
function loadProfileInfo() {
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.innerHTML = `
            <div class="profile-field">
                <span class="profile-label">Name:</span>
                <span class="profile-value">${currentUser.name}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">Email:</span>
                <span class="profile-value">${currentUser.email}</span>
            </div>
            <div class="profile-field">
                <span class="profile-label">User Type:</span>
                <span class="profile-value">${currentUser.userType}</span>
            </div>
            ${currentUser.department ? `
            <div class="profile-field">
                <span class="profile-label">Department:</span>
                <span class="profile-value">${currentUser.department}</span>
            </div>
            ` : ''}
            <div class="profile-field">
                <span class="profile-label">Member Since:</span>
                <span class="profile-value">${new Date().getFullYear()}</span>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // Issue form submission
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', handleIssueSubmission);
        console.log('✅ Issue form event listener added');
    } else {
        console.log('⚠️ Issue form not found');
    }
    
    // File input for images
    const imagesInput = document.getElementById('images');
    if (imagesInput) {
        imagesInput.addEventListener('change', handleImageSelection);
        console.log('✅ File input event listener added');
    } else {
        console.log('⚠️ Images input not found');
    }
    
    console.log('✅ Event listeners setup complete');
}

// Show/Hide sections
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the clicked menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sectionName)) {
            item.classList.add('active');
        }
    });
    
    // Load data for specific sections
    if (sectionName === 'browse-issues') {
        loadBrowseIssuesWithFilters();
    } else if (sectionName === 'my-issues') {
        loadUserIssues();
    }
}

// Get API base URL
function getApiBaseUrl() {
    // Always use the correct server URL
    if (window.location.protocol === 'file:') {
        return 'http://localhost:5000';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://${window.location.hostname}:5000`;
    } else {
        // For production, use the same origin
        return window.location.origin;
    }
}

// Handle issue form submission
async function handleIssueSubmission(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to submit an issue.', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData(event.target);
        
        // Prepare issue data
        const issueData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            location: {
                state: formData.get('state'),
                district: formData.get('district'),
                mandal: formData.get('mandal'),
                village: formData.get('village'),
                address: formData.get('address'),
                pincode: formData.get('pincode'),
                fullAddress: `${formData.get('address')}, ${formData.get('village')}, ${formData.get('mandal')}, ${formData.get('district')}, ${formData.get('state')}`
            },
            submittedBy: {
                userId: currentUser.id || currentUser._id || currentUser.userId,
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone || 'Not provided'
            }
        };
        
        console.log('🔍 ISSUE SUBMISSION DEBUG:');
        console.log('   Current user:', currentUser);
        console.log('   User ID being sent:', issueData.submittedBy.userId);
        console.log('   Issue data being sent:', issueData);
        console.log('   Form data entries:');
        for (let [key, value] of formData.entries()) {
            console.log(`     ${key}: ${value}`);
        }
        
        // Validate required fields
        if (!issueData.title || !issueData.description || !issueData.category || 
            !issueData.location.state || !issueData.location.district || 
            !issueData.location.mandal || !issueData.location.village ||
            !issueData.location.address || !issueData.location.pincode) {
            showNotification('Please fill in all required fields including location hierarchy.', 'error');
            return;
        }
        
        // Validate pincode
        if (!/^\d{6}$/.test(issueData.location.pincode)) {
            showNotification('Please enter a valid 6-digit pincode.', 'error');
            return;
        }
        
        const apiUrl = getApiBaseUrl();
        
        // First, create the issue
        const response = await fetch(`${apiUrl}/api/issues/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(issueData)
        });
        
        console.log('🔍 Server response status:', response.status);
        console.log('🔍 Server response headers:', response.headers);
        
        const result = await response.json();
        console.log('🔍 Server response data:', result);
        
        if (response.ok) {
            const issueId = result.issue._id;
            
            // Check if there are files to upload
            const fileInput = document.getElementById('images');
            if (fileInput && fileInput.files.length > 0) {
                await uploadIssueFiles(issueId, fileInput.files);
            }
            
            showNotification('Issue submitted successfully!', 'success');
            event.target.reset();
            
            // Refresh issues list
            await loadUserIssues();
            
            // Switch to my issues section
            showSection('my-issues');
        } else {
            console.error('❌ Server error:', result);
            showNotification(result.message || 'Failed to submit issue. Please try again.', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting issue:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Upload files for an issue
async function uploadIssueFiles(issueId, files) {
    try {
        const formData = new FormData();
        
        // Append files to form data
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });
        
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${files.length} file(s) uploaded successfully`);
        } else {
            console.error('File upload failed:', result.message);
            showNotification('Issue created but file upload failed: ' + result.message, 'warning');
        }
        
    } catch (error) {
        console.error('Error uploading files:', error);
        showNotification('Issue created but file upload failed', 'warning');
    }
}

// Handle image selection
function handleImageSelection(event) {
    const files = event.target.files;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    for (let file of files) {
        if (file.size > maxSize) {
            showNotification(`File ${file.name} is too large. Max size is 5MB.`, 'error');
            event.target.value = '';
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showNotification(`File ${file.name} is not a valid image type.`, 'error');
            event.target.value = '';
            return;
        }
    }
}

// Reset the issue form
function resetForm() {
    const form = document.getElementById('issueForm');
    if (form) {
        form.reset();
        
        // Reset location selectors
        const district = document.getElementById('district');
        const mandal = document.getElementById('mandal');
        const village = document.getElementById('village');
        
        if (district) {
            district.innerHTML = '<option value="">Select District</option>';
            district.disabled = true;
        }
        if (mandal) {
            mandal.innerHTML = '<option value="">Select Mandal</option>';
            mandal.disabled = true;
        }
        if (village) {
            village.innerHTML = '<option value="">Select Village</option>';
            village.disabled = true;
        }
        
        showNotification('Form reset successfully', 'success');
    }
}

// Display user issues
function displayUserIssues(issues) {
    const issuesList = document.getElementById('issuesList');
    if (!issuesList) return;
    
    if (!issues || issues.length === 0) {
        issuesList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <h3>No issues reported yet</h3>
                <p>Click "Report Issue" to submit your first issue.</p>
                <button onclick="showSection('report-issue')" class="action-btn primary" style="margin-top: 1rem;">
                    📝 Report Your First Issue
                </button>
            </div>
        `;
        return;
    }
    
    issuesList.innerHTML = issues.map(issue => `
        <div class="issue-card" onclick="showIssueDetails('${issue._id}')">
            <div class="issue-header">
                <div>
                    <h3 class="issue-title">${issue.title}</h3>
                    <span class="issue-status status-${issue.status}">${formatStatus(issue.status)}</span>
                </div>
            </div>
            <p class="issue-description">${issue.description.substring(0, 150)}${issue.description.length > 150 ? '...' : ''}</p>
            <div class="issue-meta">
                <span>📍 ${issue.location.village}, ${issue.location.mandal}</span>
                <span>📂 ${formatCategory(issue.category)}</span>
                <span class="priority-${issue.priority}">⚡ ${formatPriority(issue.priority)}</span>
                <span>📅 ${formatDate(issue.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

// Filter issues
function filterIssues() {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredIssues = userIssues;
    
    if (statusFilter) {
        filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
    }
    
    if (categoryFilter) {
        filteredIssues = filteredIssues.filter(issue => issue.category === categoryFilter);
    }
    
    displayUserIssues(filteredIssues);
}

// Utility functions
function logout() {
    localStorage.removeItem('janavaani_user');
    localStorage.removeItem('janavaani_token');
    window.location.href = 'login.html';
}

function closeModal() {
    document.getElementById('issueModal').style.display = 'none';
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        max-width: 400px;
        word-wrap: break-word;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Format functions
function formatStatus(status) {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatCategory(category) {
    const categoryMap = {
        'roads': 'Roads & Infrastructure',
        'water': 'Water Supply',
        'electricity': 'Electricity',
        'sanitation': 'Sanitation',
        'healthcare': 'Healthcare',
        'education': 'Education',
        'other': 'Other'
    };
    return categoryMap[category] || category.replace('-', ' & ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDepartment(department) {
    const departments = {
        'water': 'Water Department',
        'electricity': 'Electricity Board',
        'roads': 'Roads & Transport',
        'sanitation': 'Sanitation',
        'education': 'Education',
        'healthcare': 'Healthcare',
        'police': 'Police',
        'municipal': 'Municipal Corporation'
    };
    return departments[department] || department;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===============================
// END CORE DASHBOARD FUNCTIONS
// ===============================

// ===============================
// BROWSE ISSUES FUNCTIONALITY
// ===============================

// Load all public issues for browsing
async function loadBrowseIssues() {
    await loadBrowseIssuesWithFilters();
}

// Display browse issues in the list with social features
function displayBrowseIssues(issues) {
    const browseIssuesList = document.getElementById('browseIssuesList');
    
    if (!issues || issues.length === 0) {
        browseIssuesList.innerHTML = `
            <div class="no-results">
                <h3>No issues found</h3>
                <p>Try adjusting your filters or search criteria.</p>
                <button onclick="clearAllFilters()" class="action-btn secondary">Clear All Filters</button>
            </div>
        `;
        return;
    }
    
    browseIssuesList.innerHTML = issues.map(issue => {
        const isLiked = userInteractions.likes.has(issue._id);
        const userVote = userInteractions.votes.get(issue._id);
        const isTrending = issue.trending?.isTrending;
        
        return `
        <div class="browse-issue-card" data-issue-id="${issue._id}" onclick="showIssueDetails('${issue._id}')">
            <div class="issue-header">
                <div class="issue-title-status">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <h3 class="issue-title">${issue.title}</h3>
                        ${isTrending ? '<span class="trending-badge">🔥 Trending</span>' : ''}
                    </div>
                    <span class="issue-status status-${issue.status}">${formatStatus(issue.status)}</span>
                </div>
                <div class="issue-priority">
                    <span class="priority-badge priority-${issue.priority}">${formatPriority(issue.priority)}</span>
                </div>
            </div>
            
            <p class="issue-description">${issue.description.substring(0, 200)}${issue.description.length > 200 ? '...' : ''}</p>
            
            ${issue.attachments && issue.attachments.length > 0 ? `
                <div class="issue-attachments">
                    <div class="attachments-preview">
                        ${issue.attachments.slice(0, 3).map(attachment => `
                            ${attachment.mimetype && attachment.mimetype.startsWith('image/') ? `
                                <img src="/uploads/issues/${attachment.filename}" alt="Issue photo" 
                                     onclick="event.stopPropagation(); openImageModal('/uploads/issues/${attachment.filename}')"
                                     class="attachment-preview">
                            ` : `
                                <div class="attachment-file-preview" onclick="event.stopPropagation();">
                                    <span class="file-icon">📄</span>
                                    <a href="/uploads/issues/${attachment.filename}" target="_blank">
                                        ${attachment.originalName || attachment.filename}
                                    </a>
                                </div>
                            `}
                        `).join('')}
                        ${issue.attachments.length > 3 ? `
                            <div class="more-attachments">+${issue.attachments.length - 3} more</div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
            
            <div class="issue-meta">
                <div class="meta-row">
                    <span class="meta-item">
                        <strong>📍 Location:</strong> ${issue.location.village}, ${issue.location.mandal}, ${issue.location.district}
                    </span>
                    <span class="meta-item">
                        <strong>📂 Category:</strong> ${formatCategory(issue.category)}
                    </span>
                </div>
                <div class="meta-row">
                    <span class="meta-item">
                        <strong>👤 Reported by:</strong> ${issue.reporterName || issue.submittedBy?.name || 'Anonymous'}
                    </span>
                    <span class="meta-item">
                        <strong>📅 Date:</strong> ${formatDate(issue.createdAt)}
                    </span>
                </div>
                ${issue.assignedTo?.department ? `
                <div class="meta-row">
                    <span class="meta-item">
                        <strong>🏢 Assigned to:</strong> ${formatDepartment(issue.assignedTo.department)}
                    </span>
                </div>
                ` : ''}
            </div>
            
            <div class="issue-social-bar" onclick="event.stopPropagation()">
                <div class="social-actions">
                    <button class="social-btn ${isLiked ? 'liked' : ''}" onclick="likeIssue('${issue._id}', this)">
                        <span>❤️</span>
                        <span class="like-count">${issue.socialStats?.likes || 0}</span>
                    </button>
                    
                    <button class="social-btn upvote-btn ${userVote === 'upvote' ? 'upvoted' : ''}" onclick="voteOnIssue('${issue._id}', 'upvote', this)">
                        <span>👍</span>
                        <span class="vote-count">${issue.socialStats?.upvotes || 0}</span>
                    </button>
                    
                    <button class="social-btn downvote-btn ${userVote === 'downvote' ? 'downvoted' : ''}" onclick="voteOnIssue('${issue._id}', 'downvote', this)">
                        <span>👎</span>
                        <span class="vote-count">${issue.socialStats?.downvotes || 0}</span>
                    </button>
                    
                    <button class="social-btn" onclick="showComments('${issue._id}')">
                        <span>💬</span>
                        <span class="comment-count">${issue.socialStats?.comments || 0}</span>
                    </button>
                    
                    <button class="social-btn share-btn" onclick="shareIssue('${issue._id}')">
                        <span>📤</span>
                        <span class="share-count">${issue.socialStats?.shares || 0}</span>
                    </button>
                </div>
                
                <div class="social-stats">
                    <span>👁️ ${issue.socialStats?.views || 0} views</span>
                    <span>⚡ ${issue.socialStats?.score || 0} score</span>
                    ${issue.trending?.engagementRate ? `<span>📈 ${Math.round(issue.trending.engagementRate)}% engagement</span>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
}

// Filter browse issues based on current filter selections
function filterBrowseIssues() {
    const statusFilter = document.getElementById('browseStatusFilter').value;
    const categoryFilter = document.getElementById('browseCategoryFilter').value;
    const priorityFilter = document.getElementById('browsePriorityFilter').value;
    const locationFilter = document.getElementById('browseLocationFilter').value;
    const searchInput = document.getElementById('browseSearchInput').value.toLowerCase();
    
    filteredBrowseIssues = allBrowseIssues.filter(issue => {
        // Status filter
        if (statusFilter && issue.status !== statusFilter) {
            return false;
        }
        
        // Category filter
        if (categoryFilter && issue.category !== categoryFilter) {
            return false;
        }
        
        // Priority filter
        if (priorityFilter && issue.priority !== priorityFilter) {
            return false;
        }
        
        // Location filter
        if (locationFilter) {
            const issueLocation = `${issue.location.village}, ${issue.location.mandal}, ${issue.location.district}`;
            if (!issueLocation.toLowerCase().includes(locationFilter.toLowerCase())) {
                return false;
            }
        }
        
        // Search filter (searches in title, description, and location)
        if (searchInput) {
            const searchableText = `
                ${issue.title} 
                ${issue.description} 
                ${issue.location.village} 
                ${issue.location.mandal} 
                ${issue.location.district}
                ${issue.reporterName || issue.submittedBy?.name || ''}
            `.toLowerCase();
            
            if (!searchableText.includes(searchInput)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Apply current sort
    sortBrowseIssues();
    displayBrowseIssues(filteredBrowseIssues);
    updateBrowseStats(filteredBrowseIssues);
}

// Sort browse issues
function sortBrowseIssues() {
    const sortBy = document.getElementById('browseSortFilter').value;
    
    filteredBrowseIssues.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'priority':
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'status':
                const statusOrder = { 'pending': 1, 'in-progress': 2, 'resolved': 3, 'rejected': 4 };
                return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
    
    displayBrowseIssues(filteredBrowseIssues);
}

// Update browse statistics with social features
function updateBrowseStats(issues) {
    const total = issues.length;
    const pending = issues.filter(issue => issue.status === 'pending').length;
    const inProgress = issues.filter(issue => issue.status === 'in-progress').length;
    const resolved = issues.filter(issue => issue.status === 'resolved').length;
    
    // Calculate social stats
    const totalLikes = issues.reduce((sum, issue) => sum + (issue.socialStats?.likes || 0), 0);
    const totalComments = issues.reduce((sum, issue) => sum + (issue.socialStats?.comments || 0), 0);
    
    document.getElementById('browseTotal').textContent = total;
    document.getElementById('browsePending').textContent = pending;
    document.getElementById('browseInProgress').textContent = inProgress;
    document.getElementById('browseResolved').textContent = resolved;
    document.getElementById('browseTotalLikes').textContent = totalLikes;
    document.getElementById('browseTotalComments').textContent = totalComments;
}

// Populate location filter dropdown
function populateBrowseLocationFilter() {
    const locationFilter = document.getElementById('browseLocationFilter');
    const locations = new Set();
    
    allBrowseIssues.forEach(issue => {
        if (issue.location) {
            locations.add(`${issue.location.village}, ${issue.location.mandal}`);
            locations.add(`${issue.location.mandal}, ${issue.location.district}`);
            locations.add(issue.location.district);
        }
    });
    
    const sortedLocations = Array.from(locations).sort();
    
    locationFilter.innerHTML = '<option value="">All Locations</option>' + 
        sortedLocations.map(location => 
            `<option value="${location}">${location}</option>`
        ).join('');
}

// Clear all browse filters
function clearBrowseFilters() {
    document.getElementById('browseStatusFilter').value = '';
    document.getElementById('browseCategoryFilter').value = '';
    document.getElementById('browsePriorityFilter').value = '';
    document.getElementById('browseLocationFilter').value = '';
    document.getElementById('browseSearchInput').value = '';
    document.getElementById('browseSortFilter').value = 'newest';
    
    filteredBrowseIssues = [...allBrowseIssues];
    sortBrowseIssues();
    updateBrowseStats(filteredBrowseIssues);
    showNotification('Filters cleared!', 'info');
}

// Load locations data for locality filters
async function loadLocalityData() {
    try {
        const response = await fetch('data/locations.json');
        const locationData = await response.json();
        return locationData;
    } catch (error) {
        console.error('Error loading location data:', error);
        return null;
    }
}

// Update locality filter dropdowns
async function updateLocalityFilters() {
    const state = document.getElementById('localityState').value;
    const district = document.getElementById('localityDistrict').value;
    const mandal = document.getElementById('localityMandal').value;
    
    const locationData = await loadLocalityData();
    if (!locationData) return;
    
    // Update district dropdown
    const districtSelect = document.getElementById('localityDistrict');
    districtSelect.innerHTML = '<option value="">Select District</option>';
    
    if (state && locationData[state]) {
        Object.keys(locationData[state]).forEach(district => {
            districtSelect.innerHTML += `<option value="${district}">${district}</option>`;
        });
    }
    
    // Update mandal dropdown
    const mandalSelect = document.getElementById('localityMandal');
    mandalSelect.innerHTML = '<option value="">Select Mandal</option>';
    
    if (state && district && locationData[state] && locationData[state][district]) {
        Object.keys(locationData[state][district]).forEach(mandal => {
            mandalSelect.innerHTML += `<option value="${mandal}">${mandal}</option>`;
        });
    }
    
    // Update village dropdown
    const villageSelect = document.getElementById('localityVillage');
    villageSelect.innerHTML = '<option value="">Select Village</option>';
    
    if (state && district && mandal && locationData[state] && locationData[state][district] && locationData[state][district][mandal]) {
        locationData[state][district][mandal].forEach(village => {
            villageSelect.innerHTML += `<option value="${village}">${village}</option>`;
        });
    }
}

// Apply locality filter
function applyLocalityFilter() {
    currentLocalityFilter = {
        state: document.getElementById('localityState').value,
        district: document.getElementById('localityDistrict').value,
        mandal: document.getElementById('localityMandal').value,
        village: document.getElementById('localityVillage').value
    };
    
    loadBrowseIssuesWithFilters();
    showNotification('Locality filter applied! Showing issues from your area.', 'success');
}

// Clear locality filter
function clearLocalityFilter() {
    currentLocalityFilter = { state: '', district: '', mandal: '', village: '' };
    document.getElementById('localityState').value = '';
    document.getElementById('localityDistrict').value = '';
    document.getElementById('localityMandal').value = '';
    document.getElementById('localityVillage').value = '';
    
    loadBrowseIssuesWithFilters();
    showNotification('Showing all issues from everywhere!', 'info');
}

// Quick filter functions
function showTrendingIssues() {
    clearQuickFilterButtons();
    document.querySelector('.quick-filter-btn.trending').classList.add('active');
    loadTrendingIssues();
}

function showPopularIssues() {
    clearQuickFilterButtons();
    document.querySelector('.quick-filter-btn.popular').classList.add('active');
    document.getElementById('browseSortFilter').value = 'popular';
    loadBrowseIssuesWithFilters();
}

function showRecentIssues() {
    clearQuickFilterButtons();
    document.querySelector('.quick-filter-btn.recent').classList.add('active');
    document.getElementById('browseSortFilter').value = 'newest';
    loadBrowseIssuesWithFilters();
}

function showUrgentIssues() {
    clearQuickFilterButtons();
    document.querySelector('.quick-filter-btn.urgent').classList.add('active');
    document.getElementById('browsePriorityFilter').value = 'urgent';
    filterBrowseIssues();
}

function clearQuickFilterButtons() {
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

// Load trending issues
async function loadTrendingIssues() {
    try {
        showLoading(true);
        
        const apiUrl = getApiBaseUrl();
        let url = `${apiUrl}/api/issues/trending?limit=20`;
        
        // Add locality filters if applied
        if (currentLocalityFilter.state) url += `&state=${encodeURIComponent(currentLocalityFilter.state)}`;
        if (currentLocalityFilter.district) url += `&district=${encodeURIComponent(currentLocalityFilter.district)}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            allBrowseIssues = data.issues || [];
            filteredBrowseIssues = [...allBrowseIssues];
            displayBrowseIssues(filteredBrowseIssues);
            updateBrowseStats(filteredBrowseIssues);
            showNotification(`Found ${filteredBrowseIssues.length} trending issues!`, 'success');
        } else {
            showNotification('Failed to load trending issues.', 'error');
        }
    } catch (error) {
        console.error('Error loading trending issues:', error);
        showNotification('Network error loading trending issues.', 'error');
    } finally {
        showLoading(false);
    }
}

// Enhanced load browse issues with all filters
async function loadBrowseIssuesWithFilters() {
    try {
        showLoading(true);
        
        const apiUrl = getApiBaseUrl();
        let url = `${apiUrl}/api/issues/?limit=500`;
        
        // Add locality filters
        if (currentLocalityFilter.state) url += `&state=${encodeURIComponent(currentLocalityFilter.state)}`;
        if (currentLocalityFilter.district) url += `&district=${encodeURIComponent(currentLocalityFilter.district)}`;
        if (currentLocalityFilter.mandal) url += `&mandal=${encodeURIComponent(currentLocalityFilter.mandal)}`;
        if (currentLocalityFilter.village) url += `&village=${encodeURIComponent(currentLocalityFilter.village)}`;
        
        // Add sort parameter
        const sortBy = document.getElementById('browseSortFilter').value;
        if (sortBy) url += `&sortBy=${sortBy}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            allBrowseIssues = data.issues || [];
            filteredBrowseIssues = [...allBrowseIssues];
            
            // Populate user interactions
            if (currentUser) {
                populateUserInteractions(allBrowseIssues);
            }
            
            displayBrowseIssues(filteredBrowseIssues);
            updateBrowseStats(filteredBrowseIssues);
            showNotification('Issues loaded successfully!', 'success');
        } else {
            console.error('Failed to load browse issues');
            allBrowseIssues = [];
            filteredBrowseIssues = [];
            showNotification('Failed to load issues. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error loading browse issues:', error);
        allBrowseIssues = [];
        filteredBrowseIssues = [];
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        showLoading(false);
    }
}

// Clear all filters
function clearAllFilters() {
    // Clear regular filters
    document.getElementById('browseStatusFilter').value = '';
    document.getElementById('browseCategoryFilter').value = '';
    document.getElementById('browsePriorityFilter').value = '';
    document.getElementById('browseSearchInput').value = '';
    document.getElementById('browseSortFilter').value = 'newest';
    
    // Clear quick filters
    clearQuickFilterButtons();
    
    // Clear locality filters
    clearLocalityFilter();
    
    showNotification('All filters cleared!', 'info');
}

// Populate user interactions from issue data
function populateUserInteractions(issues) {
    if (!currentUser) return;
    
    userInteractions.likes.clear();
    userInteractions.votes.clear();
    userInteractions.comments.clear();
    
    issues.forEach(issue => {
        // Check if user liked this issue
        if (issue.likes && issue.likes.some(like => like.userId === currentUser.id)) {
            userInteractions.likes.add(issue._id);
        }
        
        // Check if user voted on this issue
        if (issue.votes) {
            const userVote = issue.votes.find(vote => vote.userId === currentUser.id);
            if (userVote) {
                userInteractions.votes.set(issue._id, userVote.voteType);
            }
        }
        
        // Check if user commented on this issue
        if (issue.comments) {
            const userComments = issue.comments.filter(comment => comment.userId === currentUser.id);
            if (userComments.length > 0) {
                userInteractions.comments.set(issue._id, userComments.length);
            }
        }
    });
    
    console.log('✅ User interactions populated:', {
        likes: userInteractions.likes.size,
        votes: userInteractions.votes.size,
        comments: userInteractions.comments.size
    });
}

// Social interaction functions
async function likeIssue(issueId, button) {
    if (!currentUser) {
        showNotification('Please login to like issues.', 'error');
        return;
    }
    
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update button state
            if (data.liked) {
                button.classList.add('liked');
                userInteractions.likes.add(issueId);
            } else {
                button.classList.remove('liked');
                userInteractions.likes.delete(issueId);
            }
            
            // Update like count
            const likeCount = button.querySelector('.like-count');
            if (likeCount) {
                likeCount.textContent = data.likeCount;
            }
            
            showNotification(data.liked ? 'Issue liked!' : 'Issue unliked!', 'success');
        } else {
            showNotification('Failed to like issue.', 'error');
        }
    } catch (error) {
        console.error('Error liking issue:', error);
        showNotification('Network error.', 'error');
    }
}

async function voteOnIssue(issueId, voteType, button) {
    if (!currentUser) {
        showNotification('Please login to vote on issues.', 'error');
        return;
    }
    
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                voteType: voteType
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Update button states
            const upvoteBtn = button.parentElement.querySelector('.upvote-btn');
            const downvoteBtn = button.parentElement.querySelector('.downvote-btn');
            
            upvoteBtn.classList.remove('upvoted');
            downvoteBtn.classList.remove('downvoted');
            
            if (voteType === 'upvote') {
                upvoteBtn.classList.add('upvoted');
                userInteractions.votes.set(issueId, 'upvote');
            } else {
                downvoteBtn.classList.add('downvoted');
                userInteractions.votes.set(issueId, 'downvote');
            }
            
            // Update vote counts
            const upvoteCount = upvoteBtn.querySelector('.vote-count');
            const downvoteCount = downvoteBtn.querySelector('.vote-count');
            
            if (upvoteCount) upvoteCount.textContent = data.upvotes;
            if (downvoteCount) downvoteCount.textContent = data.downvotes;
            
            showNotification(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully!`, 'success');
        } else {
            showNotification('Failed to vote.', 'error');
        }
    } catch (error) {
        console.error('Error voting:', error);
        showNotification('Network error.', 'error');
    }
}

// Show comments for an issue
async function showComments(issueId) {
    if (!currentUser) {
        showNotification('Please login to view comments.', 'error');
        return;
    }
    
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/comments`);
        
        if (response.ok) {
            const data = await response.json();
            displayCommentsModal(issueId, data.comments || []);
        } else {
            showNotification('Failed to load comments.', 'error');
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        showNotification('Error loading comments.', 'error');
    }
}

// Display comments in a modal
function displayCommentsModal(issueId, comments) {
    const modal = document.createElement('div');
    modal.className = 'comments-modal';
    modal.innerHTML = `
        <div class="comments-modal-content">
            <div class="comments-header">
                <h3>💬 Comments</h3>
                <span class="close-comments" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
            </div>
            
            <div class="comments-list">
                ${comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-header">
                            <strong>${comment.userName || 'Anonymous'}</strong>
                            <span class="comment-time">${new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="add-comment">
                <textarea id="newComment" placeholder="Add a comment..." rows="3"></textarea>
                <button onclick="addComment('${issueId}')" class="add-comment-btn">Post Comment</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const content = modal.querySelector('.comments-modal-content');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        width: 90%;
    `;
    
    document.body.appendChild(modal);
}

// Add a comment to an issue
async function addComment(issueId) {
    const commentText = document.getElementById('newComment').value.trim();
    if (!commentText) {
        showNotification('Please enter a comment.', 'error');
        return;
    }
    
    try {
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                comment: commentText
            })
        });
        
        if (response.ok) {
            showNotification('Comment added successfully!', 'success');
            document.getElementById('newComment').value = '';
            // Refresh comments
            showComments(issueId);
        } else {
            showNotification('Failed to add comment.', 'error');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Error adding comment.', 'error');
    }
}

async function shareIssue(issueId, platform = 'internal') {
    if (!currentUser) {
        showNotification('Please login to share issues.', 'error');
        return;
    }
    
    try {
        // Show share options modal
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="share-modal-content">
                <h3>Share Issue</h3>
                <div class="share-options">
                    <button class="share-option" onclick="shareToSocial('${issueId}', 'facebook')">
                        📘 Share on Facebook
                    </button>
                    <button class="share-option" onclick="shareToSocial('${issueId}', 'twitter')">
                        🐦 Share on Twitter
                    </button>
                    <button class="share-option" onclick="shareToSocial('${issueId}', 'whatsapp')">
                        💬 Share on WhatsApp
                    </button>
                    <button class="share-option" onclick="copyIssueLink('${issueId}')">
                        🔗 Copy Link
                    </button>
                </div>
                <button class="close-modal" onclick="closeShareModal()">Close</button>
            </div>
        `;
        document.body.appendChild(shareModal);
        
        // Update share count in backend
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/issues/${issueId}/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                platform: platform
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Update share count in UI
            const shareBtn = document.querySelector(`[data-issue-id="${issueId}"] .share-btn .share-count`);
            if (shareBtn) {
                shareBtn.textContent = data.shareCount;
            } else {
                // Try alternative selector
                const altShareBtn = document.querySelector(`button[onclick="shareIssue('${issueId}')"] .share-count`);
                if (altShareBtn) {
                    altShareBtn.textContent = data.shareCount;
                }
            }
        } else {
            console.error('Failed to update share count');
        }
    } catch (error) {
        console.error('Error sharing issue:', error);
        showNotification('Network error.', 'error');
    }
}

// Share to social media platforms
async function shareToSocial(issueId, platform) {
    const issue = allBrowseIssues.find(i => i._id === issueId);
    if (!issue) return;
    
    const shareText = `Check out this civic issue: ${issue.title}`;
    const shareUrl = `${window.location.origin}/dashboard.html?issue=${issueId}`;
    
    switch (platform) {
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            break;
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
            break;
    }
    
    closeShareModal();
    showNotification('Issue shared successfully!', 'success');
}

// Copy issue link to clipboard
async function copyIssueLink(issueId) {
    const shareUrl = `${window.location.origin}/dashboard.html?issue=${issueId}`;
    
    try {
        await navigator.clipboard.writeText(shareUrl);
        showNotification('Link copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Link copied to clipboard!', 'success');
    }
    
    closeShareModal();
}

// Close share modal
function closeShareModal() {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        modal.remove();
    }
}

// Image modal functionality for citizen dashboard
function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="close-modal" onclick="closeImageModal()">&times;</span>
            <img src="${imageSrc}" alt="Issue attachment" class="modal-image">
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
    }
}

// Add CSS for animations, share modal, and attachments
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .share-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .share-modal-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    }
    
    .share-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 20px 0;
    }
    
    .share-option {
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background: #f8f9fa;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .share-option:hover {
        background: #e9ecef;
    }
    
    .close-modal {
        padding: 10px 20px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .close-modal:hover {
        background: #5a6268;
    }
    
    .issue-attachments {
        margin: 10px 0;
    }
    
    .attachments-preview {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
    }
    
    .attachment-preview {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 5px;
        cursor: pointer;
        transition: transform 0.2s;
        border: 2px solid #e9ecef;
    }
    
    .attachment-preview:hover {
        transform: scale(1.1);
        border-color: #007bff;
    }
    
    .attachment-file-preview {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 8px;
        background: #f8f9fa;
        border-radius: 5px;
        border: 1px solid #dee2e6;
        font-size: 12px;
    }
    
    .attachment-file-preview a {
        color: #007bff;
        text-decoration: none;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .more-attachments {
        font-size: 12px;
        color: #6c757d;
        padding: 5px 8px;
        background: #f8f9fa;
        border-radius: 5px;
    }
    
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .image-modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .modal-image {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
    }
    
    .close-modal {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 30px;
        cursor: pointer;
        z-index: 1001;
    }
    
    .close-modal:hover {
        color: #ccc;
    }
`;
document.head.appendChild(style);

// Load initial data
loadBrowseIssues();
