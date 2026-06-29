const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');

// ============================================================
// DONNÉES MOCKÉES (Fallback si clés API FatSecret absentes)
// ============================================================

const MOCK_FOODS = [
  { food_id: '1', food_name: 'Pomme', brand_name: 'Générique', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, serving: '100g' },
  { food_id: '2', food_name: 'Banane', brand_name: 'Générique', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '100g' },
  { food_id: '3', food_name: 'Blanc de Poulet', brand_name: 'Générique', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, serving: '100g' },
  { food_id: '4', food_name: 'Œuf Entier', brand_name: 'Générique', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, serving: '100g' },
  { food_id: '5', food_name: 'Riz Blanc Cuit', brand_name: 'Générique', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, serving: '100g' },
  { food_id: '6', food_name: 'Pâtes Cuites', brand_name: 'Générique', calories: 158, protein: 5.8, carbs: 30.9, fat: 0.9, serving: '100g' },
  { food_id: '7', food_name: 'Avocat', brand_name: 'Générique', calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0, serving: '100g' },
  { food_id: '8', food_name: 'Saumon Cuit', brand_name: 'Générique', calories: 206, protein: 22.0, carbs: 0.0, fat: 12.0, serving: '100g' },
  { food_id: '9', food_name: 'Flocons d\'Avoine', brand_name: 'Générique', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, serving: '100g' },
  { food_id: '10', food_name: 'Fromage Blanc 0%', brand_name: 'Générique', calories: 48, protein: 8.0, carbs: 4.0, fat: 0.1, serving: '100g' }
];

