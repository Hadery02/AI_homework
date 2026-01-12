const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// GET all vehicles
router.get('/', (req, res) => {
  Vehicle.getAll((err, vehicles) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(vehicles);
  });
});

// GET vehicle by plate number (search)
router.get('/search/:plateNumber', (req, res) => {
  const { plateNumber } = req.params;
  Vehicle.getByPlateNumber(plateNumber, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (vehicle) {
      res.json({ isValid: true, vehicleInfo: vehicle });
    } else {
      res.json({ isValid: false, vehicleInfo: { plateNumber: plateNumber.toUpperCase() } });
    }
  });
});

// GET vehicle by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Vehicle.getById(id, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ error: 'Vehicle not found' });
    }
  });
});

// POST create vehicle
router.post('/', (req, res) => {
  const { plateNumber, ownerName, phone, vehicleType } = req.body;

  // Validate required fields
  if (!plateNumber || !ownerName || !phone || !vehicleType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const registeredDate = new Date().toLocaleDateString('vi-VN');
  const vehicleData = { plateNumber, ownerName, phone, vehicleType, registeredDate };

  Vehicle.create(vehicleData, (err, vehicle) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(vehicle);
  });
});

// PUT update vehicle
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { plateNumber, ownerName, phone, vehicleType, registeredDate } = req.body;

  if (!plateNumber || !ownerName || !phone || !vehicleType || !registeredDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const vehicleData = { plateNumber, ownerName, phone, vehicleType, registeredDate };

  Vehicle.update(id, vehicleData, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Vehicle updated successfully' });
  });
});

// DELETE vehicle
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  Vehicle.delete(id, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  });
});

module.exports = router;
