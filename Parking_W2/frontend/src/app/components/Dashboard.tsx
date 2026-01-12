import { useState } from "react";
import { Search, Plus, Car, Camera } from "lucide-react";

interface DashboardProps {
  onSearch: (plateNumber: string) => void;
  onAddNew: () => void;
  onViewList: () => void;
  onOpenCamera: () => void;
}

export function Dashboard({ onSearch, onAddNew, onViewList, onOpenCamera }: DashboardProps) {
  const [plateNumber, setPlateNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plateNumber.trim()) {
      onSearch(plateNumber.trim().toUpperCase());
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-y-auto">
      <div className="flex-1 p-3 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Parking Check
          </h1>
          <p className="text-sm text-gray-600">License Plate Management</p>
        </div>

        {/* Camera Scan Button - New Feature */}
        <button
          onClick={onOpenCamera}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl mb-4"
        >
          <Camera className="w-5 h-5" />
          SCAN LICENSE PLATE
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs text-gray-500 font-medium">OR ENTER</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="plateNumber"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                License Plate
              </label>
              <input
                id="plateNumber"
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="Ex: 29A-12345"
                className="w-full px-3 py-3 text-xl font-semibold text-center text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Search className="w-4 h-4" />
              CHECK
            </button>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onAddNew}
            className="bg-white hover:bg-gray-50 text-gray-900 py-3 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add License Plate
          </button>

          <button
            onClick={onViewList}
            className="bg-white hover:bg-gray-50 text-gray-900 py-3 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-all shadow-md hover:shadow-lg"
          >
            <Car className="w-4 h-4" />
            List
          </button>
        </div>
      </div>
    </div>
  );
}