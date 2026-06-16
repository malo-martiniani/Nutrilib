import React, { useState, useEffect } from 'react';
import { User, Shield, HelpCircle, Dumbbell, Flame, Target, ChevronRight, Check } from 'lucide-react';

const AVATARS = [
  { emoji: '🍏', bg: 'from-emerald-500 to-green-600', label: 'Pomme' },
  { emoji: '🥑', bg: 'from-green-400 to-emerald-500', label: 'Avocat' },
  { emoji: '🍓', bg: 'from-rose-500 to-red-600', label: 'Fraise' },
  { emoji: '🍋', bg: 'from-amber-400 to-yellow-500', label: 'Citron' },
  { emoji: '💪', bg: 'from-blue-500 to-indigo-600', label: 'Force' },
  { emoji: '🏃‍♂️', bg: 'from-purple-500 to-violet-600', label: 'Course' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', name: 'Sédentaire', desc: 'Travail de bureau, peu ou pas d\'exercice', mult: 1.2 },
  { id: 'light', name: 'Faiblement actif', desc: 'Exercice léger 1 à 3 fois par semaine', mult: 1.375 },
  { id: 'moderate', name: 'Modérément actif', desc: 'Entraînement régulier 3 à 5 fois par semaine', mult: 1.55 },
  { id: 'active', name: 'Très actif', desc: 'Exercice quotidien ou sport intense', mult: 1.725 },
  { id: 'very_active', name: 'Extrêmement actif', desc: 'Métier physique ou double entraînement quotidien', mult: 1.9 }
];

