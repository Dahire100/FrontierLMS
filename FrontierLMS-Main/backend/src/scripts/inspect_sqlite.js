const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.each("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`Table: ${row.name}`);
            console.log(row.sql);
            console.log('-------------------');
        }
    });
});

db.close();
