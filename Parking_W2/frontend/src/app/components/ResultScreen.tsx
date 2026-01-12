import { CheckCircle2, XCircle, ArrowLeft, User, Phone, Plus } from "lucide-react";

interface VehicleInfo {
  plateNumber: string;
  ownerName?: string;
  phone?: string;
  vehicleType?: string;
  registeredDate?: string;
}

interface ResultScreenProps {
  isValid: boolean;
  vehicleInfo: VehicleInfo;
  onBack: () => void;
  onAddNewVehicle?: (plateNumber: string) => void;
}

export function ResultScreen({ isValid, vehicleInfo, onBack, onAddNewVehicle }: ResultScreenProps) {
  return (
    <div className={`min-h-screen p-4 ${isValid ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-red-50 to-rose-100'}`}>
      <div className="max-w-2xl mx-auto pt-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại</span>
        </button>

        {/* Result Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {isValid ? (
              <CheckCircle2 className="w-32 h-32 text-green-500" strokeWidth={2} />
            ) : (
              <XCircle className="w-32 h-32 text-red-500" strokeWidth={2} />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {isValid ? 'HỢP LỆ' : 'CẢNH BÁO'}
            </h2>
            <p className="text-lg text-gray-600">
              {isValid ? 'Cho phép vào bãi đỗ xe' : 'Không có trong danh sách'}
            </p>
          </div>          {/* License Plate */}
          <div className="bg-yellow-400 border-4 border-black rounded-lg py-4 px-6 mb-6">
            <div className="text-center">
              <div className="text-sm font-semibold mb-1">VIỆT NAM</div>
              <div className="text-4xl font-bold tracking-wider">
                {vehicleInfo.plateNumber}
              </div>
            </div>
          </div>

          {/* Vehicle Info (only if valid) */}
          {isValid && vehicleInfo.ownerName && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Thông tin chủ xe
              </h3>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Chủ xe</div>
                  <div className="font-medium text-gray-900">{vehicleInfo.ownerName}</div>
                </div>
              </div>

              {vehicleInfo.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-medium text-gray-900">{vehicleInfo.phone}</div>
                  </div>
                </div>
              )}

              {vehicleInfo.vehicleType && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-500 mt-0.5 flex items-center justify-center">
                    🚗
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Loại xe</div>
                    <div className="font-medium text-gray-900">{vehicleInfo.vehicleType}</div>
                  </div>
                </div>
              )}

              {vehicleInfo.registeredDate && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-500 mt-0.5 flex items-center justify-center">
                    📅
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày đăng ký</div>
                    <div className="font-medium text-gray-900">{vehicleInfo.registeredDate}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning message for invalid */}
          {!isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-center font-medium">
                ⚠️ Biển số xe này chưa được đăng ký trong hệ thống
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onBack}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Kiểm tra biển số khác
          </button>

          {/* Add New Vehicle Button - only for invalid plates */}
          {!isValid && onAddNewVehicle && (
            <button
              onClick={() => onAddNewVehicle(vehicleInfo.plateNumber)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm biển số này vào hệ thống
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
