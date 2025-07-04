// Government Dashboard JavaScript
let allIssues = [];
let filteredIssues = [];
let currentIssueId = null;
let currentUser = null;

// Check authentication and load user info
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a government official
    const userData = localStorage.getItem('janavaani_user');
    if (!userData) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    try {
        currentUser = JSON.parse(userData);
    } catch (error) {
        console.error('Error parsing user data:', error);
        alert('Invalid user data. Please login again.');
        localStorage.removeItem('janavaani_user');
        window.location.href = 'login.html';
        return;
    }
    
    // Check if user is a government official
    if (currentUser.userType !== 'government') {
        alert('Access denied. This dashboard is for government officials only.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Display user info
    document.getElementById('officialName').textContent = currentUser.name || 'Unknown';
    document.getElementById('officialDept').textContent = currentUser.department || 'General';

    // Load issues
    loadIssues();

    // Add event listeners
    document.getElementById('statusUpdateForm').addEventListener('submit', handleStatusUpdate);
    document.getElementById('budgetSanctionForm').addEventListener('submit', handleBudgetSanction);
    document.getElementById('workProgressForm').addEventListener('submit', handleWorkProgress);
    document.getElementById('contractorForm').addEventListener('submit', handleContractorAssignment);
    
    // Add filter event listeners
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
});

// Load all issues from the server (filtered by department)
async function loadIssues() {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.textContent = 'Loading issues for your department...';
    loadingMessage.style.display = 'block';

    try {
        // Determine the API URL
        let apiUrl = '/api/issues';
        if (window.location.protocol === 'file:') {
            apiUrl = 'http://localhost:5000/api/issues';
        }

        // Add department filter if user has a specific department
        if (currentUser.department && currentUser.department.toLowerCase() !== 'general') {
            apiUrl += `?department=${encodeURIComponent(currentUser.department)}`;
        }

        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Loaded issues:', data);
        
        // Handle different API response structures
        if (data.issues) {
            allIssues = data.issues;
        } else if (Array.isArray(data)) {
            allIssues = data;
        } else {
            allIssues = [];
        }
        
        // Filter issues by department if official has a specific department
        if (currentUser.department && currentUser.department.toLowerCase() !== 'general') {
            filteredIssues = allIssues.filter(issue => {
                // Check if issue is assigned to this department
                if (issue.assignedTo && issue.assignedTo.department) {
                    return issue.assignedTo.department.toLowerCase() === currentUser.department.toLowerCase();
                }
                // Also check category-based assignment
                const categoryToDepartment = {
                    'water': 'water',
                    'water-supply': 'water',
                    'electricity': 'electricity',
                    'roads': 'roads',
                    'roads-transport': 'roads',
                    'sanitation': 'sanitation',
                    'sanitation-waste': 'sanitation',
                    'healthcare': 'healthcare',
                    'education': 'education',
                    'infrastructure': 'municipal',
                    'environment': 'municipal',
                    'public-safety': 'police',
                    'other': 'municipal'
                };
                const expectedDept = categoryToDepartment[issue.category];
                return expectedDept === currentUser.department.toLowerCase();
            });
        } else {
            // If general department or no specific department, show all issues
            filteredIssues = [...allIssues];
        }
        
        console.log(`Filtered ${filteredIssues.length} issues for department: ${currentUser.department}`);
        
        updateStatistics();
        displayIssues();
        
        loadingMessage.style.display = 'none';
        
    } catch (error) {
        console.error('Error loading issues:', error);
        loadingMessage.textContent = `Error loading issues: ${error.message}. Make sure the server is running.`;
        loadingMessage.style.color = '#dc3545';
    }
}

// Update statistics cards
function updateStatistics() {
    const total = filteredIssues.length;
    const pending = filteredIssues.filter(issue => issue.status === 'pending').length;
    const inProgress = filteredIssues.filter(issue => issue.status === 'in-progress').length;
    const resolved = filteredIssues.filter(issue => issue.status === 'resolved').length;

    document.getElementById('totalIssues').textContent = total;
    document.getElementById('pendingIssues').textContent = pending;
    document.getElementById('inProgressIssues').textContent = inProgress;
    document.getElementById('resolvedIssues').textContent = resolved;
}

