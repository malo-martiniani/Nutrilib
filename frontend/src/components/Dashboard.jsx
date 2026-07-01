import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  X,
  Utensils,
  Heart,
  User,
  Scale,
  Flame,
  FolderOpen,
  ChefHat,
  Star as StarIcon,
  BookOpen,
  Clock,
  CheckCircle,
  ListTodo,
  SlidersHorizontal
} from 'lucide-react';
import Profile from './Profile';
import WeightTracker from './WeightTracker';
import Favorites from './Favorites';
import Recipes from './Recipes';

const API_URL = 'http://localhost:5000/api';

const MEALS = [
  { 
    id: 'breakfast', 
    name: 'Petit-déjeuner', 
    label: 'MATIN', 
    accent: 'var(--accent-pistachio)',
    btnColor: 'var(--accent-pistachio)'
  },
  { 
    id: 'lunch', 
    name: 'Déjeuner', 
    label: 'MIDI', 
    accent: 'var(--accent-powder)',
    btnColor: 'var(--accent-powder)'
  },
  { 
    id: 'dinner', 
    name: 'Dîner', 
    label: 'SOIR', 
    accent: 'var(--accent-sand)',
    btnColor: 'var(--accent-sand)'
  },
  { 
    id: 'snack', 
    name: 'Collation', 
    label: 'SNACK', 
    accent: 'var(--accent-powder)',
    btnColor: 'var(--accent-powder)'
  }
];

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  const [profileData, setProfileData] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(130);
  const [carbGoal, setCarbGoal] = useState(220);
  const [fatGoal, setFatGoal] = useState(65);

  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState([]);
  const [headerSearching, setHeaderSearching] = useState(false);
  const [showHeaderSearchDropdown, setShowHeaderSearchDropdown] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [lists, setLists] = useState([]);

  const [selectedFood, setSelectedFood] = useState(null);
  const [servingAmount, setServingAmount] = useState(100);
  const [servingUnit, setServingUnit] = useState('g');
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);

  // Meal search modal state
  const [showMealSearchModal, setShowMealSearchModal] = useState(false);
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [mealSearchResults, setMealSearchResults] = useState([]);
  const [mealSearching, setMealSearching] = useState(false);

  // Recipe Detail Modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const [showListSelectorForFood, setShowListSelectorForFood] = useState(null);

  // Advanced search filters states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [caloriesMin, setCaloriesMin] = useState('');
  const [caloriesMax, setCaloriesMax] = useState('');
  const [proteinMin, setProteinMin] = useState('');
  const [carbsMax, setCarbsMax] = useState('');
  const [fatMax, setFatMax] = useState('');

  // Data fetchers
  const fetchProfileData = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setCalorieGoal(data.calorie_goal || 2000);
        setProteinGoal(data.protein_goal || 130);
        setCarbGoal(data.carb_goal || 220);
        setFatGoal(data.fat_goal || 65);
      }
    } catch (err) { console.error(err); }
  };

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
    } catch (err) { console.error(err); }
  };

  const fetchJournalEntries = async () => {
    if (!token) return;
    setLoadingEntries(true);
    try {
      const response = await fetch(`${API_URL}/journal?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setJournalEntries(await response.json()); }
    } catch (error) { console.error('Erreur chargement journal:', error); }
    finally { setLoadingEntries(false); }
  };

  useEffect(() => { fetchProfileData(); fetchFavoritesAndLists(); }, [token]);
  useEffect(() => { fetchJournalEntries(); }, [selectedDate, token]);

  // Debounced search for header search bar
  useEffect(() => {
    if (!headerSearchQuery.trim()) {
      setHeaderSearchResults([]);
      setShowHeaderSearchDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setHeaderSearching(true);
      try {
        let url = `${API_URL}/foods/search?query=${encodeURIComponent(headerSearchQuery)}`;
        if (caloriesMin) url += `&caloriesMin=${caloriesMin}`;
        if (caloriesMax) url += `&caloriesMax=${caloriesMax}`;
        if (proteinMin) url += `&proteinMin=${proteinMin}`;
        if (carbsMax) url += `&carbsMax=${carbsMax}`;
        if (fatMax) url += `&fatMax=${fatMax}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHeaderSearchResults(data.foods || []);
          setShowHeaderSearchDropdown(true);
        }
      } catch (err) { console.error(err); }
      finally { setHeaderSearching(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [headerSearchQuery, caloriesMin, caloriesMax, proteinMin, carbsMax, fatMax, token]);

  // Debounced search for meal search modal
  useEffect(() => {
    if (!mealSearchQuery.trim()) {
      setMealSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setMealSearching(true);
      try {
        let url = `${API_URL}/foods/search?query=${encodeURIComponent(mealSearchQuery)}`;
        if (caloriesMin) url += `&caloriesMin=${caloriesMin}`;
        if (caloriesMax) url += `&caloriesMax=${caloriesMax}`;
        if (proteinMin) url += `&proteinMin=${proteinMin}`;
        if (carbsMax) url += `&carbsMax=${carbsMax}`;
        if (fatMax) url += `&fatMax=${fatMax}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMealSearchResults(data.foods || []);
        }
      } catch (err) { console.error(err); }
      finally { setMealSearching(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [mealSearchQuery, caloriesMin, caloriesMax, proteinMin, carbsMax, fatMax, token]);

  const handleToggleFavorite = async (e, food) => {
    e.stopPropagation();
    const isFav = favoriteIds.includes(food.food_id);
    try {
      if (isFav) {
        const favsRes = await fetch(`${API_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (favsRes.ok) {
          const favs = await favsRes.json();
          const match = favs.find(f => f.food_id === food.food_id);
          if (match) {
            const delRes = await fetch(`${API_URL}/favorites/${match.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (delRes.ok) { setFavoriteIds(favoriteIds.filter(id => id !== food.food_id)); }
          }
        }
      } else {
        const addRes = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ food_id: food.food_id, food_name: food.food_name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, serving_description: food.serving })
        });
        if (addRes.ok) { setFavoriteIds([...favoriteIds, food.food_id]); }
      }
    } catch (err) { console.error(err); }
  };

  const handleAddToList = async (listId, food) => {
    try {
      const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ food_id: food.food_id, food_name: food.food_name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, serving_description: food.serving })
      });
      if (response.ok) {
        alert('Aliment ajouté à la liste !');
        fetchFavoritesAndLists();
        setShowListSelectorForFood(null);
      }
    } catch (err) { console.error(err); }
  };

  const openPortionSelector = (food, mealType = 'breakfast') => {
    setSelectedFood(food);
    setServingAmount(100);
    setServingUnit('g');
    setActiveMealType(mealType);
    setShowAddModal(true);
    setShowHeaderSearchDropdown(false);
    setHeaderSearchQuery('');
    setMealSearchQuery('');
    setMealSearchResults([]);
    setShowMealSearchModal(false);
  };

  const addFoodToJournal = async () => {
    if (!selectedFood || !token) return;
    const unitMultiplier = servingUnit === 'cl' ? 10 : 1;
    const finalAmount = servingAmount * unitMultiplier;
    const ratio = finalAmount / 100;
    const payload = {
      food_id: selectedFood.food_id,
      food_name: selectedFood.food_name,
      calories: Math.round(selectedFood.calories * ratio),
      protein: (selectedFood.protein * ratio).toFixed(1),
      carbs: (selectedFood.carbs * ratio).toFixed(1),
      fat: (selectedFood.fat * ratio).toFixed(1),
      meal_type: activeMealType,
      serving_amount: servingAmount,
      serving_unit: servingUnit,
      entry_date: selectedDate
    };
    try {
      const response = await fetch(`${API_URL}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) { fetchJournalEntries(); setShowAddModal(false); setSelectedFood(null); }
      else { const err = await response.json(); alert(err.message || 'Erreur.'); }
    } catch (err) { console.error(err); }
  };

  const deleteJournalEntry = async (id) => {
    if (!window.confirm('Retirer cet aliment du journal ?')) return;
    try {
      const response = await fetch(`${API_URL}/journal/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setJournalEntries(journalEntries.filter(entry => entry.id !== id)); }
    } catch (error) { console.error(error); }
  };

  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleFetchRecipeDetails = async (id) => {
    setLoadingRecipe(true);
    setCheckedIngredients({});
    try {
      const response = await fetch(`${API_URL}/foods/recipes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setSelectedRecipe((await response.json()).recipe); }
      else { alert('Erreur chargement recette.'); }
    } catch (err) { console.error(err); }
    finally { setLoadingRecipe(false); }
  };

  const handleToggleRecipeFavorite = async (recipe) => {
    const recipeFoodId = `recipe_${recipe.recipe_id}`;
    const isFav = favoriteIds.includes(recipeFoodId);
    try {
      if (isFav) {
        const favsRes = await fetch(`${API_URL}/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (favsRes.ok) {
          const favs = await favsRes.json();
          const match = favs.find(f => f.food_id === recipeFoodId);
          if (match) {
            const delRes = await fetch(`${API_URL}/favorites/${match.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (delRes.ok) { setFavoriteIds(favoriteIds.filter(id => id !== recipeFoodId)); }
          }
        }
      } else {
        const addRes = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            food_id: recipeFoodId,
            food_name: recipe.recipe_name,
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fat: recipe.fat,
            serving_description: '1 portion'
          })
        });
        if (addRes.ok) { setFavoriteIds([...favoriteIds, recipeFoodId]); }
      }
    } catch (err) { console.error(err); }
  };

  const toggleIngredientCheck = (index) => {
    setCheckedIngredients(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Helper function to clean oz to ml/g in ingredients list & description
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
    return formatted;
  };

  // Totals
  const totals = journalEntries.reduce(
    (acc, cur) => {
      acc.calories += cur.calories;
      acc.protein += parseFloat(cur.protein);
      acc.carbs += parseFloat(cur.carbs);
      acc.fat += parseFloat(cur.fat);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calPercent = Math.min(Math.round((totals.calories / calorieGoal) * 100), 100);
  const proteinPercent = Math.min(Math.round((totals.protein / proteinGoal) * 100), 100);
  const carbsPercent = Math.min(Math.round((totals.carbs / carbGoal) * 100), 100);
  const fatPercent = Math.min(Math.round((totals.fat / fatGoal) * 100), 100);

  const formattedDisplayDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowHeaderSearchDropdown(false);
  };

  const NAV_ITEMS = [
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'recipes', label: 'Recettes', icon: ChefHat },
    { id: 'weight', label: 'Poids', icon: Scale },
    { id: 'favorites', label: 'Favoris', icon: Heart },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const unitMultiplier = servingUnit === 'cl' ? 10 : 1;
  const computedGrams = servingAmount * unitMultiplier;

  return (
    <div className="min-h-screen text-[var(--text)] flex flex-col pb-[64px] md:pb-0 md:pl-[80px] transition-all duration-300">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-[rgba(24,32,48,0.85)] backdrop-blur-md border-b border-[var(--border)]">
        <div className="px-5 py-4 flex flex-col gap-3 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between gap-3 w-full">
          {/* Logo */}
          <h1 
            onClick={() => setActiveTab('journal')} 
            className="text-xl font-extrabold uppercase tracking-tight text-[var(--accent-pistachio)] shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            Nutrilib
          </h1>

          {/* Search Container */}
          <div className="flex-1 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
              <input
                type="text"
                placeholder="Rechercher un aliment..."
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                className="brutal-input pr-8 py-2 text-xs"
                style={{ paddingLeft: '2.5rem' }}
              />
              {headerSearchQuery && (
                <button
                  onClick={() => { setHeaderSearchQuery(''); setShowHeaderSearchDropdown(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search dropdown */}
              {showHeaderSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border)] z-50 max-h-[300px] overflow-y-auto rounded-2xl shadow-[var(--shadow-soft)]">
                  {headerSearching && (
                    <div className="flex justify-center py-6"><div className="brutal-spinner"></div></div>
                  )}
                  {!headerSearching && headerSearchResults.length === 0 && (
                    <p className="text-xs text-center text-[var(--text-dim)] py-6">Aucun résultat pour "{headerSearchQuery}"</p>
                  )}
                  {!headerSearching && headerSearchResults.map((food) => {
                    const isFav = favoriteIds.includes(food.food_id);
                    return (
                      <div
                        key={food.food_id}
                        onClick={() => openPortionSelector(food, 'breakfast')}
                        className="flex items-center justify-between p-3.5 border-b border-[var(--border-dim)] hover:bg-[var(--surface-raised)] cursor-pointer transition-colors duration-200"
                      >
                        <div>
                          <span className="font-bold text-xs text-[var(--text)] block">{food.food_name}</span>
                          <span className="text-[10px] text-[var(--text-dim)]">{food.brand_name} · {formatServing(food.serving)}</span>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[var(--accent-pistachio)] block">{food.calories}</span>
                            <span className="text-[9px] text-[var(--text-dim)]">kcal</span>
                          </div>
                          <button onClick={(e) => handleToggleFavorite(e, food)} className="brutal-btn-danger">
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-[var(--accent-magenta)] fill-[var(--accent-magenta)]' : ''}`} />
                          </button>
                          <button
                            onClick={() => setShowListSelectorForFood(showListSelectorForFood === food.food_id ? null : food.food_id)}
                            className="brutal-btn-danger"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>

                          {showListSelectorForFood === food.food_id && (
                            <div className="absolute right-2 mt-1 bg-[var(--surface)] border border-[var(--border)] p-3.5 z-50 w-44 rounded-2xl shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
                              <span className="brutal-label block border-b border-[var(--border-muted)] pb-1 mb-2">Ajouter à :</span>
                              {lists.length === 0 ? (
                                <p className="text-[10px] text-[var(--text-dim)]">Aucune liste.</p>
                              ) : (
                                lists.map(l => (
                                  <button key={l.id} onClick={() => handleAddToList(l.id, food)}
                                    className="w-full text-left py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-pistachio)] font-semibold cursor-pointer transition-colors duration-150">
                                    → {l.list_name}
                                  </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Advanced filters toggle button */}
              <button 
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-2 border rounded-xl hover:bg-[var(--surface-raised)] transition-all cursor-pointer ${showAdvancedFilters ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                title="Filtres avancés"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Logout */}
            <button onClick={logout} className="brutal-btn-ghost text-[10px] shrink-0">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>

          {/* Advanced filters panel */}
          {showAdvancedFilters && (
            <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[20px] shadow-[var(--shadow-soft)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* TAB: JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-6">

            {/* Date Navigation */}
            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] p-3 rounded-[20px] shadow-[var(--shadow-subtle)]">
              <button onClick={() => adjustDate(-1)} className="brutal-btn-ghost p-2 text-[var(--accent-pistachio)] hover:text-[var(--text)]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--accent-pistachio)]">
                <Calendar className="w-4 h-4 text-[var(--accent-pistachio)]" />
                <span className="capitalize">{formattedDisplayDate}</span>
              </div>
              <button onClick={() => adjustDate(1)} className="brutal-btn-ghost p-2 text-[var(--accent-pistachio)] hover:text-[var(--text)]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calorie + Macro overview */}
            <div className="space-y-4">
              {/* Main calorie block */}
              <div className="brutal-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="brutal-label text-[var(--text-muted)]">Calories consommées</span>
                    <p className="text-3xl font-extrabold text-[var(--text)]">
                      {totals.calories} <span className="text-sm font-semibold text-[var(--text-dim)]">/ {calorieGoal} kcal</span>
                    </p>
                  </div>
                  <span className="brutal-tag text-[var(--accent-pistachio)]" style={{ borderColor: 'var(--accent-pistachio)' }}>{calPercent}%</span>
                </div>
                <div className="brutal-progress-track">
                  <div className="brutal-progress-fill bg-[var(--accent-pistachio)]" style={{ width: `${calPercent}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <span>Consommé : {totals.calories} kcal</span>
                  <span>Restant : {Math.max(calorieGoal - totals.calories, 0)} kcal</span>
                </div>
              </div>

              {/* Macro grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="brutal-card p-4 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-powder)]">Protéines</span>
                  <p className="text-xl font-extrabold mt-1 text-[var(--text)]">{totals.protein.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {proteinGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--accent-powder)]" style={{ width: `${proteinPercent}%` }}></div>
                  </div>
                </div>
                {/* Carbs */}
                <div className="brutal-card p-4 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-powder)]">Glucides</span>
                  <p className="text-xl font-extrabold mt-1 text-[var(--text)]">{totals.carbs.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {carbGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--accent-powder)]" style={{ width: `${carbsPercent}%` }}></div>
                  </div>
                </div>
                {/* Fat */}
                <div className="brutal-card p-4 transition-all duration-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-sand)]">Lipides</span>
                  <p className="text-xl font-extrabold mt-1 text-[var(--text)]">{totals.fat.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {fatGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--accent-sand)]" style={{ width: `${fatPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <section className="space-y-5">
              {loadingEntries && (
                <div className="flex justify-center py-8"><div className="brutal-spinner"></div></div>
              )}
              {!loadingEntries && MEALS.map((meal) => {
                const mealEntries = journalEntries.filter(entry => entry.meal_type === meal.id);
                const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);
                return (
                  <div 
                    key={meal.id} 
                    className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)] transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    {/* Meal header - Uni and clean, no background images */}
                    <div className="relative px-5 py-4 border-b border-[var(--border-muted)] bg-[var(--surface)]">
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text)]">{meal.name}</h3>
                          <p className="text-[10px] text-[var(--text-muted)] font-semibold">{mealEntries.length} aliment(s)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {mealCalories > 0 && (
                            <span className="brutal-tag text-[10px]" style={{ color: meal.accent, borderColor: meal.accent }}>
                              {mealCalories} kcal
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setActiveMealType(meal.id);
                              setShowMealSearchModal(true); // Open direct meal search modal
                            }}
                            className="brutal-btn-accent py-1.5 px-3 text-[10px] cursor-pointer"
                            style={{ backgroundColor: meal.btnColor, color: 'var(--bg-dark-slate)', boxShadow: 'none' }}
                          >
                            <Plus className="w-3 h-3 stroke-[3]" /> Ajouter
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Food entries */}
                    <div className="p-4 bg-[var(--surface)]">
                      {mealEntries.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] text-center py-4 font-medium">Aucun aliment enregistré.</p>
                      ) : (
                        <div className="space-y-2">
                          {mealEntries.map((entry) => {
                            const isRecipe = entry.food_id && entry.food_id.startsWith('recipe_');
                            return (
                              <div key={entry.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-muted)]">
                                <div className="flex-1 mr-2">
                                  {isRecipe ? (
                                    <button 
                                      onClick={() => handleFetchRecipeDetails(entry.food_id.replace('recipe_', ''))}
                                      className="font-bold text-xs text-[var(--accent-powder)] hover:underline text-left cursor-pointer"
                                    >
                                      {entry.food_name} (Recette)
                                    </button>
                                  ) : (
                                    <h4 className="font-bold text-xs text-[var(--text)]">{entry.food_name}</h4>
                                  )}
                                  <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                                    {entry.serving_amount}{entry.serving_unit || 'g'} ·{' '}
                                    <span className="text-[var(--accent-powder)]">P:{entry.protein}g</span> ·{' '}
                                    <span className="text-[var(--accent-powder)]">G:{entry.carbs}g</span> ·{' '}
                                    <span className="text-[var(--accent-sand)]">L:{entry.fat}g</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="brutal-tag text-[10px] border-[var(--border-muted)] text-[var(--text-muted)]">
                                    {entry.calories} kcal
                                  </span>
                                  <button onClick={() => deleteJournalEntry(entry.id)} className="brutal-btn-danger">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        )}

        {/* TAB: RECIPES */}
        {activeTab === 'recipes' && <Recipes token={token} />}

        {/* TAB: WEIGHT */}
        {activeTab === 'weight' && <WeightTracker token={token} onWeightChange={fetchProfileData} />}

        {/* TAB: FAVORITES */}
        {activeTab === 'favorites' && <Favorites token={token} defaultDate={selectedDate} />}

        {/* TAB: PROFILE */}
        {activeTab === 'profile' && <Profile token={token} onProfileUpdate={fetchProfileData} />}

      </main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            style={{ color: activeTab === item.id ? 'var(--accent-pistachio)' : 'var(--text-muted)' }}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== DIRECT MEAL SEARCH MODAL ===== */}
      {showMealSearchModal && (
        <div className="brutal-overlay" onClick={() => { setShowMealSearchModal(false); setMealSearchQuery(''); setMealSearchResults([]); }}>
          <div className="brutal-modal max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text)]">
                  Ajouter au {MEALS.find(m => m.id === activeMealType)?.name}
                </h3>
                <span className="text-[10px] text-[var(--text-dim)] font-semibold">Rechercher un aliment ou une recette</span>
              </div>
              <button 
                onClick={() => { setShowMealSearchModal(false); setMealSearchQuery(''); setMealSearchResults([]); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer font-bold uppercase transition-colors"
              >
                Fermer
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    placeholder="Saisissez un aliment (ex: riz, œuf...)"
                    value={mealSearchQuery}
                    onChange={(e) => setMealSearchQuery(e.target.value)}
                    className="brutal-input pr-8 py-2 text-xs"
                    style={{ paddingLeft: '2.5rem' }}
                    autoFocus
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`p-2 border rounded-xl hover:bg-[var(--surface-raised)] transition-all cursor-pointer ${showAdvancedFilters ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                  title="Filtres avancés"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Advanced filters panel inside modal */}
              {showAdvancedFilters && (
                <div className="p-3 bg-[var(--surface-inset)] border border-[var(--border)] rounded-[20px] grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[9px] uppercase font-extrabold text-[var(--text-muted)] mb-1">Calories (Min - Max)</label>
                    <div className="flex gap-1">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={caloriesMin} 
                        onChange={(e) => setCaloriesMin(e.target.value)} 
                        className="brutal-input py-1 px-1.5 text-[9px] w-full text-center" 
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={caloriesMax} 
                        onChange={(e) => setCaloriesMax(e.target.value)} 
                        className="brutal-input py-1 px-1.5 text-[9px] w-full text-center" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-extrabold text-[var(--accent-powder)] mb-1">Protéines Min (g)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 20" 
                      value={proteinMin} 
                      onChange={(e) => setProteinMin(e.target.value)} 
                      className="brutal-input py-1 px-1.5 text-[9px] text-center w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-extrabold text-[var(--accent-powder)] mb-1">Glucides Max (g)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 10" 
                      value={carbsMax} 
                      onChange={(e) => setCarbsMax(e.target.value)} 
                      className="brutal-input py-1 px-1.5 text-[9px] text-center w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-extrabold text-[var(--accent-sand)] mb-1">Lipides Max (g)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 15" 
                      value={fatMax} 
                      onChange={(e) => setFatMax(e.target.value)} 
                      className="brutal-input py-1 px-1.5 text-[9px] text-center w-full" 
                    />
                  </div>
                  <div className="col-span-full flex justify-end pt-1 border-t border-[var(--border-muted)] mt-0.5">
                    <button 
                      type="button" 
                      onClick={() => {
                        setCaloriesMin('');
                        setCaloriesMax('');
                        setProteinMin('');
                        setCarbsMax('');
                        setFatMax('');
                      }} 
                      className="text-[9px] font-bold text-[var(--accent-magenta)] hover:underline uppercase cursor-pointer"
                    >
                      Réinitialiser
                    </button>
                  </div>
                </div>
              )}

              {/* Results list */}
              <div className="max-h-[300px] overflow-y-auto space-y-2 border border-[var(--border)] rounded-2xl bg-[var(--surface-inset)] p-2">
                {mealSearching && (
                  <div className="flex justify-center py-8"><div className="brutal-spinner"></div></div>
                )}
                {!mealSearching && mealSearchQuery && mealSearchResults.length === 0 && (
                  <p className="text-xs text-center text-[var(--text-muted)] py-8">Aucun aliment trouvé pour "{mealSearchQuery}"</p>
                )}
                {!mealSearching && !mealSearchQuery && (
                  <p className="text-xs text-center text-[var(--text-dim)] py-8">Commencez à taper pour rechercher...</p>
                )}
                {!mealSearching && mealSearchResults.map((food) => (
                  <div
                    key={food.food_id}
                    onClick={() => openPortionSelector(food, activeMealType)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-raised)] border border-transparent hover:border-[var(--border-muted)] cursor-pointer transition-all duration-200"
                  >
                    <div>
                      <span className="font-bold text-xs text-[var(--text)] block">{food.food_name}</span>
                      <span className="text-[9px] text-[var(--text-dim)]">{food.brand_name} · {formatServing(food.serving)}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-[var(--accent-pistachio)] block">{food.calories} kcal</span>
                      <span className="text-[9px] text-[var(--text-dim)]">sélectionner</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PORTION MODAL ===== */}
      {showAddModal && selectedFood && (
        <div className="brutal-overlay" onClick={() => { setShowAddModal(false); setSelectedFood(null); }}>
          <div className="brutal-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--text)]">Ajouter au journal</h3>
                <span className="text-[10px] text-[var(--text-dim)] font-semibold">{selectedFood.food_name}</span>
              </div>
              <button onClick={() => { setShowAddModal(false); setSelectedFood(null); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer font-bold uppercase transition-colors duration-150">
                Annuler
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Meal selector */}
              <div>
                <label className="brutal-label">Choisir le repas</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((meal) => (
                    <button key={meal.id} type="button" onClick={() => setActiveMealType(meal.id)}
                      className={`py-2.5 px-4 border text-xs font-bold uppercase text-center rounded-xl transition-all duration-200 cursor-pointer ${
                        activeMealType === meal.id
                          ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)] bg-[var(--surface-raised)]'
                          : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {meal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="brutal-label">Quantité ({servingUnit})</label>
                <div className="flex gap-2">
                  <input type="number" min="1" max="2000" value={servingAmount}
                    onChange={(e) => setServingAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="brutal-input" />
                  <select 
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    className="brutal-input w-20 text-center py-2 px-1 cursor-pointer bg-[var(--surface-inset)]"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="cl">cl</option>
                  </select>
                </div>
              </div>

              {/* Calculated values */}
              <div className="border border-[var(--border)] p-4 space-y-2 bg-[var(--surface-inset)] rounded-2xl">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-semibold">Calories</span>
                  <span className="font-extrabold text-[var(--accent-pistachio)]">{Math.round(selectedFood.calories * (computedGrams / 100))} kcal</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Protéines</span>
                  <span className="font-bold text-[var(--accent-powder)]">{(selectedFood.protein * (computedGrams / 100)).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Glucides</span>
                  <span className="font-bold text-[var(--accent-powder)]">{(selectedFood.carbs * (computedGrams / 100)).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Lipides</span>
                  <span className="font-bold text-[var(--accent-sand)]">{(selectedFood.fat * (computedGrams / 100)).toFixed(1)}g</span>
                </div>
              </div>

              <button onClick={addFoodToJournal} className="brutal-btn-accent w-full" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
                Ajouter au repas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RECIPE DETAIL MODAL ===== */}
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
                  onClick={() => handleToggleRecipeFavorite(selectedRecipe)} 
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
                      <span className="text-xs font-extrabold text-[var(--accent-pistachio)]">{selectedRecipe.calories} kcal/portion</span>
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

    </div>
  );
}
