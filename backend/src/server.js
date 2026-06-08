const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./database');
const authRoutes = require('./routes/auth');
const fatsecretRoutes = require('./routes/fatsecret');
const journalRoutes = require('./routes/journal');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration des Middlewares
app.use(helmet()); // Sécurisation des en-têtes HTTP
app.use(cors({
  origin: '*', // Permet toutes les requêtes en développement (à restreindre en prod)
  credentials: true
}));
app.use(express.json()); // Parser les requêtes avec du JSON

// Définition des Routes API
app.use('/api/auth', authRoutes);
app.use('/api/foods', fatsecretRoutes);
app.use('/api/journal', journalRoutes);

// Route de diagnostic
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    database: db.getPool() ? 'connected' : 'disconnected'
  });
});

// Gestion des routes inexistantes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ressource non trouvée' });
});

// Middleware de gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur interne est survenue sur le serveur' });
});

// Initialiser la base de données puis lancer le serveur
async function startServer() {
  try {
    console.log('Tentative d\'initialisation de la base de données...');
    await db.initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Le serveur tourne sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur en raison d\'une erreur de base de données.');
    console.log('Lancement du serveur en mode dégradé (sans base de données) pour permettre la configuration...');
    
    // On permet quand même de lancer le serveur pour éviter un blocage complet si mysql n'est pas encore actif
    app.listen(PORT, () => {
      console.log(`Le serveur tourne (sans base de données) sur le port ${PORT}`);
    });
  }
}

startServer();
