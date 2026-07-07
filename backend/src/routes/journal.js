const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// @route   GET api/journal
// @desc    Obtenir toutes les entrées de journal pour une date spécifique
// @access  Privé
router.get('/', authMiddleware, async (req, res) => {
  const { date } = req.query; // Format attendu: AAAA-MM-JJ

  if (!date) {
    return res.status(400).json({ message: 'Veuillez spécifier une date (AAAA-MM-JJ).' });
  }

  try {
    const entries = await db.query(
      'SELECT * FROM journal_entries WHERE user_id = ? AND entry_date = ? ORDER BY id DESC',
      [req.user.id, date]
    );

    res.json(entries);
  } catch (error) {
    console.error('Erreur récupération journal:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/journal
// @desc    Ajouter un aliment consommé au journal
// @access  Privé
router.post('/', authMiddleware, async (req, res) => {
  const {
    food_id,
    food_name,
    calories,
    protein,
    carbs,
    fat,
    meal_type,
    serving_amount,
    serving_unit,
    entry_date,
    sugar,
    fiber,
    sodium,
    potassium,
    cholesterol,
    saturated_fat
  } = req.body;

  // Validation
  if (!food_name || calories === undefined || !meal_type || !serving_amount || !entry_date) {
    return res.status(400).json({ message: 'Veuillez renseigner tous les champs obligatoires (nom, calories, repas, quantité, date).' });
  }

  const validMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
  if (!validMeals.includes(meal_type)) {
    return res.status(400).json({ message: 'Type de repas invalide (doit être breakfast, lunch, dinner ou snack).' });
  }

  try {
    const result = await db.query(
      `INSERT INTO journal_entries 
      (user_id, food_id, food_name, calories, protein, carbs, fat, meal_type, serving_amount, serving_unit, entry_date, sugar, fiber, sodium, potassium, cholesterol, saturated_fat) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        food_id || null,
        food_name,
        parseInt(calories),
        parseFloat(protein || 0),
        parseFloat(carbs || 0),
        parseFloat(fat || 0),
        meal_type,
        parseFloat(serving_amount),
        serving_unit || 'g',
        entry_date,
        parseFloat(sugar || 0),
        parseFloat(fiber || 0),
        parseFloat(sodium || 0),
        parseFloat(potassium || 0),
        parseFloat(cholesterol || 0),
        parseFloat(saturated_fat || 0)
      ]
    );

    const newEntry = {
      id: result.insertId,
      user_id: req.user.id,
      food_id,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      meal_type,
      serving_amount,
      serving_unit,
      entry_date,
      sugar: sugar || 0,
      fiber: fiber || 0,
      sodium: sodium || 0,
      potassium: potassium || 0,
      cholesterol: cholesterol || 0,
      saturated_fat: saturated_fat || 0
    };

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Erreur ajout journal:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   DELETE api/journal/:id
// @desc    Supprimer une entrée du journal
// @access  Privé
router.delete('/:id', authMiddleware, async (req, res) => {
  const entryId = req.params.id;

  try {
    // Vérifier d'abord si l'entrée appartient à l'utilisateur
    const entries = await db.query(
      'SELECT id FROM journal_entries WHERE id = ? AND user_id = ?',
      [entryId, req.user.id]
    );

    if (entries.length === 0) {
      return res.status(404).json({ message: 'Entrée non trouvée ou non autorisée.' });
    }

    // Supprimer l'entrée
    await db.query('DELETE FROM journal_entries WHERE id = ?', [entryId]);

    res.json({ message: 'Aliment retiré du journal avec succès.' });
  } catch (error) {
    console.error('Erreur suppression journal:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
