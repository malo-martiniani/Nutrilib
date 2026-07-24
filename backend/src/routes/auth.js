const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// Expression régulière simple pour valider l'email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @route   POST api/auth/register
// @desc    Inscription d'un utilisateur
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation basique
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Le nom d\'utilisateur doit faire au moins 3 caractères.' });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format d\'email invalide.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit faire au moins 8 caractères.' });
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une lettre et un chiffre.' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà (nom ou email)
    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur ou cet email est déjà utilisé.' });
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insérer l'utilisateur en base de données
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    const userId = result.insertId;

    // Création du Token JWT
    const payload = {
      id: userId,
      username: username
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: { id: userId, username, email }
        });
      }
    );

  } catch (error) {
    console.error('Erreur inscription:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/auth/login
// @desc    Connexion de l'utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
  }

  try {
    // Recherche de l'utilisateur par email
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    const user = users[0];

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides.' });
    }

    // Création du Token JWT
    const payload = {
      id: user.id,
      username: user.username
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, username: user.username, email: user.email }
        });
      }
    );

  } catch (error) {
    console.error('Erreur connexion:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   GET api/auth/me
// @desc    Obtenir l'utilisateur actuel
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Demande de réinitialisation de mot de passe perdu
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Adresse email requise.' });
  }

  try {
    const users = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ message: 'Si cet email correspond à un compte, un lien de réinitialisation vous a été envoyé.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    res.json({
      message: 'Un lien de réinitialisation a été généré.',
      reset_token: resetToken
    });
  } catch (error) {
    console.error('Erreur oubli mot de passe:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/auth/reset-password
// @desc    Réinitialisation effective du mot de passe avec jeton
router.post('/reset-password', async (req, res) => {
  const { email, new_password } = req.body;
  if (!email || !new_password) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
  }

  if (!/[a-zA-Z]/.test(new_password) || !/[0-9]/.test(new_password)) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins une lettre et un chiffre.' });
  }

  try {
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [password_hash, email]);

    res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
