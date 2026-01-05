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
            
            // Nhận diện với 2 lần: lần 1 (eng), lần 2 (eng + digit focus)
            Tesseract.recognize(processedImage, 'eng', tesseractConfig)
            .then(({ data: { text, confidence } }) => {
                // Làm sạch text - chỉ giữ A-Z, 0-9
                let cleanText = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                
                // Validate format biển số Việt Nam: XX[A-Z]XXXXX (ít nhất 8 ký tự)
                const platePattern = /^[0-9]{2}[A-Z][0-9]{4,5}$/;
                const isValidFormat = platePattern.test(cleanText);
                
                // Tính confidence score (từ 0-100)
                let confidenceScore = Math.min(100, Math.max(0, confidence || 75));
                
                // Nếu format không đúng, hạ confidence
                if (!isValidFormat && cleanText.length > 3) {
                    confidenceScore *= 0.7; // Hạ 30% nếu format sai
                }
                
                // Filter ký tự không hợp lý (VD: O thay vì 0)
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

// ========== IMAGE ENHANCEMENT ==========
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
            
            // Tăng contrast & brightness
            for (let i = 0; i < data.length; i += 4) {
                // Grayscale conversion
                const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                
                // Tăng contrast: multiply by factor, add bias
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
        // Fallback: return original nếu enhance fail
        return Promise.resolve(imageDataUrl);
    }
}

// ========== FILTER COMMON OCR MISTAKES ==========
function filterCommonMisreads(text) {
    // Replace common OCR mistakes trong biển số xe
    const replacements = {
        'O': '0',    // Letter O → digit 0
        'I': '1',    // Letter I → digit 1
        'S': '5',    // Letter S → digit 5
        'Z': '2',    // Letter Z → digit 2
        'L': '1',    // Letter L → digit 1
        'B': '8',    // Letter B → digit 8 (in some contexts)
        // Nhưng không replace nếu ở vị trí chữ cái (vị trí 2)
    };
    
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        // Position 2 phải là chữ cái (không replace)
        if (i === 2) {
            if (/^[A-Z]$/.test(char)) {
                result += char;
            } else if (char === '0') {
                result += 'O'; // 0 → O ở vị trí chữ cái
            }
        } else {
            // Vị trí khác: replace nếu là chữ cái phải là số
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
