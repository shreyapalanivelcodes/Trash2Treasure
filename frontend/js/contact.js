// ===== CONTACT PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    initTabSwitching();
    
    // Form submission handlers
    initFormSubmissions();
    
    // Pre-fill user data if logged in
    prefillUserData();
});

// ===== TAB SWITCHING =====
function initTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
            
            // Clear any existing messages when switching tabs
            clearMessages();
        });
    });
}

// ===== FORM SUBMISSIONS =====
function initFormSubmissions() {
    // Contact form
    document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm('contact', e.target);
    });
    
    // Feedback form
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm('feedback', e.target);
    });
    
    // Support form
    document.getElementById('support-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm('support', e.target);
    });
}

// ===== SUBMIT FORM =====
async function submitForm(type, form) {
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        type: type
    };
    
    // Validation
    if (!data.name || !data.email || !data.subject || !data.message) {
        showMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        showMessage('Sending your message...', 'loading');
        
        // Get auth token if available
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/contact/submit', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            form.reset(); // Clear the form
            
            // If user is logged in, show additional info
            if (token) {
                setTimeout(() => {
                    showMessage(
                        result.message + ' You can track this submission in your profile under "My Submissions".',
                        'success'
                    );
                }, 2000);
            }
        } else {
            throw new Error(result.message || 'Failed to submit form');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage(
            error.message || 'Failed to submit form. Please try again later.',
            'error'
        );
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ===== SHOW MESSAGE =====
function showMessage(message, type = 'info') {
    const messageDisplay = document.getElementById('message-display');
    
    // Clear existing messages
    messageDisplay.innerHTML = '';
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    messageDisplay.appendChild(messageEl);
    
    // Scroll to message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide success and error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.opacity = '0';
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
}

// ===== CLEAR MESSAGES =====
function clearMessages() {
    const messageDisplay = document.getElementById('message-display');
    messageDisplay.innerHTML = '';
}

// ===== PRE-FILL USER DATA =====
function prefillUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.name && user.email) {
        // Pre-fill name and email in all forms
        const nameFields = document.querySelectorAll('input[name="name"]');
        const emailFields = document.querySelectorAll('input[name="email"]');
        
        nameFields.forEach(field => {
            if (!field.value) {
                field.value = user.name;
            }
        });
        
        emailFields.forEach(field => {
            if (!field.value) {
                field.value = user.email;
            }
        });
    }
}

// ===== UTILITY FUNCTIONS =====

// Auto-expand textareas
document.addEventListener('input', function(e) {
    if (e.target.tagName === 'TEXTAREA') {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }
});

// Smooth form field animations
document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(field => {
    field.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    field.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Handle URL parameters for direct tab access
const urlParams = new URLSearchParams(window.location.search);
const tabParam = urlParams.get('tab');
if (tabParam && ['contact', 'feedback', 'support'].includes(tabParam)) {
    const targetBtn = document.querySelector(`[data-tab="${tabParam}"]`);
    if (targetBtn) {
        targetBtn.click();
    }
}