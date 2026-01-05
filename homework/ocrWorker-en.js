// OCR Web Worker - Runs Tesseract.js on separate thread
// Does not block main UI thread
// Optimized for Vietnamese license plates

// Load Tesseract.js CDN
importScripts('https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js');

let tesseractWorker = null;
let tesseractReady = false;

// Initialize Tesseract when worker starts
self.onmessage = function(e) {
    const { type, image, enhanceImage } = e.data;

    if (type === 'init') {
        // Initialize Tesseract worker with optimization
        try {
            Tesseract.createWorker().then(worker => {
                tesseractWorker = worker;
                tesseractReady = true;
                self.postMessage({ type: 'ready', message: 'Tesseract ready' });
            }).catch(err => {
                self.postMessage({ type: 'error', message: 'Tesseract initialization error: ' + err.message });
            });
        } catch (err) {
            self.postMessage({ type: 'error', message: 'Tesseract load error: ' + err.message });
        }
    } 
    else if (type === 'recognize' && image) {
        if (!tesseractReady) {
            self.postMessage({ type: 'error', message: 'Tesseract not ready' });
            return;
        }
        
        // Process OCR with optimization
        try {
            // Image processing: enhance contrast, resize if needed
            const processedImage = enhanceImage ? enhanceImageQuality(image) : image;
            
            // Tesseract config optimized for license plates
            const tesseractConfig = {
                logger: m => {
                    if (m.status === 'recognizing') {
                        self.postMessage({ 
                            type: 'progress', 
                            progress: Math.round(m.progress * 100) 
                        });
                    }
                }
            };
            
            // Recognize with optimization: english language for license plates
            Tesseract.recognize(processedImage, 'eng', tesseractConfig)
            .then(({ data: { text, confidence } }) => {
                // Clean text - keep only A-Z, 0-9
                let cleanText = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                
                // Validate format for Vietnamese license plate: XX[A-Z]XXXXX (minimum 8 chars)
                const platePattern = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
                const isValidFormat = platePattern.test(cleanText);
                
                // Calculate confidence score (0-100)
                let confidenceScore = Math.min(100, Math.max(0, confidence || 75));
                
                // If format is incorrect, reduce confidence
                if (!isValidFormat && cleanText.length > 3) {
                    confidenceScore *= 0.7; // Reduce by 30% if format wrong
                }
                
                // Filter unreasonable characters (e.g., O instead of 0)
                cleanText = filterCommonMisreads(cleanText);
                
                self.postMessage({ 
                    type: 'result', 
                    text: cleanText,
                    rawText: text,
                    confidence: Math.round(confidenceScore),
                    isValidFormat: isValidFormat,
                    recommendConfirm: confidenceScore < 80
                });
            })
            .catch(err => {
                self.postMessage({ 
                    type: 'error', 
                    message: 'Image processing error: ' + err.message 
                });
            });
        } catch (err) {
            self.postMessage({ 
                type: 'error', 
                message: 'Exception: ' + err.message 
            });
        }
    }
};

// ========== IMAGE ENHANCEMENT ==========
// Enhance image quality: increase contrast and brightness for better OCR
function enhanceImageQuality(imageDataUrl) {
    try {
        const canvas = new OffscreenCanvas(800, 300);
        const ctx = canvas.getContext('2d');
        
        // Create image from data URL
        const img = new Image();
        img.onload = function() {
            // Draw original image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Increase contrast & brightness
            for (let i = 0; i < data.length; i += 4) {
                // Grayscale conversion
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                
                // Increase contrast: multiply by factor, add bias
                const contrast = 1.5;
                const brightness = 20;
                const value = Math.min(255, Math.max(0, gray * contrast + brightness));
                
                data[i] = value;     // R
                data[i + 1] = value; // G
                data[i + 2] = value; // B
            }
            
            ctx.putImageData(imageData, 0, 0);
        };
        img.src = imageDataUrl;
        
        return canvas.convertToBlob().then(blob => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        });
    } catch (err) {
        // Fallback: return original if enhancement fails
        return Promise.resolve(imageDataUrl);
    }
}

// ========== FILTER COMMON OCR MISTAKES ==========
// Common OCR misreadings in license plate recognition
function filterCommonMisreads(text) {
    // Replace common OCR mistakes in license plates
    const replacements = {
        'O': '0',    // Letter O → digit 0
        'I': '1',    // Letter I → digit 1
        'S': '5',    // Letter S → digit 5
        'Z': '2',    // Letter Z → digit 2
        'L': '1',    // Letter L → digit 1
        'B': '8',    // Letter B → digit 8 (in some contexts)
        // But do not replace if at letter position (position 2)
    };
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        // Position 2 must be a letter (do not replace)
        if (i === 2) {
            if (/^[A-Z]$/.test(char)) {
                result += char;
            } else if (char === '0') {
                result += 'O'; // 0 → O at letter position
            }
        } else {
            // Other positions: replace if letter should be digit
            if (/^[0-9]$/.test(char)) {
                result += char;
            } else if (i === 2 && /^[A-Z]$/.test(char)) {
                result += char;
            } else if (/^[A-Z]$/.test(char)) {
                result += replacements[char] || char;
            }
        }
    }
    
    return result;
}
