const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  return { email, password };
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password } = clean(req.body);

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = clean(req.body);
  if (!email || !password) {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }

  try {
    const user = await User.findOne({ email });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    res.json({ id: user._id, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
});

module.exports = router;