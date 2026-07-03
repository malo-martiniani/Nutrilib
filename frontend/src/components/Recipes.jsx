import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, CheckCircle, ChevronRight, X, ListTodo, Flame, Info, Heart, FolderOpen, SlidersHorizontal } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Recipes({ token, initialFilters, onClearFilters }) {
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
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
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
          const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
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
      const response = await fetch(`${API_URL}/foods/recipes/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) { setSelectedRecipe((await response.json()).recipe); }
      else { alert('Erreur chargement recette.'); }
    } catch (err) { console.error(err); }
    finally { setLoadingRecipe(false); }
  };

  const toggleIngredientCheck = (index) => {
    setCheckedIngredients(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleToggleFavorite = async (e, recipe) => {
    e.stopPropagation();
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

  const handleAddToList = async (listId, recipe) => {
    try {
      const response = await fetch(`${API_URL}/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          food_id: `recipe_${recipe.recipe_id}`,
          food_name: recipe.recipe_name,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          serving_description: '1 portion'
        })
      });
      if (response.ok) {
        alert('Recette ajoutée à la liste !');
        fetchFavoritesAndLists();
        setShowListSelectorForRecipe(null);
      }
    } catch (err) { console.error(err); }
  };

  // Helper function to clean oz to ml/g in ingredients list
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

  return (
    <div className="space-y-6">

      {/* Search & Filters */}
      <div className="brutal-card space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input type="text" placeholder="Poulet, saumon, soupe..."
              value={query} onChange={(e) => setQuery(e.target.value)}
              className="brutal-input pr-8 py-2 text-xs"
              style={{ paddingLeft: '2.5rem' }} />
          </div>
          <button 
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 border rounded-xl hover:bg-[var(--surface-raised)] transition-all cursor-pointer ${showAdvancedFilters ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
            title="Filtres avancés"
          >
            <SlidersHorizontal className="w-4 h-4" />
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
