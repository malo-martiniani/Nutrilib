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
  BookOpen
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
    bgImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', 
    accent: 'var(--accent-neon)' 
  },
  { 
    id: 'lunch', 
    name: 'Déjeuner', 
    label: 'MIDI', 
    bgImage: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80', 
    accent: 'var(--accent-cyan)' 
  },
  { 
    id: 'dinner', 
    name: 'Dîner', 
    label: 'SOIR', 
    bgImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80', 
    accent: 'var(--accent-cyan)' 
  },
  { 
    id: 'snack', 
    name: 'Collation', 
    label: 'SNACK', 
    bgImage: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80', 
    accent: 'var(--accent-amber)' 
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
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);

  const [showListSelectorForFood, setShowListSelectorForFood] = useState(null);

  // Data fetchers (unchanged logic)
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

  // Debounced search
  useEffect(() => {
    if (!headerSearchQuery.trim()) {
      setHeaderSearchResults([]);
      setShowHeaderSearchDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setHeaderSearching(true);
      try {
        const response = await fetch(`${API_URL}/foods/search?query=${encodeURIComponent(headerSearchQuery)}`, {
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
  }, [headerSearchQuery, token]);

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
    setActiveMealType(mealType);
    setShowAddModal(true);
    setShowHeaderSearchDropdown(false);
    setHeaderSearchQuery('');
  };

  const addFoodToJournal = async () => {
    if (!selectedFood || !token) return;
    const ratio = servingAmount / 100;
    const payload = {
      food_id: selectedFood.food_id,
      food_name: selectedFood.food_name,
      calories: Math.round(selectedFood.calories * ratio),
      protein: (selectedFood.protein * ratio).toFixed(1),
      carbs: (selectedFood.carbs * ratio).toFixed(1),
      fat: (selectedFood.fat * ratio).toFixed(1),
      meal_type: activeMealType,
      serving_amount: servingAmount,
      serving_unit: 'g',
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

  return (
    <div className="min-h-screen text-[var(--text)] flex flex-col pb-[64px] md:pb-0 md:pl-[80px] transition-all duration-300">

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-[rgba(15,28,22,0.85)] backdrop-blur-md border-b border-[var(--border)]">
        <div className="px-5 py-4 flex items-center justify-between gap-3 max-w-4xl mx-auto w-full">
          {/* Logo */}
          <h1 className="text-xl font-extrabold uppercase tracking-tight text-[var(--accent-neon)] shrink-0">
            Nutrilib
          </h1>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Rechercher un aliment..."
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              className="brutal-input pl-10 pr-8 py-2 text-xs"
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
                        <span className="text-[10px] text-[var(--text-dim)]">{food.brand_name} · {food.serving}</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[var(--accent-neon)] block">{food.calories}</span>
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
                                  className="w-full text-left py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-neon)] font-semibold cursor-pointer transition-colors duration-150">
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

          {/* Logout */}
          <button onClick={logout} className="brutal-btn-ghost text-[10px] shrink-0">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* TAB: JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-6">

            {/* Date Navigation */}
            <div className="flex items-center justify-between border border-[var(--border)] bg-[var(--surface)] p-3 rounded-[20px] shadow-[var(--shadow-subtle)]">
              <button onClick={() => adjustDate(-1)} className="brutal-btn-ghost p-2">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text)]">
                <Calendar className="w-4 h-4 text-[var(--accent-neon)]" />
                <span className="capitalize">{formattedDisplayDate}</span>
              </div>
              <button onClick={() => adjustDate(1)} className="brutal-btn-ghost p-2">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calorie + Macro overview */}
            <div className="space-y-4">
              {/* Main calorie block */}
              <div className="brutal-card" style={{ borderColor: 'rgba(57, 255, 20, 0.2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="brutal-label">Calories consommées</span>
                    <p className="text-3xl font-extrabold text-[var(--text)]">
                      {totals.calories} <span className="text-sm font-semibold text-[var(--text-dim)]">/ {calorieGoal} kcal</span>
                    </p>
                  </div>
                  <span className="brutal-tag text-[var(--accent-neon)]" style={{ borderColor: 'var(--accent-neon)' }}>{calPercent}%</span>
                </div>
                <div className="brutal-progress-track">
                  <div className="brutal-progress-fill bg-[var(--accent-neon)]" style={{ width: `${calPercent}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                  <span>Consommé : {totals.calories} kcal</span>
                  <span>Restant : {Math.max(calorieGoal - totals.calories, 0)} kcal</span>
                </div>
              </div>

              {/* Macro grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="brutal-card p-4 transition-all duration-300" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--protein)]">Protéines</span>
                  <p className="text-xl font-extrabold mt-1">{totals.protein.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {proteinGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--protein)]" style={{ width: `${proteinPercent}%` }}></div>
                  </div>
                </div>
                {/* Carbs */}
                <div className="brutal-card p-4 transition-all duration-300" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--carbs)]">Glucides</span>
                  <p className="text-xl font-extrabold mt-1">{totals.carbs.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {carbGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--carbs)]" style={{ width: `${carbsPercent}%` }}></div>
                  </div>
                </div>
                {/* Fat */}
                <div className="brutal-card p-4 transition-all duration-300" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fat)]">Lipides</span>
                  <p className="text-xl font-extrabold mt-1">{totals.fat.toFixed(1)}g</p>
                  <span className="text-[10px] text-[var(--text-dim)]">/ {fatGoal}g</span>
                  <div className="brutal-progress-track mt-2">
                    <div className="brutal-progress-fill bg-[var(--fat)]" style={{ width: `${fatPercent}%` }}></div>
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
                    {/* Meal header with nature backdrop overlay */}
                    <div 
                      className="relative px-5 py-4 border-b border-[var(--border-muted)] bg-cover bg-center"
                      style={{ backgroundImage: `linear-gradient(rgba(15, 28, 22, 0.8), rgba(15, 28, 22, 0.95)), url(${meal.bgImage})` }}
                    >
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
                              alert('Utilisez la barre de recherche en haut pour ajouter un aliment !');
                            }}
                            className="brutal-btn-accent py-1.5 px-3 text-[10px] cursor-pointer"
                            style={{ backgroundColor: meal.accent, color: '#040d0a', boxShadow: 'none' }}
                          >
                            <Plus className="w-3 h-3 stroke-[3]" /> Ajouter
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Food entries */}
                    <div className="p-4 bg-[var(--surface)]">
                      {mealEntries.length === 0 ? (
                        <p className="text-xs text-[var(--text-dim)] text-center py-4 font-medium">Aucun aliment enregistré.</p>
                      ) : (
                        <div className="space-y-2">
                          {mealEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-muted)]">
                              <div>
                                <h4 className="font-bold text-xs text-[var(--text)]">{entry.food_name}</h4>
                                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                                  {entry.serving_amount}{entry.serving_unit} ·{' '}
                                  <span style={{ color: 'var(--protein)' }}>P:{entry.protein}g</span> ·{' '}
                                  <span style={{ color: 'var(--carbs)' }}>G:{entry.carbs}g</span> ·{' '}
                                  <span style={{ color: 'var(--fat)' }}>L:{entry.fat}g</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="brutal-tag text-[10px] border-[var(--border-muted)] text-[var(--text-muted)]">
                                  {entry.calories} kcal
                                </span>
                                <button onClick={() => deleteJournalEntry(entry.id)} className="brutal-btn-danger">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
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
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ===== PORTION MODAL ===== */}
      {showAddModal && selectedFood && (
        <div className="brutal-overlay">
          <div className="brutal-modal">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wider">Ajouter au journal</h3>
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
                          ? 'border-[var(--accent-neon)] text-[var(--accent-neon)] bg-[var(--surface-raised)]'
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
                <label className="brutal-label">Quantité (g)</label>
                <input type="number" min="1" max="2000" value={servingAmount}
                  onChange={(e) => setServingAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="brutal-input" />
              </div>

              {/* Calculated values */}
              <div className="border border-[var(--border)] p-4 space-y-2 bg-[var(--surface-inset)] rounded-2xl">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-semibold">Calories</span>
                  <span className="font-extrabold text-[var(--accent-neon)]">{Math.round(selectedFood.calories * (servingAmount / 100))} kcal</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Protéines</span>
                  <span className="font-bold text-[var(--protein)]">{(selectedFood.protein * (servingAmount / 100)).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Glucides</span>
                  <span className="font-bold text-[var(--carbs)]">{(selectedFood.carbs * (servingAmount / 100)).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Lipides</span>
                  <span className="font-bold text-[var(--fat)]">{(selectedFood.fat * (servingAmount / 100)).toFixed(1)}g</span>
                </div>
              </div>

              <button onClick={addFoodToJournal} className="brutal-btn-accent w-full">
                Ajouter au repas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}







