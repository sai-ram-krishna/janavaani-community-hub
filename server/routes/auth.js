const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, userType, department } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !userType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (userType === "government" && !department) {
      return res.status(400).json({ message: "Department is required for government officials." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      userType,
      department: userType === "government" ? department : undefined,
    });

    await newUser.save();
    res.status(201).json({ 
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    if (user.userType !== userType) {
      return res.status(400).json({ message: `You are not registered as a ${userType}` });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        department: user.department || null
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Admin route to get all users (PROTECTED - requires admin role)
router.get("/admin/users", async (req, res) => {
  try {
    // Simple API key check (for basic protection)
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'admin-secret-key-123') {
      return res.status(401).json({ message: "Unauthorized. Admin access required." });
    }

    const users = await User.find({}, '-password'); // Exclude password field
    res.status(200).json({
      message: "Users retrieved successfully",
      count: users.length,
      users: users
    });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Debug endpoint to count users
router.get("/users/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count, message: "User count retrieved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error counting users", error: err.message });
  }
});

module.exports = router;
