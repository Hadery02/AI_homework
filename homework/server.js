const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Start server
app.listen(PORT, () => {
    const localIP = getLocalIP();
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('🚀 G-Parking Server Started!');
    console.log('════════════════════════════════════════════════════════════\n');
    
    console.log('📱 Access URLs:\n');
    console.log(`   🖥️  Desktop:  http://localhost:${PORT}/parking.html`);
    console.log(`   📱 Mobile:   http://${localIP}:${PORT}/parking.html`);
    console.log(`   📱 Phone IP: http://${localIP}:${PORT}\n`);
    
    console.log('💡 Tips:');
    console.log('   • Open on your phone using the Mobile URL');
    console.log('   • Make sure phone is on same WiFi network');
    console.log('   • HTTPS not needed for local testing');
    console.log('   • Camera will work on HTTP (localhost origin)\n');
    
    console.log('⏹️  Stop server: Press Ctrl+C\n');
    console.log('════════════════════════════════════════════════════════════\n');
});

// Simple health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'G-Parking Server is running' });
});

// Redirect root to parking-en.html (English version)
app.get('/', (req, res) => {
    res.redirect('/parking-en.html');
});
