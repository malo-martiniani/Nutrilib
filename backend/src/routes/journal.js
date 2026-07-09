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

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date) || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ message: 'Format de date invalide (attendu : AAAA-MM-JJ).' });
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

  // Validation du format de date AAAA-MM-JJ
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(entry_date) || isNaN(new Date(entry_date).getTime())) {
    return res.status(400).json({ message: 'Format de date invalide (attendu : AAAA-MM-JJ).' });
  }

  const cleanCalories = Math.max(0, parseInt(calories) || 0);
  const cleanProtein = Math.max(0, parseFloat(protein) || 0);
  const cleanCarbs = Math.max(0, parseFloat(carbs) || 0);
  const cleanFat = Math.max(0, parseFloat(fat) || 0);
  const cleanAmount = Math.max(0, parseFloat(serving_amount) || 100);
  const cleanSugar = Math.max(0, parseFloat(sugar) || 0);
  const cleanFiber = Math.max(0, parseFloat(fiber) || 0);
  const cleanSodium = Math.max(0, parseFloat(sodium) || 0);
  const cleanPotassium = Math.max(0, parseFloat(potassium) || 0);
  const cleanCholesterol = Math.max(0, parseFloat(cholesterol) || 0);
  const cleanSaturatedFat = Math.max(0, parseFloat(saturated_fat) || 0);

  try {
    const result = await db.query(
      `INSERT INTO journal_entries 
      (user_id, food_id, food_name, calories, protein, carbs, fat, meal_type, serving_amount, serving_unit, entry_date, sugar, fiber, sodium, potassium, cholesterol, saturated_fat) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        food_id || null,
        food_name,
        cleanCalories,
        cleanProtein,
        cleanCarbs,
        cleanFat,
        meal_type,
        cleanAmount,
        serving_unit || 'g',
        entry_date,
        cleanSugar,
        cleanFiber,
        cleanSodium,
        cleanPotassium,
        cleanCholesterol,
        cleanSaturatedFat
      ]
    );

    const newEntry = {
      id: result.insertId,
      user_id: req.user.id,
      food_id,
      food_name,
      calories: cleanCalories,
      protein: cleanProtein,
      carbs: cleanCarbs,
      fat: cleanFat,
      meal_type,
      serving_amount: cleanAmount,
      serving_unit: serving_unit || 'g',
      entry_date,
      sugar: cleanSugar,
      fiber: cleanFiber,
      sodium: cleanSodium,
      potassium: cleanPotassium,
      cholesterol: cleanCholesterol,
      saturated_fat: cleanSaturatedFat
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
