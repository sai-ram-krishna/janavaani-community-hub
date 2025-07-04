const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['citizen', 'government'], default: 'citizen' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // Add admin role
  department: { type: String, required: function() { return this.userType === 'government'; } },
  location: {
    state: String,
    district: String,
    mandal: String,
    village: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
