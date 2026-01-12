import { useState, useEffect } from "react";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

interface AddVehicleFormProps {
  onBack: () => void;
  onSave: (vehicle: {
    plateNumber: string;
    ownerName: string;
    phone: string;
    vehicleType: string;
  }) => Promise<void>;
  initialPlateNumber?: string;
}

export function AddVehicleForm({ onBack, onSave, initialPlateNumber }: AddVehicleFormProps) {
  const [formData, setFormData] = useState({
    plateNumber: initialPlateNumber || "",
    ownerName: "",
    phone: "",
    vehicleType: "Car",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPlateNumber) {
      setFormData(prev => ({
        ...prev,
        plateNumber: initialPlateNumber
      }));
    }
  }, [initialPlateNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await onSave({
        ...formData,
        plateNumber: formData.plateNumber.toUpperCase(),
      });
    } catch (err: any) {
      // Handle duplicate plate number error
      if (err.message && err.message.includes('already exists')) {
        setError('This license plate already exists in the system!');
      } else {
        setError(err.message || 'Error adding vehicle. Please try again!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* License Plate */}
            <div>
              <label
                htmlFor="plateNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                License Plate <span className="text-red-500">*</span>
              </label>
              <input
                id="plateNumber"
                name="plateNumber"
                type="text"
                required
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="Ex: 29A-12345"
                className="w-full px-4 py-3 text-lg font-semibold uppercase bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0123456789"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label
                htmlFor="vehicleType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                required
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="w-6 h-6" />
              {isLoading ? "Saving..." : "Save Information"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
