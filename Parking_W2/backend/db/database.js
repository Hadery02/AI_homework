const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'parking.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Create vehicles table
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plateNumber TEXT UNIQUE NOT NULL,
        ownerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicleType TEXT NOT NULL,
        registeredDate TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data if table is empty
    db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
      if (row.count === 0) {
        const vehicles = [
          {
            plateNumber: '29A-12345',
            ownerName: 'Nguyễn Văn An',
            phone: '0912345678',
            vehicleType: 'Ô tô',
            registeredDate: '15/10/2025'
          },
          {
            plateNumber: '30B-67890',
            ownerName: 'Trần Thị Bình',
            phone: '0987654321',
            vehicleType: 'Xe máy',
            registeredDate: '20/11/2025'
          },
          {
            plateNumber: '51C-11111',
            ownerName: 'Lê Hoàng Cường',
            phone: '0901234567',
            vehicleType: 'Ô tô',
            registeredDate: '01/12/2025'
          },
          {
            plateNumber: '29D-22222',
            ownerName: 'Phạm Thị Dung',
            phone: '0976543210',
            vehicleType: 'Ô tô',
            registeredDate: '10/12/2025'
          },
          {
            plateNumber: '30E-33333',
            ownerName: 'Hoàng Văn Em',
            phone: '0965432109',
            vehicleType: 'Xe máy',
            registeredDate: '05/01/2026'
          }
        ];

        const insertStmt = db.prepare(`
          INSERT INTO vehicles (plateNumber, ownerName, phone, vehicleType, registeredDate)
          VALUES (?, ?, ?, ?, ?)
        `);

        vehicles.forEach((vehicle) => {
          insertStmt.run(
            vehicle.plateNumber,
            vehicle.ownerName,
            vehicle.phone,
            vehicle.vehicleType,
            vehicle.registeredDate
          );
        });

        insertStmt.finalize();
        console.log('Sample data inserted');
      }
    });
  });
}

module.exports = db;
