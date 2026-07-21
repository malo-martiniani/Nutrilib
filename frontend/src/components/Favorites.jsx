import React, { useState, useEffect } from 'react';
import { Heart, FolderPlus, Trash2, Plus, Calendar, ShoppingBag, Search, Folder, X, Clock, Star, ListTodo, Flame, CheckCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const MEALS = [
  { id: 'breakfast', name: 'Petit-déjeuner', label: 'MATIN' },
  { id: 'lunch', name: 'Déjeuner', label: 'MIDI' },
  { id: 'dinner', name: 'Dîner', label: 'SOIR' },
  { id: 'snack', name: 'Collation', label: 'SNACK' }
];

export default function Favorites({ token, defaultDate }) {
  const { showToast, askConfirmation } = useNotification();
  const { language, t } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const [quickAddFood, setQuickAddFood] = useState(null);
  const [quickAddAmount, setQuickAddAmount] = useState(100);
  const [quickAddUnit, setQuickAddUnit] = useState('g');
  const [quickAddMeal, setQuickAddMeal] = useState('breakfast');
  const [quickAddDate, setQuickAddDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [addingToJournal, setAddingToJournal] = useState(false);

  // Inline Search inside List card state
  const [activeListSearchId, setActiveListSearchId] = useState(null);
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [listSearchResults, setListSearchResults] = useState([]);
  const [listSearching, setListSearching] = useState(false);

  // Recipe Detail Modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const fetchData = async () => {
    try {
      const favResponse = await fetch('http://localhost:5000/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
      const listsResponse = await fetch('http://localhost:5000/api/lists', { headers: { 'Authorization': `Bearer ${token}` } });
      if (favResponse.ok) setFavorites(await favResponse.json());
      if (listsResponse.ok) setLists(await listsResponse.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  // Debounced search for list items
  useEffect(() => {
    if (!listSearchQuery.trim()) {
      setListSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setListSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/foods/search?query=${encodeURIComponent(listSearchQuery)}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language }
        });
        if (response.ok) {
          const data = await response.json();
          setListSearchResults(data.foods || []);
        }
      } catch (err) { console.error(err); }
      finally { setListSearching(false); }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [listSearchQuery, token]);

  const handleRemoveFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setFavorites(favorites.filter(f => f.id !== id)); }
    } catch (err) { console.error(err); }
  };

  const handleToggleRecipeFavorite = async (recipe) => {
    const recipeFoodId = `recipe_${recipe.recipe_id}`;
    const match = favorites.find(f => f.food_id === recipeFoodId);
    try {
      if (match) {
        const delRes = await fetch(`http://localhost:5000/api/favorites/${match.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (delRes.ok) { setFavorites(favorites.filter(f => f.id !== match.id)); }
      } else {
        const addRes = await fetch(`http://localhost:5000/api/favorites`, {
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
        if (addRes.ok) { setFavorites([...favorites, await addRes.json()]); }
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ list_name: newListName })
      });
      if (response.ok) { setLists([await response.json(), ...lists]); setNewListName(''); }
    } catch (err) { console.error(err); }
    finally { setCreatingList(false); }
  };

  const handleDeleteList = async (listId) => {
    const confirmed = await askConfirmation(t('confirm_delete_list') || 'Supprimer cette liste ?');
    if (!confirmed) return;
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { 
        setLists(lists.filter(l => l.id !== listId)); 
        showToast(t('list_deleted') || 'Liste supprimée.');
      }
    } catch (err) { 
      console.error(err); 
      showToast(t('errorServer'), 'error');
    }
  };

  const handleRemoveItemFromList = async (itemId, listId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/items/${itemId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setLists(lists.map(l => l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l)); }
    } catch (err) { console.error(err); }
  };

  const openQuickAdd = (food) => {
    setQuickAddFood(food);
    setQuickAddAmount(100);
    setQuickAddUnit('g');
    setQuickAddMeal('breakfast');
    setQuickAddDate(defaultDate || new Date().toISOString().split('T')[0]);
  };

  const handleQuickAddSubmit = async () => {
    if (!quickAddFood) return;
    setAddingToJournal(true);
    const unitMultiplier = quickAddUnit === 'cl' ? 10 : 1;
    const finalAmount = quickAddAmount * unitMultiplier;
    const ratio = finalAmount / 100;
    const payload = {
      food_id: quickAddFood.food_id,
      food_name: quickAddFood.food_name,
      calories: Math.round(quickAddFood.calories * ratio),
      protein: (quickAddFood.protein * ratio).toFixed(1),
      carbs: (quickAddFood.carbs * ratio).toFixed(1),
      fat: (quickAddFood.fat * ratio).toFixed(1),
      meal_type: quickAddMeal,
      serving_amount: quickAddAmount,
      serving_unit: quickAddUnit,
      entry_date: quickAddDate
    };
    try {
      const response = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) { 
        showToast(`${quickAddFood.food_name} ajouté au journal !`); 
        setQuickAddFood(null); 
      }
      else { 
        const err = await response.json(); 
        showToast(err.message || 'Erreur.', 'error'); 
      }
    } catch (err) { 
      showToast('Erreur réseau.', 'error'); 
    }
    finally { setAddingToJournal(false); }
  };

  const handleAddSearchItemToList = async (listId, food) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        showToast(`${food.food_name} ajouté à la liste !`);
        fetchData();
        setListSearchQuery('');
        setListSearchResults([]);
        setActiveListSearchId(null);
      }
    } catch (err) { 
      console.error(err); 
      showToast('Erreur réseau.', 'error');
    }
  };

  const handleFetchRecipeDetails = async (id) => {
    setLoadingRecipe(true);
    setCheckedIngredients({});
    try {
      const response = await fetch(`http://localhost:5000/api/foods/recipes/${id}`, { headers: { 'Authorization': `Bearer ${token}`, 'x-app-lang': language } });
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

  const unitMultiplier = quickAddUnit === 'cl' ? 10 : 1;
  const computedGrams = quickAddAmount * unitMultiplier;

  return (
    <div className="space-y-6">

      {/* FAVORITES */}
      <div className="brutal-card space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider border-b border-[var(--border-muted)] pb-3 flex items-center gap-2 text-[var(--text)]">
          <Heart className="w-5 h-5 text-[var(--accent-magenta)] fill-[var(--accent-magenta)]/10" /> {t('favorites_title')}
        </h2>

        {favorites.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-dim)]">
            <Heart className="w-10 h-10 mx-auto mb-3 text-[var(--border-muted)] opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">{t('no_favorites')}</p>
            <p className="text-[10px] mt-1">{t('click_heart_to_favorite')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => {
              const isRecipe = fav.food_id && fav.food_id.startsWith('recipe_');
              return (
                <div key={fav.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-muted)] transition-colors duration-200">
                  <div className="flex-1 mr-3">
                    {isRecipe ? (
                      <button 
                        onClick={() => handleFetchRecipeDetails(fav.food_id.replace('recipe_', ''))}
                        className="font-bold text-sm text-[var(--accent-powder)] hover:underline text-left cursor-pointer"
                      >
                        {fav.food_name} ({t('tab_recipes')})
                      </button>
                    ) : (
                      <h4 className="font-bold text-sm text-[var(--text)]">{fav.food_name}</h4>
                    )}
                    <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                      {formatServing(fav.serving_description)} ·{' '}
                      <span className="text-[var(--accent-powder)]">P:{fav.protein}g</span> ·{' '}
                      <span className="text-[var(--accent-powder)]">G:{fav.carbs}g</span> ·{' '}
                      <span className="text-[var(--accent-sand)]">L:{fav.fat}g</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="brutal-tag border-[var(--border-muted)] text-[var(--text-muted)] text-[10px]">{fav.calories} kcal</span>
                    <button 
                      onClick={() => openQuickAdd(fav)} 
                      className="brutal-btn-accent py-1.5 px-2.5 text-[10px] cursor-pointer" 
                      style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}
                      aria-label={`${t('add_to_journal')} ${fav.food_name}`}
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button 
                      onClick={() => handleRemoveFavorite(fav.id)} 
                      className="brutal-btn-danger"
                      aria-label={`${t('delete')} ${fav.food_name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOM LISTS */}
      <div className="brutal-card space-y-4">
        <div className="border-b border-[var(--border-muted)] pb-3 space-y-3">
          <h2 className="text-base font-extrabold uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
            <ShoppingBag className="w-5 h-5 text-[var(--accent-powder)]" /> {t('my_lists')}
          </h2>
          <form onSubmit={handleCreateList} className="flex gap-2">
            <label htmlFor="lst-new-name" className="sr-only">{t('list_name_placeholder') || "Nom de la liste"}</label>
            <input 
              id="lst-new-name"
              type="text" 
              required 
              placeholder={t('list_name_placeholder') || "Nom de la liste..."}
              value={newListName} 
              onChange={(e) => setNewListName(e.target.value)}
              className="brutal-input flex-1 py-2 text-xs" 
            />
            <button 
              type="submit" 
              disabled={creatingList} 
              className="brutal-btn-accent py-2 px-3 text-[10px] cursor-pointer" 
              style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)', boxShadow: 'none' }}
              aria-label={t('create_list') || 'Créer une liste'}
            >
              <FolderPlus className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-dim)]">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[var(--border-muted)] opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">{t('no_lists')}</p>
            <p className="text-[10px] mt-1">{t('create_list_above')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => (
              <div key={list.id} className="border border-[var(--border)] bg-[var(--surface-inset)] p-4 space-y-3 rounded-2xl shadow-[var(--shadow-subtle)]">
                <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)]">{list.list_name}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">{list.items.length} {t('items_count')}</span>
                  </div>
                  <button onClick={() => handleDeleteList(list.id)} className="brutal-btn-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {list.items.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-dim)] py-2 text-center font-medium">{t('empty_list_text') || 'Liste vide.'}</p>
                ) : (
                  <div className="space-y-2">
                    {list.items.map((item) => {
                      const isRecipe = item.food_id && item.food_id.startsWith('recipe_');
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-dim)]">
                          <div className="flex-1 mr-2">
                            {isRecipe ? (
                              <button 
                                onClick={() => handleFetchRecipeDetails(item.food_id.replace('recipe_', ''))}
                                className="font-bold text-xs text-[var(--accent-powder)] hover:underline text-left cursor-pointer"
                              >
                                {item.food_name} ({t('tab_recipes')})
                              </button>
                            ) : (
                              <span className="font-bold text-xs text-[var(--text)] block">{item.food_name}</span>
                            )}
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                              {formatServing(item.serving_description)} · {item.calories} kcal
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => openQuickAdd(item)} className="brutal-btn-accent py-1 px-1.5 text-[9px] cursor-pointer" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleRemoveItemFromList(item.id, list.id)} className="brutal-btn-danger">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Inline search box to add items directly to list */}
                <div className="mt-2 pt-2 border-t border-[var(--border-muted)]">
                  {activeListSearchId === list.id ? (
                    <div className="space-y-2">
                      <div className="relative flex gap-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
                        <input 
                          type="text" 
                          placeholder={t('search_food_or_recipe') || "Rechercher aliment/recette..."}
                          value={listSearchQuery}
                          onChange={(e) => setListSearchQuery(e.target.value)}
                          className="brutal-input flex-1 py-1 text-xs"
                          style={{ paddingLeft: '2.25rem' }}
                        />
                        <button 
                          onClick={() => { setActiveListSearchId(null); setListSearchQuery(''); setListSearchResults([]); }}
                          className="brutal-btn-ghost p-1 py-1 text-[10px]"
                        >
                          {t('cancel')}
                        </button>
                      </div>

                      {/* Search Results in small dropdown list */}
                      {listSearchQuery && (
                        <div className="bg-[var(--surface-raised)] border border-[var(--border)] max-h-40 overflow-y-auto rounded-xl shadow-md p-1 space-y-1">
                          {listSearching && <p className="text-[10px] text-center py-2 text-[var(--text-dim)]">{t('loading')}...</p>}
                          {!listSearching && listSearchResults.length === 0 && <p className="text-[10px] text-center py-2 text-[var(--text-dim)]">{t('no_food_found')}...</p>}
                          {!listSearching && listSearchResults.map((food) => (
                            <div 
                              key={food.food_id}
                              onClick={() => handleAddSearchItemToList(list.id, food)}
                              className="flex justify-between items-center p-2 rounded hover:bg-[var(--surface)] cursor-pointer text-[10px]"
                            >
                              <div className="flex-1 mr-2">
                                <span className="font-bold block text-[var(--text)] line-clamp-1">{food.food_name}</span>
                                <span className="text-[8px] text-[var(--text-dim)]">{formatServing(food.serving)}</span>
                              </div>
                              <span className="font-bold text-[var(--accent-pistachio)]">{food.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveListSearchId(list.id)}
                      className="w-full text-center py-1.5 text-[10px] font-bold text-[var(--accent-pistachio)] border border-dashed border-[var(--border)] rounded-xl hover:bg-[var(--surface-raised)] transition-all cursor-pointer"
                    >
                      + {t('add_food_to_list') || 'Ajouter directement un aliment / recette'}
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ADD MODAL */}
      {quickAddFood && (
        <div className="brutal-overlay" onClick={() => setQuickAddFood(null)}>
          <div className="brutal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-[var(--text)]">{t('add_food') || 'Ajout rapide'}</h4>
                <span className="text-[10px] text-[var(--text-dim)]">{quickAddFood.food_name}</span>
              </div>
              <button onClick={() => setQuickAddFood(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer font-bold uppercase transition-colors duration-150">
                {t('close')}
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="brutal-label">{t('choose_meal') || 'Repas'}</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((meal) => (
                    <button key={meal.id} type="button" onClick={() => setQuickAddMeal(meal.id)}
                      className={`py-2.5 px-4 border text-xs font-bold uppercase text-center rounded-xl transition-all duration-200 cursor-pointer ${
                        quickAddMeal === meal.id
                          ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)] bg-[var(--surface-raised)]'
                          : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {t(meal.id)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="brutal-label">{t('amount') || 'Quantité'} ({quickAddUnit})</label>
                  <div className="flex gap-2">
                    <input type="number" min="1" value={quickAddAmount}
                      onChange={(e) => setQuickAddAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="brutal-input" />
                    <select 
                      value={quickAddUnit} 
                      onChange={(e) => setQuickAddUnit(e.target.value)}
                      className="brutal-input w-20 text-center py-2 px-1 cursor-pointer bg-[var(--surface-inset)]"
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="cl">cl</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="brutal-label">{t('date')}</label>
                  <input type="date" value={quickAddDate} onChange={(e) => setQuickAddDate(e.target.value)} className="brutal-input" />
                </div>
              </div>
              <div className="border border-[var(--border)] p-4 space-y-2 bg-[var(--surface-inset)] rounded-2xl">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-semibold">Calories</span>
                  <span className="font-bold text-[var(--accent-pistachio)]">{Math.round(quickAddFood.calories * (computedGrams / 100))} kcal</span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium pt-1 border-t border-[var(--border-muted)]">
                  <span>Macros ({computedGrams}g)</span>
                  <span>
                    P:{(quickAddFood.protein * (computedGrams / 100)).toFixed(1)}g ·
                    G:{(quickAddFood.carbs * (computedGrams / 100)).toFixed(1)}g ·
                    L:{(quickAddFood.fat * (computedGrams / 100)).toFixed(1)}g
                  </span>
                </div>
              </div>
              <button onClick={handleQuickAddSubmit} disabled={addingToJournal} className="brutal-btn-accent w-full" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
                {addingToJournal ? `${t('loading')}...` : t('add_to_journal')}
              </button>
            </div>
          </div>
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
                  onClick={() => handleToggleRecipeFavorite(selectedRecipe)} 
                  className="brutal-btn-danger p-2 cursor-pointer"
                  title="Ajouter aux favoris"
                >
                  <Heart className={`w-5 h-5 ${favorites.some(f => f.food_id === `recipe_${selectedRecipe.recipe_id}`) ? 'text-[var(--accent-magenta)] fill-[var(--accent-magenta)]' : ''}`} />
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
                        <span className="brutal-label mb-0">{t('prep_time')}</span>
                        <span className="text-xs font-bold block text-[var(--text)]">
                          {selectedRecipe.preparation_time_min > 0 ? `${selectedRecipe.preparation_time_min} min` : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 border border-[var(--border)] rounded-2xl flex items-center gap-3 bg-[var(--surface-raised)]">
                      <Clock className="w-5 h-5 text-[var(--accent-sand)]" />
                      <div>
                        <span className="brutal-label mb-0">{t('cook_time')}</span>
                        <span className="text-xs font-bold block text-[var(--text)]">
                          {selectedRecipe.cooking_time_min > 0 ? `${selectedRecipe.cooking_time_min} min` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="border border-[var(--border)] p-4 space-y-3 rounded-2xl bg-[var(--surface-inset)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                      <span className="brutal-label mb-0">{t('nutrition')}</span>
                      <span className="text-xs font-extrabold text-[var(--accent-pistachio)]">
                        {selectedRecipe.calories} {t('kcal_per_serving') || 'kcal/portion'}
                        {selectedRecipe.number_of_servings ? ` (${t('servings')}: ${selectedRecipe.number_of_servings})` : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">{t('protein')}</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.protein}g</span>
                      </div>
                      <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">{t('carbs')}</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.carbs}g</span>
                      </div>
                      <div className="p-2 border border-[var(--accent-sand)]/20 rounded-xl bg-[var(--accent-sand)]/5">
                        <span className="text-[9px] font-bold text-[var(--accent-sand)] block uppercase">{t('fat')}</span>
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
                    <ListTodo className="w-4 h-4 text-[var(--accent-powder)]" /> {t('ingredients')}
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
                    <CheckCircle className="w-4 h-4 text-[var(--accent-sand)]" /> {t('directions')}
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
