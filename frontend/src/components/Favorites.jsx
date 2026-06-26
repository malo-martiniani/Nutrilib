import React, { useState, useEffect } from 'react';
import { Heart, FolderPlus, Trash2, Plus, Calendar, ShoppingBag } from 'lucide-react';

const MEALS = [
  { id: 'breakfast', name: 'Petit-déjeuner', label: 'MATIN' },
  { id: 'lunch', name: 'Déjeuner', label: 'MIDI' },
  { id: 'dinner', name: 'Dîner', label: 'SOIR' },
  { id: 'snack', name: 'Collation', label: 'SNACK' }
];

export default function Favorites({ token, defaultDate }) {
  const [favorites, setFavorites] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newListName, setNewListName] = useState('');
  const [creatingList, setCreatingList] = useState(false);

  const [quickAddFood, setQuickAddFood] = useState(null);
  const [quickAddAmount, setQuickAddAmount] = useState(100);
  const [quickAddMeal, setQuickAddMeal] = useState('breakfast');
  const [quickAddDate, setQuickAddDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [addingToJournal, setAddingToJournal] = useState(false);

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

  const handleRemoveFavorite = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setFavorites(favorites.filter(f => f.id !== id)); }
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
    if (!window.confirm('Supprimer cette liste ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setLists(lists.filter(l => l.id !== listId)); }
    } catch (err) { console.error(err); }
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
    setQuickAddMeal('breakfast');
    setQuickAddDate(defaultDate || new Date().toISOString().split('T')[0]);
  };

  const handleQuickAddSubmit = async () => {
    if (!quickAddFood) return;
    setAddingToJournal(true);
    const ratio = quickAddAmount / 100;
    const payload = {
      food_id: quickAddFood.food_id,
      food_name: quickAddFood.food_name,
      calories: Math.round(quickAddFood.calories * ratio),
      protein: (quickAddFood.protein * ratio).toFixed(1),
      carbs: (quickAddFood.carbs * ratio).toFixed(1),
      fat: (quickAddFood.fat * ratio).toFixed(1),
      meal_type: quickAddMeal,
      serving_amount: quickAddAmount,
      serving_unit: 'g',
      entry_date: quickAddDate
    };
    try {
      const response = await fetch('http://localhost:5000/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) { alert(`${quickAddFood.food_name} ajouté au journal !`); setQuickAddFood(null); }
      else { const err = await response.json(); alert(err.message || 'Erreur.'); }
    } catch (err) { alert('Erreur réseau.'); }
    finally { setAddingToJournal(false); }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="brutal-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">

      {/* FAVORITES */}
      <div className="brutal-card space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider border-b border-[var(--border-muted)] pb-3 flex items-center gap-2 text-[var(--text)]">
          <Heart className="w-5 h-5 text-[var(--accent-magenta)] fill-[var(--accent-magenta)]/10" /> Mes Favoris
        </h2>

        {favorites.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-dim)]">
            <Heart className="w-10 h-10 mx-auto mb-3 text-[var(--border-muted)] opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">Aucun favori</p>
            <p className="text-[10px] mt-1">Cliquez sur le cœur lors de vos recherches.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div key={fav.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-muted)] transition-colors duration-200">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">{fav.food_name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">
                    {fav.serving_description} ·{' '}
                    <span style={{ color: 'var(--protein)' }}>P:{fav.protein}g</span> ·{' '}
                    <span style={{ color: 'var(--carbs)' }}>G:{fav.carbs}g</span> ·{' '}
                    <span style={{ color: 'var(--fat)' }}>L:{fav.fat}g</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="brutal-tag border-[var(--border-muted)] text-[var(--text-muted)] text-[10px]">{fav.calories} kcal</span>
                  <button onClick={() => openQuickAdd(fav)} className="brutal-btn-accent py-1.5 px-2.5 text-[10px] cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleRemoveFavorite(fav.id)} className="brutal-btn-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOM LISTS */}
      <div className="brutal-card space-y-4">
        <div className="border-b border-[var(--border-muted)] pb-3 space-y-3">
          <h2 className="text-base font-extrabold uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
            <ShoppingBag className="w-5 h-5 text-[var(--accent-cyan)]" /> Mes Listes
          </h2>
          <form onSubmit={handleCreateList} className="flex gap-2">
            <input type="text" required placeholder="Nom de la liste..."
              value={newListName} onChange={(e) => setNewListName(e.target.value)}
              className="brutal-input flex-1 py-2 text-xs" />
            <button type="submit" disabled={creatingList} className="brutal-btn-accent py-2 px-3 text-[10px] cursor-pointer">
              <FolderPlus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-dim)]">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-[var(--border-muted)] opacity-50" />
            <p className="text-xs font-bold uppercase tracking-wider">Aucune liste</p>
            <p className="text-[10px] mt-1">Créez une liste ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => (
              <div key={list.id} className="border border-[var(--border)] bg-[var(--surface-inset)] p-4 space-y-3 rounded-2xl shadow-[var(--shadow-subtle)]">
                <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)]">{list.list_name}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">{list.items.length} aliment(s)</span>
                  </div>
                  <button onClick={() => handleDeleteList(list.id)} className="brutal-btn-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {list.items.length === 0 ? (
                  <p className="text-[10px] text-[var(--text-dim)] py-2 text-center font-medium">Liste vide.</p>
                ) : (
                  <div className="space-y-2">
                    {list.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-dim)]">
                        <div>
                          <span className="font-bold text-xs text-[var(--text)]">{item.food_name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                            {item.serving_description} · {item.calories} kcal
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openQuickAdd(item)} className="brutal-btn-accent py-1 px-1.5 text-[9px] cursor-pointer">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleRemoveItemFromList(item.id, list.id)} className="brutal-btn-danger">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ADD MODAL */}
      {quickAddFood && (
        <div className="brutal-overlay">
          <div className="brutal-modal">
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider">Ajout rapide</h4>
                <span className="text-[10px] text-[var(--text-dim)]">{quickAddFood.food_name}</span>
              </div>
              <button onClick={() => setQuickAddFood(null)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer font-bold uppercase transition-colors duration-150">
                Fermer
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="brutal-label">Repas</label>
                <div className="grid grid-cols-2 gap-2">
                  {MEALS.map((meal) => (
                    <button key={meal.id} type="button" onClick={() => setQuickAddMeal(meal.id)}
                      className={`py-2.5 px-4 border text-xs font-bold uppercase text-center rounded-xl transition-all duration-200 cursor-pointer ${
                        quickAddMeal === meal.id
                          ? 'border-[var(--accent-neon)] text-[var(--accent-neon)] bg-[var(--surface-raised)]'
                          : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      {meal.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="brutal-label">Quantité (g)</label>
                  <input type="number" min="1" value={quickAddAmount}
                    onChange={(e) => setQuickAddAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="brutal-input" />
                </div>
                <div>
                  <label className="brutal-label">Date</label>
                  <input type="date" value={quickAddDate} onChange={(e) => setQuickAddDate(e.target.value)} className="brutal-input" />
                </div>
              </div>
              <div className="border border-[var(--border)] p-4 space-y-2 bg-[var(--surface-inset)] rounded-2xl">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-semibold">Calories</span>
                  <span className="font-bold text-[var(--accent-neon)]">{Math.round(quickAddFood.calories * (quickAddAmount / 100))} kcal</span>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium pt-1 border-t border-[var(--border-muted)]">
                  <span>Macros</span>
                  <span>
                    P:{(quickAddFood.protein * (quickAddAmount / 100)).toFixed(1)}g ·
                    G:{(quickAddFood.carbs * (quickAddAmount / 100)).toFixed(1)}g ·
                    L:{(quickAddFood.fat * (quickAddAmount / 100)).toFixed(1)}g
                  </span>
                </div>
              </div>
              <button onClick={handleQuickAddSubmit} disabled={addingToJournal} className="brutal-btn-accent w-full">
                {addingToJournal ? 'Ajout...' : 'Ajouter au journal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
