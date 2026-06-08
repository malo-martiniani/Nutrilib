const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');

// Mock de base de données d'aliments au cas où les clés ne sont pas configurées
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
// Implémentation OAuth 1.0 (HMAC-SHA1) pour FatSecret
// ============================================================

// Encodage RFC 3986 (percent-encoding strict)
function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

// Générer un nonce aléatoire
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Construire la requête signée OAuth 1.0 pour FatSecret
function buildSignedUrl(method, apiParams) {
  const consumerKey = process.env.FATSECRET_CLIENT_ID;
  const consumerSecret = process.env.FATSECRET_CLIENT_SECRET;
  const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

  // Paramètres OAuth obligatoires
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: generateNonce(),
    oauth_version: '1.0'
  };

  // Fusionner tous les paramètres (API + OAuth)
  const allParams = { ...apiParams, ...oauthParams };

  // Trier les paramètres par ordre alphabétique et les encoder
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  // Construire la Base String (méthode&URL&params)
  const baseString = [
    method.toUpperCase(),
    percentEncode(baseUrl),
    percentEncode(paramString)
  ].join('&');

  // Clé de signature = consumer_secret& (pas de token secret en 2-legged OAuth)
  const signingKey = `${percentEncode(consumerSecret)}&`;

  // Calculer la signature HMAC-SHA1
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(baseString)
    .digest('base64');

  // Construire l'URL finale avec tous les paramètres + signature
  allParams.oauth_signature = signature;

  const finalQuery = Object.keys(allParams)
    .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
    .join('&');

  return `${baseUrl}?${finalQuery}`;
}

// @route   GET api/foods/search
// @desc    Rechercher des aliments via FatSecret (OAuth 1.0) ou mock si non configuré
// @access  Privé (nécessite d'être connecté)
router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ message: 'Veuillez spécifier un terme de recherche.' });
  }

  if (!areCredentialsConfigured()) {
    console.log('Utilisation des données Mockées (FatSecret non configuré).');
    const filtered = MOCK_FOODS.filter(food => 
      food.food_name.toLowerCase().includes(query.toLowerCase())
    );
    return res.json({ foods: filtered, isMock: true });
  }

  try {
    // Paramètres de la requête API FatSecret
    const apiParams = {
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: '15'
    };

    // Construire l'URL signée OAuth 1.0
    const signedUrl = buildSignedUrl('GET', apiParams);
    
    console.log('Appel API FatSecret (OAuth 1.0)...');
    const response = await fetch(signedUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FatSecret API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Formater la réponse FatSecret pour simplifier l'utilisation côté front
    let foods = [];
    if (data.foods && data.foods.food) {
      const foodList = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
      
      foods = foodList.map(item => {
        // FatSecret renvoie une chaîne "food_description" contenant les macros, ex:
        // "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
        // Nous allons parser cette chaîne pour en extraire des valeurs numériques propres
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
    }

    res.json({ foods, isMock: false });

  } catch (error) {
    console.error('Erreur API FatSecret:', error.message);
    // En cas d'erreur de clé ou de réseau, on bascule sur le mock au lieu de planter
    console.log('Bascule de secours sur les données Mockées.');
    const filtered = MOCK_FOODS.filter(food => 
      food.food_name.toLowerCase().includes(query.toLowerCase())
    );
    res.json({ foods: filtered, isMock: true, error: error.message });
  }
});

module.exports = router;
