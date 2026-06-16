import React, { useState, useEffect } from 'react';
import { Heart, FolderPlus, Trash2, Plus, Calendar, PlusCircle, ShoppingBag, Utensils } from 'lucide-react';

const MEALS = [
  { id: 'breakfast', name: 'Petit-déjeuner', icon: '🥐' },
  { id: 'lunch', name: 'Déjeuner', icon: '🍽️' },
  { id: 'dinner', name: 'Dîner', icon: '🍲' },
  { id: 'snack', name: 'En-cas / Collation', icon: '🍎' }
];

export default function Favorites({ token, defaultDate }) {
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire nouvelle liste
  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  // Pop-up d'ajout rapide au journal
  const [quickAddFood, setQuickAddFood] = useState(null);
  const [quickAddAmount, setQuickAddAmount] = useState(100);
  const [quickAddMeal, setQuickAddMeal] = useState('breakfast');
  const [quickAddDate, setQuickAddDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [addingToJournal, setAddingToJournal] = useState(false);

  const fetchData = async () => {
    try {
      const favResponse = await fetch('http://localhost:5000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listsResponse = await fetch('http://localhost:5000/api/lists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (favResponse.ok) setFavorites(await favResponse.json());
      if (listsResponse.ok) setLists(await listsResponse.json());
    } catch (err) {
      console.error('Erreur chargement favoris/listes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Retirer des favoris
  const handleRemoveFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Créer une nouvelle liste
  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingList(true);

    try {
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ list_name: newListName })
      });

      if (response.ok) {
        const newList = await response.json();
        setLists([newList, ...lists]);
        setNewListName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingList(false);
    }
  };

  // Supprimer une liste
  const handleDeleteList = async (listId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette liste ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setLists(lists.filter(l => l.id !== listId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Retirer un aliment d'une liste
  const handleRemoveItemFromList = async (itemId, listId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setLists(lists.map(l => {
          if (l.id === listId) {
            return { ...l, items: l.items.filter(i => i.id !== itemId) };
          }
          return l;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ouvrir la modale d'ajout rapide au journal
  const openQuickAdd = (food) => {
    setQuickAddFood(food);
    setQuickAddAmount(100);
    setQuickAddMeal('breakfast');
    setQuickAddDate(defaultDate || new Date().toISOString().split('T')[0]);
  };

  // Soumettre l'ajout rapide au journal
  const handleQuickAddSubmit = async () => {
    if (!quickAddFood) return;
    setAddingToJournal(true);

    const ratio = quickAddAmount / 100;
    const computedCalories = Math.round(quickAddFood.calories * ratio);
    const computedProtein = (quickAddFood.protein * ratio).toFixed(1);
    const computedCarbs = (quickAddFood.carbs * ratio).toFixed(1);
    const computedFat = (quickAddFood.fat * ratio).toFixed(1);

    const payload = {
      food_id: quickAddFood.food_id,
      food_name: quickAddFood.food_name,
      calories: computedCalories,
      protein: computedProtein,
      carbs: computedCarbs,
      fat: computedFat,
      meal_type: quickAddMeal,
      serving_amount: quickAddAmount,
      serving_unit: 'g',
      entry_date: quickAddDate
    };

    try {
      const response = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(`${quickAddFood.food_name} a été ajouté au journal !`);
        setQuickAddFood(null);
      } else {
        const err = await response.json();
        alert(err.message || 'Erreur lors de l\'ajout.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setAddingToJournal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
      
      {/* Colonne Favoris */}
      <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col min-h-[500px]">
        <h2 className="text-base font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Mes Aliments Favoris
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1 max-h-[600px]">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-slate-600 flex flex-col items-center justify-center gap-3">
              <Heart className="w-12 h-12 text-slate-800" />
              <p className="text-sm italic">Vous n'avez pas encore d'aliments favoris.</p>
              <p className="text-xs max-w-xs">Cliquez sur l'icône cœur lors de vos recherches d'aliments pour les retrouver ici instantanément.</p>
            </div>
          ) : (
            favorites.map((fav) => (
              <div 
                key={fav.id} 
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 hover:bg-slate-900/25 border border-slate-900/50 transition-all"
              >
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">{fav.food_name}</h4>
                  <p className="text-xs text-slate-500">
                    Base: {fav.serving_description} • 
                    <span className="text-rose-450"> P: {fav.protein}g</span> • 
                    <span className="text-amber-450"> G: {fav.carbs}g</span> • 
                    <span className="text-sky-450"> L: {fav.fat}g</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-200 text-xs bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
                    {fav.calories} kcal
                  </span>
                  
                  <button
                    onClick={() => openQuickAdd(fav)}
                    className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-450 hover:scale-105 transition-all text-[11px] font-bold cursor-pointer"
                    title="Ajouter au journal"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemoveFavorite(fav.id)}
                    className="p-1.5 rounded-lg text-slate-650 hover:text-rose-450 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Colonne Listes Personnalisées */}
      <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col min-h-[500px]">
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> Mes Listes Personnalisées
          </h2>
          
          <form onSubmit={handleCreateList} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Nom de la liste..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-700 text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-36"
            />
            <button
              type="submit"
              disabled={creatingList}
              className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 cursor-pointer disabled:opacity-50"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 mt-4 pr-1 max-h-[600px]">
          {lists.length === 0 ? (
            <div className="text-center py-16 text-slate-600 flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-12 h-12 text-slate-800" />
              <p className="text-sm italic">Vous n'avez aucune liste d'aliments.</p>
              <p className="text-xs max-w-xs">Créez une liste ci-dessus, puis ajoutez-y des aliments lors de vos recherches pour assembler rapidement vos repas.</p>
            </div>
          ) : (
            lists.map((list) => (
              <div 
                key={list.id} 
                className="bg-slate-950/40 rounded-xl border border-slate-900/80 p-4 space-y-3"
              >
                {/* Entête de liste */}
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-250 text-sm">{list.list_name}</h3>
                    <span className="text-[10px] text-slate-500">{list.items.length} aliment(s) dans la liste</span>
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="p-1 rounded-lg text-slate-650 hover:text-rose-450 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Supprimer la liste"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items de la liste */}
                <div className="space-y-2">
                  {list.items.length === 0 ? (
                    <p className="text-[11px] text-slate-650 italic py-2 text-center">Aucun aliment dans cette liste.</p>
                  ) : (
                    list.items.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-900/50"
                      >
                        <div>
                          <span className="font-semibold text-xs text-slate-350">{item.food_name}</span>
                          <span className="text-[10px] text-slate-550 block">
                            {item.serving_description} • {item.calories} kcal (P: {item.protein}g, G: {item.carbs}g, L: {item.fat}g)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openQuickAdd(item)}
                            className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                            title="Ajouter au journal"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveItemFromList(item.id, list.id)}
                            className="p-1 rounded-md text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Retirer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale d'ajout rapide au journal */}
      {quickAddFood && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-950 w-full max-w-sm rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-900 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Ajout rapide au journal</h4>
                <span className="text-[10px] text-slate-550 block">Aliment : {quickAddFood.food_name}</span>
              </div>
              <button 
                onClick={() => setQuickAddFood(null)}
                className="text-xs text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Repas */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold block">Sélectionnez le repas</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((meal) => (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => setQuickAddMeal(meal.id)}
                      className={`py-1.5 px-3 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                        quickAddMeal === meal.id
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                          : 'bg-slate-900/40 border-slate-900/60 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {meal.icon} {meal.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantité & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold block">Quantité (g)</label>
                  <input
                    type="number"
                    min="1"
                    value={quickAddAmount}
                    onChange={(e) => setQuickAddAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold block">Date d'ajout</label>
                  <input
                    type="date"
                    value={quickAddDate}
                    onChange={(e) => setQuickAddDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Résumé des valeurs calculées */}
              <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Calories calculées</span>
                  <span className="font-bold text-slate-200">
                    {Math.round(quickAddFood.calories * (quickAddAmount / 100))} kcal
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Macros</span>
                  <span>
                    P: {(quickAddFood.protein * (quickAddAmount / 100)).toFixed(1)}g • 
                    G: {(quickAddFood.carbs * (quickAddAmount / 100)).toFixed(1)}g • 
                    L: {(quickAddFood.fat * (quickAddAmount / 100)).toFixed(1)}g
                  </span>
                </div>
              </div>

              <button
                onClick={handleQuickAddSubmit}
                disabled={addingToJournal}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {addingToJournal ? 'Ajout...' : 'Ajouter au journal alimentaire'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
