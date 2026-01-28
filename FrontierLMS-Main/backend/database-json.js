const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'school-demo.json');

// Initialize database file
if (!fs.existsSync(dbPath)) {
  const initialData = {
    schools: [],
    users: [
      {
        id: 1,
        email: 'superadmin@frontierlms.com',
        password: 'admin123',
        role: 'super_admin',
        firstName: 'Super',
        lastName: 'Admin'
      }
    ]
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  console.log('📁 JSON database created at:', dbPath);
}

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading database:', error);
    // Return default structure if file is corrupted
    return {
      schools: [],
      users: [
        {
          id: 1,
          email: 'superadmin@frontierlms.com',
          password: 'admin123',
          role: 'super_admin',
          firstName: 'Super',
          lastName: 'Admin'
        }
      ]
    };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing to database:', error);
    return false;
  }
}

module.exports = { readDB, writeDB };