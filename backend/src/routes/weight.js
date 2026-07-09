const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// @route   GET api/weight
// @desc    Obtenir l'historique de poids de l'utilisateur
// @access  Privé
router.get('/', authMiddleware, async (req, res) => {
  try {
    const weights = await db.query(
      'SELECT id, weight, entry_date FROM weight_history WHERE user_id = ? ORDER BY entry_date ASC',
      [req.user.id]
    );
    res.json(weights);
  } catch (error) {
    console.error('Erreur récupération poids:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/weight
// @desc    Ajouter ou modifier le poids pour une journée
// @access  Privé
router.post('/', authMiddleware, async (req, res) => {
  const { weight, entry_date } = req.body;

  if (weight === undefined || !entry_date) {
    return res.status(400).json({ message: 'Veuillez fournir un poids et une date.' });
  }

  const parsedWeight = parseFloat(weight);
  if (isNaN(parsedWeight) || parsedWeight <= 0 || parsedWeight > 500) {
    return res.status(400).json({ message: 'Poids invalide (doit être compris entre 0.1 et 500 kg).' });
  }

  // Validation du format de date AAAA-MM-JJ
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(entry_date) || isNaN(new Date(entry_date).getTime())) {
    return res.status(400).json({ message: 'Format de date invalide (attendu : AAAA-MM-JJ).' });
  }

  try {
    await db.query(
      `INSERT INTO weight_history (user_id, weight, entry_date) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE weight = ?`,
      [req.user.id, parsedWeight, entry_date, parsedWeight]
    );

    // Mettre également à jour current_weight dans la table users si la date saisie est aujourd'hui (ou la plus récente)
    // Pour simplifier, on met à jour users.current_weight s'il s'agit de la saisie la plus récente.
    const [latest] = await db.query(
      'SELECT weight FROM weight_history WHERE user_id = ? ORDER BY entry_date DESC LIMIT 1',
      [req.user.id]
    );

    if (latest && latest.weight) {
      await db.query('UPDATE users SET current_weight = ? WHERE id = ?', [latest.weight, req.user.id]);
    }

    res.status(201).json({ message: 'Poids enregistré.', weight: parsedWeight, entry_date });
  } catch (error) {
    console.error('Erreur enregistrement poids:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   DELETE api/weight/:id
// @desc    Supprimer une mesure de poids de l'historique
// @access  Privé
router.delete('/:id', authMiddleware, async (req, res) => {
  const weightId = req.params.id;

  try {
    // Vérifier si la mesure appartient bien à l'utilisateur
    const entries = await db.query(
      'SELECT id FROM weight_history WHERE id = ? AND user_id = ?',
      [weightId, req.user.id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ message: 'Mesure de poids non trouvée ou non autorisée.' });
    }

    await db.query('DELETE FROM weight_history WHERE id = ?', [weightId]);
    res.json({ message: 'Mesure de poids supprimée.' });
  } catch (error) {
    console.error('Erreur suppression poids:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
