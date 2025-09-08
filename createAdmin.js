// createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Adjust to your User schema path
const User = require("./models/User");

const createAdmin = async () => {
  try {
    // Ensure DB name is always vasaiProperty
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.includes("vasaiProperty")) {
      // If URI has no DB specified, append /vasaiProperty
      if (mongoUri.endsWith("/")) {
        mongoUri += "vasaiProperty";
      } else {
        mongoUri += "/vasaiProperty";
      }
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");
    console.log("DB name:", mongoose.connection.name);
    console.log(
      "Collections:",
      await mongoose.connection.db.listCollections().toArray()
    );

    const phone = "2222222222"; // 👈 set your admin phone
    const plainPassword = "smitaa"; // 👈 set your admin password

    // Check if admin already exists
    const existingAdmin = await User.findOne({ phone });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists with this phone.");
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = new User({
      name: "Super Admin",
      phone,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${plainPassword}`);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    mongoose.connection.close();
  }
};

createAdmin();
