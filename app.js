// const express = require('express');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const path = require('path');
// const { Pool } = require('pg');
// require('dotenv').config(); // Load environment variables

// const authRoutes = require('./routes/auth');
// const linkRoutes = require('./routes/links');

// const app = express();

// // Middleware
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // Session configuration
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Use secret from .env
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//     },
//   })
// );

// // View Engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Database connection
// const db = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT || 5432,
// });

// db.connect()
//   .then(() => console.log('Connected to the database'))
//   .catch((err) => {
//     console.error('Database connection error:', err);
//     process.exit(1);
//   });

// // Assign the database pool to app.locals
// app.locals.db = db;

// // Routes
// app.use('/auth', authRoutes);
// app.use('/links', linkRoutes);

// // Landing page
// app.get('/', (req, res) => {
//   res.render('index', { user: req.session.user });
// });

// // About Page
// app.get('/about', (req, res) => {
//   res.render('about');
// });

// // Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// firebase 
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables

// Initialize Firebase Admin SDK with Service Account Key
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),  // Using the service account
  });
}

// Initialize Firestore
const db = admin.firestore();

// Store Firestore reference in app.locals for global access
const app = express();
app.locals.db = db;  // Make db accessible in all routes

// Routes and other middleware
const authRoutes = require('./routes/auth');
const linkRoutes = require('./routes/links');

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/links', linkRoutes);

// Landing page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

