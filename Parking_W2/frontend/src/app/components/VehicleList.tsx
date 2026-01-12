import { ArrowLeft, Plus, Search, Trash2, Car } from "lucide-react";
import { useState } from "react";

interface Vehicle {
  id: number;
  plateNumber: string;
  ownerName: string;
  vehicleType: string;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  onBack: () => void;
  onAddNew: () => void;
  onDelete: (id: number | string) => void;
}

export function VehicleList({ vehicles, onBack, onAddNew, onDelete }: VehicleListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/20 bg-gradient-to-b from-blue-50 to-transparent p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Vehicle list</h1>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all text-xs"
            />
          </div>
        </div>
      </div>

      {/* Vehicle List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredVehicles.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <Car className="w-12 h-12 mx-auto mb-2 opacity-50" />
              </div>
              <p className="text-gray-600 text-sm">
                {searchQuery ? "No vehicles found" : "No vehicles yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-3"
              >
                <div className="flex items-start gap-3">
                  {/* License Plate */}
                  <div className="flex-shrink-0">
                    <div className="bg-yellow-400 border-2 border-black rounded px-2 py-1 min-w-fit">
                      <div className="text-[10px] font-semibold text-center">VN</div>
                      <div className="text-sm font-bold text-center tracking-wide">
                        {vehicle.plateNumber}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {vehicle.ownerName}
                    </h3>
                    <div className="text-xs text-gray-600">
                      <div>🚗 {vehicle.vehicleType}</div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(vehicle.id)}
                    className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
