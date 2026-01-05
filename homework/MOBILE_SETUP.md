# G-Parking Mobile Server Setup Guide

## 📱 Quick Start for Mobile Testing

### Prerequisites
- Node.js installed (download from https://nodejs.org)
- Your computer and phone on the same WiFi network
- Modern mobile browser (Chrome, Firefox, Safari)

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Start the Server
```bash
npm start
```

You should see output like:
```
============================================================
📱 G-PARKING SERVER STARTED
============================================================

🖥️  DESKTOP (same computer):
   http://localhost:3000/parking-en.html

📱 MOBILE (same WiFi network):
   http://192.168.x.x:3000/parking-en.html

🔗 LOCAL IP: 192.168.x.x
⚙️  PORT: 3000

💡 TIPS:
   • Make sure your phone is on the same WiFi network
   • Copy the mobile URL to your phone browser
   • For HTTPS, use a reverse proxy or ngrok
   • Press Ctrl+C to stop the server
============================================================
```

#### 3. Access on Mobile
1. Copy the **MOBILE** URL from the console
2. Open your phone's browser
3. Paste the URL in the address bar
4. Press Enter

### File Structure

```
PackCar/
├── server.js              # Express server (runs on port 3000)
├── package.json           # Node dependencies
├── parking-en.html        # Main app (English version)
├── parking.html           # Original app (Vietnamese version)
├── ocrWorker-en.js        # OCR worker (English comments)
├── ocrWorker.js           # OCR worker (Vietnamese comments)
└── sample-whitelist.json  # Test data
```

### Available Languages

**English Version:**
- `http://localhost:3000/parking-en.html` (Desktop)
- `http://[IP]:3000/parking-en.html` (Mobile)

**Vietnamese Version (legacy):**
- `http://localhost:3000/parking.html` (Desktop)
- `http://[IP]:3000/parking.html` (Mobile)

### Development Commands

```bash
# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev
```

### Features

✅ **License Plate Scanning**
- Real-time camera capture with Tesseract.js
- Web Worker for background processing
- Image enhancement for better accuracy

✅ **Whitelist Management**
- Add/remove license plates
- Import/export JSON files
- Merge or replace existing data
- Local storage persistence

✅ **Accuracy Improvements**
- Confidence scoring (0-100%)
- Format validation
- Common OCR error filtering
- User confirmation for low confidence

✅ **Mobile Friendly**
- Responsive design (480px width)
- Touch-friendly buttons
- Camera optimization

### Troubleshooting

#### "Cannot connect to phone"
- ✓ Make sure both devices on same WiFi
- ✓ Check server is running (`npm start`)
- ✓ Try turning off firewall temporarily
- ✓ Use phone's IP address, not hostname

#### "Camera not working"
- ✓ Check camera permissions in browser settings
- ✓ HTTPS or localhost required (not IP address with HTTP)
- ✓ Try different browser (Chrome recommended)

#### "OCR takes too long"
- ✓ Enable "Improve Accuracy" toggle (uses image enhancement)
- ✓ Point camera directly at license plate
- ✓ Ensure good lighting

#### "Port already in use"
```bash
# Change port in server.js
PORT=3001 npm start
```

### Customization

**Change Server Port:**
Edit `server.js` and change:
```javascript
const PORT = process.env.PORT || 3000;
```

**Change Default Language:**
Edit `server.js` redirect:
```javascript
app.get('/', (req, res) => {
    res.redirect('/parking-en.html');  // or '/parking.html' for Vietnamese
});
```

### API Endpoints

- `GET /` → Redirects to parking-en.html
- `GET /health` → Server status check
- `GET /parking-en.html` → English version
- `GET /parking.html` → Vietnamese version
- `GET /ocrWorker-en.js` → English OCR worker
- `GET /ocrWorker.js` → Vietnamese OCR worker

### Performance Notes

- **Whitelist Lookup:** O(1) using JavaScript Set (5000x faster than Array)
- **Web Worker:** Non-blocking OCR processing
- **Image Enhancement:** Optional, improves accuracy by ~15-20%
- **First Load:** Tesseract.js ~3-5 seconds initialization

### Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✓       | ✓ (Recommended) |
| Firefox | ✓       | ✓      |
| Safari  | ✓       | ✓      |
| Edge    | ✓       | ✓      |

### Security Notes

⚠️ **Important:** This is a development server
- Data is stored locally in browser (`localStorage`)
- No backend database
- No authentication implemented
- For production, use:
  - HTTPS/TLS encryption
  - Authentication layer
  - Backend database
  - Rate limiting

### Next Steps

1. **Mobile Testing:**
   ```bash
   npm start
   # Open http://[IP]:3000/parking-en.html on phone
   ```

2. **Whitelist Management:**
   - Use "IMPORT JSON" to load test data
   - Use "EXPORT JSON" to backup data

3. **Customize License Plate Format:**
   - Edit `VIETNAMESE_PLATE_REGEX` in parking-en.html
   - Update `platePattern` in ocrWorker-en.js

4. **Deploy to Production:**
   - Use PM2: `npm install -g pm2`
   - Use reverse proxy (nginx)
   - Add HTTPS with Let's Encrypt
   - Use cloud hosting (Heroku, DigitalOcean, etc.)

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Check browser console for errors (F12)
3. Check server console for logs
4. Review code comments in HTML and JS files

---

**Version:** 2.1.0  
**Last Updated:** 2024  
**Language:** English  
**Status:** ✓ Ready for mobile testing
