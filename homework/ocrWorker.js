// OCR Web Worker - Chạy Tesseract.js trên thread riêng
// Không ảnh hưởng đến UI chính
// Tối ưu hóa cho biển số xe Việt Nam

// Load Tesseract.js CDN
importScripts('https://unpkg.com/tesseract.js@v4.1.1/dist/tesseract.min.js');

let tesseractWorker = null;
let tesseractReady = false;

// Khởi tạo Tesseract khi worker bắt đầu
self.onmessage = function(e) {
    const { type, image, enhanceImage } = e.data;

    if (type === 'init') {
        // Khởi tạo Tesseract worker với tối ưu
        try {
            Tesseract.createWorker().then(worker => {
                tesseractWorker = worker;
                tesseractReady = true;
                self.postMessage({ type: 'ready', message: 'Tesseract ready' });
            }).catch(err => {
                self.postMessage({ type: 'error', message: 'Lỗi khởi tạo Tesseract: ' + err.message });
            });
        } catch (err) {
            self.postMessage({ type: 'error', message: 'Lỗi load Tesseract: ' + err.message });
        }
    } 
    else if (type === 'recognize' && image) {
        if (!tesseractReady) {
            self.postMessage({ type: 'error', message: 'Tesseract chưa sẵn sàng' });
            return;
        }
        
        // Xử lý OCR với tối ưu hóa
        try {
            // Xử lý ảnh: enhance contrast, resize nếu cần
            const processedImage = enhanceImage ? enhanceImageQuality(image) : image;
            
            // Tesseract config tối ưu cho biển số xe
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
            
            // Nhận diện với tối ưu: English language cho biển số
            Tesseract.recognize(processedImage, 'eng', tesseractConfig)
            .then(({ data: { text, confidence } }) => {
                // STEP 1: Làm sạch text - chỉ giữ A-Z, 0-9
                let cleanText = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                
                // STEP 2: Áp dụng advanced OCR text correction
                cleanText = correctOCRText(cleanText);
                
                // STEP 3: Validate format biển số Việt Nam
                const platePattern = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
                const isValidFormat = platePattern.test(cleanText);
                
                // STEP 4: Tính confidence score nâng cao
                let confidenceScore = calculateConfidenceScore(confidence, cleanText, isValidFormat);
                
                // STEP 5: Áp dụng penalty format nếu cần
                if (!isValidFormat && cleanText.length > 3) {
                    confidenceScore *= 0.6; // Hạ 40% nếu format sai
                }
                
                // STEP 6: Đảm bảo confidence trong phạm vi
                confidenceScore = Math.min(100, Math.max(0, Math.round(confidenceScore)));
                
                self.postMessage({ 
                    type: 'result', 
                    text: cleanText,
                    rawText: text,
                    confidence: confidenceScore,
                    isValidFormat: isValidFormat,
                    recommendConfirm: confidenceScore < 85  // Nâng từ 80%
                });
            })
            .catch(err => {
                self.postMessage({ 
                    type: 'error', 
                    message: 'Lỗi xử lý ảnh: ' + err.message 
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
// Tính confidence score dựa trên nhiều yếu tố
function calculateConfidenceScore(baseConfidence, text, isValidFormat) {
    // Bắt đầu với base confidence từ Tesseract
    let score = Math.min(100, Math.max(0, baseConfidence || 75));
    
    // Yếu tố 1: Text length bonus
    if (text.length >= 8) {
        score = Math.min(100, score + 5);  // Bonus cho độ dài đúng
    }
    
    // Yếu tố 2: Character composition check
    let digitCount = 0;
    let letterCount = 0;
    
    for (let i = 0; i < text.length; i++) {
        if (/^[0-9]$/.test(text[i])) digitCount++;
        if (/^[A-Z]$/.test(text[i])) letterCount++;
    }
    
    // Penalize nếu tỷ lệ không đúng
    const expectedDigits = 7;
    const expectedLetters = 1;
    
    if (Math.abs(digitCount - expectedDigits) <= 1 && letterCount === expectedLetters) {
        score = Math.min(100, score + 3);  // Good composition
    } else if (digitCount < 5 || letterCount > 2) {
        score = Math.max(0, score - 15);  // Bad composition
    }
    
    // Yếu tố 3: Format validation bonus
    if (isValidFormat) {
        score = Math.min(100, score + 8);  // Good format bonus
    }
    
    // Đảm bảo score hợp lệ
    return Math.round(Math.min(100, Math.max(0, score)));
}

// ========== IMAGE ENHANCEMENT ==========
// Tăng cường chất lượng ảnh: tăng contrast, brightness cho OCR tốt hơn
function enhanceImageQuality(imageDataUrl) {
    try {
        const canvas = new OffscreenCanvas(800, 300);
        const ctx = canvas.getContext('2d');
        
        // Create image từ data URL
        const img = new Image();
        img.onload = function() {
            // Draw original image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Lấy image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // STEP 1: Tính histogram cho adaptive contrast
            const histogram = new Array(256).fill(0);
            for (let i = 0; i < data.length; i += 4) {
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                histogram[Math.floor(gray)]++;
            }
            
            // STEP 2: Áp dụng Contrast Limited Adaptive Histogram Equalization (CLAHE)
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
                const contrast = 1.8;  // Nâng từ 1.5
                const brightness = 30;
                const value = Math.min(255, Math.max(0, normalized * contrast + brightness));
                
                data[i] = value;     // R
                data[i + 1] = value; // G
                data[i + 2] = value; // B
            }
            
            // STEP 3: Áp dụng morphological dilation
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
        // Fallback: return original nếu enhance fail
        return Promise.resolve(imageDataUrl);
    }
}

// ========== MORPHOLOGICAL DILATION ==========
// Cải thiện character separation và edge clarity
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
// Lọc lỗi OCR phổ biến trong nhận diện biển số xe với xử lý theo vị trí
function filterCommonMisreads(text) {
    // Định dạng biển số Việt Nam: 29A12345
    // Vị trí: 0-1 (số), 2 (chữ), 3-7 (số)
    
    const numberCharReplacements = {
        'O': '0',    // Letter O → digit 0 (rất phổ biến)
        'Q': '0',    // Letter Q → digit 0
        'S': '5',    // Letter S → digit 5
        'Z': '2',    // Letter Z → digit 2
        'G': '9',    // Letter G → digit 9
        'B': '8',    // Letter B → digit 8
        'I': '1',    // Letter I → digit 1
        'L': '1',    // Letter L → digit 1
    };
    
    const letterNumberReplacements = {
        '0': 'O',    // digit 0 → Letter O (ở vị trí chữ)
        '1': 'I',    // digit 1 → Letter I (ở vị trí chữ)
        '5': 'S',    // digit 5 → Letter S (ở vị trí chữ)
        '2': 'Z',    // digit 2 → Letter Z (ở vị trí chữ)
    };
    
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        // Vị trí 2 phải là CHỮ CÁI (định dạng biển số Việt Nam)
        if (i === 2) {
            if (/^[A-Z]$/.test(char)) {
                // Đã là chữ, giữ nguyên
                result += char;
            } else if (letterNumberReplacements[char]) {
                // Chuyển số thành chữ
                result += letterNumberReplacements[char];
            } else if (/^[0-9]$/.test(char)) {
                // Số ở vị trí chữ - cố gắng chuyển
                const converted = letterNumberReplacements[char];
                result += converted || 'A'; // Default 'A' nếu không thể chuyển
            } else {
                // Ký tự không biết - thay bằng 'A'
                result += 'A';
            }
        } 
        // Vị trí 0, 1, 3-7 phải là SỐ
        else {
            if (/^[0-9]$/.test(char)) {
                // Đã là số, giữ nguyên
                result += char;
            } else if (numberCharReplacements[char]) {
                // Thay chữ bằng số
                result += numberCharReplacements[char];
            } else if (/^[A-Z]$/.test(char)) {
                // Chữ ở vị trí số - cố gắng thay
                const converted = numberCharReplacements[char];
                result += converted || char; // Giữ nguyên nếu không thể thay
            } else {
                // Ký tự không biết - thay bằng '0'
                const converted = numberCharReplacements[char] || '0';
                result += converted;
            }
        }
    }
    
    return result;
}

// ========== ADVANCED TEXT CORRECTION ==========
// Post-processing correction sử dụng common Vietnamese plate patterns
function correctOCRText(text) {
    // Đảm bảo độ dài tối thiểu
    if (text.length < 8) {
        text = text + '0'.repeat(8 - text.length); // Pad với zeros nếu quá ngắn
    }
    
    // Lấy chỉ 9 ký tự đầu tiên tối đa
    text = text.substring(0, 9);
    
    // Áp dụng filtering
    text = filterCommonMisreads(text);
    
    // Final validation - đảm bảo format XX[A-Z]XXXXX
    const validFormat = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
    
    if (!validFormat.test(text)) {
        // Cố gắng sửa bằng cách điều chỉnh vị trí 2
        if (text.length > 2) {
            let chars = text.split('');
            
            // Đảm bảo vị trí 2 là chữ cái
            if (!/^[A-Z]$/.test(chars[2])) {
                chars[2] = 'A'; // Default thành A nếu không là chữ
            }
            
            // Loại bỏ ký tự không phải alphanumeric ở cuối
            chars = chars.filter((c, i) => 
                /^[A-Z0-9]$/.test(c) || (i <= 2 && /^[A-Z0-9]$/.test(c))
            );
            
            text = chars.join('');
        }
    }
    
    return text.toUpperCase();
}
