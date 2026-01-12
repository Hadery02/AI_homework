const db = require('../db/database');

class Vehicle {
  static getAll(callback) {
    db.all('SELECT * FROM vehicles ORDER BY registeredDate DESC', callback);
  }

  static getByPlateNumber(plateNumber, callback) {
    db.get('SELECT * FROM vehicles WHERE plateNumber = ?', [plateNumber.toUpperCase()], callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM vehicles WHERE id = ?', [id], callback);
  }

  static create(data, callback) {
    const { plateNumber, ownerName, phone, vehicleType, registeredDate } = data;
    db.run(
      'INSERT INTO vehicles (plateNumber, ownerName, phone, vehicleType, registeredDate) VALUES (?, ?, ?, ?, ?)',
      [plateNumber.toUpperCase(), ownerName, phone, vehicleType, registeredDate],
      function (err) {
        if (err) {
          console.error('Insert error:', err);
          callback(err);
        } else {
          callback(null, { id: this.lastID, plateNumber: plateNumber.toUpperCase(), ownerName, phone, vehicleType, registeredDate });
        }
      }
    );
  }

  static update(id, data, callback) {
    const { plateNumber, ownerName, phone, vehicleType, registeredDate } = data;
    db.run(
      'UPDATE vehicles SET plateNumber = ?, ownerName = ?, phone = ?, vehicleType = ?, registeredDate = ? WHERE id = ?',
      [plateNumber.toUpperCase(), ownerName, phone, vehicleType, registeredDate, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM vehicles WHERE id = ?', [id], callback);
  }

  static search(query, callback) {
    const searchTerm = `%${query}%`;
    db.all(
      'SELECT * FROM vehicles WHERE plateNumber LIKE ? OR ownerName LIKE ? ORDER BY registeredDate DESC',
      [searchTerm, searchTerm],
      callback
    );
  }
}

module.exports = Vehicle;
