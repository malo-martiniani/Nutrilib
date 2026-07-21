const express = require('express');
const router = express.Router();
const db = require('../database');
const authMiddleware = require('../middleware/auth');

// @route   GET api/profile
// @desc    Obtenir le profil complet de l'utilisateur connecté
// @access  Privé
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, username, email, display_name, avatar_url, is_private, 
              gender, age, height, current_weight, activity_level, 
              calorie_goal, protein_goal, carb_goal, fat_goal, goal_type, target_weight, goal_speed, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur récupération profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   PUT api/profile
// @desc    Mettre à jour les infos de base du profil
// @access  Privé
router.put('/', authMiddleware, async (req, res) => {
  const { display_name, avatar_url, is_private } = req.body;

  if (display_name && display_name.length > 100) {
    return res.status(400).json({ message: 'Le nom d\'affichage ne peut pas dépasser 100 caractères.' });
  }

  if (avatar_url && avatar_url.length > 255) {
    return res.status(400).json({ message: 'L\'URL de l\'avatar ne peut pas dépasser 255 caractères.' });
  }

  try {
    await db.query(
      `UPDATE users 
       SET display_name = ?, avatar_url = ?, is_private = ? 
       WHERE id = ?`,
      [
        display_name || null,
        avatar_url || null,
        is_private ? 1 : 0,
        req.user.id
      ]
    );

    res.json({ message: 'Profil mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   PUT api/profile/calculator
// @desc    Calculer et mettre à jour les besoins caloriques et les objectifs macros
// @access  Privé
router.put('/calculator', authMiddleware, async (req, res) => {
  const { gender, age, height, current_weight, activity_level, goal_type, target_weight, goal_speed } = req.body;

  // Validation
  if (!gender || !age || !height || !current_weight || !activity_level) {
    return res.status(400).json({ message: 'Veuillez remplir tous les champs du calculateur.' });
  }

  const parsedAge = parseInt(age);
  const parsedHeight = parseInt(height);
  const parsedWeight = parseFloat(current_weight);
  const parsedTargetWeight = target_weight ? parseFloat(target_weight) : null;

  if (isNaN(parsedAge) || isNaN(parsedHeight) || isNaN(parsedWeight)) {
    return res.status(400).json({ message: 'Valeurs numériques invalides.' });
  }

  if (parsedAge < 1 || parsedAge > 120) {
    return res.status(400).json({ message: "L'âge doit être compris entre 1 et 120 ans." });
  }

  if (parsedHeight < 50 || parsedHeight > 280) {
    return res.status(400).json({ message: "La taille doit être comprise entre 50 et 280 cm." });
  }

  if (parsedWeight < 10 || parsedWeight > 500) {
    return res.status(400).json({ message: "Le poids doit être compris entre 10 et 500 kg." });
  }

  if (parsedTargetWeight !== null && (parsedTargetWeight < 10 || parsedTargetWeight > 500)) {
    return res.status(400).json({ message: "Le poids cible doit être compris entre 10 et 500 kg." });
  }

  try {
    // 1. Calcul du BMR selon Mifflin-St Jeor
    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * parsedWeight) + (6.25 * parsedHeight) - (5 * parsedAge) + 5;
    } else if (gender === 'female') {
      bmr = (10 * parsedWeight) + (6.25 * parsedHeight) - (5 * parsedAge) - 161;
    } else {
      return res.status(400).json({ message: 'Genre invalide.' });
    }

    // 2. Calcul du TDEE selon l'activité
    let multiplier = 1.2;
    switch (activity_level) {
      case 'sedentary':
        multiplier = 1.2;
        break;
      case 'light':
        multiplier = 1.375;
        break;
      case 'moderate':
        multiplier = 1.55;
        break;
      case 'active':
        multiplier = 1.725;
        break;
      case 'very_active':
        multiplier = 1.9;
        break;
      default:
        return res.status(400).json({ message: 'Niveau d\'activité invalide.' });
    }

    const tdee = Math.round(bmr * multiplier);

    // 3. Calcul de l'objectif calorique ajusté en fonction de l'objectif de poids et du rythme
    let calorie_goal = tdee;
    const finalGoalType = goal_type || 'maintain';
    const finalGoalSpeed = goal_speed || 'normal';

    if (parsedTargetWeight !== null && finalGoalType !== 'maintain') {
      const heightM = parsedHeight / 100;
      const targetBmi = parsedTargetWeight / (heightM * heightM);
      if (targetBmi < 18.45) {
        const minHealthyWeight = Math.round(18.5 * (heightM * heightM));
        return res.status(400).json({ message: `Le poids cible ne peut pas être inférieur à la limite de santé de ${minHealthyWeight} kg (IMC 18.5).` });
      }
    }

    if (finalGoalType === 'lose') {
      let deficit = 500;
      switch (finalGoalSpeed) {
        case 'very_slow': deficit = 150; break;
        case 'slow': deficit = 250; break;
        case 'normal': deficit = 500; break;
        case 'fast': deficit = 750; break;
        case 'very_fast': deficit = 1000; break;
      }
      const floor = gender === 'male' ? 1500 : 1200;
      calorie_goal = Math.max(floor, tdee - deficit);
    } else if (finalGoalType === 'gain') {
      let surplus = 250;
      switch (finalGoalSpeed) {
        case 'very_slow': surplus = 100; break;
        case 'slow': surplus = 150; break;
        case 'normal': surplus = 250; break;
        case 'fast': surplus = 350; break;
        case 'very_fast': surplus = 500; break;
      }
      calorie_goal = tdee + surplus;
    }

    // 4. Calcul des macros (Utilise les pourcentages fournis ou les valeurs par défaut)
    const pPct = req.body.protein_percent !== undefined ? parseFloat(req.body.protein_percent) : 25;
    const cPct = req.body.carb_percent !== undefined ? parseFloat(req.body.carb_percent) : 50;
    const fPct = req.body.fat_percent !== undefined ? parseFloat(req.body.fat_percent) : 25;

    const protein_goal = Math.round((calorie_goal * (pPct / 100)) / 4);
    const fat_goal = Math.round((calorie_goal * (fPct / 100)) / 9);
    const carb_goal = Math.round((calorie_goal * (cPct / 100)) / 4);

    // 5. Mettre à jour la base de données
    await db.query(
      `UPDATE users 
       SET gender = ?, age = ?, height = ?, current_weight = ?, activity_level = ?,
           calorie_goal = ?, protein_goal = ?, carb_goal = ?, fat_goal = ?,
           goal_type = ?, target_weight = ?, goal_speed = ?
       WHERE id = ?`,
      [
        gender,
        parsedAge,
        parsedHeight,
        parsedWeight,
        activity_level,
        calorie_goal,
        protein_goal,
        carb_goal,
        fat_goal,
        finalGoalType,
        parsedTargetWeight,
        finalGoalSpeed,
        req.user.id
      ]
    );

    // Également insérer le poids actuel dans l'historique du poids si aucun poids n'est enregistré pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    await db.query(
      `INSERT INTO weight_history (user_id, weight, entry_date)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE weight = ?`,
      [req.user.id, parsedWeight, today, parsedWeight]
    );

    res.json({
      message: 'Objectifs caloriques mis à jour.',
      goals: {
        calorie_goal,
        protein_goal,
        carb_goal,
        fat_goal,
        goal_type: finalGoalType,
        target_weight: parsedTargetWeight,
        goal_speed: finalGoalSpeed,
        bmr: Math.round(bmr)
      }
    });

  } catch (error) {
    console.error('Erreur calculateur profil:', error.message);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// @route   GET api/profile/export
// @desc    Exporter toutes les données de l'utilisateur sous forme de JSON (RGPD - Droit à la portabilité)
// @access  Privé
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer le profil
    const users = await db.query(
      `SELECT id, username, email, display_name, avatar_url, is_private, 
              gender, age, height, current_weight, activity_level, 
              calorie_goal, protein_goal, carb_goal, fat_goal, goal_type, target_weight, goal_speed, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const profile = users[0];

    // Récupérer le journal
    const journal = await db.query(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );

    // Récupérer le poids
    const weight = await db.query(
      'SELECT * FROM weight_history WHERE user_id = ? ORDER BY entry_date DESC',
      [userId]
    );

    // Récupérer les favoris
    const favorites = await db.query(
      'SELECT * FROM favorites WHERE user_id = ?',
      [userId]
    );

    // Récupérer les recettes personnalisées
    const recipes = await db.query(
      'SELECT * FROM custom_recipes WHERE user_id = ?',
      [userId]
    );

    // Pour chaque recette, récupérer les ingrédients
    for (let r of recipes) {
      r.ingredients = await db.query(
        'SELECT * FROM custom_recipe_ingredients WHERE recipe_id = ?',
        [r.id]
      );
    }

    // Récupérer les listes de courses
    const lists = await db.query(
      'SELECT * FROM custom_lists WHERE user_id = ?',
      [userId]
    );

    // Pour chaque liste, récupérer les items
    for (let l of lists) {
      l.items = await db.query(
        'SELECT * FROM custom_list_items WHERE list_id = ?',
        [l.id]
      );
    }

    const exportedData = {
      export_date: new Date(),
      profile,
      journal,
      weight_history: weight,
      favorites,
      custom_recipes: recipes,
      grocery_lists: lists
    };

    res.json(exportedData);
  } catch (error) {
    console.error('Erreur export de données:', error.message);
    res.status(500).json({ message: 'Erreur lors de la génération du fichier d\'export.' });
  }
});

// @route   DELETE api/profile
// @desc    Supprimer définitivement le compte et toutes les données associées (RGPD - Droit à l'oubli)
// @access  Privé
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM users WHERE id = ?',
      [req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Compte supprimé avec succès. Toutes vos données ont été définitivement effacées.' });
  } catch (error) {
    console.error('Erreur suppression compte:', error.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de votre compte.' });
  }
});

module.exports = router;
