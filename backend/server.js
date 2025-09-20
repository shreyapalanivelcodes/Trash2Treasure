const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch'); // npm install node-fetch@2

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES =====
app.use(cors());
app.use(express.json());

// ===== CONNECT TO MONGODB =====
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ===== ROUTES =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// ===== DISPOSAL CENTERS =====
app.get('/api/disposal-centers', async (req, res) => {
    const { lat, lng, type } = req.query;
    const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // replace with actual key

    if (!lat || !lng || !type) {
        return res.status(400).json({ message: 'Missing location or waste type.' });
    }

    try {
        const query = `${type} recycling center`;
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=15000&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(500).json({ message: 'Google Places API error', error: data.status });
        }

        const places = data.results.map(place => ({
            name: place.name,
            address: place.formatted_address,
            location: place.geometry.location,
            place_id: place.place_id
        }));

        res.json(places);
    } catch (error) {
        console.error('Error fetching disposal centers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===== STATIC FILES =====
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use(express.static(path.join(__dirname, '../frontend/html')));

// ===== SERVE SPECIFIC HTML PAGES =====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/index.html')));
app.get('/index.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/login.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/signup.html')));
app.get('/upload.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/upload.html')));
app.get('/leaderboard.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/leaderboard.html')));
app.get('/profile.html', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/profile.html')));

// ===== 404 PAGE =====
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