// Display issues in the UI
function displayIssues() {
    const container = document.getElementById('issuesContainer');
    
    if (filteredIssues.length === 0) {
        container.innerHTML = '<div class="no-issues">No issues found for your department. Issues will appear here once they are assigned to your department.</div>';
        return;
    }

    const issuesHTML = filteredIssues.map(issue => `
        <div class="issue-card priority-${issue.priority || 'medium'}">
            <div class="issue-header">
                <div>
                    <h3 class="issue-title">${issue.title || 'Untitled Issue'}</h3>
                    <div class="issue-meta">
                        <span><strong>Reporter:</strong> ${issue.submittedBy?.name || 'Anonymous'}</span>
                        <span><strong>Category:</strong> ${formatCategory(issue.category)}</span>
                        <span><strong>Priority:</strong> ${formatPriority(issue.priority)}</span>
                        <span><strong>Date:</strong> ${formatDate(issue.createdAt)}</span>
                    </div>
                </div>
                <span class="status-badge status-${issue.status || 'pending'}">
                    ${formatStatus(issue.status || 'pending')}
                </span>
            </div>
            
            <div class="issue-description">
                ${issue.description || 'No description provided.'}
            </div>
            
            ${issue.attachments && issue.attachments.length > 0 ? `
                <div class="issue-attachments">
                    <strong>📎 Attachments:</strong>
                    <div class="attachments-grid">
                        ${issue.attachments.map(attachment => `
                            <div class="attachment-item">
                                ${attachment.mimetype && attachment.mimetype.startsWith('image/') ? `
                                    <img src="/uploads/issues/${attachment.filename}" alt="Issue photo" 
                                         onclick="openImageModal('/uploads/issues/${attachment.filename}')"
                                         class="attachment-image">
                                ` : `
                                    <div class="attachment-file">
                                        <span class="file-icon">📄</span>
                                        <a href="/uploads/issues/${attachment.filename}" target="_blank">
                                            ${attachment.originalName || attachment.filename}
                                        </a>
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="issue-location">
                <strong>📍 Location:</strong> 
                ${formatLocation(issue.location)}
            </div>
            
            ${issue.statusHistory && issue.statusHistory.length > 0 ? `
                <div class="issue-location">
                    <strong>📝 Latest Update:</strong> 
                    ${issue.statusHistory[issue.statusHistory.length - 1].comment || 'Status updated'}
                    <em>(${formatDate(issue.statusHistory[issue.statusHistory.length - 1].date)})</em>
                </div>
            ` : ''}
            
            ${issue.resolutionDetails?.budgetSanctioned ? `
                <div class="issue-location">
                    <strong>💰 Budget:</strong> 
                    ₹${issue.resolutionDetails.budgetSanctioned.amount?.toLocaleString() || 'Not specified'}
                    (Bill: ${issue.resolutionDetails.budgetSanctioned.billNumber || 'N/A'})
                </div>
            ` : ''}
            
            ${issue.resolutionDetails?.contractor ? `
                <div class="issue-location">
                    <strong>👷 Contractor:</strong> 
                    ${issue.resolutionDetails.contractor.name || 'Not assigned'}
                    ${issue.resolutionDetails.contractor.contactNumber ? `(${issue.resolutionDetails.contractor.contactNumber})` : ''}
                </div>
            ` : ''}
            
            <div class="issue-actions">
                <button class="btn btn-small" onclick="openDetailsModal('${issue._id}')">
                    📋 View Details
                </button>
                <button class="btn btn-warning btn-small" onclick="openStatusModal('${issue._id}')">
                    📝 Update Status
                </button>
                ${issue.status !== 'resolved' && issue.status !== 'rejected' ? `
                    <button class="btn btn-success btn-small" onclick="openBudgetModal('${issue._id}')">
                        💰 Sanction Budget
                    </button>
                    <button class="btn btn-small" onclick="openProgressModal('${issue._id}')">
                        🔧 Work Progress
                    </button>
                    <button class="btn btn-small" onclick="openContractorModal('${issue._id}')">
                        👷 Assign Contractor
                    </button>
                    <button class="btn btn-success btn-small" onclick="quickResolve('${issue._id}')">
                        ✅ Quick Resolve
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = issuesHTML;
}

// Apply filters to the issues list
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    const currentFiltered = currentUser.department && currentUser.department.toLowerCase() !== 'general' 
        ? allIssues.filter(issue => {
            // Filter by department first
            if (issue.assignedTo && issue.assignedTo.department) {
                return issue.assignedTo.department.toLowerCase() === currentUser.department.toLowerCase();
            }
            // Category-based assignment
            const categoryToDepartment = {
                'water': 'water',
                'water-supply': 'water',
                'electricity': 'electricity',
                'roads': 'roads',
                'roads-transport': 'roads',
                'sanitation': 'sanitation',
                'sanitation-waste': 'sanitation',
                'healthcare': 'healthcare',
                'education': 'education',
                'infrastructure': 'municipal',
                'environment': 'municipal',
                'public-safety': 'police',
                'other': 'municipal'
            };
            const expectedDept = categoryToDepartment[issue.category];
            return expectedDept === currentUser.department.toLowerCase();
        })
        : [...allIssues];

    filteredIssues = currentFiltered.filter(issue => {
        const statusMatch = !statusFilter || issue.status === statusFilter;
        const priorityMatch = !priorityFilter || issue.priority === priorityFilter;
        const categoryMatch = !categoryFilter || issue.category === categoryFilter;
        const searchMatch = !searchInput || 
            (issue.title && issue.title.toLowerCase().includes(searchInput)) ||
            (issue.description && issue.description.toLowerCase().includes(searchInput)) ||
            (issue.submittedBy?.name && issue.submittedBy.name.toLowerCase().includes(searchInput));

        return statusMatch && priorityMatch && categoryMatch && searchMatch;
    });

    displayIssues();
}

// Clear all filters
function clearFilters() {
    document.getElementById('statusFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('searchInput').value = '';
    applyFilters(); // This will properly refilter based on department
}

// Helper functions for formatting
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'resolved': 'Resolved',
        'rejected': 'Rejected',
        'under-review': 'Under Review'
    };
    return statusMap[status] || status;
}

function formatCategory(category) {
    const categoryMap = {
        'water': 'Water Supply',
        'water-supply': 'Water Supply',
        'electricity': 'Electricity',
        'roads': 'Roads & Transport',
        'roads-transport': 'Roads & Transport',
        'sanitation': 'Sanitation',
        'sanitation-waste': 'Sanitation & Waste',
        'healthcare': 'Healthcare',
        'education': 'Education',
        'infrastructure': 'Infrastructure',
        'environment': 'Environment',
        'public-safety': 'Public Safety',
        'other': 'Other'
    };
    return categoryMap[category] || category;
}

function formatPriority(priority) {
    const priorityMap = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'urgent': 'Urgent'
    };
    return priorityMap[priority] || priority;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return 'Invalid Date';
    }
}

function formatLocation(location) {
    if (!location) return 'Location not specified';
    
    const parts = [];
    if (location.village) parts.push(location.village);
    if (location.mandal) parts.push(location.mandal);
    if (location.district) parts.push(location.district);
    if (location.state) parts.push(location.state);
    
    if (parts.length === 0 && location.address) {
        return location.address;
    }
    
    return parts.join(', ') || 'Location not specified';
}

// Open status update modal
function openStatusModal(issueId) {
    currentIssueId = issueId;
    const issue = allIssues.find(i => i._id === issueId);
    
    if (issue) {
        document.getElementById('newStatus').value = issue.status || 'pending';
        document.getElementById('statusComment').value = '';
        document.getElementById('statusModal').style.display = 'block';
    }
}

// Close status update modal
function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
    currentIssueId = null;
}

// Handle status update form submission
async function handleStatusUpdate(e) {
    e.preventDefault();
    
    if (!currentIssueId) return;

    const newStatus = document.getElementById('newStatus').value;
    const comment = document.getElementById('statusComment').value;

    try {
        let apiUrl = `/api/issues/${currentIssueId}/status`;
        if (window.location.protocol === 'file:') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueId}/status`;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                comment: comment,
                updatedBy: currentUser.name,
                department: currentUser.department
            })
        });

        if (response.ok) {
            alert('Status updated successfully!');
            closeStatusModal();
            loadIssues(); // Reload issues
        } else {
            const errorData = await response.json();
            alert(`Error updating status: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Open budget sanction modal
function openBudgetModal(issueId) {
    currentIssueId = issueId;
    document.getElementById('budgetModal').style.display = 'block';
}

// Close budget sanction modal
function closeBudgetModal() {
    document.getElementById('budgetModal').style.display = 'none';
    currentIssueId = null;
}

// Handle budget sanction form submission
async function handleBudgetSanction(e) {
    e.preventDefault();
    
    if (!currentIssueId) return;

    const budgetAmount = document.getElementById('budgetAmount').value;
    const billNumber = document.getElementById('billNumber').value;
    const financialYear = document.getElementById('financialYear').value;
    const sanctionedBy = document.getElementById('sanctionedBy').value;

    try {
        let apiUrl = `/api/issues/${currentIssueId}/sanction-budget`;
        if (window.location.protocol === 'file:') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueId}/sanction-budget`;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                budgetSanctioned: {
                    amount: parseFloat(budgetAmount),
                    billNumber: billNumber,
                    financialYear: financialYear,
                    sanctionedBy: sanctionedBy,
                    sanctionDate: new Date()
                },
                updatedBy: currentUser.name,
                department: currentUser.department
            })
        });

        if (response.ok) {
            alert('Budget sanctioned successfully!');
            closeBudgetModal();
            loadIssues(); // Reload issues
        } else {
            const errorData = await response.json();
            alert(`Error sanctioning budget: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error sanctioning budget:', error);
        alert('Error sanctioning budget. Please try again.');
    }
}

// Open work progress modal
function openProgressModal(issueId) {
    currentIssueId = issueId;
    document.getElementById('progressModal').style.display = 'block';
}

// Close work progress modal
function closeProgressModal() {
    document.getElementById('progressModal').style.display = 'none';
    currentIssueId = null;
}

// Handle work progress form submission
async function handleWorkProgress(e) {
    e.preventDefault();
    
    if (!currentIssueId) return;

    const workStage = document.getElementById('workStage').value;
    const progressDescription = document.getElementById('progressDescription').value;
    const completionPercentage = document.getElementById('completionPercentage').value;
    const progressPhotos = document.getElementById('progressPhotos').files;

    try {
        let apiUrl = `/api/issues/${currentIssueId}/work-progress`;
        if (window.location.protocol === 'file:') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueId}/work-progress`;
        }

        // First update work progress
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workProgress: {
                    stage: workStage,
                    description: progressDescription,
                    completionPercentage: parseInt(completionPercentage),
                    updatedAt: new Date(),
                    updatedBy: currentUser.id
                }
            })
        });

        if (response.ok) {
            // If there are photos, upload them separately
            if (progressPhotos.length > 0) {
                try {
                    await uploadProgressPhotos(currentIssueId, 0, progressPhotos);
                } catch (photoError) {
                    console.warn('Progress updated but photo upload failed:', photoError);
                }
            }
            
            alert('Work progress updated successfully!');
            closeProgressModal();
            loadIssues(); // Reload issues
        } else {
            const errorData = await response.json();
            alert(`Error updating progress: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error updating progress:', error);
        alert('Error updating progress. Please try again.');
    }
}

// Open contractor assignment modal
function openContractorModal(issueId) {
    currentIssueId = issueId;
    document.getElementById('contractorModal').style.display = 'block';
}

// Close contractor assignment modal
function closeContractorModal() {
    document.getElementById('contractorModal').style.display = 'none';
    currentIssueId = null;
}

// Handle contractor assignment form submission
async function handleContractorAssignment(e) {
    e.preventDefault();
    
    if (!currentIssueId) return;

    const contractorName = document.getElementById('contractorName').value;
    const contractorContact = document.getElementById('contractorContact').value;
    const contractorReg = document.getElementById('contractorReg').value;
    const estimatedCost = document.getElementById('estimatedCost').value;
    const expectedCompletion = document.getElementById('expectedCompletion').value;

    try {
        let apiUrl = `/api/issues/${currentIssueId}/contractor`;
        if (window.location.protocol === 'file:') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueId}/contractor`;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contractor: {
                    name: contractorName,
                    contactNumber: contractorContact,
                    registrationNumber: contractorReg
                },
                estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
                expectedCompletionDate: expectedCompletion ? new Date(expectedCompletion) : null,
                updatedBy: currentUser.name,
                department: currentUser.department
            })
        });

        if (response.ok) {
            alert('Contractor assigned successfully!');
            closeContractorModal();
            loadIssues(); // Reload issues
        } else {
            const errorData = await response.json();
            alert(`Error assigning contractor: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error assigning contractor:', error);
        alert('Error assigning contractor. Please try again.');
    }
}

// Quick resolve function
async function quickResolve(issueId) {
    if (confirm('Are you sure you want to mark this issue as resolved?')) {
        currentIssueId = issueId;
        
        try {
            let apiUrl = `/api/issues/${issueId}/status`;
            if (window.location.protocol === 'file:') {
                apiUrl = `http://localhost:5000/api/issues/${issueId}/status`;
            }

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'resolved',
                    comment: 'Issue resolved by government official',
                    updatedBy: currentUser.name,
                    department: currentUser.department
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                alert('Issue marked as resolved!');
                loadIssues(); // Reload issues
            } else {
                throw new Error(data.message || 'Failed to resolve issue');
            }

        } catch (error) {
            console.error('Error resolving issue:', error);
            alert(`Error resolving issue: ${error.message}`);
        }
    }
}

