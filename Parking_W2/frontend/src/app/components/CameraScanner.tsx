import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Scan, Check, Upload, AlertCircle, Flashlight, FlashlightOff, Sun, Contrast } from "lucide-react";
import { createWorker } from 'tesseract.js';

interface CameraScannerProps {
  onBack: () => void;
  onScanned: (plateNumber: string) => void;
}

export function CameraScanner({ onBack, onScanned }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedPlate, setDetectedPlate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Clear error
      setCameraError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Your browser does not support camera. Please use Chrome, Firefox or Safari.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", 
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => console.error('Play error:', err));
        };
        // Ensure video plays
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playing successfully');
            })
            .catch(error => {
              console.error('Error playing video:', error);
              // Try again after a short delay
              setTimeout(() => {
                videoRef.current?.play().catch(err => console.error('Retry play failed:', err));
              }, 500);
            });
        }
      }
      setStream(mediaStream);
      setIsScanning(true);

      // Check if flash/torch is available
      try {
        const track = mediaStream.getVideoTracks()[0];
        if (track) {
          const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
          setHasFlash(capabilities?.torch === true);
        }
      } catch (err) {
        console.log("Could not check flash capability:", err);
      }
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Cannot access camera.";
      
      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          errorMessage = "❌ You have denied camera permission.\n\n➡️ How to grant permission:\n\n📱 Android: Settings > Apps > [App] > Permissions > Camera\n\n🍎 iPhone: Settings > Privacy > Camera > [App]\n\n💻 PC: Chrome > Settings > Privacy > Site settings > Camera > Allow";
        } else if (error.name === "NotFoundError") {
          errorMessage = "⚠️ No camera found on this device.\n\nPlease check if your device has a camera.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "⚠️ Camera is being used by another application.\n\nPlease close other applications and try again.";
        } else if (error.name === "TypeError") {
          errorMessage = "❌ Browser does not support camera or HTTPS is not configured.\n\nPlease use HTTPS or localhost.";
        }
      }
      
      setCameraError(errorMessage);
      setIsScanning(false);
    }
  };

  const toggleFlash = async () => {
    if (!stream || !hasFlash) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      await track.applyConstraints({
        // @ts-ignore - torch is not in TypeScript types yet
        advanced: [{ torch: !flashEnabled }]
      });
      setFlashEnabled(!flashEnabled);
    } catch (error) {
      console.error("Error toggling flash:", error);
    }
  };

  const stopCamera = () => {
    try {
      // Stop video element
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      
      // Stop all tracks
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        setStream(null);
      }
      
      setIsScanning(false);
      setCameraError(null);
      console.log('Camera stopped successfully');
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        setCameraError(null);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        console.error('Could not get canvas context');
        return;
      }

      // Check if video is ready and has dimensions
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('Video not ready for capture:', {
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log('Capturing image:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        brightness,
        contrast,
        videoPlaying: !video.paused,
        videoCurrentTime: video.currentTime
      });

      // Clear canvas first
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Reset canvas transform and filters
      context.resetTransform();
      context.filter = 'none';

      try {
        // Draw the video directly to canvas
        // The CSS transforms on the video element will be ignored by drawImage
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Apply brightness and contrast filters after drawing
        if (brightness !== 100 || contrast !== 100) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Apply brightness and contrast
          const brightnessMultiplier = brightness / 100;
          const contrastMultiplier = contrast / 100;
          const contrastOffset = 128 * (1 - contrastMultiplier);

          for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            data[i] = Math.min(255, data[i] * brightnessMultiplier);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * brightnessMultiplier); // Green
            data[i + 2] = Math.min(255, data[i + 2] * brightnessMultiplier); // Blue
            // Apply contrast
            data[i] = Math.max(0, (data[i] - 128) * contrastMultiplier + 128 + contrastOffset);
            data[i + 1] = Math.max(0, (data[i + 1] - 128) * contrastMultiplier + 128 + contrastOffset);
            data[i + 2] = Math.max(0, (data[i + 2] - 128) * contrastMultiplier + 128 + contrastOffset);
          }

          context.putImageData(imageData, 0, 0);
        }

        // Convert to data URL
        const imageData = canvas.toDataURL("image/jpeg", 0.95);
        console.log('Captured image data URL length:', imageData.length);

        setCapturedImage(imageData);
        setIsScanning(false);
        processImage(imageData);

      } catch (error) {
        console.error('Error capturing image:', error);
      }
    } else {
      console.error('Video or canvas ref not available');
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      // Initialize Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          // You can add progress tracking here if needed
          // console.log(m);
        }
      });

      // Recognize text from image
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      // Extract license plate pattern from recognized text
      // Vietnamese license plate patterns: 12A-12345, 12AB-12345, 12A-123.45, etc.
      const platePattern = /\d{2}[A-Z]{1,2}[-\s]?\d{3,5}\.?\d{0,2}/g;
      const matches = text.match(platePattern);
      
      let detectedPlateNumber = "";
      if (matches && matches.length > 0) {
        // Clean up the detected plate
        detectedPlateNumber = matches[0]
          .replace(/\s/g, '')  // Remove spaces
          .replace(/[^\dA-Z\-\.]/g, '')  // Keep only numbers, letters, hyphens, and dots
          .toUpperCase();
      }

      // If no plate detected, try to extract any alphanumeric sequence
      if (!detectedPlateNumber) {
        const alphanumeric = text.replace(/[^A-Z0-9]/gi, '');
        if (alphanumeric.length >= 5) {
          // Format as best guess
          detectedPlateNumber = alphanumeric.substring(0, 8).toUpperCase();
        }
      }

      setDetectedPlate(detectedPlateNumber);
      setIsProcessing(false);
      
    } catch (error) {
      console.error("OCR Error:", error);
      setIsProcessing(false);
      // Fallback to empty - user can manually edit
      setDetectedPlate("");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setDetectedPlate("");
    setIsScanning(true);
    startCamera();
  };

  const confirmPlate = () => {
    if (detectedPlate) {
      stopCamera();
      onScanned(detectedPlate);
    }
  };

  const handleManualEdit = (value: string) => {
    setDetectedPlate(value.toUpperCase());
  };

  return (
    <div className="h-full bg-black relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={() => {
              stopCamera();
              setTimeout(() => {
                onBack();
              }, 100);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-medium">Back</span>
          </button>
          <h1 className="text-lg font-semibold">Scan license plate</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Camera Error / Fallback Upload */}
      {cameraError && !capturedImage && (
        <div className="h-full w-full flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Camera Error</h2>
              <p className="text-gray-600 text-sm whitespace-pre-line">{cameraError}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <Camera className="w-5 h-5" />
                Try again
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload photo
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> To use camera:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Click the camera icon on the address bar</li>
                  <li>Select "Allow" for camera access</li>
                  <li>Reload the page if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View */}
      {isScanning && !capturedImage && !cameraError && (
        <div className="relative h-full w-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={true}
            className="w-full h-full object-cover bg-black"
            style={{ 
              transform: 'scaleX(-1)',
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              WebkitTransform: 'scaleX(-1)',
              WebkitFilter: `brightness(${brightness}%) contrast(${contrast}%)`
            }}
          />
          
          {/* Controls Panel */}
          <div className="absolute top-20 right-4 z-20 flex flex-col gap-3">
            {/* Flash Toggle */}
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className={`p-3 rounded-full transition-all ${
                  flashEnabled 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-gray-700/80 backdrop-blur text-white'
                }`}
                title="Flash light"
              >
                {flashEnabled ? (
                  <Flashlight className="w-6 h-6" />
                ) : (
                  <FlashlightOff className="w-6 h-6" />
                )}
              </button>
            )}
            
            {/* Brightness Control */}
            <div className="bg-gray-700/80 backdrop-blur rounded-lg p-3 w-14">
              <div className="flex items-center justify-center mb-2">
                <Sun className="w-5 h-5 text-yellow-300" />
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                title="Brightness"
              />
              <div className="text-xs text-white text-center mt-1">{brightness}%</div>
            </div>
            
            {/* Contrast Control */}
            <div className="bg-gray-700/80 backdrop-blur rounded-lg p-3 w-14">
              <div className="flex items-center justify-center mb-2">
                <Contrast className="w-5 h-5 text-blue-300" />
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                title="Contrast"
              />
              <div className="text-xs text-white text-center mt-1">{contrast}%</div>
            </div>
          </div>
          
          {/* Scanning Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Corner Brackets */}
              <div className="relative w-80 h-48 border-4 border-transparent">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-400"></div>
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-400"></div>
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-400"></div>
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-400"></div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="animate-scan-line h-1 bg-green-400 shadow-lg shadow-green-400/50"></div>
                </div>
              </div>
              
              <p className="text-white text-center mt-4 text-sm bg-black/50 px-4 py-2 rounded-full">
                <Scan className="inline w-4 h-4 mr-2" />
                Align license plate into frame
              </p>
            </div>
          </div>

          {/* Capture Button */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 bg-gray-700/80 backdrop-blur rounded-full flex items-center justify-center shadow-xl hover:bg-gray-600/80 transition-colors text-white"
            >
              <Upload className="w-6 h-6" />
            </button>
            <button
              onClick={captureImage}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform border-4 border-gray-300"
            >
              <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-600"></div>
            </button>
            <div className="w-14 h-14"></div> {/* Spacer for balance */}
          </div>
        </div>
      )}

      {/* Captured Image Processing */}
      {capturedImage && (
        <div className="h-full w-full flex flex-col overflow-y-auto">
          <div className="flex-shrink-0 relative bg-black min-h-64 max-h-96">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-contain"
            />
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
                  <p className="text-white text-lg font-medium">Recognizing license plate...</p>
                  <p className="text-white/70 text-sm mt-2">Using AI OCR</p>
                </div>
              </div>
            )}
          </div>

          {/* Result Panel */}
          {!isProcessing && (
            <div className="bg-white rounded-t-3xl p-4 space-y-3 flex-1 overflow-y-auto">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-2">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  {detectedPlate ? "Recognized" : "Could not recognize"}
                </h2>
                {!detectedPlate && (
                  <p className="text-xs text-gray-500 mt-1">Please enter manually</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  License plate {detectedPlate ? "scanned" : "(manual entry)"}
                </label>
                <input
                  type="text"
                  value={detectedPlate}
                  onChange={(e) => handleManualEdit(e.target.value)}
                  className="w-full px-3 py-3 text-xl font-bold text-center uppercase bg-yellow-50 border-2 border-yellow-400 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Ex: 29A-12345"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  You can edit the license plate if needed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={retakePhoto}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Retake
                </button>
                <button
                  onClick={confirmPlate}
                  disabled={!detectedPlate}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Check className="w-4 h-4" />
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden Canvas for Image Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Custom CSS for scanning animation */}
      <style>{`
        @keyframes scan-line {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(192px);
          }
        }
        
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
