document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('issueForm');
    const submitBtn = document.getElementById('submitBtn');
    const alertContainer = document.getElementById('alertContainer');
    const priorityOptions = document.querySelectorAll('.priority-option');

    // Check how the page is accessed
    const isFileProtocol = window.location.protocol === 'file:';
    const isLiveServer = window.location.hostname === '127.0.0.1' && window.location.port === '5500';
    const isCorrectServer = window.location.hostname === 'localhost' && window.location.port === '5000';

    // Determine API base URL
    let API_BASE_URL;
    if (isCorrectServer) {
        API_BASE_URL = 'http://localhost:5000/api';
    } else if (isFileProtocol || isLiveServer) {
        API_BASE_URL = 'http://localhost:5000/api';
        showAlert('warning', '⚠️ For best experience, please access this page via <a href="http://localhost:5000/report-issue.html" target="_blank">http://localhost:5000/report-issue.html</a>');
    } else {
        API_BASE_URL = '/api'; // Fallback for production
    }

    // Handle priority selection UI
    priorityOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            priorityOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            // Check the radio button
            this.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Set default medium priority as selected
    document.querySelector('.priority-option.medium').classList.add('selected');

    // Auto-populate user details if available in localStorage
    const userData = localStorage.getItem('janavaani_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('reporterName').value = user.name || '';
            document.getElementById('reporterEmail').value = user.email || '';
            // Phone might not be stored in login data, so leave it editable
        } catch (e) {
            console.log('Could not parse stored user data');
        }
    }

    // Form validation
    function validateForm() {
        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value.trim();
        const address = document.getElementById('address').value.trim();
        const pincode = document.getElementById('pincode').value.trim();
        const name = document.getElementById('reporterName').value.trim();
        const email = document.getElementById('reporterEmail').value.trim();
        const phone = document.getElementById('reporterPhone').value.trim();
        const priority = document.querySelector('input[name="priority"]:checked')?.value;

        if (!title || !category || !description || !address || !pincode || !name || !email || !phone || !priority) {
            showAlert('error', 'Please fill in all required fields.');
            return false;
        }

        if (!/^\d{6}$/.test(pincode)) {
            showAlert('error', 'Please enter a valid 6-digit pincode.');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            showAlert('error', 'Please enter a valid email address.');
            return false;
        }

        if (description.length < 20) {
            showAlert('error', 'Please provide a more detailed description (at least 20 characters).');
            return false;
        }

        return true;
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Get current user ID (you might need to implement proper user session)
            let userId = null;
            const userData = localStorage.getItem('janavaani_user');
            if (userData) {
                try {
                    userId = JSON.parse(userData).id;
                } catch (e) {
                    console.log('Could not get user ID from stored data');
                }
            }

            // If no user ID, create a guest submission (you might want to require login instead)
            if (!userId) {
                showAlert('error', 'Please <a href="login.html">login</a> first to report an issue.');
                return;
            }

            const formData = {
                title: document.getElementById('title').value.trim(),
                description: document.getElementById('description').value.trim(),
                category: document.getElementById('category').value,
                priority: document.querySelector('input[name="priority"]:checked').value,
                location: {
                    address: document.getElementById('address').value.trim(),
                    pincode: document.getElementById('pincode').value.trim(),
                    landmark: document.getElementById('landmark').value.trim()
                },
                submittedBy: {
                    userId: userId,
                    name: document.getElementById('reporterName').value.trim(),
                    email: document.getElementById('reporterEmail').value.trim(),
                    phone: document.getElementById('reporterPhone').value.trim()
                }
            };

            console.log('Submitting issue:', formData);

            const response = await fetch(`${API_BASE_URL}/issues/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', `✅ Issue submitted successfully! Issue ID: ${result.issue.id}. You will be notified of updates via email.`);
                form.reset();
                // Reset priority selection
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                document.querySelector('.priority-option.medium').classList.add('selected');
                document.getElementById('priority-medium').checked = true;
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showAlert('error', result.message || 'Failed to submit issue. Please try again.');
            }

        } catch (error) {
            console.error('Error submitting issue:', error);
            if (isFileProtocol || isLiveServer) {
                showAlert('error', '❌ Network error: Please make sure you are accessing this page via <a href="http://localhost:5000/report-issue.html" target="_blank">http://localhost:5000</a> and the server is running.');
            } else {
                showAlert('error', '❌ Network error. Please check your connection and try again.');
            }
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Issue Report';
        }
    });

    // Show alert function
    function showAlert(type, message) {
        alertContainer.innerHTML = `
            <div class="alert ${type}">
                ${message}
            </div>
        `;
        alertContainer.querySelector('.alert').style.display = 'block';
        
        // Auto-hide success alerts after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                const alert = alertContainer.querySelector('.alert');
                if (alert) {
                    alert.style.display = 'none';
                }
            }, 10000);
        }
    }

    // Character counter for description
    const descriptionField = document.getElementById('description');
    const maxLength = 2000;
    
    function updateCharacterCount() {
        const remaining = maxLength - descriptionField.value.length;
        let counter = descriptionField.parentNode.querySelector('.char-counter');
        
        if (!counter) {
            counter = document.createElement('small');
            counter.className = 'char-counter';
            counter.style.color = '#666';
            counter.style.float = 'right';
            descriptionField.parentNode.appendChild(counter);
        }
        
        counter.textContent = `${remaining} characters remaining`;
        
        if (remaining < 100) {
            counter.style.color = '#e74c3c';
        } else {
            counter.style.color = '#666';
        }
    }

    descriptionField.addEventListener('input', updateCharacterCount);
    updateCharacterCount(); // Initial count

    // Pincode validation
    document.getElementById('pincode').addEventListener('input', function(e) {
        // Only allow digits
        e.target.value = e.target.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (e.target.value.length > 6) {
            e.target.value = e.target.value.slice(0, 6);
        }
    });

    console.log('Issue reporting form initialized');
    console.log('API Base URL:', API_BASE_URL);
});
