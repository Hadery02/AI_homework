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
                // STEP 1: Clean text - keep only A-Z, 0-9
                let cleanText = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                
                // STEP 2: Apply advanced OCR text correction
                cleanText = correctOCRText(cleanText);
                
                // STEP 3: Validate format for Vietnamese license plate
                const platePattern = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
                const isValidFormat = platePattern.test(cleanText);
                
                // STEP 4: Calculate advanced confidence score
                let confidenceScore = calculateConfidenceScore(confidence, cleanText, isValidFormat);
                
                // STEP 5: Apply format penalty if needed
                if (!isValidFormat && cleanText.length > 3) {
                    confidenceScore *= 0.6; // Reduce by 40% if format wrong (increased from 30%)
                }
                
                // STEP 6: Ensure confidence is within bounds
                confidenceScore = Math.min(100, Math.max(0, Math.round(confidenceScore)));
                
                self.postMessage({ 
                    type: 'result', 
                    text: cleanText,
                    rawText: text,
                    confidence: confidenceScore,
                    isValidFormat: isValidFormat,
                    recommendConfirm: confidenceScore < 85  // Raised from 80% for stricter validation
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

// ========== ADVANCED CONFIDENCE CALCULATION ==========
// Calculate confidence score based on multiple factors
function calculateConfidenceScore(baseConfidence, text, isValidFormat) {
    // Start with base confidence from Tesseract
    let score = Math.min(100, Math.max(0, baseConfidence || 75));
    
    // Factor 1: Text length bonus (longer valid text = more confident)
    if (text.length >= 8) {
        score = Math.min(100, score + 5);  // Bonus for correct length
    }
    
    // Factor 2: Character composition check
    let digitCount = 0;
    let letterCount = 0;
    
    for (let i = 0; i < text.length; i++) {
        if (/^[0-9]$/.test(text[i])) digitCount++;
        if (/^[A-Z]$/.test(text[i])) letterCount++;
    }
    
    // Penalize if mix is wrong (should have ~7 digits and 1 letter for 8-char plate)
    const expectedDigits = 7;
    const expectedLetters = 1;
    
    if (Math.abs(digitCount - expectedDigits) <= 1 && letterCount === expectedLetters) {
        score = Math.min(100, score + 3);  // Good composition
    } else if (digitCount < 5 || letterCount > 2) {
        score = Math.max(0, score - 15);  // Bad composition
    }
    
    // Factor 3: Format validation bonus
    if (isValidFormat) {
        score = Math.min(100, score + 8);  // Good format bonus
    }
    
    // Ensure score is valid
    return Math.round(Math.min(100, Math.max(0, score)));
}

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
            
            // STEP 1: Calculate histogram for adaptive contrast
            const histogram = new Array(256).fill(0);
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                histogram[Math.floor(gray)]++;
            }
            
            // STEP 2: Apply Contrast Limited Adaptive Histogram Equalization (CLAHE)
            // This improves local contrast without oversaturation
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                
                // Calculate cumulative histogram
                let cumulativeSum = 0;
                for (let j = 0; j < Math.floor(gray); j++) {
                    cumulativeSum += histogram[j];
                }
                
                // Normalize to 0-255 range
                const normalized = (cumulativeSum / (canvas.width * canvas.height)) * 255;
                
                // Apply contrast and brightness with adaptive scaling
                const contrast = 1.8;  // Increased from 1.5
                const brightness = 30;
                const value = Math.min(255, Math.max(0, normalized * contrast + brightness));
                
                data[i] = value;     // R
                data[i + 1] = value; // G
                data[i + 2] = value; // B
            }
            
            // STEP 3: Apply morphological dilation for better character separation
            const dilatedData = dilateImage(data, canvas.width, canvas.height);
            
            ctx.putImageData(new ImageData(dilatedData, canvas.width, canvas.height), 0, 0);
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