// View issue details (could open a detailed modal)
function viewIssueDetails(issueId) {
    const issue = allIssues.find(i => i._id === issueId);
    if (issue) {
        let details = `Issue Details:\n\n`;
        details += `Title: ${issue.title}\n`;
        details += `Description: ${issue.description}\n`;
        details += `Category: ${issue.category}\n`;
        details += `Priority: ${issue.priority}\n`;
        details += `Status: ${issue.status}\n`;
        details += `Reporter: ${issue.reporterName}\n`;
        details += `Location: ${formatLocation(issue.location)}\n`;
        details += `Created: ${formatDate(issue.createdAt)}\n`;
        
        if (issue.statusHistory && issue.statusHistory.length > 0) {
            details += `\nStatus History:\n`;
            issue.statusHistory.forEach((update, index) => {
                details += `${index + 1}. ${update.status} - ${update.comment || 'No comment'} (${formatDate(update.date)})\n`;
            });
        }
        
        alert(details);
    }
}

// ===============================
// ENHANCED GOVERNMENT WORKFLOW
// ===============================

let currentIssueForWorkflow = null;

// Open budget sanction modal
function openBudgetModal(issueId) {
    currentIssueForWorkflow = issueId;
    document.getElementById('budgetModal').style.display = 'block';
    
    // Pre-fill sanctioned by with current user
    document.getElementById('sanctionedBy').value = currentUser.name;
    
    // Set current financial year
    const currentYear = new Date().getFullYear();
    const nextYear = (currentYear + 1).toString().slice(-2);
    document.getElementById('financialYear').value = `${currentYear}-${nextYear}`;
}

