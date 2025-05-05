require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const Customer = require('./models/Customer');
const authRoutes = require('./routes/auth');

const app = express();

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/hisaab", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// View Engine and Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Setup
app.use(session({
  secret: "thisIsASecretKey",
  resave: false,
  saveUninitialized: false
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Auth Routes
app.use('/', authRoutes);

// Authentication Middleware
app.use((req, res, next) => {
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(req.path) || req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
});

// Routes
app.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({});
    const total = customers.reduce((acc, curr) => acc + curr.rupees, 0);
    res.render('index', { customers, total });
  } catch (err) {
    console.error('Error in / route:', err);
    res.status(500).send("Error loading data");
  }
});

app.get('/add', (req, res) => {
  res.render("add");
});

app.post('/add', async (req, res) => {
  const { accountNumber, rupees } = req.body;
  const createdDate = new Date().toISOString().split('T')[0]; // For daily sum
  const newCustomer = new Customer({ accountNumber, rupees, createdDate });
  await newCustomer.save();
  res.redirect("/");
});

app.post('/sum', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const customers = await Customer.find({ createdDate: today });
  const total = customers.reduce((acc, curr) => acc + curr.rupees, 0);
  res.render('index', { customers, total });
});

app.get('/search', async (req, res) => {
  const searchAccount = req.query.accountNumber;
  const deleted = req.query.deleted || 'false'; // Add this line to read from query param
  try {
    const customers = await Customer.find({ accountNumber: searchAccount });
    const total = customers.reduce((acc, curr) => acc + curr.rupees, 0);
    res.render('account', { customers, total, searchAccount, deleted }); // Pass 'deleted'
  } catch (err) {
    console.error("Error in /search:", err);
    res.status(500).send("Error searching for account");
  }
});
app.post('/delete-selected', async (req, res) => {
  const { selectedIds, accountNumber } = req.body;

  if (!selectedIds) {
    return res.redirect(`/search?accountNumber=${accountNumber}`);
  }

  const ids = Array.isArray(selectedIds) ? selectedIds : [selectedIds];

  try {
    await Customer.deleteMany({ _id: { $in: ids } });
    res.redirect(`/search?accountNumber=${accountNumber}`);
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).send("Error deleting entries");
  }
});

app.post('/delete-account', async (req, res) => {
  const { accountNumber } = req.body;
  await Customer.deleteMany({ accountNumber });
  res.redirect(`/search?accountNumber=${accountNumber}&deleted=true`);
});

app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.render('login', { error: 'You have been logged out.' });
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('notFound');
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});