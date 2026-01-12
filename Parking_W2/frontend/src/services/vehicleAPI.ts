const API_BASE_URL = 'http://localhost:5000/api/vehicles';

export const vehicleAPI = {
  // Get all vehicles
  async getAllVehicles() {
    try {
      const response = await fetch(API_BASE_URL);
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Search vehicle by plate number
  async searchVehicle(plateNumber: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/${plateNumber}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching vehicle:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error('Vehicle not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Create vehicle
  async createVehicle(vehicle: any) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create vehicle');
      }
      return data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  async updateVehicle(id: string, vehicle: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicle),
      });
      if (!response.ok) throw new Error('Failed to update vehicle');
      return await response.json();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  async deleteVehicle(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      return await response.json();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },
};
