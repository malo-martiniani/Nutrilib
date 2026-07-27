// Dataset de Secours / Hors-ligne (Exam Safety Net)
// Contient 22 recettes complètes utilisables sans backend ni connexion internet.

export const FALLBACK_RECIPES = [
  {
    recipe_id: 'fb_101',
    recipe_name: 'Salade de Poulet Keto au Fromage Blanc',
    recipe_name_en: 'Keto Chicken Salad with Cottage Cheese',
    recipe_description: 'Une salade fraîche, faible en glucides et très riche en protéines, avec une sauce crémeuse légère. [Keto, Cétogène]',
    recipe_description_en: 'A fresh, low-carb, high-protein salad with a light creamy dressing. [Keto]',
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
      '1 c. à café de jus de citron',
      'Sel et poivre au goût'
    ],
    ingredients_en: [
      '150g cooked chicken breast, shredded',
      '50g 0% fat cottage cheese',
      '1/2 diced avocado',
      '2 cups romaine lettuce',
      '1 tsp lemon juice',
      'Salt and pepper to taste'
    ],
    directions: [
      'Dans un bol, mélangez le fromage blanc, le jus de citron, le sel et le poivre pour former la sauce.',
      'Dans un grand saladier, disposez la laitue, le poulet émincé et l\'avocat.',
      'Versez la sauce et mélangez délicatement avant de servir.'
    ],
    directions_en: [
      'In a bowl, mix cottage cheese, lemon juice, salt, and pepper to make the dressing.',
      'In a large bowl, arrange lettuce, shredded chicken, and avocado.',
      'Pour dressing over salad and toss gently before serving.'
    ]
  },
  {
    recipe_id: 'fb_102',
    recipe_name: 'Omelette Légère Épinards et Féta',
    recipe_name_en: 'Light Spinach & Feta Omelette',
    recipe_description: 'Une omelette protéinée, rapide à réaliser et pauvre en calories pour le petit-déjeuner ou le déjeuner.',
    recipe_description_en: 'A high-protein, quick, low-calorie omelette ideal for breakfast or lunch.',
    recipe_image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400',
    preparation_time_min: 5,
    cooking_time_min: 7,
    rating: 4.6,
    calories: 240,
    carbs: 4,
    protein: 22,
    fat: 14,
    ingredients: [
      '2 œufs entiers + 2 blancs d\'œufs',
      '1 tasse d\'épinards frais',
      '30g de féta allégée émiettée',
      '1/2 c. à café d\'huile d\'olive',
      'Sel, poivre et origan'
    ],
    ingredients_en: [
      '2 whole eggs + 2 egg whites',
      '1 cup fresh spinach',
      '30g crumbled light feta',
      '1/2 tsp olive oil',
      'Salt, pepper, and oregano'
    ],
    directions: [
      'Battez les œufs et les blancs dans un bol avec le sel et le poivre.',
      'Faites suer les épinards dans une poêle antiadhésive avec l\'huile d\'olive pendant 1 minute.',
      'Versez les œufs battus, ajoutez la féta par-dessus et laissez cuire à feu doux pendant 5 minutes.'
    ],
    directions_en: [
      'Whisk eggs and whites in a bowl with salt and pepper.',
      'Saute spinach in a non-stick pan with olive oil for 1 minute.',
      'Pour beaten eggs, sprinkle feta on top, and cook over low heat for 5 minutes.'
    ]
  },
  {
    recipe_id: 'fb_103',
    recipe_name: 'Porridge Protéiné Avoine et Flocons',
    recipe_name_en: 'Protein Berry Oatmeal Porridge',
    recipe_description: 'Un bol chaud d\'avoine enrichi en whey protéine et garni de fruits rouges frais.',
    recipe_description_en: 'A warm bowl of oats enriched with whey protein and topped with fresh berries.',
    recipe_image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400',
    preparation_time_min: 5,
    cooking_time_min: 5,
    rating: 4.9,
    calories: 350,
    carbs: 45,
    protein: 28,
    fat: 5,
    ingredients: [
      '50g de flocons d\'avoine complets',
      '200ml de lait d\'amande sans sucre',
      '30g de whey protéine vanille',
      '50g de myrtilles et framboises',
      '1 c. à café de graines de chia'
    ],
    ingredients_en: [
      '50g rolled oats',
      '200ml unsweetened almond milk',
      '30g vanilla whey protein',
      '50g fresh blueberries and raspberries',
      '1 tsp chia seeds'
    ],
    directions: [
      'Faites chauffer l\'avoine et le lait d\'amande dans une casserole pendant 4 minutes en remuant.',
      'Retirez du feu et incorporez la whey protéine en mélangeant vigoureusement.',
      'Versez dans un bol et décorez avec les fruits rouges et graines de chia.'
    ],
    directions_en: [
      'Heat oats and almond milk in a saucepan for 4 minutes, stirring constantly.',
      'Remove from heat and vigorously stir in the whey protein.',
      'Pour into a bowl and top with berries and chia seeds.'
    ]
  },
  {
    recipe_id: 'fb_104',
    recipe_name: 'Pavé de Saumon et Quinoa aux Légumes',
    recipe_name_en: 'Grilled Salmon & Vegetable Quinoa',
    recipe_description: 'Un plat équilibré riche en oméga-3, glucides complexes et minéraux.',
    recipe_description_en: 'A balanced dish rich in omega-3s, complex carbs, and minerals.',
    recipe_image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    preparation_time_min: 10,
    cooking_time_min: 15,
    rating: 4.7,
    calories: 490,
    carbs: 38,
    protein: 36,
    fat: 20,
    ingredients: [
      '140g de pavé de saumon frais',
      '60g de quinoa cru (ou 150g cuit)',
      '1/2 courgette coupée en dés',
      '1 c. à soupe d\'huile d\'olive',
      '1 quartier de citron vert'
    ],
    ingredients_en: [
      '140g fresh salmon fillet',
      '60g raw quinoa (or 150g cooked)',
      '1/2 diced zucchini',
      '1 tbsp olive oil',
      '1 lime wedge'
    ],
    directions: [
      'Faites cuire le quinoa dans l\'eau bouillante salée pendant 12 minutes.',
      'Saisissez le saumon à la poêle 4 minutes de chaque côté.',
      'Faites sauter la courgette avec l\'huile d\'olive et servez avec le quinoa et le citron.'
    ],
    directions_en: [
      'Cook quinoa in boiling salted water for 12 minutes.',
      'Sear salmon in a pan for 4 minutes per side.',
      'Saute zucchini with olive oil and serve alongside quinoa and lime.'
    ]
  },
  {
    recipe_id: 'fb_105',
    recipe_name: 'Bol de Poulet Rôti et Patate Douce',
    recipe_name_en: 'Roasted Chicken & Sweet Potato Power Bowl',
    recipe_description: 'Un Power Bowl complet, idéal pour la récupération musculaire post-entraînement.',
    recipe_description_en: 'A complete Power Bowl ideal for post-workout muscle recovery.',
    recipe_image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400',
    preparation_time_min: 15,
    cooking_time_min: 20,
    rating: 4.8,
    calories: 510,
    carbs: 52,
    protein: 42,
    fat: 12,
    ingredients: [
      '160g de blanc de poulet rôti',
      '150g de patate douce en cubes',
      '100g de brocolis vapeur',
      '1 c. à soupe d\'huile d\'olive',
      'Herbes de Provence et paprika'
    ],
    ingredients_en: [
      '160g roasted chicken breast',
      '150g cubed sweet potato',
      '100g steamed broccoli',
      '1 tbsp olive oil',
      'Herbs de Provence and paprika'
    ],
    directions: [
      'Faites rôtir la patate douce au four avec l\'huile d\'olive et le paprika à 200°C pendant 20 min.',
      'Faites cuire les brocolis à la vapeur pendant 6 min.',
      'Assemblez le poulet rôti, la patate douce et le brocoli dans un grand bol.'
    ],
    directions_en: [
      'Roast sweet potato cubes with olive oil and paprika at 200°C for 20 mins.',
      'Steam broccoli florets for 6 mins.',
      'Assemble roasted chicken, sweet potato, and broccoli in a large bowl.'
    ]
  },
  {
    recipe_id: 'fb_106',
    recipe_name: 'Wrap de Dinde et Avocat Rapide',
    recipe_name_en: 'Quick Turkey & Avocado Wrap',
    recipe_description: 'Un wrap protéiné prêt en 5 minutes, parfait pour un déjeuner sur le pouce.',
    recipe_description_en: 'A protein-packed wrap ready in 5 minutes, perfect for lunch on the go.',
    recipe_image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
    preparation_time_min: 5,
    cooking_time_min: 0,
    rating: 4.5,
    calories: 360,
    carbs: 28,
    protein: 30,
    fat: 14,
    ingredients: [
      '1 tortilla de blé complet',
      '100g de filet de dinde cuit',
      '1/2 avocat écrasé',
      '1/2 tomate en rondelles',
      'Quelques feuilles de roquette'
    ],
    ingredients_en: [
      '1 whole wheat tortilla',
      '100g cooked turkey breast',
      '1/2 mashed avocado',
      '1/2 sliced tomato',
      'Handful of arugula'
    ],
    directions: [
      'Étalez l\'avocat écrasé sur la tortilla.',
      'Ajoutez les tranches de dinde, les tomates et la roquette.',
      'Roulez fermement la tortilla et coupez-la en deux.'
    ],
    directions_en: [
      'Spread mashed avocado over tortilla.',
      'Layer turkey slices, tomatoes, and arugula on top.',
      'Roll tightly and slice in half.'
    ]
  },
  {
    recipe_id: 'fb_107',
    recipe_name: 'Pancakes Protéinés à la Banane',
    recipe_name_en: 'Banana Protein Pancakes',
    recipe_description: 'Des pancakes moelleux sans sucre ajouté, très riches en protéines.',
    recipe_description_en: 'Fluffy sugar-free pancakes rich in protein.',
    recipe_image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400',
    preparation_time_min: 5,
    cooking_time_min: 8,
    rating: 4.9,
    calories: 380,
    carbs: 42,
    protein: 32,
    fat: 8,
    ingredients: [
      '1 banane mûre',
      '2 œufs',
      '30g de flocons d\'avoine mixés',
      '25g de whey protéine',
      '1/2 c. à café de levure chimique'
    ],
    ingredients_en: [
      '1 ripe banana',
      '2 eggs',
      '30g oat flour',
      '25g whey protein',
      '1/2 tsp baking powder'
    ],
    directions: [
      'Écrasez la banane et mélangez-la avec les œufs, l\'avoine, la whey et la levure.',
      'Versez des louches de pâte dans une poêle chaude antiadhésive.',
      'Faites cuire 2 min de chaque côté jusqu\'à ce qu\'ils soient dorés.'
    ],
    directions_en: [
      'Mash banana and whisk with eggs, oat flour, whey, and baking powder.',
      'Pour batter portions into a hot non-stick skillet.',
      'Cook for 2 mins per side until golden brown.'
    ]
  },
  {
    recipe_id: 'fb_108',
    recipe_name: 'Poke Bowl Thon et Edamame',
    recipe_name_en: 'Tuna & Edamame Poke Bowl',
    recipe_description: 'Un Poke Bowl hawaïen frais avec du thon, du riz complet et des edamames.',
    recipe_description_en: 'A fresh Hawaiian Poke Bowl with tuna, brown rice, and edamame.',
    recipe_image: 'https://images.unsplash.com/photo-1546069901-d5794e756c07?w=400',
    preparation_time_min: 15,
    cooking_time_min: 0,
    rating: 4.8,
    calories: 440,
    carbs: 48,
    protein: 35,
    fat: 10,
    ingredients: [
      '120g de thon rouge frais en dés',
      '100g de riz complet cuit',
      '50g d\'edamames écossés',
      '1/4 concombre en tranches',
      '1 c. à soupe de sauce soja allégée'
    ],
    ingredients_en: [
      '120g fresh tuna steak, cubed',
      '100g cooked brown rice',
      '50g shelled edamame',
      '1/4 sliced cucumber',
      '1 tbsp low-sodium soy sauce'
    ],
    directions: [
      'Disposez le riz au fond du bol.',
      'Ajoutez le thon en dés, les edamames et les tranches de concombre.',
      'Arrosez de sauce soja et servez bien frais.'
    ],
    directions_en: [
      'Place rice in the bottom of a bowl.',
      'Arrange tuna cubes, edamame, and cucumber slices on top.',
      'Drizzle with soy sauce and serve chilled.'
    ]
  },
  {
    recipe_id: 'fb_109',
    recipe_name: 'Chili Con Carne Fort en Protéines',
    recipe_name_en: 'High Protein Beef Chili Con Carne',
    recipe_description: 'Un classique réconfortant avec du bœuf haché 5% et des haricots rouges.',
    recipe_description_en: 'A comforting classic made with 5% fat minced beef and kidney beans.',
    recipe_image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400',
    preparation_time_min: 10,
    cooking_time_min: 25,
    rating: 4.7,
    calories: 480,
    carbs: 35,
    protein: 44,
    fat: 14,
    ingredients: [
      '150g de bœuf haché 5%',
      '100g de haricots rouges en conserve',
      '150g de coulis de tomate',
      '1/2 oignon haché',
      'Épices chili et cumin'
    ],
    ingredients_en: [
      '150g 5% lean minced beef',
      '100g canned kidney beans',
      '150g tomato puree',
      '1/2 chopped onion',
      'Chili spices and cumin'
    ],
    directions: [
      'Faites revenir l\'oignon et le bœuf dans une sauteuse.',
      'Ajoutez le coulis de tomate, les haricots rouges et les épices.',
      'Laissez mijoter à feu doux pendant 20 minutes.'
    ],
    directions_en: [
      'Saute onion and beef in a skillet.',
      'Add tomato puree, kidney beans, and spices.',
      'Simmer over low heat for 20 minutes.'
    ]
  },
  {
    recipe_id: 'fb_110',
    recipe_name: 'Pâtes Integrales au Pesto et Crevettes',
    recipe_name_en: 'Whole Wheat Pasta with Pesto & Shrimp',
    recipe_description: 'Des pâtes complètes savoureuses mariées avec des crevettes poêlées au basilic.',
    recipe_description_en: 'Tasty whole wheat pasta paired with basil sautéed shrimp.',
    recipe_image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281316?w=400',
    preparation_time_min: 10,
    cooking_time_min: 10,
    rating: 4.6,
    calories: 420,
    carbs: 50,
    protein: 34,
    fat: 10,
    ingredients: [
      '70g de pâtes complètes crues',
      '120g de crevettes décortiquées',
      '1 c. à soupe de pesto basilic',
      '5 tomates cerises coupées en deux'
    ],
    ingredients_en: [
      '70g raw whole wheat pasta',
      '120g peeled shrimp',
      '1 tbsp basil pesto',
      '5 halved cherry tomatoes'
    ],
    directions: [
      'Faites cuire les pâtes al dente dans l\'eau bouillante salée.',
      'Faites poêler les crevettes 3 minutes avec les tomates cerises.',
      'Mélangez le tout avec le pesto et servez chaud.'
    ],
    directions_en: [
      'Cook pasta al dente in boiling salted water.',
      'Saute shrimp for 3 minutes with cherry tomatoes.',
      'Toss everything together with pesto and serve warm.'
    ]
  },
  {
    recipe_id: 'fb_111',
    recipe_name: 'Chia Pudding Coco et Mangue',
    recipe_name_en: 'Coconut Mango Chia Pudding',
    recipe_description: 'Un dessert ou petit-déjeuner rafraîchissant riche en fibres et oméga-3.',
    recipe_description_en: 'A refreshing dessert or breakfast rich in fiber and omega-3s.',
    recipe_image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400',
    preparation_time_min: 5,
    cooking_time_min: 0,
    rating: 4.8,
    calories: 260,
    carbs: 26,
    protein: 8,
    fat: 12,
    ingredients: [
      '30g de graines de chia',
      '150ml de lait de coco léger',
      '60g de dés de mangue fraîche',
      '1 c. à café de miel'
    ],
    ingredients_en: [
      '30g chia seeds',
      '150ml light coconut milk',
      '60g fresh mango cubes',
      '1 tsp honey'
    ],
    directions: [
      'Mélangez les graines de chia, le lait de coco et le miel dans un verre.',
      'Laissez reposer au réfrigérateur au moins 2 heures.',
      'Ajoutez les dés de mangue par-dessus avant de déguster.'
    ],
    directions_en: [
      'Mix chia seeds, coconut milk, and honey in a glass.',
      'Refrigerate for at least 2 hours to thicken.',
      'Top with fresh mango cubes before enjoying.'
    ]
  },
  {
    recipe_id: 'fb_112',
    recipe_name: 'Bowl de Tofu Poêlé et Légumes Verts',
    recipe_name_en: 'Sautéed Tofu & Green Veggies Bowl',
    recipe_description: 'Un bol végétalien équilibré avec du tofu doré à la sauce soja.',
    recipe_description_en: 'A balanced vegan bowl featuring soy-marinated crispy tofu.',
    recipe_image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    preparation_time_min: 10,
    cooking_time_min: 12,
    rating: 4.5,
    calories: 340,
    carbs: 24,
    protein: 26,
    fat: 16,
    ingredients: [
      '150g de tofu ferme en cubes',
      '100g de haricots verts cuits',
      '1 c. à soupe de sauce soja',
      '1 c. à café d\'huile de sésame',
      'Graines de sésame pour la finition'
    ],
    ingredients_en: [
      '150g firm tofu, cubed',
      '100g cooked green beans',
      '1 tbsp soy sauce',
      '1 tsp sesame oil',
      'Sesame seeds for garnish'
    ],
    directions: [
      'Faites dorera le tofu dans une poêle avec l\'huile de sésame pendant 8 min.',
      'Déglacez avec la sauce soja et ajoutez les haricots verts.',
      'Servez saupoudré de graines de sésame.'
    ],
    directions_en: [
      'Brown tofu cubes in a pan with sesame oil for 8 mins.',
      'Deglaze with soy sauce and stir in green beans.',
      'Serve sprinkled with sesame seeds.'
    ]
  }
];

