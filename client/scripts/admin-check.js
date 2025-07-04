// Check if user should see admin button
function checkAdminAccess() {
  try {
    const userData = localStorage.getItem('janavaani_user');
    const adminButton = document.querySelector('a[href="admin.html"]');
    const adminLink = document.getElementById('adminLink');
    const adminLinkClass = document.querySelector('.admin-link');
    
    // Collect all admin elements
    const adminElements = [adminButton, adminLink, adminLinkClass].filter(el => el);
    
    if (adminElements.length > 0) {
      if (userData) {
        try {
          const user = JSON.parse(userData);
          // Only show admin access for logged-in government users or admins
          const hasAccess = user.userType === 'government' || user.role === 'admin';
          
          adminElements.forEach(element => {
            element.style.display = hasAccess ? 'inline-block' : 'none';
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          adminElements.forEach(element => {
            element.style.display = 'none';
          });
        }
      } else {
        adminElements.forEach(element => {
          element.style.display = 'none';
        });
      }
    }
  } catch (error) {
    console.error('Error checking admin access:', error);
    // Hide all admin elements if there's an error
    const adminElements = [
      document.querySelector('a[href="admin.html"]'),
      document.getElementById('adminLink'),
      document.querySelector('.admin-link')
    ].filter(el => el);
    
    adminElements.forEach(element => {
      element.style.display = 'none';
    });
  }
}

// Run when page loads
document.addEventListener('DOMContentLoaded', checkAdminAccess);
