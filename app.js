const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

let users = []; // Inmemory user storage

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Route: GET /
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Route: POST /register
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.send('⚠️ User already exists. <a href="/login.html">Login</a>');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  users.push({ name, email, password: hashedPassword, role });
  res.send('✅ Registration successful! <a href="/login.html">Login here</a>');
});

// Route: POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.redirect('/usernotfound.html');

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.redirect('/wrongpss.html');

  req.session.user = user;
  res.redirect('/welcome.html');
});
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
