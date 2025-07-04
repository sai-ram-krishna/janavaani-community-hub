document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const userTypeRadios = document.querySelectorAll('input[name="userType"]');
  const departmentSelect = document.getElementById('departmentSelect');

  // Handle user type selection for department visibility
  userTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'government') {
        departmentSelect.classList.add('show');
        document.getElementById('department').required = true;
      } else {
        departmentSelect.classList.remove('show');
        document.getElementById('department').required = false;
        document.getElementById('department').value = '';
      }
    });
  });

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data using proper selectors
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const userType = document.querySelector('input[name="userType"]:checked')?.value;
    const department = document.getElementById('department').value;

    // Validation
    if (!email || !password || !userType) {
      alert("❌ Please fill in all required fields.");
      return;
    }

    if (userType === "government" && !department) {
      alert("❌ Please select your department.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("❌ Please enter a valid email address");
      return;
    }

    // Update button state
    const loginBtn = document.querySelector('.login-btn');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;

    try {
      // Try relative URL first, fallback to full URL
      let apiUrl = "/api/auth/login";
      
      // Check if we're accessing via file:// protocol
      if (window.location.protocol === 'file:') {
        apiUrl = "http://localhost:5000/api/auth/login";
      }
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          userType,
          department: userType === "government" ? department : undefined
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        throw new Error("Invalid response from server");
      }

      if (response.ok) {
        alert("✅ Login successful!");

        // Save user data with consistent key name
        localStorage.setItem("janavaani_user", JSON.stringify(data.user));
        
        // Save token if provided
        if (data.token) {
            localStorage.setItem("janavaani_token", data.token);
        }

        // Redirect based on user type
        if (data.user.userType === 'government') {
          // Redirect government officials to their department dashboard
          window.location.href = "government-dashboard.html";
        } else {
          // Redirect citizens to regular dashboard
          window.location.href = "dashboard.html";
        }
      } else {
        alert("❌ " + (data.message || "Login failed"));
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.message.includes("Failed to fetch")) {
        alert("❌ Cannot connect to server. Please make sure the server is running.");
      } else {
        alert("❌ Network error. Please try again later.");
      }
    } finally {
      // Reset button state
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
    }
  });
});
