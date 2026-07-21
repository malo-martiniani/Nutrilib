import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, CheckCircle, ChevronRight, X, ListTodo, Flame, Info, Heart, FolderOpen, SlidersHorizontal, Trash2, Plus, Sparkles, ChefHat } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Recipes({ token, initialFilters, onClearFilters }) {
  const { showToast, askConfirmation } = useNotification();
  const { language, t } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  const [filterKeto, setFilterKeto] = useState(false);
  const [filterHighProtein, setFilterHighProtein] = useState(false);
  const [filterLight, setFilterLight] = useState(false);

  // Advanced search filters states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [caloriesMin, setCaloriesMin] = useState('');
  const [caloriesMax, setCaloriesMax] = useState('');
  const [proteinMin, setProteinMin] = useState('');
  const [carbsMax, setCarbsMax] = useState('');
  const [fatMax, setFatMax] = useState('');

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [lists, setLists] = useState([]);
  const [showListSelectorForRecipe, setShowListSelectorForRecipe] = useState(null);

  // Custom Recipes States
  const [activeSubTab, setActiveSubTab] = useState('api'); // 'api' or 'custom'
  const [customRecipes, setCustomRecipes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newRecipeImage, setNewRecipeImage] = useState('');
  const [newRecipeServings, setNewRecipeServings] = useState(1);
  const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
  const [ingSearchQuery, setIngSearchQuery] = useState('');
  const [ingSearchResults, setIngSearchResults] = useState([]);
  const [ingSearching, setIngSearching] = useState(false);
  const [selectedIngForAmount, setSelectedIngForAmount] = useState(null);
  const [ingAmount, setIngAmount] = useState(100);
  const [ingUnit, setIngUnit] = useState('g');
  const [selectedCustomRecipeForJournal, setSelectedCustomRecipeForJournal] = useState(null);
  const [journalRecipePortions, setJournalRecipePortions] = useState(1);
  const [quickAddMeal, setQuickAddMeal] = useState('breakfast');
  const [quickAddDate, setQuickAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomRecipeDetail, setSelectedCustomRecipeDetail] = useState(null);

  const fetchFavoritesAndLists = async () => {
    if (!token) return;
    try {
      const favRes = await fetch(`${API_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
      const listsRes = await fetch(`${API_URL}/lists`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (favRes.ok) {
        const favs = await favRes.json();
        setFavoriteIds(favs.map(f => f.food_id));
      }
      if (listsRes.ok) { setLists(await listsRes.json()); }
    } catch (err) { console.error('Erreur chargement favoris/listes dans recettes:', err); }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError('');
    setSelectedRecipe(null);

    let url = `${API_URL}/foods/recipes/search?query=${encodeURIComponent(query)}`;
    if (filterLight) url += '&caloriesMax=400';
    if (filterKeto) url += '&carbMaxPercent=15';
    if (filterHighProtein) url += '&proteinMinPercent=30';

    // Filtres nutritionnels précis
    if (caloriesMin) url += `&caloriesMin=${caloriesMin}`;
    if (caloriesMax) url += `&caloriesMax=${caloriesMax}`;
    if (proteinMin) url += `&proteinMin=${proteinMin}`;
    if (carbsMax) url += `&carbsMax=${carbsMax}`;
    if (fatMax) url += `&fatMax=${fatMax}`;

    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language } });
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
        setIsMockData(data.isMock || false);
        if (data.recipes && data.recipes.length === 0) { setError('Aucune recette trouvée.'); }
      } else { throw new Error('Erreur.'); }
    } catch (err) { setError('Impossible de récupérer les recettes.'); }
    finally { setSearching(false); }
  };

  useEffect(() => {
    if (initialFilters) {
      setQuery(initialFilters.query || '');
      setCaloriesMin(initialFilters.caloriesMin || '');
      setCaloriesMax(initialFilters.caloriesMax || '');
      setProteinMin(initialFilters.proteinMin || '');
      setCarbsMax(initialFilters.carbsMax || '');
      setFatMax(initialFilters.fatMax || '');
      setFilterKeto(!!initialFilters.filterKeto);
      setFilterHighProtein(!!initialFilters.filterHighProtein);
      setFilterLight(!!initialFilters.filterLight);
      
      if (initialFilters.showAdvancedFilters) {
        setShowAdvancedFilters(true);
      }

      // Execute search immediately with incoming filters
      const executeInitialSearch = async () => {
        setSearching(true);
        setError('');
        setSelectedRecipe(null);

        let url = `${API_URL}/foods/recipes/search?query=${encodeURIComponent(initialFilters.query || '')}`;
        if (initialFilters.filterLight) url += '&caloriesMax=400';
        if (initialFilters.filterKeto) url += '&carbMaxPercent=15';
        if (initialFilters.filterHighProtein) url += '&proteinMinPercent=30';

        if (initialFilters.caloriesMin) url += `&caloriesMin=${initialFilters.caloriesMin}`;
        if (initialFilters.caloriesMax) url += `&caloriesMax=${initialFilters.caloriesMax}`;
        if (initialFilters.proteinMin) url += `&proteinMin=${initialFilters.proteinMin}`;
        if (initialFilters.carbsMax) url += `&carbsMax=${initialFilters.carbsMax}`;
        if (initialFilters.fatMax) url += `&fatMax=${initialFilters.fatMax}`;

        try {
          const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language } });
          if (response.ok) {
            const data = await response.json();
            setRecipes(data.recipes || []);
            setIsMockData(data.isMock || false);
            if (data.recipes && data.recipes.length === 0) { setError('Aucune recette trouvée.'); }
          } else { throw new Error('Erreur.'); }
        } catch (err) { setError('Impossible de récupérer les recettes.'); }
        finally { setSearching(false); }
      };

      executeInitialSearch();

      if (onClearFilters) onClearFilters();
    }
  }, [initialFilters]);

  useEffect(() => { 
    if (initialFilters) return; // Prevent double trigger when processing initialFilters
    handleSearch(); 
    fetchFavoritesAndLists();
  }, [filterKeto, filterHighProtein, filterLight, caloriesMin, caloriesMax, proteinMin, carbsMax, fatMax, token]);

  const handleFetchRecipeDetails = async (id) => {
    setLoadingRecipe(true);
    setCheckedIngredients({});
    try {
      const response = await fetch(`${API_URL}/foods/recipes/${id}`, { headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language } });
      if (response.ok) { setSelectedRecipe((await response.json()).recipe); }
      else { showToast('Erreur chargement recette.', 'error'); }
    } catch (err) { 
      console.error(err); 
      showToast('Erreur réseau.', 'error');
    }
    finally { setLoadingRecipe(false); }
  };

  const toggleIngredientCheck = (index) => {
    setCheckedIngredients(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const fetchCustomRecipes = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/foods/custom-recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCustomRecipes(await response.json());
      }
    } catch (err) {
      console.error('Erreur chargement recettes personnalisées:', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'custom') {
      fetchCustomRecipes();
    }
  }, [activeSubTab, token]);

  useEffect(() => {
    if (!ingSearchQuery.trim()) {
      setIngSearchResults([]);
      return;
    }
    setIngSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/foods/search?query=${encodeURIComponent(ingSearchQuery)}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language }
        });
        if (response.ok) {
          const data = await response.json();
          setIngSearchResults(data.foods || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIngSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [ingSearchQuery, token]);

  const openPortionSelectorForIng = (food) => {
    setSelectedIngForAmount(food);
    setIngAmount(100);
    setIngUnit('g');
  };

  const handleAddIngSubmit = () => {
    if (!selectedIngForAmount) return;
    
    let computedAmount = ingAmount;
    if (ingUnit === 'cl') {
      computedAmount = ingAmount * 10;
    }
    const ratio = computedAmount / 100;

    const newIng = {
      food_id: selectedIngForAmount.food_id,
      food_name: selectedIngForAmount.food_name,
      calories: Math.round(selectedIngForAmount.calories * ratio),
      protein: parseFloat((selectedIngForAmount.protein * ratio).toFixed(1)),
      carbs: parseFloat((selectedIngForAmount.carbs * ratio).toFixed(1)),
      fat: parseFloat((selectedIngForAmount.fat * ratio).toFixed(1)),
      serving_amount: ingAmount,
      serving_unit: ingUnit
    };

    setNewRecipeIngredients([...newRecipeIngredients, newIng]);
    setSelectedIngForAmount(null);
    setIngSearchQuery('');
    setIngSearchResults([]);
  };

  const computedNewRecipeTotals = newRecipeIngredients.reduce((acc, ing) => {
    acc.calories += ing.calories;
    acc.protein += ing.protein;
    acc.carbs += ing.carbs;
    acc.fat += ing.fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleCreateCustomRecipe = async (e) => {
    e.preventDefault();
    if (!newRecipeName.trim()) {
      showToast('Veuillez entrer un nom de recette.', 'error');
      return;
    }
    if (newRecipeIngredients.length === 0) {
      showToast('Veuillez ajouter au moins un ingrédient.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/foods/custom-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipe_name: newRecipeName,
          recipe_description: newRecipeDesc,
          recipe_image: newRecipeImage || null,
          servings: Math.max(1, parseInt(newRecipeServings) || 1),
          calories: computedNewRecipeTotals.calories,
          protein: computedNewRecipeTotals.protein,
          carbs: computedNewRecipeTotals.carbs,
          fat: computedNewRecipeTotals.fat,
          ingredients: newRecipeIngredients
        })
      });

      if (response.ok) {
        showToast('Recette personnalisée créée !');
        setNewRecipeName('');
        setNewRecipeDesc('');
        setNewRecipeImage('');
        setNewRecipeServings(1);
        setNewRecipeIngredients([]);
        setShowCreateModal(false);
        fetchCustomRecipes();
      } else {
        showToast(t('error_creating_recipe'), 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t('errorNetwork'), 'error');
    }
  };

  const handleDeleteCustomRecipe = async (recipeId) => {
    const confirmed = await askConfirmation(t('confirm_delete_recipe') || 'Supprimer cette recette ?');
    if (!confirmed) return;
    try {
      const response = await fetch(`${API_URL}/custom-recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCustomRecipes(customRecipes.filter(r => r.id !== recipeId));
        showToast(t('recipe_deleted') || 'Recette supprimée.');
      }
    } catch (err) {
      console.error(err);
      showToast(t('errorServer'), 'error');
    }
  };

  const handleQuickAddCustomRecipeSubmit = async () => {
    if (!selectedCustomRecipeForJournal) return;
    const servings = selectedCustomRecipeForJournal.servings || 1;
    const cleanPortions = Math.max(1, parseFloat(journalRecipePortions) || 1);
    
    const payload = {
      food_id: `recipe_custom_${selectedCustomRecipeForJournal.id}`,
      food_name: selectedCustomRecipeForJournal.recipe_name,
      calories: Math.round((selectedCustomRecipeForJournal.calories / servings) * cleanPortions),
      protein: parseFloat(((selectedCustomRecipeForJournal.protein / servings) * cleanPortions).toFixed(1)),
      carbs: parseFloat(((selectedCustomRecipeForJournal.carbs / servings) * cleanPortions).toFixed(1)),
      fat: parseFloat(((selectedCustomRecipeForJournal.fat / servings) * cleanPortions).toFixed(1)),
      meal_type: quickAddMeal,
      serving_amount: cleanPortions,
      serving_unit: 'portion',
      entry_date: quickAddDate
    };
    try {
      const response = await fetch(`${API_URL}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        showToast('Recette ajoutée au journal !');
        setSelectedCustomRecipeForJournal(null);
        setJournalRecipePortions(1);
      } else {
        showToast("Erreur lors de l'ajout.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur réseau.", "error");
    }
  };

  const handleToggleFavorite = async (e, recipe) => {
    e.stopPropagation();
    const isCustom = !recipe.recipe_id;
    const recipeFoodId = isCustom ? `recipe_custom_${recipe.id}` : `recipe_${recipe.recipe_id}`;
    const isFav = favoriteIds.includes(recipeFoodId);

    const servings = recipe.servings || 1;
    const calories = isCustom ? Math.round(recipe.calories / servings) : recipe.calories;
    const protein = isCustom ? parseFloat((recipe.protein / servings).toFixed(1)) : recipe.protein;
    const carbs = isCustom ? parseFloat((recipe.carbs / servings).toFixed(1)) : recipe.carbs;
    const fat = isCustom ? parseFloat((recipe.fat / servings).toFixed(1)) : recipe.fat;

    try {
      if (isFav) {
        const favsRes = await fetch(`${API_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (favsRes.ok) {
          const favs = await favsRes.json();
          const match = favs.find(f => f.food_id === recipeFoodId);
          if (match) {
            const delRes = await fetch(`${API_URL}/favorites/${match.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (delRes.ok) { 
              setFavoriteIds(favoriteIds.filter(id => id !== recipeFoodId));
              showToast('Retiré des favoris.');
            }
          }
        }
      } else {
        const addRes = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            food_id: recipeFoodId,
            food_name: recipe.recipe_name,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            serving_description: isCustom ? `1 portion (sur ${servings})` : '1 portion'
          })
        });
        if (addRes.ok) { 
          setFavoriteIds([...favoriteIds, recipeFoodId]);
          showToast('Ajouté aux favoris !');
        }
      }
    } catch (err) { 
      console.error(err);
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleAddToList = async (listId, recipe) => {
    const isCustom = !recipe.recipe_id;
    const recipeFoodId = isCustom ? `recipe_custom_${recipe.id}` : `recipe_${recipe.recipe_id}`;
    const servings = recipe.servings || 1;
    const calories = isCustom ? Math.round(recipe.calories / servings) : recipe.calories;
    const protein = isCustom ? parseFloat((recipe.protein / servings).toFixed(1)) : recipe.protein;
    const carbs = isCustom ? parseFloat((recipe.carbs / servings).toFixed(1)) : recipe.carbs;
    const fat = isCustom ? parseFloat((recipe.fat / servings).toFixed(1)) : recipe.fat;

    try {
      const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          food_id: recipeFoodId,
          food_name: recipe.recipe_name,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          serving_description: isCustom ? `1 portion (sur ${servings})` : '1 portion'
        })
      });
      if (response.ok) {
        showToast('Recette ajoutée à la liste !');
        fetchFavoritesAndLists();
        setShowListSelectorForRecipe(null);
      }
    } catch (err) { 
      console.error(err);
      showToast('Erreur réseau.', 'error');
    }
  };

  // Helper function to clean oz to ml/g in ingredients list & convert Fahrenheit to Celsius
  const formatServing = (servingStr) => {
    if (!servingStr) return '';
    let formatted = servingStr.replace(/(\d+(?:\.\d+)?)\s*fl\s*oz/gi, (match, p1) => {
      const ml = Math.round(parseFloat(p1) * 29.57);
      return `${ml} ml`;
    });
    formatted = formatted.replace(/(\d+(?:\.\d+)?)\s*oz/gi, (match, p1) => {
      const g = Math.round(parseFloat(p1) * 28.35);
      return `${g} g`;
    });
    // Convert explicit Fahrenheit: e.g. 350°F, 350 F, 350 fahrenheit, 350 degrees F, 350 degrees Fahrenheit
    formatted = formatted.replace(/(\d+(?:\.\d+)?)\s*(?:degrés?|degrees?|°)?\s*[fF](?:ahrenheit)?\b/gi, (match, p1) => {
      const f = parseFloat(p1);
      const c = Math.round((f - 32) * 5 / 9);
      return `${c}°C`;
    });
    // Convert implicit Fahrenheit: numbers between 250 and 500 followed by degrees/degrés without F
    formatted = formatted.replace(/\b(2[5-9]\d|[3-4]\d{2}|500)\s*(?:degrés?|degrees?)\b/gi, (match, p1) => {
      const f = parseFloat(p1);
      const c = Math.round((f - 32) * 5 / 9);
      return `${c}°C`;
    });
    return formatted;
  };

  return (
    <div className="space-y-6">

      {/* Sub-tabs header */}
      <div className="flex gap-2 border-b border-[var(--border-muted)] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('api')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase rounded-xl transition-all duration-200 cursor-pointer ${
            activeSubTab === 'api'
              ? 'border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent-pistachio)] shadow-[var(--shadow-subtle)]'
              : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Search className="w-3.5 h-3.5" /> {t('discover_recipes')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold uppercase rounded-xl transition-all duration-200 cursor-pointer ${
            activeSubTab === 'custom'
              ? 'border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--accent-pistachio)] shadow-[var(--shadow-subtle)]'
              : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> {t('custom_recipes_title')}
        </button>
      </div>

      {activeSubTab === 'api' ? (
        <>
          {/* Search & Filters */}
          <div className="brutal-card space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <label htmlFor="rec-search-query" className="sr-only">{language === 'fr' ? 'Rechercher une recette' : 'Search recipes'}</label>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" aria-hidden="true" />
                <input 
                  id="rec-search-query"
                  type="text" 
                  placeholder="Poulet, saumon, soupe..."
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  className="brutal-input pr-8 py-2 text-xs"
                  style={{ paddingLeft: '2.5rem' }} 
                />
              </div>
              <button 
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 border rounded-xl hover:bg-[var(--surface-raised)] transition-all cursor-pointer ${showAdvancedFilters ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                aria-label="Filtres avancés"
                aria-expanded={showAdvancedFilters}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>
              <button type="submit" disabled={searching} className="brutal-btn-accent px-5 cursor-pointer" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
                {searching ? <div className="brutal-spinner-sm"></div> : 'Rechercher'}
              </button>
            </form>

            {/* Advanced filters panel */}
            {showAdvancedFilters && (
              <div className="p-4 bg-[var(--surface-inset)] border border-[var(--border)] rounded-[20px] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-[var(--text-muted)] mb-1">Calories (Min - Max)</label>
                  <div className="flex gap-1.5">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={caloriesMin} 
                      onChange={(e) => setCaloriesMin(e.target.value)} 
                      className="brutal-input py-1.5 px-2 text-[10px] w-full text-center" 
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={caloriesMax} 
                      onChange={(e) => setCaloriesMax(e.target.value)} 
                      className="brutal-input py-1.5 px-2 text-[10px] w-full text-center" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-[var(--accent-powder)] mb-1">Protéines Min (g)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 20" 
                    value={proteinMin} 
                    onChange={(e) => setProteinMin(e.target.value)} 
                    className="brutal-input py-1.5 px-2 text-[10px] text-center w-full" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-[var(--accent-powder)] mb-1">Glucides Max (g)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10" 
                    value={carbsMax} 
                    onChange={(e) => setCarbsMax(e.target.value)} 
                    className="brutal-input py-1.5 px-2 text-[10px] text-center w-full" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-[var(--accent-sand)] mb-1">Lipides Max (g)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 15" 
                    value={fatMax} 
                    onChange={(e) => setFatMax(e.target.value)} 
                    className="brutal-input py-1.5 px-2 text-[10px] text-center w-full" 
                  />
                </div>
                <div className="col-span-full flex justify-end gap-2 pt-2 border-t border-[var(--border-muted)] mt-1">
                  <button 
                    type="button" 
                    onClick={() => {
                      setCaloriesMin('');
                      setCaloriesMax('');
                      setProteinMin('');
                      setCarbsMax('');
                      setFatMax('');
                    }} 
                    className="text-[10px] font-bold text-[var(--accent-magenta)] hover:underline uppercase cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            )}

            {/* Filter toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="brutal-label mb-0 mr-1">Filtres :</span>
              <button type="button" onClick={() => setFilterKeto(!filterKeto)}
                className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
                  filterKeto ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
                }`}
              >
                Keto
              </button>
              <button type="button" onClick={() => setFilterHighProtein(!filterHighProtein)}
                className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
                  filterHighProtein ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
                }`}
              >
                Protéines+
              </button>
              <button type="button" onClick={() => setFilterLight(!filterLight)}
                className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
                  filterLight ? 'border-[var(--accent-sand)] text-[var(--accent-sand)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
                }`}
              >
                Léger
              </button>
            </div>

            {isMockData && recipes.length > 0 && (
              <div className="p-4 border border-[var(--accent-sand)]/20 bg-[var(--accent-sand)]/10 text-[var(--accent-sand)] text-xs font-semibold flex items-center gap-2 rounded-2xl">
                <Info className="w-4 h-4 shrink-0 text-[var(--accent-sand)]" /> Mode démo — clés FatSecret non configurées.
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-4">
            {error && <p className="text-sm text-center text-[var(--accent-magenta)] font-bold py-8 uppercase">{error}</p>}

            {searching && recipes.length === 0 && (
              <div className="flex justify-center py-16"><div className="brutal-spinner"></div></div>
            )}

            {!searching && recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe) => {
                  const recipeFoodId = `recipe_${recipe.recipe_id}`;
                  const isFav = favoriteIds.includes(recipeFoodId);
                  return (
                    <div key={recipe.recipe_id} 
                      onClick={() => handleFetchRecipeDetails(recipe.recipe_id)}
                      className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] flex flex-col shadow-[var(--shadow-soft)] hover:translate-y-[-2px] transition-all duration-300 group cursor-pointer"
                    >
                      {/* Image */}
                      <div className="h-44 w-full overflow-hidden relative bg-[var(--surface-inset)]">
                        <img src={recipe.recipe_image} alt={recipe.recipe_name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'; }}
                        />
                        <div className="absolute top-3 right-3 brutal-tag border-transparent text-[var(--text)] bg-[rgba(24,32,48,0.85)] backdrop-blur-md text-[9px] rounded-lg">
                          <Flame className="w-3 h-3 text-[var(--accent-pistachio)]" /> {recipe.calories} kcal
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div onClick={() => handleFetchRecipeDetails(recipe.recipe_id)} className="cursor-pointer">
                          <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1 group-hover:text-[var(--accent-pistachio)] transition-colors">{recipe.recipe_name}</h3>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1.5 font-medium">
                            {recipe.recipe_description || 'Une recette équilibrée pour enrichir votre alimentation.'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-t border-[var(--border-muted)] pt-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-[var(--accent-sand)] fill-[var(--accent-sand)]" />
                              <span className="font-bold text-[var(--text)]">{recipe.rating}</span>
                            </div>
                            {/* Favorite button */}
                            <button onClick={(e) => handleToggleFavorite(e, recipe)} className="brutal-btn-danger p-1">
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[var(--accent-magenta)] fill-[var(--accent-magenta)]' : ''}`} />
                            </button>
                            {/* Add to list button */}
                            <button onClick={(e) => setShowListSelectorForRecipe(showListSelectorForRecipe === recipe.recipe_id ? null : recipe.recipe_id)} className="brutal-btn-danger p-1">
                              <FolderOpen className="w-3.5 h-3.5" />
                            </button>

                            {showListSelectorForRecipe === recipe.recipe_id && (
                              <div className="absolute left-4 mt-8 bg-[var(--surface)] border border-[var(--border)] p-3.5 z-50 w-44 rounded-2xl shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
                                <span className="brutal-label block border-b border-[var(--border-muted)] pb-1 mb-2">Ajouter à :</span>
                                {lists.length === 0 ? (
                                  <p className="text-[10px] text-[var(--text-dim)]">Aucune liste.</p>
                                ) : (
                                  lists.map(l => (
                                    <button key={l.id} onClick={() => handleAddToList(l.id, recipe)}
                                      className="w-full text-left py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-pistachio)] font-semibold cursor-pointer transition-colors duration-150">
                                      → {l.list_name}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[var(--accent-powder)]">P:{Math.round(recipe.protein)}g</span>
                            <span className="text-[var(--accent-powder)]">G:{Math.round(recipe.carbs)}g</span>
                            <span className="text-[var(--accent-sand)]">L:{Math.round(recipe.fat)}g</span>
                          </div>
                        </div>

                        <button onClick={() => handleFetchRecipeDetails(recipe.recipe_id)}
                          className="brutal-btn-ghost w-full text-[10px] cursor-pointer">
                          Voir la recette <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-3">
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-[var(--text)]">{t('custom_recipes_title')}</h2>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">{t('compose_creations_desc') || 'Composez vos propres créations culinaires et calculez leurs macros.'}</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="brutal-btn-accent flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
            >
              <Plus className="w-3.5 h-3.5" /> {t('create') || 'Créer'}
            </button>
          </div>

          {customRecipes.length === 0 ? (
            <div className="brutal-card p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-dashed border-[var(--border)] flex items-center justify-center mx-auto text-xl bg-[var(--surface-raised)]">
                <ChefHat className="w-6 h-6 text-[var(--text-dim)]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text)]">{t('no_custom_recipes')}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">{t('create_first_recipe_desc') || "Créez votre première recette pour l'ajouter facilement à vos repas."}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="brutal-btn-ghost px-4 py-2 text-[10px] font-extrabold uppercase text-[var(--accent-pistachio)]"
              >
                {t('create_recipe')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {customRecipes.map((recipe) => {
                const recipeFoodId = `recipe_custom_${recipe.id}`;
                const isFav = favoriteIds.includes(recipeFoodId);
                const servings = recipe.servings || 1;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => setSelectedCustomRecipeDetail(recipe)}
                    className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] flex flex-col shadow-[var(--shadow-soft)] hover:translate-y-[-2px] transition-all duration-300 group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="h-44 w-full overflow-hidden relative bg-[var(--surface-inset)]">
                      <img 
                        src={recipe.recipe_image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'} 
                        alt={recipe.recipe_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'; }}
                      />
                      <div className="absolute top-3 right-3 brutal-tag border-transparent text-[var(--text)] bg-[rgba(24,32,48,0.85)] backdrop-blur-md text-[9px] rounded-lg">
                        <Flame className="w-3 h-3 text-[var(--accent-pistachio)]" /> {Math.round(recipe.calories / servings)} kcal/portion
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div onClick={() => setSelectedCustomRecipeDetail(recipe)} className="cursor-pointer">
                        <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1 group-hover:text-[var(--accent-pistachio)] transition-colors pr-6">
                          {recipe.recipe_name}
                        </h3>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1.5 font-medium">
                          {recipe.recipe_description || 'Une recette personnalisée.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-t border-[var(--border-muted)] pt-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {/* Portion Badge */}
                          <span className="text-[9px] text-[var(--accent-sand)] font-extrabold uppercase mr-1">
                            {servings} portion(s)
                          </span>
                          {/* Favorite button */}
                          <button onClick={(e) => handleToggleFavorite(e, recipe)} className="brutal-btn-danger p-1">
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[var(--accent-magenta)] fill-[var(--accent-magenta)]' : ''}`} />
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteCustomRecipe(recipe.id)}
                            className="brutal-btn-danger p-1"
                            title="Supprimer la recette"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[var(--accent-powder)]">P:{Math.round(recipe.protein / servings)}g</span>
                          <span className="text-[var(--accent-powder)]">G:{Math.round(recipe.carbs / servings)}g</span>
                          <span className="text-[var(--accent-sand)]">L:{Math.round(recipe.fat / servings)}g</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCustomRecipeForJournal(recipe)}
                          className="brutal-btn-accent flex-1 py-1.5 text-[9px] font-black uppercase text-center bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
                        >
                          Ajouter au repas
                        </button>
                        <button
                          onClick={() => setSelectedCustomRecipeDetail(recipe)}
                          className="brutal-btn-ghost flex-1 py-1.5 text-[9px] font-black uppercase text-center"
                        >
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="brutal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[28px] shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-[var(--text)]">{selectedRecipe.recipe_name}</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 max-w-xl font-medium">{selectedRecipe.recipe_description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => handleToggleFavorite(e, selectedRecipe)} 
                  className="brutal-btn-danger p-2 cursor-pointer"
                  title="Ajouter aux favoris"
                >
                  <Heart className={`w-5 h-5 ${favoriteIds.includes(`recipe_${selectedRecipe.recipe_id}`) ? 'text-[var(--accent-magenta)] fill-[var(--accent-magenta)]' : ''}`} />
                </button>
                <button onClick={() => setSelectedRecipe(null)} className="brutal-btn-ghost p-2 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Image & quick metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <img src={selectedRecipe.recipe_image} alt={selectedRecipe.recipe_name}
                  className="w-full h-40 object-cover border border-[var(--border-muted)] rounded-2xl md:col-span-1"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'; }}
                />
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 border border-[var(--border)] rounded-2xl flex items-center gap-3 bg-[var(--surface-raised)]">
                      <Clock className="w-5 h-5 text-[var(--accent-powder)]" />
                      <div>
                        <span className="brutal-label mb-0">Préparation</span>
                        <span className="text-xs font-bold block text-[var(--text)]">
                          {selectedRecipe.preparation_time_min > 0 ? `${selectedRecipe.preparation_time_min} min` : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 border border-[var(--border)] rounded-2xl flex items-center gap-3 bg-[var(--surface-raised)]">
                      <Clock className="w-5 h-5 text-[var(--accent-sand)]" />
                      <div>
                        <span className="brutal-label mb-0">Cuisson</span>
                        <span className="text-xs font-bold block text-[var(--text)]">
                          {selectedRecipe.cooking_time_min > 0 ? `${selectedRecipe.cooking_time_min} min` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="border border-[var(--border)] p-4 space-y-3 rounded-2xl bg-[var(--surface-inset)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                      <span className="brutal-label mb-0">Nutrition</span>
                      <span className="text-xs font-extrabold text-[var(--accent-pistachio)]">
                        {selectedRecipe.calories} kcal/portion
                        {selectedRecipe.number_of_servings ? ` (Recette de ${selectedRecipe.number_of_servings} portions)` : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">Protéines</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.protein}g</span>
                      </div>
                      <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">Glucides</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.carbs}g</span>
                      </div>
                      <div className="p-2 border border-[var(--accent-sand)]/20 rounded-xl bg-[var(--accent-sand)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-sand)] block uppercase">Lipides</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-[var(--border-muted)]">
                {/* Ingredients */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
                    <ListTodo className="w-4 h-4 text-[var(--accent-powder)]" /> Ingrédients
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedRecipe.ingredients.map((ing, index) => {
                      const isChecked = !!checkedIngredients[index];
                      return (
                        <div key={index} onClick={() => toggleIngredientCheck(index)}
                          className={`flex items-center gap-2.5 p-3 border rounded-2xl cursor-pointer transition-all duration-200 ${
                            isChecked
                              ? 'border-transparent bg-[var(--surface-inset)] line-through text-[var(--text-dim)]'
                              : 'border-[var(--border-muted)] bg-[var(--surface-raised)] hover:border-[var(--text-muted)] text-[var(--text)]'
                          }`}>
                          <CheckCircle className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isChecked ? 'text-[var(--accent-pistachio)]' : 'text-[var(--text-dim)]'}`} />
                          <span className="text-xs">{formatServing(ing)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-sand)]" /> Instructions
                  </h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {selectedRecipe.directions.map((step, index) => (
                      <div key={index} className="flex gap-3.5 items-start p-3.5 border border-[var(--border-muted)] rounded-2xl bg-[var(--surface-raised)]">
                        <span className="w-6 h-6 rounded-full bg-[var(--surface-inset)] text-[var(--text)] font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-[var(--border)]">
                          {index + 1}
                        </span>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-0.5">{formatServing(step)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loadingRecipe && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="brutal-spinner"></div>
        </div>
      )}

      {/* ===== CREATE CUSTOM RECIPE MODAL ===== */}
      {showCreateModal && (
        <div className="brutal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="brutal-modal max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text)]">Créer une Recette</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-bold uppercase transition-colors">
                Fermer
              </button>
            </div>

            <form onSubmit={handleCreateCustomRecipe} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label htmlFor="rec-name" className="brutal-label">{language === 'fr' ? 'Nom de la recette' : 'Recipe name'}</label>
                <input
                  id="rec-name"
                  type="text"
                  placeholder="Ex: Riz sauté poulet curry"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  className="brutal-input text-xs py-2"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="rec-desc" className="brutal-label">{language === 'fr' ? 'Description (facultatif)' : 'Description (optional)'}</label>
                <textarea
                  id="rec-desc"
                  placeholder="Ex: Idéal après une séance d'entraînement."
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                  className="brutal-input text-xs h-16 py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="rec-img" className="brutal-label">{language === 'fr' ? "URL de l'image (facultatif)" : 'Image URL (optional)'}</label>
                <input
                  id="rec-img"
                  type="url"
                  placeholder="https://images.unsplash.com/... (ou vide)"
                  value={newRecipeImage}
                  onChange={(e) => setNewRecipeImage(e.target.value)}
                  className="brutal-input text-xs py-2"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="rec-servings" className="brutal-label">{language === 'fr' ? 'Nombre de portions' : 'Number of servings'}</label>
                <input
                  id="rec-servings"
                  type="number"
                  min="1"
                  value={newRecipeServings}
                  onChange={(e) => setNewRecipeServings(Math.max(1, parseInt(e.target.value) || 1))}
                  className="brutal-input text-xs py-2"
                  required
                />
              </div>

              {/* Ingredients chosen list */}
              <div className="space-y-2">
                <label className="brutal-label block">{(t('ingredients') || 'Ingrédients') + ' (' + newRecipeIngredients.length + ')'}</label>
                {newRecipeIngredients.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-inset)] p-3 rounded-xl border border-dashed border-[var(--border)] text-center font-medium">
                    {language === 'fr' ? 'Aucun ingrédient pour le moment. Recherchez ci-dessous pour en ajouter.' : 'No ingredients yet. Search below to add.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {newRecipeIngredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-[var(--surface-inset)] border border-[var(--border)] rounded-xl text-xs font-semibold">
                        <div className="flex-1 mr-2">
                          <span className="text-[var(--text)] block line-clamp-1">{ing.food_name}</span>
                          <span className="text-[9px] text-[var(--text-muted)] font-medium">
                            {ing.serving_amount}{ing.serving_unit} · P: {ing.protein}g · G: {ing.carbs}g · L: {ing.fat}g
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--accent-pistachio)] font-bold">{ing.calories} kcal</span>
                          <button
                            type="button"
                            onClick={() => setNewRecipeIngredients(newRecipeIngredients.filter((_, i) => i !== idx))}
                            className="text-[var(--accent-magenta)] hover:text-red-500 font-extrabold cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Running total calories & macros */}
              {newRecipeIngredients.length > 0 && (
                <div className="p-3 border border-[var(--border)] bg-[var(--surface-inset)] rounded-xl space-y-1.5 text-[10px] font-extrabold">
                  <div className="flex justify-between text-[var(--text)]">
                    <span>{language === 'fr' ? 'Total Calories :' : 'Total Calories:'}</span>
                    <span className="text-[var(--accent-pistachio)]">{computedNewRecipeTotals.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)] pt-1 border-t border-[var(--border-muted)]/30">
                    <span>{t('macro_split') || 'Macronutrients:'}</span>
                    <span>
                      P: {computedNewRecipeTotals.protein.toFixed(1)}g · 
                      {language === 'fr' ? 'G' : 'C'}: {computedNewRecipeTotals.carbs.toFixed(1)}g · 
                      {language === 'fr' ? 'L' : 'F'}: {computedNewRecipeTotals.fat.toFixed(1)}g
                    </span>
                  </div>
                </div>
              )}

              {/* Ingredients search panel inside Creator */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-muted)]/40">
                <label className="brutal-label block">{language === 'fr' ? 'Rechercher un ingrédient' : 'Search for an ingredient'}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    placeholder={t('food_placeholder') || (language === 'fr' ? 'Saisissez un aliment (ex: avocat, riz...)' : 'Enter food...')}
                    value={ingSearchQuery}
                    onChange={(e) => setIngSearchQuery(e.target.value)}
                    className="brutal-input pl-8 py-1.5 text-xs"
                    style={{ paddingLeft: '2.2rem' }}
                  />
                </div>

                {ingSearching && (
                  <div className="flex justify-center py-4"><div className="brutal-spinner-sm"></div></div>
                )}

                {ingSearchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-[var(--border)] rounded-xl bg-[var(--surface)] p-1.5 shadow-[var(--shadow-subtle)]">
                    {ingSearchResults.map((food) => (
                      <div
                        key={food.food_id}
                        onClick={() => openPortionSelectorForIng(food)}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-[var(--surface-raised)] border border-transparent hover:border-[var(--border-muted)] cursor-pointer transition-colors text-[10px] font-bold"
                      >
                        <div>
                          <span className="text-[var(--text)] block">{food.food_name}</span>
                          <span className="text-[8px] text-[var(--text-dim)] font-semibold">{food.brand_name} · {formatServing(food.serving)}</span>
                        </div>
                        <span className="text-[var(--accent-pistachio)]">{food.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={newRecipeIngredients.length === 0}
                className="brutal-btn-accent w-full py-2 bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
              >
                {language === 'fr' ? 'Créer la Recette' : 'Create Recipe'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== PORTION SELECTOR FOR INGREDIENTS ===== */}
      {selectedIngForAmount && (
        <div className="brutal-overlay z-[60]" onClick={() => setSelectedIngForAmount(null)}>
          <div className="brutal-modal max-w-xs w-full z-[70]" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-[var(--border-muted)] flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[var(--text)]">{language === 'fr' ? 'Quantité ingrédient' : 'Ingredient quantity'}</span>
              <button onClick={() => setSelectedIngForAmount(null)} className="text-[10px] text-[var(--text-muted)] font-bold uppercase hover:text-[var(--text)]">{t('cancel')}</button>
            </div>
            
            <div className="p-5 space-y-4">
              <span className="text-[10px] text-[var(--text-dim)] font-semibold block">{selectedIngForAmount.food_name}</span>
              
              <div className="flex gap-2">
                <input
                  type="number"
                  value={ingAmount}
                  onChange={(e) => setIngAmount(parseFloat(e.target.value) || 0)}
                  className="brutal-input text-center text-xs py-1.5"
                  autoFocus
                />
                <select
                  value={ingUnit}
                  onChange={(e) => setIngUnit(e.target.value)}
                  className="brutal-input w-24 text-center py-1.5 px-1 bg-[var(--surface-inset)] text-[var(--text)] text-xs font-bold cursor-pointer"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="cl">cl</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddIngSubmit}
                className="brutal-btn-accent w-full py-1.5 text-xs font-extrabold uppercase bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
              >
                {language === 'fr' ? "Confirmer l'ajout" : 'Confirm addition'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUICK ADD CUSTOM RECIPE TO JOURNAL ===== */}
      {selectedCustomRecipeForJournal && (
        <div className="brutal-overlay" onClick={() => setSelectedCustomRecipeForJournal(null)}>
          <div className="brutal-modal max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-[var(--border-muted)] flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[var(--text)]">{t('add_to_journal')}</span>
              <button onClick={() => setSelectedCustomRecipeForJournal(null)} className="text-[10px] text-[var(--text-muted)] font-bold uppercase">{t('cancel')}</button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-bold text-[var(--text)] block">{selectedCustomRecipeForJournal.recipe_name}</span>
                <span className="text-[9px] text-[var(--text-dim)]">
                  {Math.round(selectedCustomRecipeForJournal.calories / (selectedCustomRecipeForJournal.servings || 1))} kcal {language === 'fr' ? 'par portion' : 'per serving'} ({language === 'fr' ? 'Recette de' : 'Recipe has'} {selectedCustomRecipeForJournal.servings || 1} {language === 'fr' ? 'portion(s)' : 'serving(s)'})
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-extrabold text-[var(--text-muted)]">{language === 'fr' ? 'Nombre de portions consommées' : 'Number of servings eaten'}</label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={journalRecipePortions}
                  onChange={(e) => setJournalRecipePortions(parseFloat(e.target.value) || 1)}
                  className="brutal-input w-full py-1.5 text-xs text-center font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-extrabold text-[var(--text-muted)]">{language === 'fr' ? 'Type de repas' : 'Meal type'}</label>
                <select
                  value={quickAddMeal}
                  onChange={(e) => setQuickAddMeal(e.target.value)}
                  className="brutal-input w-full py-1.5 text-xs font-bold bg-[var(--surface)] text-[var(--text)]"
                >
                  <option value="breakfast">{t('breakfast')}</option>
                  <option value="lunch">{t('lunch')}</option>
                  <option value="dinner">{t('dinner')}</option>
                  <option value="snack">{t('snack')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-extrabold text-[var(--text-muted)]">{language === 'fr' ? 'Date de consommation' : 'Consumption date'}</label>
                <input
                  type="date"
                  value={quickAddDate}
                  onChange={(e) => setQuickAddDate(e.target.value)}
                  className="brutal-input w-full py-1.5 text-xs text-center"
                />
              </div>

              <button
                type="button"
                onClick={handleQuickAddCustomRecipeSubmit}
                className="brutal-btn-accent w-full py-2 text-xs font-extrabold bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
              >
                {t('add_to_meal_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CUSTOM RECIPE DETAIL MODAL ===== */}
      {selectedCustomRecipeDetail && (
        <div className="brutal-overlay" onClick={() => setSelectedCustomRecipeDetail(null)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-[28px] shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-[var(--text)]">{selectedCustomRecipeDetail.recipe_name}</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-medium">{selectedCustomRecipeDetail.recipe_description || (language === 'fr' ? 'Pas de description.' : 'No description.')}</p>
              </div>
              <button onClick={() => setSelectedCustomRecipeDetail(null)} className="brutal-btn-ghost p-2 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Left column: image */}
                <div className="w-full md:w-1/2 h-48 md:h-52 rounded-[20px] overflow-hidden bg-[var(--surface-inset)] shrink-0">
                  <img 
                    src={selectedCustomRecipeDetail.recipe_image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'} 
                    alt={selectedCustomRecipeDetail.recipe_name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'; }}
                  />
                </div>
                
                {/* Right column: info & per-portion macros */}
                <div className="flex-1 space-y-4">
                  <div className="border border-[var(--border)] p-4 space-y-3 rounded-2xl bg-[var(--surface-inset)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                      <span className="brutal-label mb-0">{language === 'fr' ? 'Nutrition (par portion)' : 'Nutrition (per serving)'}</span>
                      <span className="text-[10px] text-[var(--accent-pistachio)] font-extrabold">{selectedCustomRecipeDetail.servings || 1} {language === 'fr' ? 'portion(s)' : 'serving(s)'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="p-1.5 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[8px] font-bold text-[var(--text-dim)] uppercase block">Cal.</span>
                        <span className="text-[10px] font-extrabold text-[var(--accent-pistachio)]">{Math.round(selectedCustomRecipeDetail.calories / (selectedCustomRecipeDetail.servings || 1))} kcal</span>
                      </div>
                      <div className="p-1.5 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[8px] font-bold text-[var(--accent-powder)] block uppercase">Prot.</span>
                        <span className="text-[10px] font-extrabold text-[var(--text)]">{parseFloat((selectedCustomRecipeDetail.protein / (selectedCustomRecipeDetail.servings || 1)).toFixed(1))}g</span>
                      </div>
                      <div className="p-1.5 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[8px] font-bold text-[var(--accent-powder)] block uppercase">{language === 'fr' ? 'Gluc.' : 'Carb.'}</span>
                        <span className="text-[10px] font-extrabold text-[var(--text)]">{parseFloat((selectedCustomRecipeDetail.carbs / (selectedCustomRecipeDetail.servings || 1)).toFixed(1))}g</span>
                      </div>
                      <div className="p-1.5 border border-[var(--accent-sand)]/20 rounded-xl bg-[var(--accent-sand)]/5">
                        <span className="text-[8px] font-bold text-[var(--accent-sand)] block uppercase">{language === 'fr' ? 'Lip.' : 'Fat.'}</span>
                        <span className="text-[10px] font-extrabold text-[var(--text)]">{parseFloat((selectedCustomRecipeDetail.fat / (selectedCustomRecipeDetail.servings || 1)).toFixed(1))}g</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)] font-bold text-center border-t border-[var(--border-muted)] pt-1.5 mt-1">
                      {language === 'fr' ? 'Total recette :' : 'Total recipe:'} {selectedCustomRecipeDetail.calories} kcal · P: {selectedCustomRecipeDetail.protein}g · {language === 'fr' ? 'G' : 'C'}: {selectedCustomRecipeDetail.carbs}g · {language === 'fr' ? 'L' : 'F'}: {selectedCustomRecipeDetail.fat}g
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text)]">{t('ingredients')} ({selectedCustomRecipeDetail.ingredients?.length})</h4>
                <div className="space-y-1.5">
                  {selectedCustomRecipeDetail.ingredients?.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-[var(--surface-inset)] border border-[var(--border-muted)] rounded-xl text-xs">
                      <span className="text-[var(--text-muted)] font-semibold">{ing.food_name}</span>
                      <span className="font-bold text-[var(--text)]">{ing.serving_amount}{ing.serving_unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-muted)] flex gap-3 bg-[var(--surface-inset)]">
              <button
                onClick={() => { setSelectedCustomRecipeDetail(null); setSelectedCustomRecipeForJournal(selectedCustomRecipeDetail); }}
                className="brutal-btn-accent flex-1 py-2 bg-[var(--accent-pistachio)] text-[var(--bg-dark-slate)]"
              >
                {t('add_to_meal_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
