const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// @route   GET api/favorites
// @desc    Obtenir la liste des aliments favoris de l'utilisateur
// @access  Privé
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await db.query(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY id DESC',
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    console.error('Erreur récupération favoris:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/favorites
// @desc    Ajouter un aliment aux favoris
// @access  Privé
router.post('/', authMiddleware, async (req, res) => {
  const { food_id, food_name, calories, protein, carbs, fat, serving_description } = req.body;

  if (!food_id || !food_name || calories === undefined) {
    return res.status(400).json({ message: 'Veuillez fournir un ID d\'aliment, un nom et un nombre de calories.' });
  }

  try {
    // Vérifier si l'aliment est déjà en favori
    const existing = await db.query(
      'SELECT id FROM favorites WHERE user_id = ? AND food_id = ?',
      [req.user.id, food_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Cet aliment est déjà dans vos favoris.' });
    }

    const result = await db.query(
      `INSERT INTO favorites 
       (user_id, food_id, food_name, calories, protein, carbs, fat, serving_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        food_id,
        food_name,
        parseInt(calories),
        parseFloat(protein || 0),
        parseFloat(carbs || 0),
        parseFloat(fat || 0),
        serving_description || '100g'
      ]
    );

    res.status(201).json({
      id: result.insertId,
      food_id,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      serving_description
    });
  } catch (error) {
    console.error('Erreur ajout favori:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   DELETE api/favorites/:id
// @desc    Supprimer un aliment des favoris
// @access  Privé
router.delete('/:id', authMiddleware, async (req, res) => {
  const favoriteId = req.params.id;

  try {
    const existing = await db.query(
      'SELECT id FROM favorites WHERE id = ? AND user_id = ?',
      [favoriteId, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Favori non trouvé ou non autorisé.' });
    }

    await db.query('DELETE FROM favorites WHERE id = ?', [favoriteId]);
    res.json({ message: 'Aliment retiré des favoris.' });
  } catch (error) {
    console.error('Erreur suppression favori:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
