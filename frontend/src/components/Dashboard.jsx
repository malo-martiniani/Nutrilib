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
  Award
} from 'lucide-react';

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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');
  
  // États de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  // État de l'aliment à ajouter
  const [selectedFood, setSelectedFood] = useState(null);
  const [servingAmount, setServingAmount] = useState(100);

  // Objectifs nutritionnels par défaut
  const calorieGoal = 2000;
  const proteinGoal = 130; // g
  const carbGoal = 220; // g
  const fatGoal = 65; // g

  // Charger les entrées de journal pour la date sélectionnée
  const fetchJournalEntries = async () => {
    if (!token) return;
    setLoadingEntries(true);
    try {
      const response = await fetch(`${API_URL}/journal?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    fetchJournalEntries();
  }, [selectedDate, token]);

  // Changer de date
  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Lancer la recherche d'aliments
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');
    setSelectedFood(null);

    try {
      const response = await fetch(`${API_URL}/foods/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche.');
      }

      const data = await response.json();
      setSearchResults(data.foods || []);
      setIsMockData(data.isMock || false);
      if (data.foods && data.foods.length === 0) {
        setSearchError('Aucun aliment trouvé.');
      }
    } catch (err) {
      setSearchError(err.message || 'Une erreur est survenue.');
    } finally {
      setSearching(false);
    }
  };

  // Sélectionner un aliment dans les résultats
  const selectFoodItem = (food) => {
    setSelectedFood(food);
    setServingAmount(100); // Réinitialiser à 100g par défaut
  };

  // Ajouter l'aliment au journal
  const addFoodToJournal = async () => {
    if (!selectedFood || !token) return;

    // Calculer les macros au prorata de la quantité saisie (base 100g)
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
        // Rafraîchir les entrées
        fetchJournalEntries();
        // Fermer le modal
        closeSearch();
      } else {
        const errData = await response.json();
        alert(errData.message || 'Erreur lors de l\'ajout.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    }
  };

  // Supprimer une entrée du journal
  const deleteEntry = async (id) => {
    if (!window.confirm('Voulez-vous vraiment retirer cet aliment du journal ?')) return;

    try {
      const response = await fetch(`${API_URL}/journal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJournalEntries(journalEntries.filter(entry => entry.id !== id));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const openSearch = (mealType) => {
    setActiveMealType(mealType);
    setShowSearchModal(true);
  };

  const closeSearch = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setSearchError('');
  };

  // Calculs totaux
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

  // Pourcentages des objectifs
  const calPercent = Math.min(Math.round((totals.calories / calorieGoal) * 100), 100);
  const proteinPercent = Math.min(Math.round((totals.protein / proteinGoal) * 100), 100);
  const carbsPercent = Math.min(Math.round((totals.carbs / carbGoal) * 100), 100);
  const fatPercent = Math.min(Math.round((totals.fat / fatGoal) * 100), 100);

  // Formater la date en français pour l'affichage
  const formattedDisplayDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/30 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Nutrilib
              </h1>
              <p className="text-xs text-slate-500">Tableau de bord de {user?.username}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all duration-200 text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation de Date */}
        <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
          <button
            onClick={() => adjustDate(-1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-slate-200 font-semibold capitalize text-center">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>{formattedDisplayDate}</span>
          </div>

          <button
            onClick={() => adjustDate(1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Section Objectifs & Widgets Nutrition */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Jauge des Calories */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Calories</h3>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {totals.calories} <span className="text-lg font-normal text-slate-500">/ {calorieGoal} kcal</span>
                </p>
              </div>
              <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {calPercent}%
              </div>
            </div>
            
            {/* Barre de Progression */}
            <div className="mt-6">
              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${calPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Consommé : {totals.calories} kcal</span>
                <span>Restant : {Math.max(calorieGoal - totals.calories, 0)} kcal</span>
              </div>
            </div>
          </div>

          {/* Macros Breakdowns (Protéines, Glucides, Lipides) */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Protéines</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">{totals.protein.toFixed(1)}g</p>
              <span className="text-xs text-slate-500">Objectif: {proteinGoal}g</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${proteinPercent}%` }}></div>
              </div>
              <span className="text-right block text-xs text-rose-400 mt-1">{proteinPercent}%</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Glucides</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">{totals.carbs.toFixed(1)}g</p>
              <span className="text-xs text-slate-500">Objectif: {carbGoal}g</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${carbsPercent}%` }}></div>
              </div>
              <span className="text-right block text-xs text-amber-400 mt-1">{carbsPercent}%</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Lipides</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">{totals.fat.toFixed(1)}g</p>
              <span className="text-xs text-slate-500">Objectif: {fatGoal}g</span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-full" style={{ width: `${fatPercent}%` }}></div>
              </div>
              <span className="text-right block text-xs text-sky-400 mt-1">{fatPercent}%</span>
            </div>
          </div>
        </section>

        {/* Section Repas du Journal */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-wide text-slate-300">Mon Journal Alimentaire</h2>
            {loadingEntries && (
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {MEALS.map((meal) => {
              // Filtrer les entrées pour ce repas
              const mealEntries = journalEntries.filter(entry => entry.meal_type === meal.id);
              // Somme des calories du repas
              const mealCalories = mealEntries.reduce((sum, entry) => sum + entry.calories, 0);

              return (
                <div 
                  key={meal.id} 
                  className="bg-slate-900/30 rounded-2xl border border-slate-900 overflow-hidden shadow-lg transition-all hover:border-slate-800"
                >
                  {/* Entête du Repas */}
                  <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meal.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-200">{meal.name}</h3>
                        <p className="text-xs text-slate-500">{mealEntries.length} aliment(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {mealCalories > 0 && (
                        <span className="text-sm font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/15">
                          {mealCalories} kcal
                        </span>
                      )}
                      <button
                        onClick={() => openSearch(meal.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Liste des aliments du Repas */}
                  <div className="p-4 division-y divide-slate-900">
                    {mealEntries.length === 0 ? (
                      <p className="text-sm text-slate-600 text-center py-4 italic">Aucun aliment enregistré pour ce repas.</p>
                    ) : (
                      <div className="space-y-3">
                        {mealEntries.map((entry) => (
                          <div 
                            key={entry.id} 
                            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/40 border border-slate-900/50 transition-all"
                          >
                            <div className="space-y-1">
                              <h4 className="font-semibold text-slate-300 text-sm">{entry.food_name}</h4>
                              <p className="text-xs text-slate-500">
                                {entry.serving_amount} {entry.serving_unit} • 
                                <span className="text-rose-400"> P: {entry.protein}g</span> • 
                                <span className="text-amber-400"> G: {entry.carbs}g</span> • 
                                <span className="text-sky-400"> L: {entry.fat}g</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-slate-200 text-sm">{entry.calories} kcal</span>
                              <button
                                onClick={() => deleteEntry(entry.id)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
        </section>
      </main>

      {/* Modal de Recherche d'Aliments FatSecret */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-950 w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">
                  Ajouter au {MEALS.find(m => m.id === activeMealType)?.name}
                </h3>
                <p className="text-xs text-slate-500">Recherche d'aliments via FatSecret</p>
              </div>
              <button 
                onClick={closeSearch}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-400 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire de Recherche */}
            <div className="p-6 border-b border-slate-900">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Ex: Banane, poulet, yaourt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {searching ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : 'Rechercher'}
                </button>
              </form>
              {isMockData && searchResults.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Mode Démo : Clés FatSecret non configurées. Aliments simulés affichés.</span>
                </div>
              )}
            </div>

            {/* Corps Modal */}
            <div className="flex-1 overflow-y-auto p-6 flex gap-6">
              
              {/* Résultats de Recherche */}
              <div className="flex-1 space-y-3">
                {searchError && (
                  <p className="text-sm text-center text-rose-400 py-6">{searchError}</p>
                )}
                {!searchError && searchResults.length === 0 && !searching && (
                  <div className="text-center py-12 text-slate-600 flex flex-col items-center justify-center gap-3">
                    <Utensils className="w-12 h-12 text-slate-700" />
                    <p className="text-sm">Recherchez un aliment pour voir ses valeurs nutritionnelles.</p>
                  </div>
                )}

                {searchResults.map((item) => (
                  <button
                    key={item.food_id}
                    onClick={() => selectFoodItem(item)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      selectedFood?.food_id === item.food_id
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-inner'
                        : 'bg-slate-900/40 border-slate-900/50 hover:bg-slate-900/70 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-slate-300 text-sm">{item.food_name}</h4>
                      <p className="text-xs text-slate-500">
                        Marque: {item.brand_name} • Base: {item.serving}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-200 block text-sm">{item.calories} kcal</span>
                      <span className="text-slate-500">
                        P: {item.protein}g • G: {item.carbs}g • L: {item.fat}g
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Panneau latéral d'ajustement de portion */}
              {selectedFood && (
                <div className="w-64 bg-slate-900/50 border border-slate-900 rounded-xl p-4 flex flex-col justify-between sticky top-0 animate-in slide-in-from-right duration-200">
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2"> Portion consommée</h4>
                    <div>
                      <label className="text-xs text-slate-400 font-semibold block mb-1">Quantité (g)</label>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={servingAmount}
                        onChange={(e) => setServingAmount(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>

                    <div className="space-y-2 border-t border-slate-800/60 pt-3 text-xs">
                      <span className="text-slate-400 font-semibold block uppercase">Valeurs calculées</span>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Calories</span>
                        <span className="font-bold text-slate-200">{Math.round(selectedFood.calories * (servingAmount / 100))} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Protéines</span>
                        <span className="font-semibold text-rose-400">{(selectedFood.protein * (servingAmount / 100)).toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Glucides</span>
                        <span className="font-semibold text-amber-400">{(selectedFood.carbs * (servingAmount / 100)).toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lipides</span>
                        <span className="font-semibold text-sky-400">{(selectedFood.fat * (servingAmount / 100)).toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={addFoodToJournal}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all text-xs cursor-pointer mt-4"
                  >
                    Ajouter au repas
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