export default function Profile({ token, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Formulaire d'informations de base
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Formulaire calculateur
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');

  // Résultats calculés localement
  const [calcResults, setCalcResults] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
        setIsPrivate(data.is_private === 1);
        
        if (data.gender) setGender(data.gender);
        if (data.age) setAge(data.age.toString());
        if (data.height) setHeight(data.height.toString());
        if (data.current_weight) setWeight(data.current_weight.toString());
        if (data.activity_level) setActivityLevel(data.activity_level);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Recalculer les objectifs en direct quand les champs changent
  useEffect(() => {
    const a = parseInt(age);
    const h = parseInt(height);
    const w = parseFloat(weight);
    
    if (a && h && w && (gender === 'male' || gender === 'female')) {
      let bmr = 0;
      if (gender === 'male') {
        bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
      } else {
        bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
      }

      const activeObj = ACTIVITY_LEVELS.find(lvl => lvl.id === activityLevel);
      const mult = activeObj ? activeObj.mult : 1.2;
      const tdee = Math.round(bmr * mult);
      
      const protein = Math.round((tdee * 0.25) / 4);
      const fat = Math.round((tdee * 0.25) / 9);
      const carbs = Math.round((tdee * 0.50) / 4);

      setCalcResults({ bmr: Math.round(bmr), tdee, protein, fat, carbs });
    } else {
      setCalcResults(null);
    }
  }, [gender, age, height, weight, activityLevel]);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
          is_private: isPrivate
        })
      });

      if (response.ok) {
        setMessage({ text: 'Informations de base enregistrées !', type: 'success' });
        // Mettre à jour l'état local du profil
        setProfile(prev => ({
          ...prev,
          display_name: displayName,
          avatar_url: avatarUrl,
          is_private: isPrivate ? 1 : 0
        }));
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const err = await response.json();
        setMessage({ text: err.message || 'Erreur lors de la mise à jour.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erreur réseau.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCalculator = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/profile/calculator', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gender,
          age,
          height,
          current_weight: weight,
          activity_level: activityLevel
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ text: 'Calculateur validé et objectifs enregistrés !', type: 'success' });
        setProfile(prev => ({
          ...prev,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          current_weight: parseFloat(weight),
          activity_level: activityLevel,
          calorie_goal: data.goals.calorie_goal,
          protein_goal: data.goals.protein_goal,
          carb_goal: data.goals.carb_goal,
          fat_goal: data.goals.fat_goal
        }));
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const err = await response.json();
        setMessage({ text: err.message || 'Erreur lors du calcul.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Erreur réseau.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const selectPresetAvatar = (preset) => {
    const url = `preset:${preset.emoji}:${preset.bg}`;
    setAvatarUrl(url);
  };

  const renderCurrentAvatar = () => {
    if (avatarUrl && avatarUrl.startsWith('preset:')) {
      const [, emoji, bg] = avatarUrl.split(':');
      return (
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-4xl shadow-lg border border-white/10`}>
          {emoji}
        </div>
      );
    } else if (avatarUrl) {
      return (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="w-20 h-20 rounded-2xl object-cover border border-slate-800 shadow-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150';
          }}
        />
      );
    }
    return (
      <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-lg">
        <User className="w-10 h-10" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Section Édition Profil de Base */}
        <div className="flex-1 bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-400" /> Mon Compte & Profil
          </h2>

          <form onSubmit={handleUpdateBasic} className="space-y-6">
            <div className="flex items-center gap-5">
              {renderCurrentAvatar()}
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Photo de profil</span>
                <p className="text-xs text-slate-400">Choisissez un avatar rapide ci-dessous ou insérez une URL d'image.</p>
              </div>
            </div>

            {/* Presets d'Avatars */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-semibold block">Galerie d'avatars Nutrilib</label>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map((preset, index) => {
                  const presetUrl = `preset:${preset.emoji}:${preset.bg}`;
                  const isSelected = avatarUrl === presetUrl;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectPresetAvatar(preset)}
                      className={`relative aspect-square rounded-xl bg-gradient-to-br ${preset.bg} flex items-center justify-center text-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all border ${
                        isSelected ? 'border-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 shadow-md' : 'border-white/5'
                      }`}
                    >
                      {preset.emoji}
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center border border-slate-950">
                          <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URL d'image personnalisée */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">URL de votre photo personnalisée</label>
              <input
                type="text"
                value={avatarUrl.startsWith('preset:') ? '' : avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemples.com/votre-image.jpg"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pseudo / Nom d'affichage */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Pseudo / Nom affiché</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile?.username}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Confidentialité du compte */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Profil Privé
                </span>
                <p className="text-xs text-slate-500">Un profil privé masque vos informations de journal aux autres.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  isPrivate ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span className={`absolute top-0.75 left-0.75 w-4.5 h-4.5 rounded-full bg-slate-950 transition-transform ${
                  isPrivate ? 'translate-x-5' : 'translate-x-0'
                }`}></span>
              </button>
            </div>

            {message.text && message.type === 'success' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                {message.text}
              </div>
            )}
            {message.text && message.type === 'error' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {updating ? 'Enregistrement...' : 'Enregistrer mon profil'}
            </button>
          </form>
        </div>

        {/* Section Calculateur de Besoins Métaboliques */}
        <div className="flex-1 bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-amber-500" /> Calculateur Mifflin-St Jeor (TDEE)
          </h2>

          <form onSubmit={handleSaveCalculator} className="space-y-5">
            {/* Genre */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2.5 rounded-xl border font-bold text-sm cursor-pointer transition-all ${
                  gender === 'male' 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-inner' 
                    : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                }`}
              >
                Homme 👨
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2.5 rounded-xl border font-bold text-sm cursor-pointer transition-all ${
                  gender === 'female' 
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-inner' 
                    : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                }`}
              >
                Femme 👩
              </button>
            </div>

            {/* Âge, Taille, Poids */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Âge (ans)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Taille (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Poids (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Niveau d'activité */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold block">Niveau d'activité physique</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setActivityLevel(lvl.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      activityLevel === lvl.id
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-inner'
                        : 'bg-slate-950 border-slate-900/60 hover:bg-slate-900/40 hover:border-slate-800'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-semibold block ${activityLevel === lvl.id ? 'text-amber-400' : 'text-slate-300'}`}>
                        {lvl.name}
                      </span>
                      <span className="text-xs text-slate-500 block">{lvl.desc}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${activityLevel === lvl.id ? 'text-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Affichage des Résultats du Calculateur en direct */}
            {calcResults && (
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-4 animate-in slide-in-from-bottom duration-250">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Objectif quotidien (TDEE)</span>
                    <span className="text-lg font-black block text-amber-400">{calcResults.tdee} kcal / jour</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Métabolisme de Base (BMR)</span>
                    <span className="text-sm font-semibold block text-slate-400">{calcResults.bmr} kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <span className="text-[10px] font-bold text-rose-400 block uppercase">Protéines</span>
                    <span className="text-base font-extrabold text-white">{calcResults.protein}g</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">25% • 4kcal/g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase">Glucides</span>
                    <span className="text-base font-extrabold text-white">{calcResults.carbs}g</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">50% • 4kcal/g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-500/5 border border-sky-500/10">
                    <span className="text-[10px] font-bold text-sky-400 block uppercase">Lipides</span>
                    <span className="text-base font-extrabold text-white">{calcResults.fat}g</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">25% • 9kcal/g</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={updating || !calcResults}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-sm hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {updating ? 'Enregistrement...' : 'Valider & Appliquer les objectifs'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
