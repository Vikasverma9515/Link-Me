const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('pg');

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});


router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if `db` is properly set
    if (!req.app.locals.db) {
      throw new Error('Database connection not initialized');
    }

    await req.app.locals.db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.redirect('/auth/register');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await req.app.locals.db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = { id: user.id, username: user.username };
        return res.redirect('/links');
      }
    }
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Error during login:', err.message);
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error('Error during logout:', err.message);
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });

module.exports = router;