const MOCK_FOOD_DETAILS = {
  '1': {
    food_id: '1',
    food_name: 'Pomme',
    brand_name: 'Générique',
    servings: [
      { calories: 52, protein: 0.3, carbohydrate: 14.0, fat: 0.2, saturated_fat: 0.05, cholesterol: 0, sodium: 1, potassium: 107, fiber: 2.4, sugar: 10.4, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' },
      { calories: 95, protein: 0.5, carbohydrate: 25.0, fat: 0.3, saturated_fat: 0.1, cholesterol: 0, sodium: 2, potassium: 195, fiber: 4.4, sugar: 18.9, serving_description: '1 pomme moyenne', metric_serving_amount: 182, metric_serving_unit: 'g' }
    ]
  },
  '2': {
    food_id: '2',
    food_name: 'Banane',
    brand_name: 'Générique',
    servings: [
      { calories: 89, protein: 1.1, carbohydrate: 22.8, fat: 0.3, saturated_fat: 0.1, cholesterol: 0, sodium: 1, potassium: 358, fiber: 2.6, sugar: 12.2, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' },
      { calories: 105, protein: 1.3, carbohydrate: 27.0, fat: 0.4, saturated_fat: 0.1, cholesterol: 0, sodium: 1, potassium: 422, fiber: 3.1, sugar: 14.4, serving_description: '1 banane moyenne', metric_serving_amount: 118, metric_serving_unit: 'g' }
    ]
  },
  '3': {
    food_id: '3',
    food_name: 'Blanc de Poulet',
    brand_name: 'Générique',
    servings: [
      { calories: 165, protein: 31.0, carbohydrate: 0.0, fat: 3.6, saturated_fat: 1.0, cholesterol: 85, sodium: 74, potassium: 256, fiber: 0, sugar: 0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '4': {
    food_id: '4',
    food_name: 'Œuf Entier',
    brand_name: 'Générique',
    servings: [
      { calories: 155, protein: 13.0, carbohydrate: 1.1, fat: 11.0, saturated_fat: 3.3, cholesterol: 372, sodium: 124, potassium: 126, fiber: 0, sugar: 1.1, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' },
      { calories: 78, protein: 6.5, carbohydrate: 0.6, fat: 5.5, saturated_fat: 1.6, cholesterol: 186, sodium: 62, potassium: 63, fiber: 0, sugar: 0.6, serving_description: '1 œuf moyen', metric_serving_amount: 50, metric_serving_unit: 'g' }
    ]
  },
  '5': {
    food_id: '5',
    food_name: 'Riz Blanc Cuit',
    brand_name: 'Générique',
    servings: [
      { calories: 130, protein: 2.7, carbohydrate: 28.0, fat: 0.3, saturated_fat: 0.1, cholesterol: 0, sodium: 1, potassium: 35, fiber: 0.4, sugar: 0.1, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '6': {
    food_id: '6',
    food_name: 'Pâtes Cuites',
    brand_name: 'Générique',
    servings: [
      { calories: 158, protein: 5.8, carbohydrate: 30.9, fat: 0.9, saturated_fat: 0.2, cholesterol: 0, sodium: 1, potassium: 44, fiber: 1.8, sugar: 0.6, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '7': {
    food_id: '7',
    food_name: 'Avocat',
    brand_name: 'Générique',
    servings: [
      { calories: 160, protein: 2.0, carbohydrate: 8.5, fat: 15.0, saturated_fat: 2.1, cholesterol: 0, sodium: 7, potassium: 485, fiber: 6.7, sugar: 0.7, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '8': {
    food_id: '8',
    food_name: 'Saumon Cuit',
    brand_name: 'Générique',
    servings: [
      { calories: 206, protein: 22.0, carbohydrate: 0.0, fat: 12.0, saturated_fat: 2.5, cholesterol: 63, sodium: 61, potassium: 384, fiber: 0, sugar: 0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '9': {
    food_id: '9',
    food_name: 'Flocons d\'Avoine',
    brand_name: 'Générique',
    servings: [
      { calories: 389, protein: 16.9, carbohydrate: 66.3, fat: 6.9, saturated_fat: 1.2, cholesterol: 0, sodium: 2, potassium: 429, fiber: 10.6, sugar: 1.0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  },
  '10': {
    food_id: '10',
    food_name: 'Fromage Blanc 0%',
    brand_name: 'Générique',
    servings: [
      { calories: 48, protein: 8.0, carbohydrate: 4.0, fat: 0.1, saturated_fat: 0.05, cholesterol: 2, sodium: 40, potassium: 110, fiber: 0, sugar: 4.0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }
    ]
  }
};

const MOCK_RECIPES = [
  {
    recipe_id: '101',
    recipe_name: 'Salade de Poulet Keto au Fromage Blanc',
    recipe_description: 'Une salade fraîche, faible en glucides et très riche en protéines, avec une sauce crémeuse légère.',
    recipe_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    preparation_time_min: 10,
    cooking_time_min: 5,
    rating: 4.8,
    calories: 320,
    carbs: 6,
    protein: 38,
    fat: 16,
    ingredients: [
      '150g de blanc de poulet cuit et émincé',
      '50g de fromage blanc 0%',
      '1/2 avocat en dés',
      '2 tasses de laitue romaine',
      '1 cuillère à café de jus de citron',
      'Sel et poivre au goût'
    ],
    directions: [
      'Dans un bol, mélangez le fromage blanc, le jus de citron, le sel et le poivre pour former la sauce.',
      'Dans un grand saladier, disposez la laitue, le poulet émincé et l\'avocat.',
      'Nappez de sauce et mélangez délicatement avant de servir frais.'
    ]
  },
  {
    recipe_id: '102',
    recipe_name: 'Omelette Légère Épinards et Féta',
    recipe_description: 'Une omelette protéinée rapide et saine pour le petit-déjeuner ou le dîner.',
    recipe_image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    preparation_time_min: 5,
    cooking_time_min: 10,
    rating: 4.5,
    calories: 240,
    carbs: 4,
    protein: 20,
    fat: 16,
    ingredients: [
      '2 gros œufs entiers',
      '1 tasse d\'épinards frais',
      '30g de féta émiettée',
      '1 cuillère à café d\'huile d\'olive',
      'Sel et poivre'
    ],
    directions: [
      'Battez les œufs dans un bol avec du sel et du poivre.',
      'Faites chauffer l\'huile d\'olive dans une poêle et faites-y revenir les épinards pendant 1 minute.',
      'Versez les œufs battus dans la poêle et laissez cuire à feu doux.',
      'Ajoutez la féta émiettée sur le dessus juste avant que l\'omelette ne soit complètement cuite, pliez-la en deux et servez.'
    ]
  },
  {
    recipe_id: '103',
    recipe_name: 'Porridge d\'Avoine Protéiné aux Fruits Rouges',
    recipe_description: 'Un bol de porridge réconfortant, riche en fibres et idéal pour faire le plein d\'énergie.',
    recipe_image: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=400',
    preparation_time_min: 5,
    cooking_time_min: 5,
    rating: 4.7,
    calories: 380,
    carbs: 45,
    protein: 25,
    fat: 6,
    ingredients: [
      '40g de flocons d\'avoine',
      '200ml de lait d\'amande non sucré',
      '1 cuillère de whey protéine ou fromage blanc',
      '1 poignée de fruits rouges frais (fraises, myrtilles)',
      '1 cuillère à café de graines de chia'
    ],
    directions: [
      'Dans une casserole, mélangez les flocons d\'avoine et le lait d\'amande.',
      'Faites cuire à feu moyen en remuant constamment jusqu\'à épaississement (environ 4-5 minutes).',
      'Retirez du feu, laissez tiédir puis incorporez la whey protéine (ou servez avec le fromage blanc à côté).',
      'Versez dans un bol, décorez avec les fruits rouges frais et les graines de chia.'
    ]
  }
];

// Vérifier si les identifiants FatSecret sont configurés et non-fictifs
function areCredentialsConfigured() {
  const id = process.env.FATSECRET_CLIENT_ID;
  const secret = process.env.FATSECRET_CLIENT_SECRET;
  
  return (
    id && 
    secret && 
    !id.includes('votre_') && 
    !secret.includes('votre_') &&
    id.length > 5
  );
}

// ============================================================
// SIGNATURE OAUTH 1.0 (HMAC-SHA1)
// ============================================================

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function buildSignedUrl(method, apiParams) {
  const consumerKey = process.env.FATSECRET_CLIENT_ID;
  const consumerSecret = process.env.FATSECRET_CLIENT_SECRET;
  const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: generateNonce(),
    oauth_version: '1.0'
  };

  const allParams = { ...apiParams, ...oauthParams };

  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  const baseString = [
    method.toUpperCase(),
    percentEncode(baseUrl),
    percentEncode(paramString)
  ].join('&');

  const signingKey = `${percentEncode(consumerSecret)}&`;

  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  allParams.oauth_signature = signature;

  const finalQuery = Object.keys(allParams)
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  return `${baseUrl}?${finalQuery}`;
}

// ============================================================
// ENDPOINTS
// ============================================================

// @route   GET api/foods/search
// @desc    Rechercher des aliments via FatSecret (OAuth 1.0)
// @access  Privé
router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.query;
  const { caloriesMin, caloriesMax, proteinMin, carbsMax, fatMax } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Veuillez spécifier un terme de recherche.' });
  }

  if (!areCredentialsConfigured()) {
    console.log('Utilisation des données Mockées (FatSecret non configuré).');
    let filtered = MOCK_FOODS.filter(food => 
      food.food_name.toLowerCase().includes(query.toLowerCase())
    );
    // Appliquer les filtres de nutriments
    if (caloriesMin) filtered = filtered.filter(f => f.calories >= parseInt(caloriesMin));
    if (caloriesMax) filtered = filtered.filter(f => f.calories <= parseInt(caloriesMax));
    if (proteinMin) filtered = filtered.filter(f => f.protein >= parseFloat(proteinMin));
    if (carbsMax) filtered = filtered.filter(f => f.carbs <= parseFloat(carbsMax));
    if (fatMax) filtered = filtered.filter(f => f.fat <= parseFloat(fatMax));

    return res.json({ foods: filtered, isMock: true });
  }

  try {
    const apiParams = {
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: '30' // Échantillon plus grand pour un filtrage efficace
    };

    const signedUrl = buildSignedUrl('GET', apiParams);
    
    console.log('Appel API FatSecret (foods.search)...');
    const response = await fetch(signedUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FatSecret API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    let foods = [];
    if (data.foods && data.foods.food) {
      const foodList = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      
      foods = foodList.map(item => {
        const desc = item.food_description || '';
        const caloriesMatch = desc.match(/Calories:\s*(\d+)kcal/i);
        const fatMatch = desc.match(/Fat:\s*([\d.]+)g/i);
        const carbsMatch = desc.match(/Carbs:\s*([\d.]+)g/i);
        const proteinMatch = desc.match(/Protein:\s*([\d.]+)g/i);
        
        let serving = '100g';
        const servingMatch = desc.match(/^Per\s+([^|-]+)/i);
        if (servingMatch) {
          serving = servingMatch[1].trim();
        }

        return {
          food_id: item.food_id,
          food_name: item.food_name,
          brand_name: item.brand_name || 'Générique',
          calories: caloriesMatch ? parseInt(caloriesMatch[1]) : 0,
          fat: fatMatch ? parseFloat(fatMatch[1]) : 0.0,
          carbs: carbsMatch ? parseFloat(carbsMatch[1]) : 0.0,
          protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0.0,
          serving: serving
        };
      });

      // Appliquer les filtres de nutriments
      if (caloriesMin) foods = foods.filter(f => f.calories >= parseInt(caloriesMin));
      if (caloriesMax) foods = foods.filter(f => f.calories <= parseInt(caloriesMax));
      if (proteinMin) foods = foods.filter(f => f.protein >= parseFloat(proteinMin));
      if (carbsMax) foods = foods.filter(f => f.carbs <= parseFloat(carbsMax));
      if (fatMax) foods = foods.filter(f => f.fat <= parseFloat(fatMax));
    }

    res.json({ foods, isMock: false });

  } catch (error) {
    console.error('Erreur API FatSecret:', error.message);
    let filtered = MOCK_FOODS.filter(food => 
      food.food_name.toLowerCase().includes(query.toLowerCase())
    );
    if (caloriesMin) filtered = filtered.filter(f => f.calories >= parseInt(caloriesMin));
    if (caloriesMax) filtered = filtered.filter(f => f.calories <= parseInt(caloriesMax));
    if (proteinMin) filtered = filtered.filter(f => f.protein >= parseFloat(proteinMin));
    if (carbsMax) filtered = filtered.filter(f => f.carbs <= parseFloat(carbsMax));
    if (fatMax) filtered = filtered.filter(f => f.fat <= parseFloat(fatMax));

    res.json({ foods: filtered, isMock: true, error: error.message });
  }
});

// @route   GET api/foods/food/:id
// @desc    Obtenir les détails nutritionnels d'un aliment
// @access  Privé
router.get('/food/:id', authMiddleware, async (req, res) => {
  const foodId = req.params.id;

  if (!areCredentialsConfigured()) {
    console.log('Détails aliment Mockés.');
    const details = MOCK_FOOD_DETAILS[foodId] || {
      food_id: foodId,
      food_name: 'Aliment Inconnu (Démo)',
      brand_name: 'Générique',
      servings: [{ calories: 100, protein: 5, carbohydrate: 15, fat: 2, saturated_fat: 0, cholesterol: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }]
    };
    return res.json({ food: details, isMock: true });
  }

  try {
    const apiParams = {
      method: 'food.get.v4', // v4 contient plus de données micronutritionnelles
      food_id: foodId,
      format: 'json'
    };

    const signedUrl = buildSignedUrl('GET', apiParams);
    
    console.log(`Appel API FatSecret (food.get) pour ID ${foodId}...`);
    const response = await fetch(signedUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FatSecret API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.food) {
      return res.status(404).json({ message: 'Aliment non trouvé sur FatSecret.' });
    }

    // Extraction et formatage des portions
    const rawFood = data.food;
    const servingsData = rawFood.servings && rawFood.servings.serving;
    const rawServings = Array.isArray(servingsData) ? servingsData : (servingsData ? [servingsData] : []);

    const servings = rawServings.map(s => ({
      calories: s.calories ? parseInt(s.calories) : 0,
      carbohydrate: s.carbohydrate ? parseFloat(s.carbohydrate) : 0.0,
      protein: s.protein ? parseFloat(s.protein) : 0.0,
      fat: s.fat ? parseFloat(s.fat) : 0.0,
      saturated_fat: s.saturated_fat ? parseFloat(s.saturated_fat) : 0.0,
      polyunsaturated_fat: s.polyunsaturated_fat ? parseFloat(s.polyunsaturated_fat) : 0.0,
      monounsaturated_fat: s.monounsaturated_fat ? parseFloat(s.monounsaturated_fat) : 0.0,
      trans_fat: s.trans_fat ? parseFloat(s.trans_fat) : 0.0,
      cholesterol: s.cholesterol ? parseFloat(s.cholesterol) : 0.0,
      sodium: s.sodium ? parseFloat(s.sodium) : 0.0,
      potassium: s.potassium ? parseFloat(s.potassium) : 0.0,
      fiber: s.fiber ? parseFloat(s.fiber) : 0.0,
      sugar: s.sugar ? parseFloat(s.sugar) : 0.0,
      serving_description: s.serving_description,
      metric_serving_amount: s.metric_serving_amount ? parseFloat(s.metric_serving_amount) : 0.0,
      metric_serving_unit: s.metric_serving_unit || 'g'
    }));

    const foodDetails = {
      food_id: rawFood.food_id,
      food_name: rawFood.food_name,
      brand_name: rawFood.brand_name || 'Générique',
      servings
    };

    res.json({ food: foodDetails, isMock: false });

  } catch (error) {
    console.error(`Erreur récupération détails aliment ${foodId}:`, error.message);
    const details = MOCK_FOOD_DETAILS[foodId] || {
      food_id: foodId,
      food_name: 'Aliment Inconnu (Démo)',
      brand_name: 'Générique',
      servings: [{ calories: 100, protein: 5, carbohydrate: 15, fat: 2, saturated_fat: 0, cholesterol: 0, sodium: 0, potassium: 0, fiber: 0, sugar: 0, serving_description: '100g', metric_serving_amount: 100, metric_serving_unit: 'g' }]
    };
    res.json({ food: details, isMock: true, error: error.message });
  }
});

// @route   GET api/foods/recipes/search
// @desc    Rechercher des recettes avec filtres avancés
// @access  Privé
router.get('/recipes/search', authMiddleware, async (req, res) => {
  const { query, caloriesMax, carbMaxPercent, proteinMinPercent, caloriesMin, proteinMin, carbsMax, fatMax } = req.query;

  if (!areCredentialsConfigured()) {
    console.log('Utilisation des recettes Mockées (FatSecret non configuré).');
    let filtered = [...MOCK_RECIPES];
    if (query) {
      filtered = filtered.filter(r => r.recipe_name.toLowerCase().includes(query.toLowerCase()) || r.recipe_description.toLowerCase().includes(query.toLowerCase()));
    }
    if (caloriesMax) {
      filtered = filtered.filter(r => r.calories <= parseInt(caloriesMax));
    }
    if (carbMaxPercent) {
      filtered = filtered.filter(r => ((r.carbs * 4) / r.calories) * 100 <= parseInt(carbMaxPercent));
    }
    if (proteinMinPercent) {
      filtered = filtered.filter(r => ((r.protein * 4) / r.calories) * 100 >= parseInt(proteinMinPercent));
    }
    // Nouveaux filtres précis
    if (caloriesMin) filtered = filtered.filter(r => r.calories >= parseInt(caloriesMin));
    if (proteinMin) filtered = filtered.filter(r => r.protein >= parseFloat(proteinMin));
    if (carbsMax) filtered = filtered.filter(r => r.carbs <= parseFloat(carbsMax));
    if (fatMax) filtered = filtered.filter(r => r.fat <= parseFloat(fatMax));

    return res.json({ recipes: filtered, isMock: true });
  }

  try {
    const apiParams = {
      method: 'recipes.search.v3',
      format: 'json',
      max_results: '24' // Plus de résultats pour filtrer précisément ensuite
    };

    if (query) apiParams.search_expression = query;
    if (caloriesMax) apiParams['calories.to'] = caloriesMax;
    if (carbMaxPercent) apiParams['carb_percentage.to'] = carbMaxPercent;
    if (proteinMinPercent) apiParams['protein_percentage.from'] = proteinMinPercent;

    const signedUrl = buildSignedUrl('GET', apiParams);
    
    console.log('Appel API FatSecret (recipes.search.v3)...');
    const response = await fetch(signedUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FatSecret API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    let recipes = [];
    if (data.recipes && data.recipes.recipe) {
      const recipeList = Array.isArray(data.recipes.recipe) ? data.recipes.recipe : [data.recipes.recipe];
      
      recipes = recipeList.map(r => ({
        recipe_id: r.recipe_id,
        recipe_name: r.recipe_name,
        recipe_description: r.recipe_description || '',
        recipe_image: r.recipe_image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
        rating: r.rating ? parseFloat(r.rating) : 4.5,
        calories: r.recipe_nutrition ? parseInt(r.recipe_nutrition.calories) : 0,
        carbs: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.carbohydrate) : 0.0,
        protein: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.protein) : 0.0,
        fat: r.recipe_nutrition ? parseFloat(r.recipe_nutrition.fat) : 0.0
      }));

      // Appliquer les filtres nutritionnels précis
      if (caloriesMin) recipes = recipes.filter(r => r.calories >= parseInt(caloriesMin));
      if (proteinMin) recipes = recipes.filter(r => r.protein >= parseFloat(proteinMin));
      if (carbsMax) recipes = recipes.filter(r => r.carbs <= parseFloat(carbsMax));
      if (fatMax) recipes = recipes.filter(r => r.fat <= parseFloat(fatMax));
    }

    res.json({ recipes, isMock: false });

  } catch (error) {
    console.error('Erreur API FatSecret Recettes:', error.message);
    // Secours sur le mock
    let filtered = [...MOCK_RECIPES];
    if (query) {
      filtered = filtered.filter(r => r.recipe_name.toLowerCase().includes(query.toLowerCase()));
    }
    if (caloriesMin) filtered = filtered.filter(r => r.calories >= parseInt(caloriesMin));
    if (caloriesMax) filtered = filtered.filter(r => r.calories <= parseInt(caloriesMax));
    if (proteinMin) filtered = filtered.filter(r => r.protein >= parseFloat(proteinMin));
    if (carbsMax) filtered = filtered.filter(r => r.carbs <= parseFloat(carbsMax));
    if (fatMax) filtered = filtered.filter(r => r.fat <= parseFloat(fatMax));

    res.json({ recipes: filtered, isMock: true, error: error.message });
  }
});

// @route   GET api/foods/recipes/:id
// @desc    Obtenir le détail d'une recette (ingrédients et étapes)
// @access  Privé
router.get('/recipes/:id', authMiddleware, async (req, res) => {
  const recipeId = req.params.id;

  if (!areCredentialsConfigured()) {
    const recipe = MOCK_RECIPES.find(r => r.recipe_id === recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée.' });
    }
    return res.json({ recipe, isMock: true });
  }

  try {
    const apiParams = {
      method: 'recipe.get',
      recipe_id: recipeId,
      format: 'json'
    };

    const signedUrl = buildSignedUrl('GET', apiParams);
    
    console.log(`Appel API FatSecret (recipe.get) pour ID ${recipeId}...`);
    const response = await fetch(signedUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FatSecret API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.recipe) {
      return res.status(404).json({ message: 'Recette non trouvée.' });
    }

    const r = data.recipe;

    // Parser les ingrédients (gérer le cas d'un objet unique ou d'un tableau)
    const ingredientsData = r.ingredients && r.ingredients.ingredient;
    const rawIngredients = Array.isArray(ingredientsData) ? ingredientsData : (ingredientsData ? [ingredientsData] : []);
    const ingredients = rawIngredients.map(i => i.ingredient_description);

    // Parser les instructions de préparation
    const directionsData = r.directions && r.directions.direction;
    const rawDirections = Array.isArray(directionsData) ? directionsData : (directionsData ? [directionsData] : []);
    const directions = rawDirections
      .sort((a, b) => parseInt(a.direction_number) - parseInt(b.direction_number))
      .map(d => d.direction_description);

    // Extraction de la nutrition depuis serving_sizes.serving ou recipe_nutrition
    let nutrition = {};
    if (r.serving_sizes && r.serving_sizes.serving) {
      const s = Array.isArray(r.serving_sizes.serving) ? r.serving_sizes.serving[0] : r.serving_sizes.serving;
      nutrition = s || {};
    } else if (r.recipe_nutrition) {
      nutrition = r.recipe_nutrition;
    }

    const recipeDetails = {
      recipe_id: r.recipe_id,
      recipe_name: r.recipe_name,
      recipe_description: r.recipe_description || '',
      recipe_image: r.recipe_image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
      preparation_time_min: r.preparation_time_min ? parseInt(r.preparation_time_min) : 0,
      cooking_time_min: r.cooking_time_min ? parseInt(r.cooking_time_min) : 0,
      rating: r.rating ? parseFloat(r.rating) : 4.5,
      calories: nutrition.calories ? Math.round(parseFloat(nutrition.calories)) : 0,
      carbs: nutrition.carbohydrate ? parseFloat(nutrition.carbohydrate) : 0.0,
      protein: nutrition.protein ? parseFloat(nutrition.protein) : 0.0,
      fat: nutrition.fat ? parseFloat(nutrition.fat) : 0.0,
      ingredients,
      directions
    };

    res.json({ recipe: recipeDetails, isMock: false });

  } catch (error) {
    console.error(`Erreur récupération recette ${recipeId}:`, error.message);
    const recipe = MOCK_RECIPES.find(r => r.recipe_id === recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recette non trouvée.' });
    }
    res.json({ recipe, isMock: true, error: error.message });
  }
});

module.exports = router;