// Helper de filtrage local en mode secours
export function filterFallbackRecipes(params = {}, lang = 'fr') {
  let list = FALLBACK_RECIPES.map(r => {
    if (lang === 'en') {
      return {
        ...r,
        recipe_name: r.recipe_name_en || r.recipe_name,
        recipe_description: r.recipe_description_en || r.recipe_description,
        ingredients: r.ingredients_en || r.ingredients,
        directions: r.directions_en || r.directions
      };
    }
    return r;
  });

  const { query, caloriesMin, caloriesMax, proteinMin, carbsMax, fatMax, filterKeto, filterHighProtein, filterLight } = params;

  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    list = list.filter(r => 
      r.recipe_name.toLowerCase().includes(q) || 
      r.recipe_description.toLowerCase().includes(q)
    );
  }

  if (filterLight) list = list.filter(r => r.calories <= 400);
  if (filterKeto) list = list.filter(r => r.carbs <= 15);
  if (filterHighProtein) list = list.filter(r => r.protein >= 28);

  if (caloriesMin) list = list.filter(r => r.calories >= parseInt(caloriesMin));
  if (caloriesMax) list = list.filter(r => r.calories <= parseInt(caloriesMax));
  if (proteinMin) list = list.filter(r => r.protein >= parseFloat(proteinMin));
  if (carbsMax) list = list.filter(r => r.carbs <= parseFloat(carbsMax));
  if (fatMax) list = list.filter(r => r.fat <= parseFloat(fatMax));

  return list;
}
