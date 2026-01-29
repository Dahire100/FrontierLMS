// src/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database:', dbPath);
    
    // Initialize database after connection
    initDB();
  }
});

// Initialize database tables
const initDB = () => {
  console.log('🔄 Initializing database tables...');
  
  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT CHECK(role IN ('super_admin', 'school_admin', 'teacher', 'parent', 'student')) NOT NULL,
      firstName TEXT,
      lastName TEXT,
      phone TEXT,
      schoolId INTEGER,
      isActive BOOLEAN DEFAULT 1,
      lastLogin DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Schools table
    `CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schoolName TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL,
      pinCode TEXT NOT NULL,
      contactNumber TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      principalName TEXT NOT NULL,
      principalEmail TEXT NOT NULL,
      principalPhone TEXT NOT NULL,
      schoolType TEXT NOT NULL,
      boardType TEXT NOT NULL,
      establishmentYear TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      adminEmail TEXT,
      adminPassword TEXT,
      registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Students table
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentId TEXT UNIQUE NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      class TEXT NOT NULL,
      section TEXT NOT NULL,
      rollNumber INTEGER,
      admissionDate DATE,
      dateOfBirth DATE,
      gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
      address TEXT,
      phone TEXT,
      email TEXT,
      parentName TEXT,
      parentPhone TEXT,
      bloodGroup TEXT,
      transportRoute TEXT,
      schoolId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (schoolId) REFERENCES schools (id)
    )`
  ];

  let tablesCreated = 0;
  
  queries.forEach((query, index) => {
    db.run(query, (err) => {
      if (err) {
        console.error(`❌ Error creating table ${index + 1}:`, err.message);
      } else {
        tablesCreated++;
        console.log(`✅ Table ${index + 1} created/verified`);
      }
      
      // When all tables are processed, create super admin
      if (tablesCreated === queries.length) {
        createSuperAdmins();
      }
    });
  });
};

// Create super admin users
const createSuperAdmins = () => {
  console.log('🔧 Setting up super admin accounts...');
  
  const superAdmins = [
    {
      email: 'superadmin@frontierlms.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator'
    },
    {
      email: 'spchandratre371322@kkwagh.edu.in',
      password: 'admin123',
      firstName: 'Sachin',
      lastName: 'Chandratre'
    }
  ];

  let adminsProcessed = 0;
  
  superAdmins.forEach((admin) => {
    setupSuperAdmin(admin, () => {
      adminsProcessed++;
      if (adminsProcessed === superAdmins.length) {
        console.log('✅ All super admins setup completed');
        testDatabase();
      }
    });
  });
};

const setupSuperAdmin = (admin, callback) => {
  const { email, password, firstName, lastName } = admin;
  
  // Generate proper bcrypt hash
  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  
  // First check if user with this email exists (regardless of role)
  const checkUserQuery = `SELECT id, role FROM users WHERE email = ?`;
  
  db.get(checkUserQuery, [email], (err, existingUser) => {
    if (err) {
      console.error(`❌ Error checking user ${email}:`, err.message);
      callback();
      return;
    }
    
    if (existingUser) {
      console.log(`ℹ️  User already exists: ${email} (Current role: ${existingUser.role})`);
      
      if (existingUser.role === 'super_admin') {
        // User is already super admin, just update password and details
        const updateQuery = `UPDATE users SET passwordHash = ?, firstName = ?, lastName = ?, role = 'super_admin' WHERE email = ?`;
        db.run(updateQuery, [hashedPassword, firstName, lastName, email], (updateErr) => {
          if (updateErr) {
            console.error(`❌ Error updating super admin ${email}:`, updateErr.message);
          } else {
            console.log(`✅ Super admin updated: ${email}`);
            console.log(`   📧 Login: ${email}`);
            console.log(`   🔐 Password: ${password}`);
          }
          callback();
        });
      } else {
        // User exists but with different role - update to super_admin
        const updateQuery = `UPDATE users SET passwordHash = ?, firstName = ?, lastName = ?, role = 'super_admin', schoolId = NULL WHERE email = ?`;
        db.run(updateQuery, [hashedPassword, firstName, lastName, email], (updateErr) => {
          if (updateErr) {
            console.error(`❌ Error converting user to super admin ${email}:`, updateErr.message);
          } else {
            console.log(`✅ User converted to super admin: ${email}`);
            console.log(`   📧 Login: ${email}`);
            console.log(`   🔐 Password: ${password}`);
          }
          callback();
        });
      }
    } else {
      // Create new super admin
      const insertQuery = `INSERT INTO users (email, passwordHash, role, firstName, lastName, isActive) 
                          VALUES (?, ?, 'super_admin', ?, ?, 1)`;
      
      db.run(insertQuery, [email, hashedPassword, firstName, lastName], (insertErr) => {
        if (insertErr) {
          console.error(`❌ Error creating super admin ${email}:`, insertErr.message);
          
          // If unique constraint fails, try to update existing record
          if (insertErr.message.includes('UNIQUE constraint failed')) {
            console.log(`🔄 Email ${email} already exists, attempting to update...`);
            const updateQuery = `UPDATE users SET passwordHash = ?, firstName = ?, lastName = ?, role = 'super_admin' WHERE email = ?`;
            db.run(updateQuery, [hashedPassword, firstName, lastName, email], (updateErr) => {
              if (updateErr) {
                console.error(`❌ Failed to update existing user ${email}:`, updateErr.message);
              } else {
                console.log(`✅ Existing user updated to super admin: ${email}`);
                console.log(`   📧 Login: ${email}`);
                console.log(`   🔐 Password: ${password}`);
              }
              callback();
            });
          } else {
            callback();
          }
        } else {
          console.log(`✅ Super admin created successfully: ${email}`);
          console.log(`   📧 Login: ${email}`);
          console.log(`   🔐 Password: ${password}`);
          console.log(`   ⚠️  Change this password in production!`);
          callback();
        }
      });
    }
  });
};

// Add utility functions for database operations
db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Test database connection and tables
const testDatabase = async () => {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test users table
    const users = await db.allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (users.length > 0) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table missing');
    }
    
    // Test schools table
    const schools = await db.allAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='schools'");
    if (schools.length > 0) {
      console.log('✅ Schools table exists');
    } else {
      console.log('❌ Schools table missing');
    }
    
    // Count existing users
    const userCount = await db.getAsync("SELECT COUNT(*) as count FROM users");
    console.log(`👥 Total users in database: ${userCount.count}`);
    
    // Count super admins and list them
    const superAdmins = await db.allAsync("SELECT email, firstName, lastName FROM users WHERE role = 'super_admin'");
    console.log(`👑 Super admins (${superAdmins.length}):`);
    superAdmins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });
    
    // List all users for debugging
    const allUsers = await db.allAsync("SELECT email, role FROM users");
    console.log(`📋 All users in database:`);
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
};

module.exports = { db, initDB };