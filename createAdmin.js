// createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

mongoose.connect("mongodb://127.0.0.1:27017/yourDatabase");

async function createAdmin() {
  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await User.create({ username: "admin", password: hashedPassword });
  console.log("Admin created successfully");
}

createAdmin();