// ========== MORPHOLOGICAL DILATION ==========
// Improve character separation and edge clarity
function dilateImage(imageData, width, height) {
    const kernel = 3; // 3x3 kernel
    const result = new Uint8ClampedArray(imageData.length);
    
    for (let i = 0; i < imageData.length; i += 4) {
        const pixelIndex = i / 4;
        const row = Math.floor(pixelIndex / width);
        const col = pixelIndex % width;
        
        let maxValue = imageData[i]; // Current pixel value
        
        // Check 3x3 neighborhood
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const newRow = row + dy;
                const newCol = col + dx;
                
                if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
                    const neighborIndex = (newRow * width + newCol) * 4;
                    maxValue = Math.max(maxValue, imageData[neighborIndex]);
                }
            }
        }
        
        // Apply dilation
        result[i] = maxValue;     // R
        result[i + 1] = maxValue; // G
        result[i + 2] = maxValue; // B
        result[i + 3] = imageData[i + 3]; // Keep alpha
    }
    
    return result;
}

// ========== FILTER COMMON OCR MISTAKES ==========
// Common OCR misreadings in license plate recognition with position-aware filtering
function filterCommonMisreads(text) {
    // Vietnamese license plate format: 29A12345
    // Position: 0-1 (digits), 2 (letter), 3-7 (digits)
    
    const numberCharReplacements = {
        'O': '0',    // Letter O → digit 0 (very common)
        'Q': '0',    // Letter Q → digit 0
        'S': '5',    // Letter S → digit 5
        'Z': '2',    // Letter Z → digit 2
        'G': '9',    // Letter G → digit 9
        'B': '8',    // Letter B → digit 8
        'I': '1',    // Letter I → digit 1
        'L': '1',    // Letter L → digit 1
    };
    
    const letterNumberReplacements = {
        '0': 'O',    // digit 0 → Letter O (at letter position)
        '1': 'I',    // digit 1 → Letter I (at letter position)
        '5': 'S',    // digit 5 → Letter S (at letter position)
        '2': 'Z',    // digit 2 → Letter Z (at letter position)
    };
    
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        // Position 2 must be a LETTER (Vietnamese plate format)
        if (i === 2) {
            if (/^[A-Z]$/.test(char)) {
                // Already a letter, keep it
                result += char;
            } else if (letterNumberReplacements[char]) {
                // Convert digit to letter
                result += letterNumberReplacements[char];
            } else if (/^[0-9]$/.test(char)) {
                // Digit at letter position - try to convert
                const converted = letterNumberReplacements[char];
                result += converted || 'A'; // Default to 'A' if can't convert
            } else {
                // Unknown char - skip or replace with 'A'
                result += 'A';
            }
        } 
        // Positions 0, 1, 3-7 must be DIGITS
        else {
            if (/^[0-9]$/.test(char)) {
                // Already a digit, keep it
                result += char;
            } else if (numberCharReplacements[char]) {
                // Replace letter with digit
                result += numberCharReplacements[char];
            } else if (/^[A-Z]$/.test(char)) {
                // Letter at digit position - try to replace
                const converted = numberCharReplacements[char];
                result += converted || char; // Keep original if no replacement
            } else {
                // Unknown char - try to find best match
                const converted = numberCharReplacements[char] || '0';
                result += converted;
            }
        }
    }
    
    return result;
}

// ========== ADVANCED TEXT CORRECTION ==========
// Post-processing correction using common Vietnamese plate patterns
function correctOCRText(text) {
    // Ensure minimum length
    if (text.length < 8) {
        text = text + '0'.repeat(8 - text.length); // Pad with zeros if too short
    }
    
    // Take only first 9 characters max
    text = text.substring(0, 9);
    
    // Apply common mistake filtering
    text = filterCommonMisreads(text);
    
    // Final validation - ensure format matches XX[A-Z]XXXXX
    const validFormat = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
    
    if (!validFormat.test(text)) {
        // Try to fix by adjusting character at position 2
        if (text.length > 2) {
            let chars = text.split('');
            
            // Ensure position 2 is always a letter
            if (!/^[A-Z]$/.test(chars[2])) {
                chars[2] = 'A'; // Default to A if not a letter
            }
            
            // Remove any non-alphanumeric at the end
            chars = chars.filter((c, i) => 
                /^[A-Z0-9]$/.test(c) || (i <= 2 && /^[A-Z0-9]$/.test(c))
            );
            
            text = chars.join('');
        }
    }
    
    return text.toUpperCase();
}
