const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const router = require('./routes/router');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const host = process.env.HOST || 'localhost';

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const uri = process.env.MONGODB_URI;
const connect = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

connect();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', router);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

const server = app.listen(port, host, () => {
  console.log(`Node server is listening on http://${host}:${server.address().port}`);
  console.log(`Static files served from: ${path.join(__dirname, 'uploads')}`);
});

module.exports = app;