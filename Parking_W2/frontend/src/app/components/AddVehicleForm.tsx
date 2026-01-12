import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

interface AddVehicleFormProps {
  onBack: () => void;
  onSave: (vehicle: {
    plateNumber: string;
    ownerName: string;
    phone: string;
    vehicleType: string;
  }) => void;
  initialPlateNumber?: string;
}

export function AddVehicleForm({ onBack, onSave, initialPlateNumber }: AddVehicleFormProps) {
  const [formData, setFormData] = useState({
    plateNumber: initialPlateNumber || "",
    ownerName: "",
    phone: "",
    vehicleType: "Ô tô",
  });

  useEffect(() => {
    if (initialPlateNumber) {
      setFormData(prev => ({
        ...prev,
        plateNumber: initialPlateNumber
      }));
    }
  }, [initialPlateNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      plateNumber: formData.plateNumber.toUpperCase(),
    });
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
            <span className="font-medium">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Thêm xe mới</h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* License Plate */}
            <div>
              <label
                htmlFor="plateNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <input
                id="plateNumber"
                name="plateNumber"
                type="text"
                required
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="VD: 29A-12345"
                className="w-full px-4 py-3 text-lg font-semibold uppercase bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label
                htmlFor="ownerName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tên chủ xe <span className="text-red-500">*</span>
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912345678"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label
                htmlFor="vehicleType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Loại xe <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                required
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option value="Ô tô">Ô tô</option>
                <option value="Xe máy">Xe máy</option>
                <option value="Xe tải">Xe tải</option>
                <option value="Xe khác">Xe khác</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="w-6 h-6" />
              Lưu thông tin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
