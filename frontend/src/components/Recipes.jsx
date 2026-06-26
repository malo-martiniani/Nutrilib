import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, CheckCircle, ChevronRight, X, ListTodo, Flame, Info } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Recipes({ token }) {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  const [filterKeto, setFilterKeto] = useState(false);
  const [filterHighProtein, setFilterHighProtein] = useState(false);
  const [filterLight, setFilterLight] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError('');
    setSelectedRecipe(null);

    let url = `${API_URL}/foods/recipes/search?query=${encodeURIComponent(query)}`;
    if (filterLight) url += '&caloriesMax=400';
    if (filterKeto) url += '&carbMaxPercent=15';
    if (filterHighProtein) url += '&proteinMinPercent=30';

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

  useEffect(() => { handleSearch(); }, [filterKeto, filterHighProtein, filterLight]);

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

  return (
    <div className="space-y-6">

      {/* Search & Filters */}
      <div className="brutal-card space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            <input type="text" placeholder="Poulet, saumon, soupe..."
              value={query} onChange={(e) => setQuery(e.target.value)}
              className="brutal-input pl-10" />
          </div>
          <button type="submit" disabled={searching} className="brutal-btn-accent px-5 cursor-pointer">
            {searching ? <div className="brutal-spinner-sm"></div> : 'Rechercher'}
          </button>
        </form>

        {/* Filter toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="brutal-label mb-0 mr-1">Filtres :</span>
          <button type="button" onClick={() => setFilterKeto(!filterKeto)}
            className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
              filterKeto ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
            }`}
          >
            Keto
          </button>
          <button type="button" onClick={() => setFilterHighProtein(!filterHighProtein)}
            className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
              filterHighProtein ? 'border-[var(--protein)] text-[var(--protein)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
            }`}
          >
            Protéines+
          </button>
          <button type="button" onClick={() => setFilterLight(!filterLight)}
            className={`py-1.5 px-3 border text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-all duration-200 ${
              filterLight ? 'border-[var(--fat)] text-[var(--fat)] bg-[var(--surface-raised)]' : 'border-[var(--border-muted)] text-[var(--text-dim)]'
            }`}
          >
            Léger
          </button>
        </div>

        {isMockData && recipes.length > 0 && (
          <div className="p-4 border border-[var(--accent-amber)]/20 bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] text-xs font-semibold flex items-center gap-2 rounded-2xl">
            <Info className="w-4 h-4 shrink-0 text-[var(--accent-amber)]" /> Mode démo — clés FatSecret non configurées.
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
            {recipes.map((recipe) => (
              <div key={recipe.recipe_id} className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] flex flex-col shadow-[var(--shadow-soft)] hover:translate-y-[-2px] transition-all duration-300 group">
                {/* Image */}
                <div className="h-44 w-full overflow-hidden relative bg-[var(--surface-inset)]">
                  <img src={recipe.recipe_image} alt={recipe.recipe_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400'; }}
                  />
                  <div className="absolute top-3 right-3 brutal-tag border-transparent text-[var(--text)] bg-[rgba(15,28,22,0.85)] backdrop-blur-md text-[9px] rounded-lg">
                    <Flame className="w-3 h-3 text-[var(--accent-neon)]" /> {recipe.calories} kcal
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text)] line-clamp-1">{recipe.recipe_name}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 mt-1.5 font-medium">
                      {recipe.recipe_description || 'Une recette équilibrée pour enrichir votre alimentation.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] border-t border-[var(--border-muted)] pt-3 font-semibold">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                      <span className="font-bold text-[var(--text)]">{recipe.rating}</span>
                    </div>
                    <div className="flex gap-2">
                      <span style={{ color: 'var(--protein)' }}>P:{Math.round(recipe.protein)}g</span>
                      <span style={{ color: 'var(--carbs)' }}>G:{Math.round(recipe.carbs)}g</span>
                      <span style={{ color: 'var(--fat)' }}>L:{Math.round(recipe.fat)}g</span>
                    </div>
                  </div>

                  <button onClick={() => handleFetchRecipeDetails(recipe.recipe_id)}
                    className="brutal-btn-ghost w-full text-[10px] cursor-pointer">
                    Voir la recette <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="brutal-overlay">
          <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[28px] shadow-[var(--shadow-soft)]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border-muted)] flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-[var(--text)]">{selectedRecipe.recipe_name}</h3>
                <p className="text-[10px] text-[var(--text-muted)] mt-1.5 max-w-xl font-medium">{selectedRecipe.recipe_description}</p>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="brutal-btn-ghost p-2 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
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
                      <Clock className="w-5 h-5 text-[var(--accent-cyan)]" />
                      <div>
                        <span className="brutal-label mb-0">Préparation</span>
                        <span className="text-xs font-bold block text-[var(--text)]">{selectedRecipe.preparation_time_min} min</span>
                      </div>
                    </div>
                    <div className="p-3.5 border border-[var(--border)] rounded-2xl flex items-center gap-3 bg-[var(--surface-raised)]">
                      <Clock className="w-5 h-5 text-[var(--accent-amber)]" />
                      <div>
                        <span className="brutal-label mb-0">Cuisson</span>
                        <span className="text-xs font-bold block text-[var(--text)]">{selectedRecipe.cooking_time_min} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="border border-[var(--border)] p-4 space-y-3 rounded-2xl bg-[var(--surface-inset)]">
                    <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-2">
                      <span className="brutal-label mb-0">Nutrition</span>
                      <span className="text-xs font-extrabold text-[var(--accent-neon)]">{selectedRecipe.calories} kcal/portion</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 border border-[var(--protein)]/20 rounded-xl bg-[var(--protein)]/5">
                        <span className="text-[9px] font-bold text-[var(--protein)] block uppercase">Protéines</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.protein}g</span>
                      </div>
                      <div className="p-2 border border-[var(--carbs)]/20 rounded-xl bg-[var(--carbs)]/5">
                        <span className="text-[9px] font-bold text-[var(--carbs)] block uppercase">Glucides</span>
                        <span className="text-sm font-extrabold text-[var(--text)]">{selectedRecipe.carbs}g</span>
                      </div>
                      <div className="p-2 border border-[var(--fat)]/20 rounded-xl bg-[var(--fat)]/5">
                        <span className="text-[9px] font-bold text-[var(--fat)] block uppercase">Lipides</span>
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
                    <ListTodo className="w-4 h-4 text-[var(--accent-cyan)]" /> Ingrédients
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
                          <CheckCircle className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isChecked ? 'text-[var(--accent-neon)]' : 'text-[var(--text-dim)]'}`} />
                          <span className="text-xs">{ing}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-amber)]" /> Instructions
                  </h4>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {selectedRecipe.directions.map((step, index) => (
                      <div key={index} className="flex gap-3.5 items-start p-3.5 border border-[var(--border-muted)] rounded-2xl bg-[var(--surface-raised)]">
                        <span className="w-6 h-6 rounded-full bg-[var(--surface-inset)] text-[var(--text)] font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-[var(--border)]">
                          {index + 1}
                        </span>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-0.5">{step}</p>
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
