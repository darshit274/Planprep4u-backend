const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const router = require('./routes/index');
const serverless = require("serverless-http");
// Removed express-fileupload to avoid conflict with multer

const { sequelize } = require('./models'); // Assuming your sequelize export is CommonJS
const errorMiddleware = require('./utils/default/globalErrorHandler');
const { initializeFirebase } = require('./config/firebase');
const { validateConfig: validateRazorpayConfig } = require('./config/razorpay');
const NotificationScheduler = require('./services/NotificationScheduler');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow all origins so nginx error responses (413 etc.) don't block
// cross-origin requests. Origin restriction is enforced at the nginx proxy layer.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
}));

// Trust proxy for devtunnels/ngrok
app.set('trust proxy', true);

// Request logging middleware — method/path only. Origin and request bodies are
// intentionally excluded to avoid leaking PII or auth state into stdout.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Parse JSON bodies with increased limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload is handled by multer in individual controllers

// Serve static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});
app.use(errorMiddleware);
sequelize.authenticate().then(() => {
  console.log('✅ Database connected.');
}).catch((error) => {
  console.error('❌ DB Connection error:', error);
});

async function startServer() {
  try {
    // Initialize Firebase Admin SDK
    initializeFirebase();

    // Validate Razorpay configuration
    validateRazorpayConfig();

    // Initialize Notification Scheduler
    NotificationScheduler.initialize();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
}

startServer();
module.exports = app;
module.exports.handler = serverless(app);
