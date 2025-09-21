// ===== SUBMISSIONS PAGE FUNCTIONALITY =====

let submissions = [];
let filteredSubmissions = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthAndRedirect();
    
    // Initialize page
    initSubmissionsPage();
});

// ===== CHECK AUTHENTICATION =====
function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html?redirect=submissions.html';
        return;
    }
}

// ===== INITIALIZE PAGE =====
function initSubmissionsPage() {
    // Setup event listeners
    setupEventListeners();
    
    // Load submissions
    loadSubmissions();
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadSubmissions);
    
    // Filter dropdowns
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
}

// ===== LOAD SUBMISSIONS =====
async function loadSubmissions() {
    const contentArea = document.getElementById('content-area');
    
    // Show loading state
    contentArea.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your submissions...</p>
        </div>
    `;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/contact/my-submissions', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            submissions = await response.json();
            filteredSubmissions = [...submissions];
            renderSubmissions();
        } else if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html?redirect=submissions.html';
        } else {
            throw new Error('Failed to load submissions');
        }
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        showErrorState();
    }
}

// ===== APPLY FILTERS =====
function applyFilters() {
    const typeFilter = document.getElementById('type-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredSubmissions = submissions.filter(submission => {
        const typeMatch = !typeFilter || submission.type === typeFilter;
        const statusMatch = !statusFilter || submission.status === statusFilter;
        return typeMatch && statusMatch;
    });
    
    renderSubmissions();
}

// ===== RENDER SUBMISSIONS =====
function renderSubmissions() {
    const contentArea = document.getElementById('content-area');
    
    if (filteredSubmissions.length === 0) {
        showEmptyState();
        return;
    }
    
    const submissionsHtml = filteredSubmissions.map(submission => createSubmissionCard(submission)).join('');
    
    contentArea.innerHTML = `
        <div class="submissions-grid">
            ${submissionsHtml}
        </div>
    `;
}

// ===== CREATE SUBMISSION CARD =====
function createSubmissionCard(submission) {
    const createdDate = new Date(submission.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const updatedDate = new Date(submission.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Admin response section
    let adminResponseHtml = '';
    if (submission.adminResponse && submission.adminResponse.message) {
        const responseDate = new Date(submission.adminResponse.respondedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        adminResponseHtml = `
            <div class="admin-response">
                <div class="admin-response-header">
                    <span>💬</span>
                    <span>Response from Support Team</span>
                </div>
                <div class="admin-response-message">${escapeHtml(submission.adminResponse.message)}</div>
                <div class="admin-response-meta">
                    <span>Responded by: ${escapeHtml(submission.adminResponse.respondedBy)}</span>
                    <span>${responseDate}</span>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="submission-card" data-submission-id="${submission._id}">
            <div class="submission-header">
                <span class="submission-type ${submission.type}">${submission.type}</span>
                <span class="submission-status ${submission.status.replace('-', ' ')}">${submission.status}</span>
            </div>
            
            <div class="submission-subject">${escapeHtml(submission.subject)}</div>
            <div class="submission-message">${escapeHtml(submission.message)}</div>
            
            ${adminResponseHtml}
            
            <div class="submission-meta">
                <div class="submission-date">
                    <span>📅</span>
                    <span>Created: ${createdDate}</span>
                </div>
                <div class="submission-priority">
                    Priority: <span style="text-transform: capitalize;">${submission.priority}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== SHOW EMPTY STATE =====
function showEmptyState() {
    const contentArea = document.getElementById('content-area');
    const typeFilter = document.getElementById('type-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let message = "You haven't submitted any messages yet.";
    if (typeFilter || statusFilter) {
        message = "No submissions found matching your filters.";
    }
    
    contentArea.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <h3>No Submissions Found</h3>
            <p>${message}</p>
            <a href="contact.html" class="btn">Submit a Message</a>
        </div>
    `;
}

// ===== SHOW ERROR STATE =====
function showErrorState() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="error-state">
            <h3>⚠️ Error Loading Submissions</h3>
            <p>Failed to load your submissions. Please check your connection and try again.</p>
            <button onclick="loadSubmissions()" style="
                padding: 10px 20px;
                background: #f44336;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 15px;
            ">Try Again</button>
        </div>
    `;
}

// ===== UTILITY FUNCTIONS =====

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date helper
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

// Get status icon
function getStatusIcon(status) {
    const icons = {
        'open': '🟢',
        'in-progress': '🟡',
        'resolved': '🔵',
        'closed': '⚪'
    };
    return icons[status] || '⚪';
}

// Get type icon
function getTypeIcon(type) {
    const icons = {
        'contact': '✉️',
        'feedback': '💭',
        'support': '🛠️'
    };
    return icons[type] || '📄';
}