function closeBudgetModal() {
    document.getElementById('budgetModal').style.display = 'none';
    currentIssueForWorkflow = null;
}

// Handle budget sanction form submission
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Add new form listeners
    if (document.getElementById('budgetSanctionForm')) {
        document.getElementById('budgetSanctionForm').addEventListener('submit', handleBudgetSanction);
    }
    if (document.getElementById('workProgressForm')) {
        document.getElementById('workProgressForm').addEventListener('submit', handleWorkProgress);
    }
    if (document.getElementById('contractorForm')) {
        document.getElementById('contractorForm').addEventListener('submit', handleContractorAssignment);
    }
});

async function handleBudgetSanction(e) {
    e.preventDefault();
    
    if (!currentIssueForWorkflow) return;

    const budgetData = {
        amount: parseFloat(document.getElementById('budgetAmount').value),
        billNumber: document.getElementById('billNumber').value,
        financialYear: document.getElementById('financialYear').value,
        sanctionedBy: document.getElementById('sanctionedBy').value
    };

    try {
        let apiUrl = `/api/issues/${currentIssueForWorkflow}/sanction-budget`;
        if (window.location.protocol === 'file') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueForWorkflow}/sanction-budget`;
        }

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(budgetData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            alert(`Budget of ₹${budgetData.amount} sanctioned successfully!`);
            closeBudgetModal();
            loadIssues(); // Reload issues to show updated data
            document.getElementById('budgetSanctionForm').reset();
        } else {
            throw new Error(data.message || 'Failed to sanction budget');
        }

    } catch (error) {
        console.error('Error sanctioning budget:', error);
        alert(`Error sanctioning budget: ${error.message}`);
    }
}

// Open work progress modal
function openProgressModal(issueId) {
    currentIssueForWorkflow = issueId;
    document.getElementById('progressModal').style.display = 'block';
}

function closeProgressModal() {
    document.getElementById('progressModal').style.display = 'none';
    currentIssueForWorkflow = null;
}

async function handleWorkProgress(e) {
    e.preventDefault();
    
    if (!currentIssueForWorkflow) return;

    const progressData = {
        stage: document.getElementById('workStage').value,
        description: document.getElementById('progressDescription').value,
        completionPercentage: parseInt(document.getElementById('completionPercentage').value),
        updatedBy: currentUser.name
    };

    try {
        let apiUrl = `/api/issues/${currentIssueForWorkflow}/work-progress`;
        if (window.location.protocol === 'file') {
            apiUrl = `http://localhost:5000/api/issues/${currentIssueForWorkflow}/work-progress`;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            // Check if there are photos to upload
            const photoInput = document.getElementById('progressPhotos');
            if (photoInput && photoInput.files.length > 0) {
                // Get the latest progress entry index (should be the last one we just created)
                const progressIndex = await getLatestProgressIndex(currentIssueForWorkflow);
                await uploadProgressPhotos(currentIssueForWorkflow, progressIndex, photoInput.files);
            }
            
            alert(`Work progress updated: ${progressData.stage} (${progressData.completionPercentage}% complete)`);
            closeProgressModal();
            loadIssues(); // Reload issues to show updated data
            document.getElementById('workProgressForm').reset();
        } else {
            throw new Error(data.message || 'Failed to update work progress');
        }

    } catch (error) {
        console.error('Error updating work progress:', error);
        alert(`Error updating work progress: ${error.message}`);
    }
}

