import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, CheckCircle, ChevronRight, X, ListTodo, Flame, Info } from 'lucide-react';

export default function Recipes({ token }) {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  // Filtres
  const [filterKeto, setFilterKeto] = useState(false);
  const [filterHighProtein, setFilterHighProtein] = useState(false);
  const [filterLight, setFilterLight] = useState(false);

  // Recette sélectionnée pour le détail
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // Liste de courses interactive temporaire pour la modale
  const [checkedIngredients, setCheckedIngredients] = useState({});

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setError('');
    setSelectedRecipe(null);

    // Construire les query parameters
    let url = `http://localhost:5000/api/foods/recipes/search?query=${encodeURIComponent(query)}`;
    if (filterLight) url += '&caloriesMax=400';
    if (filterKeto) url += '&carbMaxPercent=15'; // max 15% de calories de glucides
    if (filterHighProtein) url += '&proteinMinPercent=30'; // min 30% de calories de protéines

    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
        setIsMockData(data.isMock || false);
        if (data.recipes && data.recipes.length === 0) {
          setError('Aucune recette ne correspond à vos critères.');
        }
      } else {
        throw new Error('Erreur de recherche.');
      }
    } catch (err) {
      setError('Impossible de récupérer les recettes. Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  };

  // Lancer une recherche par défaut à l'ouverture (ex: vide ou "sain")
  useEffect(() => {
    handleSearch();
  }, [filterKeto, filterHighProtein, filterLight]); // recherche automatique quand on clique sur un filtre !

  const handleFetchRecipeDetails = async (id) => {
    setLoadingRecipe(true);
    setCheckedIngredients({});
    try {
      const response = await fetch(`http://localhost:5000/api/foods/recipes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedRecipe(data.recipe);
      } else {
        alert('Erreur lors du chargement des détails de la recette.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecipe(false);
    }
  };

  const toggleIngredientCheck = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Barre de Recherche & Filtres */}
      <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-600" />
            <input
              type="text"
              placeholder="Ex: Poulet, saumon, soupe, salade..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer text-sm"
          >
            {searching ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : 'Rechercher'}
          </button>
        </form>

        {/* Checkboxes Filtres */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Filtres rapides :</span>
          
          <button
            type="button"
            onClick={() => setFilterKeto(!filterKeto)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterKeto 
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-450' 
                : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
            }`}
          >
            🥑 Keto (Glucides &lt; 15%)
          </button>

          <button
            type="button"
            onClick={() => setFilterHighProtein(!filterHighProtein)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterHighProtein 
                ? 'bg-rose-500/10 border-rose-500/50 text-rose-450' 
                : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
            }`}
          >
            💪 Riche en Protéines (&gt; 30%)
          </button>

          <button
            type="button"
            onClick={() => setFilterLight(!filterLight)}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filterLight 
                ? 'bg-sky-500/10 border-sky-500/50 text-sky-450' 
                : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
            }`}
          >
            🌱 Léger (&lt; 400 kcal)
          </button>
        </div>

        {isMockData && recipes.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 text-[11px]">
            <Info className="w-3.5 h-3.5" />
            <span>Mode Démo : Clés FatSecret non configurées ou inaccessibles. Recettes simulées affichées.</span>
          </div>
        )}
      </div>

      {/* Liste de Résultats */}
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-center text-rose-450 py-12">{error}</p>
        )}

        {searching && recipes.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!searching && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div 
                key={recipe.recipe_id} 
                className="bg-slate-900/30 border border-slate-900/80 rounded-2xl overflow-hidden shadow-lg hover:border-slate-800 transition-all flex flex-col group"
              >
                {/* Image Recette */}
                <div className="h-44 w-full overflow-hidden relative bg-slate-950">
                  <img 
                    src={recipe.recipe_image} 
                    alt={recipe.recipe_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400';
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/85 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-450 border border-slate-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> {recipe.calories} kcal
                  </div>
                </div>

                {/* Contenu Recette */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {recipe.recipe_name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {recipe.recipe_description || 'Une délicieuse recette équilibrée pour enrichir votre alimentation au quotidien.'}
                    </p>
                  </div>

                  {/* Rating / Macros rapides */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900/60 pt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold">{recipe.rating}</span>
                    </div>
                    <div className="flex gap-2 font-semibold text-[10px]">
                      <span className="text-rose-450">P: {Math.round(recipe.protein)}g</span>
                      <span className="text-amber-450">G: {Math.round(recipe.carbs)}g</span>
                      <span className="text-sky-450">L: {Math.round(recipe.fat)}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFetchRecipeDetails(recipe.recipe_id)}
                    className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Voir la recette <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de Détail Recette */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-950 w-full max-w-3xl rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modale */}
            <div className="px-6 py-4 border-b border-slate-900 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-slate-200">{selectedRecipe.recipe_name}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">{selectedRecipe.recipe_description}</p>
              </div>
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-450 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps de la modale */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Image & Métriques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <img 
                  src={selectedRecipe.recipe_image} 
                  alt={selectedRecipe.recipe_name} 
                  className="w-full h-40 object-cover rounded-xl border border-slate-900 md:col-span-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400';
                  }}
                />
                
                {/* Infos nutrition et temps */}
                <div className="md:col-span-2 flex flex-col justify-between gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/50 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-450" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Temps Prép</span>
                        <span className="text-xs font-bold text-slate-300">{selectedRecipe.preparation_time_min} min</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/50 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-450" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Temps Cuisson</span>
                        <span className="text-xs font-bold text-slate-300">{selectedRecipe.cooking_time_min} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Répartition macros */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <span className="text-xs font-bold text-slate-400">Analyse nutritionnelle</span>
                      <span className="text-xs font-bold text-emerald-400">{selectedRecipe.calories} kcal / portion</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                      <div className="p-1.5 bg-rose-500/5 rounded-lg border border-rose-500/10">
                        <span className="text-[9px] text-rose-400 block uppercase">Protéines</span>
                        <span className="text-sm font-extrabold text-white">{selectedRecipe.protein}g</span>
                      </div>
                      <div className="p-1.5 bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <span className="text-[9px] text-amber-400 block uppercase">Glucides</span>
                        <span className="text-sm font-extrabold text-white">{selectedRecipe.carbs}g</span>
                      </div>
                      <div className="p-1.5 bg-sky-500/5 rounded-lg border border-sky-500/10">
                        <span className="text-[9px] text-sky-400 block uppercase">Lipides</span>
                        <span className="text-sm font-extrabold text-white">{selectedRecipe.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingrédients (Liste de course interactive) & Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-900">
                {/* Ingrédients */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-450" /> Ingrédients requis
                  </h4>
                  <p className="text-[10px] text-slate-500">Cochez les ingrédients au fur et à mesure pour préparer votre cuisine.</p>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedRecipe.ingredients.map((ing, index) => {
                      const isChecked = !!checkedIngredients[index];
                      return (
                        <div 
                          key={index} 
                          onClick={() => toggleIngredientCheck(index)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500 line-through' 
                              : 'bg-slate-950 border-slate-900/60 text-slate-300 hover:border-slate-800'
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 shrink-0 transition-all ${isChecked ? 'text-emerald-500' : 'text-slate-800'}`} />
                          <span className="text-xs">{ing}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-450" /> Instructions de préparation
                  </h4>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedRecipe.directions.map((step, index) => (
                      <div key={index} className="flex gap-3 items-start p-3 bg-slate-950 border border-slate-900 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed pt-0.5">{step}</p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  );
}
