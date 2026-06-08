const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Récupérer le token de l'en-tête Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });
  }

  // Le format attendu est "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Format du jeton invalide. Utilisez "Bearer <token>".' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'generer_un_secret_tres_long_et_securise_ici');
    req.user = decoded; // Ajoute l'utilisateur décodé à l'objet de requête (contient id et username)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Jeton invalide ou expiré.' });
  }
};
