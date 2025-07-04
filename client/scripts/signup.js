// Show/hide department field based on user type
document.getElementById('userType').addEventListener('change', function() {
  const departmentField = document.getElementById('department');
  if (this.value === 'government') {
    departmentField.style.display = 'block';
    departmentField.required = true;
  } else {
    departmentField.style.display = 'none';
    departmentField.required = false;
    departmentField.value = '';
  }
});

document.querySelector(".signup-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fullName = this.querySelector('#fullName').value.trim();
  const email = this.querySelector('#email').value.trim();
  const phone = this.querySelector('#phone').value.trim();
  const userType = this.querySelector('#userType').value;
  const department = this.querySelector('#department').value;
  const password = this.querySelector('#password').value;
  const confirmPassword = this.querySelector('#confirmPassword').value;

  // Client-side validation
  if (!fullName || !email || !phone || !userType || !password || !confirmPassword) {
    alert("❌ Please fill in all fields");
    return;
  }

  if (userType === 'government' && !department) {
    alert("❌ Please select your department");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match");
    return;
  }

  if (password.length < 6) {
    alert("❌ Password must be at least 6 characters long");
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("❌ Please enter a valid email address");
    return;
  }

  // Basic phone validation (adjust pattern as needed)
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    alert("❌ Please enter a valid phone number");
    return;
  }

  try {
    // Determine the correct API URL
    let apiUrl;
    
    if (window.location.hostname === 'localhost' && window.location.port === '5000') {
      // Accessing via server - use relative URL
      apiUrl = "/api/auth/register";
    } else {
      // Fallback to full URL
      apiUrl = "http://localhost:5000/api/auth/register";
    }
    
    console.log('Making signup request to:', apiUrl);
    console.log('Current location:', window.location.href);
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email,
        phone,
        userType,
        department: userType === 'government' ? department : undefined,
        password
      })
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      throw new Error("Invalid response from server. Make sure you're accessing via http://localhost:5000");
    }

    if (res.ok) {
      alert("✅ Account created successfully!");
      
      // Save user data and redirect to dashboard
      localStorage.setItem("janavaani_user", JSON.stringify(data.user));
      window.location.href = "dashboard.html";
    } else {
      alert("❌ " + (data.message || "Signup failed"));
    }
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err.message.includes("Failed to fetch")) {
      alert(`❌ Cannot connect to server. 

Please make sure:
1. Server is running (run 'npm start' in terminal)
2. You're accessing via http://localhost:5000/signup.html
3. Not opening the file directly

Current page: ${window.location.href}
Expected: http://localhost:5000/signup.html`);
    } else {
      alert("❌ Network error. Please try again later.");
    }
  }
});
