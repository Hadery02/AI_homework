import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { ResultScreen } from "./components/ResultScreen";
import { VehicleList } from "./components/VehicleList";
import { AddVehicleForm } from "./components/AddVehicleForm";
import { CameraScanner } from "./components/CameraScanner";
import { vehicleAPI } from "../services/vehicleAPI";

type Screen =
  | "dashboard"
  | "result"
  | "list"
  | "add"
  | "camera";

interface Vehicle {
  id: number;
  plateNumber: string;
  ownerName: string;
  phone: string;
  vehicleType: string;
  registeredDate: string;
}

function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>("dashboard");
  const [searchResult, setSearchResult] = useState<{
    isValid: boolean;
    vehicleInfo: Vehicle | { plateNumber: string };
  } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPlateNumber, setPendingPlateNumber] = useState<string | null>(null);

  // Load vehicles from API on component mount
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleAPI.getAllVehicles();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      // Fallback to empty list
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (plateNumber: string) => {
    try {
      const result = await vehicleAPI.searchVehicle(plateNumber);
      setSearchResult(result);
      setCurrentScreen("result");
    } catch (error) {
      console.error("Search error:", error);
      setSearchResult({
        isValid: false,
        vehicleInfo: { plateNumber },
      });
      setCurrentScreen("result");
    }
  };

  const handleAddVehicleFromResult = (plateNumber: string) => {
    setPendingPlateNumber(plateNumber);
    setCurrentScreen("add");
  };

  const handleAddVehicle = async (
    newVehicle: Omit<Vehicle, "id" | "registeredDate">,
  ) => {
    try {
      setLoading(true);
      const vehicle = await vehicleAPI.createVehicle(newVehicle);
      setVehicles([...vehicles, vehicle]);
      setPendingPlateNumber(null);
      setCurrentScreen("list");
    } catch (error) {
      console.error("Failed to add vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: string | number) => {
    try {
      await vehicleAPI.deleteVehicle(String(id));
      setVehicles(vehicles.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] h-screen max-h-[960px] bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-50"></div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-6">
          {currentScreen === "dashboard" && (
            <Dashboard
              onSearch={handleSearch}
              onAddNew={() => setCurrentScreen("add")}
              onViewList={() => setCurrentScreen("list")}
              onOpenCamera={() => setCurrentScreen("camera")}
            />
          )}

          {currentScreen === "camera" && (
            <CameraScanner
              onBack={() => setCurrentScreen("dashboard")}
              onScanned={handleSearch}
            />
          )}

          {currentScreen === "result" && searchResult && (
            <ResultScreen
              isValid={searchResult.isValid}
              vehicleInfo={searchResult.vehicleInfo as any}
              onBack={() => setCurrentScreen("dashboard")}
              onAddNewVehicle={handleAddVehicleFromResult}
            />
          )}

          {currentScreen === "list" && (
            <VehicleList
              vehicles={vehicles}
              onBack={() => setCurrentScreen("dashboard")}
              onAddNew={() => {
                setPendingPlateNumber(null);
                setCurrentScreen("add");
              }}
              onDelete={handleDeleteVehicle}
            />
          )}

          {currentScreen === "add" && (
            <AddVehicleForm
              onBack={() => {
                setPendingPlateNumber(null);
                setCurrentScreen("list");
              }}
              onSave={handleAddVehicle}
              initialPlateNumber={pendingPlateNumber || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;