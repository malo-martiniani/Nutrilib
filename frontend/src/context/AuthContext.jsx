import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

const TRANSLATIONS = {
  fr: {
    loading: 'Chargement',
    logout: 'Quitter',
    username: "Nom d'utilisateur",
    email: 'Adresse email',
    password: 'Mot de passe',
    login: 'Se connecter',
    register: "S'inscrire",
    noAccount: "Vous n'avez pas de compte ?",
    alreadyAccount: 'Déjà un compte ?',
    errorServer: 'Erreur serveur.',
    tab_journal: 'Journal',
    tab_recipes: 'Recettes',
    tab_weight: 'Poids',
    tab_favorites: 'Favoris',
    tab_profile: 'Profil',
    search_placeholder: 'Rechercher un aliment...',
    search_no_results: 'Aucun résultat pour',
    advanced_filters: 'Filtres avancés',
    cal_min_max: 'Calories (Min - Max)',
    prot_min: 'Protéines Min (g)',
    carbs_max: 'Glucides Max (g)',
    fat_max: 'Lipides Max (g)',
    reset_filters: 'Réinitialiser',
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    snack: 'Collation',
    add_food: 'Ajouter un aliment',
    add_to: 'Ajouter à :',
    no_list: 'Aucune liste.',
    remaining: 'Restant',
    target: 'Objectif',
    food: 'Aliments',
    protein: 'Protéines',
    carbs: 'Glucides',
    fat: 'Lipides',
    water_tracker: 'Suivi de l\'Eau',
    add_water: 'Ajouter 250ml',
    reset_water: 'Réinitialiser',
    no_food_logged: 'Aucun aliment enregistré aujourd\'hui.',
    micro_details: 'Détails des Micronutriments',
    sugar: 'Sucre',
    fiber: 'Fibres',
    sodium: 'Sodium',
    potassium: 'Potassium',
    cholesterol: 'Cholestérol',
    sat_fat: 'Graisses saturées',
    search_recipe_placeholder: 'Rechercher une recette...',
    custom_recipes: 'Mes Recettes',
    discover_recipes: 'Découvrir',
    create_recipe: 'Créer une recette',
    prep_time: 'Préparation',
    cook_time: 'Cuisson',
    rating: 'Note',
    servings: 'portions',
    ingredients: 'Ingrédients',
    directions: 'Instructions',
    add_to_journal: 'Ajouter au journal',
    add_ingredient: 'Ajouter un ingrédient',
    recipe_name: 'Nom de la recette',
    description: 'Description',
    image_url: 'URL de l\'image (optionnel)',
    number_servings: 'Nombre de portions',
    save_recipe: 'Enregistrer la recette',
    no_custom_recipes: 'Vous n\'avez pas encore créé de recette.',
    weight_tracker_title: 'Suivi du Poids',
    log_weight: 'Enregistrer votre poids',
    weight_placeholder: 'Poids (kg)',
    save: 'Enregistrer',
    weight_history: 'Historique du poids',
    delete: 'Supprimer',
    no_weight_data: 'Aucune donnée de poids enregistrée.',
    favorites_title: 'Mes Aliments Favoris',
    no_favorites: 'Vous n\'avez pas encore d\'aliments favoris.',
    my_lists: 'Mes Listes d\'Épicerie',
    create_list: 'Créer une nouvelle liste',
    list_name_placeholder: 'Nom de la liste',
    create: 'Créer',
    no_lists: 'Vous n\'avez pas encore de listes.',
    empty_list: 'Cette liste est vide.',
    profile_title: 'Mon Profil & Objectifs',
    display_name: 'Nom d\'affichage',
    gender: 'Genre',
    male: 'Homme',
    female: 'Femme',
    age: 'Âge',
    height: 'Taille (cm)',
    weight_label: 'Poids actuel (kg)',
    activity_level: 'Niveau d\'activité',
    sedentary: 'Sédentaire',
    lightly_active: 'Légèrement actif',
    moderately_active: 'Modérément actif',
    very_active: 'Très actif',
    goal_type: 'Objectif de poids',
    lose_weight: 'Perdre du poids',
    maintain_weight: 'Maintenir le poids',
    gain_weight: 'Prendre du poids',
    target_weight_label: 'Poids cible (kg)',
    goal_speed: 'Rythme',
    slow: 'Lent',
    normal: 'Normal',
    fast: 'Rapide',
    macro_split: 'Répartition des Macronutriments',
    update_goals: 'Mettre à jour mes objectifs',
    goals_updated_success: 'Objectifs mis à jour avec succès !',

    // New keys
    login_title_login: 'Connectez-vous pour accéder à votre journal.',
    login_title_register: 'Créez votre compte nutritionnel.',
    validation_fill_fields: 'Veuillez remplir tous les champs.',
    validation_username_len: "Le nom d'utilisateur doit faire au moins 3 caractères.",
    validation_password_len: 'Le mot de passe doit faire au moins 8 caractères.',
    validation_password_complexity: 'Le mot de passe doit contenir au moins une lettre et un chiffre.',
    sign_up_action: 'Inscrivez-vous',
    sign_in_action: 'Connectez-vous',
    create_account: 'Créer mon compte',
    no_account_yet: 'Pas encore de compte ? ',
    already_account_link: 'Vous avez déjà un compte ? ',
    date: 'Date',
    evolution_chart: "Courbe d'évolution",
    weight_variations: 'Variations de poids au fil du temps',
    min_weights_required: 'Min. 2 mesures requises',
    confirm_delete_weight: 'Supprimer cette mesure ?',
    weight_input_title: 'Saisie du poids',
    no_history: 'Aucun historique.',
    calories_consumed: 'Calories consommées',
    consumed: 'Consommé',
    micro_details_today: '🔬 Détails Micronutriments du jour',
    hide: 'Masquer',
    show: 'Afficher',
    items_count: 'aliment(s)',
    add: 'Ajouter',
    add_to_meal: 'Ajouter au',
    search_food_or_recipe: 'Rechercher un aliment ou une recette',
    close: 'Fermer',
    food_placeholder: 'Saisissez un aliment (ex: riz, œuf...)',
    no_food_found: 'Aucun aliment trouvé pour',
    type_to_search: 'Commencez à taper pour rechercher...',
    select: 'sélectionner',
    cancel: 'Annuler',
    choose_meal: 'Choisir le repas',
    amount: 'Quantité',
    add_to_meal_btn: 'Ajouter au repas',
    nutrition: 'Nutrition',
    kcal_per_serving: 'kcal/portion',
    evolution_chart_title: "Courbe d'évolution",
    confirm_delete_favorite: 'Retirer des favoris ?',
    click_heart_to_favorite: 'Cliquez sur le cœur lors de vos recherches.',
    create_list_above: 'Créez une liste ci-dessus.',
    empty_list_text: 'Liste vide.',
    add_food_to_list: 'Ajouter un aliment à cette liste',
    custom_recipes_title: 'Mes Créations',
    advanced_filters_title: 'Filtres avancés',
    search: 'Rechercher',
    private_profile: 'Profil Privé',
    private_profile_desc: 'Masque vos informations aux autres.',
    save_profile: 'Enregistrer mon profil',
    saving_profile: 'Enregistrement...',
    tdee_calculator: 'Calculateur TDEE',
    meal_calorie_goals: 'Objectif Calorique par Repas',
    diet_type: 'Régime Alimentaire',
    nutrition_preference: 'Préférence Nutritionnelle',
    choose_avatar: 'Choisissez un avatar ou insérez une URL.',
    custom_url: 'URL personnalisée',
    avatars: 'Avatars'
  },
  en: {
    loading: 'Loading',
    logout: 'Logout',
    username: 'Username',
    email: 'Email address',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    noAccount: "Don't have an account?",
    alreadyAccount: 'Already have an account?',
    errorServer: 'Server error.',
    tab_journal: 'Journal',
    tab_recipes: 'Recipes',
    tab_weight: 'Weight',
    tab_favorites: 'Favorites',
    tab_profile: 'Profile',
    search_placeholder: 'Search for a food...',
    search_no_results: 'No results for',
    advanced_filters: 'Advanced filters',
    cal_min_max: 'Calories (Min - Max)',
    prot_min: 'Min Protein (g)',
    carbs_max: 'Max Carbs (g)',
    fat_max: 'Max Fat (g)',
    reset_filters: 'Reset',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    add_food: 'Add food',
    add_to: 'Add to:',
    no_list: 'No list.',
    remaining: 'Remaining',
    target: 'Goal',
    food: 'Food',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    water_tracker: 'Water Tracker',
    add_water: 'Add 250ml',
    reset_water: 'Reset',
    no_food_logged: 'No food logged today.',
    micro_details: 'Micronutrient Details',
    sugar: 'Sugar',
    fiber: 'Fiber',
    sodium: 'Sodium',
    potassium: 'Potassium',
    cholesterol: 'Cholesterol',
    sat_fat: 'Saturated fat',
    search_recipe_placeholder: 'Search for a recipe...',
    custom_recipes: 'My Recipes',
    discover_recipes: 'Discover',
    create_recipe: 'Create a recipe',
    prep_time: 'Prep Time',
    cook_time: 'Cook Time',
    rating: 'Rating',
    servings: 'servings',
    ingredients: 'Ingredients',
    directions: 'Directions',
    add_to_journal: 'Add to journal',
    add_ingredient: 'Add ingredient',
    recipe_name: 'Recipe Name',
    description: 'Description',
    image_url: 'Image URL (optional)',
    number_servings: 'Number of servings',
    save_recipe: 'Save Recipe',
    no_custom_recipes: 'You haven\'t created any recipes yet.',
    weight_tracker_title: 'Weight Tracker',
    log_weight: 'Log your weight',
    weight_placeholder: 'Weight (kg)',
    save: 'Save',
    weight_history: 'Weight History',
    delete: 'Delete',
    no_weight_data: 'No weight data logged.',
    favorites_title: 'My Favorite Foods',
    no_favorites: 'You don\'t have any favorite foods yet.',
    my_lists: 'My Grocery Lists',
    create_list: 'Create new list',
    list_name_placeholder: 'List name',
    create: 'Create',
    no_lists: 'You don\'t have any lists yet.',
    empty_list: 'This list is empty.',
    profile_title: 'My Profile & Goals',
    display_name: 'Display Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    age: 'Age',
    height: 'Height (cm)',
    weight_label: 'Current Weight (kg)',
    activity_level: 'Activity Level',
    sedentary: 'Sedentary',
    lightly_active: 'Lightly active',
    moderately_active: 'Moderately active',
    very_active: 'Very active',
    goal_type: 'Weight Goal',
    lose_weight: 'Lose weight',
    maintain_weight: 'Maintain weight',
    gain_weight: 'Gain weight',
    target_weight_label: 'Target Weight (kg)',
    goal_speed: 'Speed',
    slow: 'Slow',
    normal: 'Normal',
    fast: 'Fast',
    macro_split: 'Macronutrient Split',
    update_goals: 'Update my goals',
    goals_updated_success: 'Goals updated successfully!',

    // New keys
    login_title_login: 'Log in to access your journal.',
    login_title_register: 'Create your nutritional account.',
    validation_fill_fields: 'Please fill in all fields.',
    validation_username_len: 'Username must be at least 3 characters.',
    validation_password_len: 'Password must be at least 8 characters.',
    validation_password_complexity: 'Password must contain at least one letter and one number.',
    sign_up_action: 'Sign up',
    sign_in_action: 'Sign in',
    create_account: 'Create account',
    no_account_yet: "Don't have an account? ",
    already_account_link: 'Already have an account? ',
    date: 'Date',
    evolution_chart: 'Evolution Chart',
    weight_variations: 'Weight variations over time',
    min_weights_required: 'Min. 2 measurements required',
    confirm_delete_weight: 'Delete this measurement?',
    weight_input_title: 'Log Weight',
    no_history: 'No history.',
    calories_consumed: 'Calories consumed',
    consumed: 'Consumed',
    micro_details_today: '🔬 Today\'s Micronutrients Details',
    hide: 'Hide',
    show: 'Show',
    items_count: 'food item(s)',
    add: 'Add',
    add_to_meal: 'Add to',
    search_food_or_recipe: 'Search for a food or recipe',
    close: 'Close',
    food_placeholder: 'Enter a food (e.g. rice, egg...)',
    no_food_found: 'No food found for',
    type_to_search: 'Start typing to search...',
    select: 'select',
    cancel: 'Cancel',
    choose_meal: 'Choose meal',
    amount: 'Amount',
    add_to_meal_btn: 'Add to meal',
    nutrition: 'Nutrition',
    kcal_per_serving: 'kcal/serving',
    evolution_chart_title: 'Evolution Chart',
    confirm_delete_favorite: 'Remove from favorites?',
    click_heart_to_favorite: 'Click the heart when searching to add favorites.',
    create_list_above: 'Create a list above.',
    empty_list_text: 'Empty list.',
    add_food_to_list: 'Add food to this list',
    custom_recipes_title: 'My Creations',
    advanced_filters_title: 'Advanced filters',
    search: 'Search',
    private_profile: 'Private Profile',
    private_profile_desc: 'Hide your profile information from others.',
    save_profile: 'Save my profile',
    saving_profile: 'Saving...',
    tdee_calculator: 'TDEE Calculator',
    meal_calorie_goals: 'Meal Calorie Goals',
    diet_type: 'Diet Type',
    nutrition_preference: 'Nutrition Preference',
    choose_avatar: 'Choose an avatar or enter custom URL.',
    custom_url: 'Custom URL',
    avatars: 'Avatars'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session de l'utilisateur au chargement
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token invalide ou expiré
          logout();
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
        // Ne pas déconnecter en cas de problème de réseau temporaire
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Connexion
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Inscription
  const register = async (username, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const [language, setLanguageState] = useState(localStorage.getItem('language') || 'fr');

  const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['fr']?.[key] || key;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError, language, setLanguage, t }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