// Get the index of the latest progress entry for photo upload
async function getLatestProgressIndex(issueId) {
    try {
        let apiUrl = `/api/issues/${issueId}/government-details`;
        if (window.location.protocol === 'file') {
            apiUrl = `http://localhost:5000/api/issues/${issueId}/government-details`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.issue.resolutionDetails.workProgress) {
            return data.issue.resolutionDetails.workProgress.length - 1;
        }
        return 0;
    } catch (error) {
        console.error('Error getting progress index:', error);
        return 0;
    }
}

// Upload progress photos
async function uploadProgressPhotos(issueId, progressIndex, files) {
    try {
        const formData = new FormData();
        
        // Append files and metadata
        Array.from(files).forEach(file => {
            formData.append('photos', file);
        });
        formData.append('progressIndex', progressIndex);
        formData.append('description', 'Work progress photos');
        formData.append('uploadedBy', currentUser.id || 'unknown');
        
        let apiUrl = `/api/issues/${issueId}/progress-photos`;
        if (window.location.protocol === 'file') {
            apiUrl = `http://localhost:5000/api/issues/${issueId}/progress-photos`;
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Progress photos uploaded:', data);
            return data;
        } else {
            throw new Error('Failed to upload progress photos');
        }
        
    } catch (error) {
        console.error('Error uploading progress photos:', error);
        throw error;
    }
}

// Image modal functionality
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

// Add CSS for attachments and image modal
const attachmentStyles = document.createElement('style');
attachmentStyles.textContent = `
    .issue-attachments {
        margin: 15px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }
    
    .attachments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }
    
    .attachment-item {
        position: relative;
    }
    
    .attachment-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 5px;
        cursor: pointer;
        transition: transform 0.2s;
        border: 2px solid #e9ecef;
    }
    
    .attachment-image:hover {
        transform: scale(1.05);
        border-color: #007bff;
    }
    
    .attachment-file {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px;
        background: white;
        border-radius: 5px;
        border: 1px solid #dee2e6;
    }
    
    .file-icon {
        font-size: 20px;
    }
    
    .attachment-file a {
        color: #007bff;
        text-decoration: none;
        font-size: 14px;
    }
    
    .attachment-file a:hover {
        text-decoration: underline;
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
document.head.appendChild(attachmentStyles);

console.log('Government Dashboard JavaScript loaded successfully');
