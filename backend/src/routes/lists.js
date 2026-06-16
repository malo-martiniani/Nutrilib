const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// @route   GET api/lists
// @desc    Obtenir toutes les listes de l'utilisateur avec leurs aliments
// @access  Privé
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT l.id AS list_id, l.list_name, l.created_at AS list_created,
              i.id AS item_id, i.food_id, i.food_name, i.calories, i.protein, i.carbs, i.fat, i.serving_description
       FROM custom_lists l
       LEFT JOIN custom_list_items i ON l.id = i.list_id
       WHERE l.user_id = ?
       ORDER BY l.id DESC, i.id DESC`,
      [req.user.id]
    );

    const listsMap = {};
    for (const row of rows) {
      if (!listsMap[row.list_id]) {
        listsMap[row.list_id] = {
          id: row.list_id,
          list_name: row.list_name,
          created_at: row.list_created,
          items: []
        };
      }
      if (row.item_id) {
        listsMap[row.list_id].items.push({
          id: row.item_id,
          food_id: row.food_id,
          food_name: row.food_name,
          calories: parseInt(row.calories),
          protein: parseFloat(row.protein),
          carbs: parseFloat(row.carbs),
          fat: parseFloat(row.fat),
          serving_description: row.serving_description
        });
      }
    }

    res.json(Object.values(listsMap));
  } catch (error) {
    console.error('Erreur récupération listes:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/lists
// @desc    Créer une nouvelle liste personnalisée
// @access  Privé
router.post('/', authMiddleware, async (req, res) => {
  const { list_name } = req.body;

  if (!list_name) {
    return res.status(400).json({ message: 'Le nom de la liste est requis.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO custom_lists (user_id, list_name) VALUES (?, ?)',
      [req.user.id, list_name]
    );

    res.status(201).json({
      id: result.insertId,
      list_name,
      items: []
    });
  } catch (error) {
    console.error('Erreur création liste:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   POST api/lists/:listId/items
// @desc    Ajouter un aliment à une liste personnalisée
// @access  Privé
router.post('/:listId/items', authMiddleware, async (req, res) => {
  const listId = req.params.listId;
  const { food_id, food_name, calories, protein, carbs, fat, serving_description } = req.body;

  if (!food_name || calories === undefined) {
    return res.status(400).json({ message: 'Le nom de l\'aliment et les calories sont requis.' });
  }

  try {
    // Vérifier d'abord que la liste appartient à l'utilisateur
    const list = await db.query(
      'SELECT id FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (list.length === 0) {
      return res.status(404).json({ message: 'Liste non trouvée ou non autorisée.' });
    }

    const result = await db.query(
      `INSERT INTO custom_list_items 
       (list_id, food_id, food_name, calories, protein, carbs, fat, serving_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listId,
        food_id || null,
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
      list_id: parseInt(listId),
      food_id,
      food_name,
      calories,
      protein,
      carbs,
      fat,
      serving_description
    });
  } catch (error) {
    console.error('Erreur ajout aliment à la liste:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   DELETE api/lists/:listId
// @desc    Supprimer une liste complète
// @access  Privé
router.delete('/:listId', authMiddleware, async (req, res) => {
  const listId = req.params.listId;

  try {
    const list = await db.query(
      'SELECT id FROM custom_lists WHERE id = ? AND user_id = ?',
      [listId, req.user.id]
    );

    if (list.length === 0) {
      return res.status(404).json({ message: 'Liste non trouvée ou non autorisée.' });
    }

    await db.query('DELETE FROM custom_lists WHERE id = ?', [listId]);
    res.json({ message: 'Liste personnalisée supprimée.' });
  } catch (error) {
    console.error('Erreur suppression liste:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   DELETE api/lists/items/:itemId
// @desc    Supprimer un aliment d'une liste personnalisée
// @access  Privé
router.delete('/items/:itemId', authMiddleware, async (req, res) => {
  const itemId = req.params.itemId;

  try {
    // Vérifier si l'aliment appartient à une liste de l'utilisateur
    const item = await db.query(
      `SELECT i.id FROM custom_list_items i
       JOIN custom_lists l ON i.list_id = l.id
       WHERE i.id = ? AND l.user_id = ?`,
      [itemId, req.user.id]
    );

    if (item.length === 0) {
      return res.status(404).json({ message: 'Élément de liste non trouvé ou non autorisé.' });
    }

    await db.query('DELETE FROM custom_list_items WHERE id = ?', [itemId]);
    res.json({ message: 'Aliment retiré de la liste.' });
  } catch (error) {
    console.error('Erreur suppression élément de liste:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
