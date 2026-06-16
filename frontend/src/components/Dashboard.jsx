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
  Activity,
  Award,
  Heart,
  User,
  Scale,
  Flame,
  ShoppingBag,
  ChefHat,
  PlusCircle,
  FolderOpen
} from 'lucide-react';
import Profile from './Profile';
import WeightTracker from './WeightTracker';
import Favorites from './Favorites';
import Recipes from './Recipes';

const API_URL = 'http://localhost:5000/api';

const MEALS = [
  { id: 'breakfast', name: 'Petit-déjeuner', icon: '🥐' },
  { id: 'lunch', name: 'Déjeuner', icon: '🍽️' },
  { id: 'dinner', name: 'Dîner', icon: '🍲' },
  { id: 'snack', name: 'En-cas / Collation', icon: '🍎' }
];

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  // Profil et objectifs caloriques
  const [profileData, setProfileData] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(130);
  const [carbGoal, setCarbGoal] = useState(220);
  const [fatGoal, setFatGoal] = useState(65);

  // État de la recherche debouncée dans le Header
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState([]);
  const [headerSearching, setHeaderSearching] = useState(false);
  const [showHeaderSearchDropdown, setShowHeaderSearchDropdown] = useState(false);

  // Favoris de l'utilisateur pour l'icône cœur interactif
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [lists, setLists] = useState([]);

  // Gestion de l'ajout d'un aliment
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingAmount, setServingAmount] = useState(100);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [showAddModal, setShowAddModal] = useState(false);

  // Gestion de la sélection de liste personnalisée (pour ajouter depuis la recherche)
  const [showListSelectorForFood, setShowListSelectorForFood] = useState(null);

  // Charger le profil de l'utilisateur
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
    } catch (err) {
      console.error(err);
    }
  };

  // Charger les favoris et listes personnalisées
  const fetchFavoritesAndLists = async () => {
    if (!token) return;
    try {
      const favRes = await fetch(`${API_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listsRes = await fetch(`${API_URL}/lists`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (favRes.ok) {
        const favs = await favRes.json();
        setFavoriteIds(favs.map(f => f.food_id));
      }
      if (listsRes.ok) {
        setLists(await listsRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Charger le journal pour le jour sélectionné
  const fetchJournalEntries = async () => {
    if (!token) return;
    setLoadingEntries(true);
    try {
      const response = await fetch(`${API_URL}/journal?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data);
      }
    } catch (error) {
      console.error('Erreur chargement journal:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchFavoritesAndLists();
  }, [token]);

  useEffect(() => {
    fetchJournalEntries();
  }, [selectedDate, token]);

  // Debounce de la recherche dans le Header
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
      } catch (err) {
        console.error(err);
      } finally {
        setHeaderSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [headerSearchQuery, token]);

  // Gérer l'ajout rapide de favoris
  const handleToggleFavorite = async (e, food) => {
    e.stopPropagation();
    const isFav = favoriteIds.includes(food.food_id);

    try {
      if (isFav) {
        // Supprimer des favoris
        const favsRes = await fetch(`${API_URL}/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (favsRes.ok) {
          const favs = await favsRes.json();
          const match = favs.find(f => f.food_id === food.food_id);
          if (match) {
            const delRes = await fetch(`${API_URL}/favorites/${match.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (delRes.ok) {
              setFavoriteIds(favoriteIds.filter(id => id !== food.food_id));
            }
          }
        }
      } else {
        // Ajouter aux favoris
        const addRes = await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            food_id: food.food_id,
            food_name: food.food_name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            serving_description: food.serving
          })
        });
        if (addRes.ok) {
          setFavoriteIds([...favoriteIds, food.food_id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gérer l'ajout d'un aliment dans une liste personnalisée
  const handleAddToList = async (listId, food) => {
    try {
      const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          food_id: food.food_id,
          food_name: food.food_name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          serving_description: food.serving
        })
      });

      if (response.ok) {
        alert(`Aliment ajouté à la liste avec succès !`);
        fetchFavoritesAndLists(); // rafraîchir
        setShowListSelectorForFood(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ouvrir la popup d'ajout au journal
  const openPortionSelector = (food, mealType = 'breakfast') => {
    setSelectedFood(food);
    setServingAmount(100);
    setActiveMealType(mealType);
    setShowAddModal(true);
    setShowHeaderSearchDropdown(false);
    setHeaderSearchQuery('');
  };

  // Valider l'ajout d'un aliment au journal
  const addFoodToJournal = async () => {
    if (!selectedFood || !token) return;

    const ratio = servingAmount / 100;
    const computedCalories = Math.round(selectedFood.calories * ratio);
    const computedProtein = (selectedFood.protein * ratio).toFixed(1);
    const computedCarbs = (selectedFood.carbs * ratio).toFixed(1);
    const computedFat = (selectedFood.fat * ratio).toFixed(1);

    const payload = {
      food_id: selectedFood.food_id,
      food_name: selectedFood.food_name,
      calories: computedCalories,
      protein: computedProtein,
      carbs: computedCarbs,
      fat: computedFat,
      meal_type: activeMealType,
      serving_amount: servingAmount,
      serving_unit: 'g',
      entry_date: selectedDate
    };

    try {
      const response = await fetch(`${API_URL}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchJournalEntries();
        setShowAddModal(false);
        setSelectedFood(null);
      } else {
        const err = await response.json();
        alert(err.message || 'Erreur lors de l\'ajout.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Retirer du journal
  const deleteJournalEntry = async (id) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet aliment du journal ?')) return;

    try {
      const response = await fetch(`${API_URL}/journal/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Totaux journaliers
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const renderAvatar = (url, size = 'w-9 h-9 text-lg') => {
    if (url && url.startsWith('preset:')) {
      const [, emoji, bg] = url.split(':');
      return (
        <div className={`${size} rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center border border-white/10 shadow-sm`}>
          {emoji}
        </div>
      );
    } else if (url) {
      return (
        <img 
          src={url} 
          alt="Avatar" 
          className={`${size} rounded-xl object-cover border border-slate-800 shadow-sm`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150';
          }}
        />
      );
    }
    return (
      <div className={`${size} rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-sm`}>
        <User className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Header avec Barre de Recherche Globale Debouncée */}
      <header className="border-b border-slate-900 bg-slate-900/30 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & User info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Nutrilib
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                Hello, {profileData?.display_name || user?.username} 👋
              </p>
            </div>
          </div>

          {/* Barre de Recherche Universelle (Header) */}
          <div className="relative w-full md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-650" />
              <input
                type="text"
                placeholder="Recherche rapide d'aliments (Banane, Poulet...)"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-850 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
              />
              {headerSearchQuery && (
                <button 
                  onClick={() => { setHeaderSearchQuery(''); setShowHeaderSearchDropdown(false); }}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown de recherche flottant */}
            {showHeaderSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-slate-850 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto z-50 divide-y divide-slate-900/60 animate-in slide-in-from-top-2 duration-150 backdrop-blur-lg">
                {headerSearching && (
                  <div className="flex justify-center items-center py-6">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!headerSearching && headerSearchResults.length === 0 && (
                  <p className="text-xs text-center text-slate-500 py-6 italic">Aucun aliment trouvé pour "{headerSearchQuery}"</p>
                )}
                {!headerSearching && headerSearchResults.map((food) => {
                  const isFav = favoriteIds.includes(food.food_id);
                  return (
                    <div 
                      key={food.food_id}
                      onClick={() => openPortionSelector(food, 'breakfast')}
                      className="flex items-center justify-between p-3 hover:bg-slate-900/40 cursor-pointer transition-all"
                    >
                      <div>
                        <span className="font-semibold text-xs text-slate-200 block">{food.food_name}</span>
                        <span className="text-[10px] text-slate-500">
                          {food.brand_name} • {food.serving}
                        </span>
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-300 block">{food.calories} kcal</span>
                          <span className="text-[9px] text-slate-650">P:{food.protein} • G:{food.carbs} • L:{food.fat}</span>
                        </div>

                        {/* Coeur Favoris */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, food)}
                          className="p-1 rounded-md hover:bg-slate-900 transition-all cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
                        </button>

                        {/* Dossier Listes */}
                        <button
                          onClick={() => setShowListSelectorForFood(showListSelectorForFood === food.food_id ? null : food.food_id)}
                          className="p-1 rounded-md hover:bg-slate-900 transition-all cursor-pointer"
                          title="Ajouter à une liste"
                        >
                          <FolderOpen className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Sélecteur de liste personnalisé imbriqué */}
                      {showListSelectorForFood === food.food_id && (
                        <div className="absolute right-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-2xl z-50 space-y-2 text-xs w-44" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block border-b border-slate-900 pb-1">Ajouter à :</span>
                          {lists.length === 0 ? (
                            <p className="text-[9px] text-slate-600 italic">Aucune liste créée.</p>
                          ) : (
                            lists.map(l => (
                              <button
                                key={l.id}
                                onClick={() => handleAddToList(l.id, food)}
                                className="w-full text-left py-1 hover:text-emerald-400 block transition-all"
                              >
                                📁 {l.list_name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User profile details & Logout */}
          <div className="flex items-center justify-between md:justify-end gap-3.5 w-full md:w-auto">
            <div className="flex items-center gap-2">
              {renderAvatar(profileData?.avatar_url)}
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold block text-slate-200">{profileData?.display_name || user?.username}</span>
                <span className="text-[10px] text-slate-500">{profileData?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-250 hover:border-slate-700 transition-all duration-200 text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Quitter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Navbar Secondaire) */}
      <nav className="bg-slate-900/20 border-b border-slate-900/60 sticky top-[68px] z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between md:justify-start gap-1 sm:gap-4 overflow-x-auto text-xs font-bold uppercase tracking-wider text-slate-400">
          <button
            onClick={() => { setActiveTab('journal'); setShowHeaderSearchDropdown(false); }}
            className={`py-3.5 border-b-2 px-2.5 cursor-pointer transition-all ${
              activeTab === 'journal' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            📋 Journal
          </button>
          <button
            onClick={() => { setActiveTab('recipes'); setShowHeaderSearchDropdown(false); }}
            className={`py-3.5 border-b-2 px-2.5 cursor-pointer transition-all ${
              activeTab === 'recipes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            🍳 Recettes
          </button>
          <button
            onClick={() => { setActiveTab('weight'); setShowHeaderSearchDropdown(false); }}
            className={`py-3.5 border-b-2 px-2.5 cursor-pointer transition-all ${
              activeTab === 'weight' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            ⚖️ Poids
          </button>
          <button
            onClick={() => { setActiveTab('favorites'); setShowHeaderSearchDropdown(false); }}
            className={`py-3.5 border-b-2 px-2.5 cursor-pointer transition-all ${
              activeTab === 'favorites' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            💖 Favoris
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setShowHeaderSearchDropdown(false); }}
            className={`py-3.5 border-b-2 px-2.5 cursor-pointer transition-all ${
              activeTab === 'profile' ? 'border-emerald-500 text-emerald-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            👤 Profil
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        
        {/* TAB 1: JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-slate-900/40 p-3.5 rounded-2xl border border-slate-900">
              <button
                onClick={() => adjustDate(-1)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              
              <div className="flex items-center gap-2 text-slate-200 font-semibold capitalize text-xs sm:text-sm">
                <Calendar className="w-4.5 h-4.5 text-emerald-500" />
                <span>{formattedDisplayDate}</span>
              </div>

              <button
                onClick={() => adjustDate(1)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Objectifs & Macros */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-900 flex flex-col justify-between shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Calories consommées</h3>
                    <p className="text-3xl font-black text-white mt-1">
                      {totals.calories} <span className="text-sm font-normal text-slate-500">/ {calorieGoal} kcal</span>
                    </p>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {calPercent}%
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-900">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-inner" 
                      style={{ width: `${calPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase">
                    <span>Consommé : {totals.calories} kcal</span>
                    <span>Restant : {Math.max(calorieGoal - totals.calories, 0)} kcal</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-450 uppercase tracking-wider">Protéines</span>
                  <p className="text-2xl font-black mt-1 text-slate-100">{totals.protein.toFixed(1)}g</p>
                  <span className="text-[10px] text-slate-500 font-semibold">Objectif: {proteinGoal}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${proteinPercent}%` }}></div>
                  </div>
                  <span className="text-right block text-[10px] font-bold text-rose-400 mt-1">{proteinPercent}%</span>
                </div>
              </div>

              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-450 uppercase tracking-wider">Glucides</span>
                  <p className="text-2xl font-black mt-1 text-slate-100">{totals.carbs.toFixed(1)}g</p>
                  <span className="text-[10px] text-slate-500 font-semibold">Objectif: {carbGoal}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${carbsPercent}%` }}></div>
                  </div>
                  <span className="text-right block text-[10px] font-bold text-amber-400 mt-1">{carbsPercent}%</span>
                </div>
              </div>

              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-sky-450 uppercase tracking-wider">Lipides</span>
                  <p className="text-2xl font-black mt-1 text-slate-100">{totals.fat.toFixed(1)}g</p>
                  <span className="text-[10px] text-slate-500 font-semibold">Objectif: {fatGoal}g</span>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-sky-500 h-full" style={{ width: `${fatPercent}%` }}></div>
                  </div>
                  <span className="text-right block text-[10px] font-bold text-sky-400 mt-1">{fatPercent}%</span>
                </div>
              </div>
            </section>

            {/* Repas du journal */}
            <section className="space-y-4">
              {loadingEntries && (
                <div className="flex justify-center items-center py-6">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {!loadingEntries && MEALS.map((meal) => {
                const mealEntries = journalEntries.filter(entry => entry.meal_type === meal.id);
                const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

                return (
                  <div 
                    key={meal.id} 
                    className="bg-slate-900/30 rounded-2xl border border-slate-900/80 overflow-hidden shadow-lg"
                  >
                    {/* Header de repas */}
                    <div className="bg-slate-900/40 px-5 py-3.5 flex items-center justify-between border-b border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{meal.icon}</span>
                        <div>
                          <h3 className="font-bold text-slate-200 text-xs sm:text-sm">{meal.name}</h3>
                          <p className="text-[10px] text-slate-550">{mealEntries.length} aliment(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {mealCalories > 0 && (
                          <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/15">
                            {mealCalories} kcal
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActiveMealType(meal.id);
                            // Ouvrir une recherche factice de commodité ou orienter vers le header
                            alert('Utilisez la barre de recherche globale dans le header en haut de la page pour rechercher et ajouter un aliment !');
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 text-[10px] font-extrabold transition-all cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" /> Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Liste aliments */}
                    <div className="p-4">
                      {mealEntries.length === 0 ? (
                        <p className="text-xs text-slate-600 text-center py-4 italic">Aucun aliment enregistré pour ce repas.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {mealEntries.map((entry) => (
                            <div 
                              key={entry.id} 
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 hover:bg-slate-900/25 border border-slate-900/50 transition-all"
                            >
                              <div>
                                <h4 className="font-bold text-slate-250 text-xs">{entry.food_name}</h4>
                                <p className="text-[10px] text-slate-500">
                                  {entry.serving_amount} {entry.serving_unit} • 
                                  <span className="text-rose-450"> P: {entry.protein}g</span> • 
                                  <span className="text-amber-450"> G: {entry.carbs}g</span> • 
                                  <span className="text-sky-450"> L: {entry.fat}g</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-200 text-xs bg-slate-900 px-2 py-1 border border-slate-850 rounded-md">
                                  {entry.calories} kcal
                                </span>
                                <button
                                  onClick={() => deleteJournalEntry(entry.id)}
                                  className="p-1.5 rounded-lg text-slate-650 hover:text-rose-450 hover:bg-rose-500/10 transition-all cursor-pointer"
                                >
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

        {/* TAB 2: RECETTES */}
        {activeTab === 'recipes' && (
          <Recipes token={token} />
        )}

        {/* TAB 3: POIDS */}
        {activeTab === 'weight' && (
          <WeightTracker token={token} onWeightChange={fetchProfileData} />
        )}

        {/* TAB 4: FAVORIS */}
        {activeTab === 'favorites' && (
          <Favorites token={token} defaultDate={selectedDate} />
        )}

        {/* TAB 5: PROFIL */}
        {activeTab === 'profile' && (
          <Profile token={token} onProfileUpdate={fetchProfileData} />
        )}

      </main>

      {/* Modale d'Ajustement de portion (Ouverte depuis la recherche globale) */}
      {showAddModal && selectedFood && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-950 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-5 py-3.5 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Ajouter au journal</h3>
                <span className="text-[10px] text-slate-500 block">{selectedFood.food_name}</span>
              </div>
              <button 
                onClick={() => { setShowAddModal(false); setSelectedFood(null); }}
                className="text-xs text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                Annuler
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Repas ciblé */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold block">Choisir le repas</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((meal) => (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => setActiveMealType(meal.id)}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                        activeMealType === meal.id
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : 'bg-slate-900/40 border-slate-900/60 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {meal.icon} {meal.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion quantifiée */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold block">Quantité consommée (g)</label>
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={servingAmount}
                  onChange={(e) => setServingAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Valeurs nutritionnelles calculées */}
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Calories estimées</span>
                  <span className="font-extrabold text-slate-200">
                    {Math.round(selectedFood.calories * (servingAmount / 100))} kcal
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Protéines</span>
                  <span className="font-semibold text-rose-400">
                    {(selectedFood.protein * (servingAmount / 100)).toFixed(1)}g
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Glucides</span>
                  <span className="font-semibold text-amber-400">
                    {(selectedFood.carbs * (servingAmount / 100)).toFixed(1)}g
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Lipides</span>
                  <span className="font-semibold text-sky-400">
                    {(selectedFood.fat * (servingAmount / 100)).toFixed(1)}g
                  </span>
                </div>
              </div>

              <button
                onClick={addFoodToJournal}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer shadow-sm"
              >
                Ajouter au repas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
