// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const infoRoutes = require('./routes/infoRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS - Allow your frontend
const SITE = process.env.CLIENT_URL ||'http://localhost:5173' ;
app.use(cors({
  origin: ['http://127.0.0.1:5173',SITE],
  credentials: true
}));

// CRITICAL FIX: Allow large image uploads (Base64)
app.use(express.json({ limit: '15mb' }));                    // Up to 15MB JSON
app.use(express.urlencoded({ limit: '15mb', extended: true })); // For form data

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
      <h1 style="font-size: 3rem;">FixItNow API Running!</h1>
      <p style="font-size: 1.5rem;">Server is live • Port: ${process.env.PORT || 8000}</p>
      <p>All image uploads now work perfectly</p>
    </div>
  `);
});

// Auto cleanup: Delete resolved complaints after 24 hours
const cleanupResolvedIssues = require('./utils/Cleanup');

// Run every 24 hours
setInterval(cleanupResolvedIssues, 24 * 60 * 60 * 1000);

// Run once on server start
cleanupResolvedIssues();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Upload images up to 15MB allowed`);
});