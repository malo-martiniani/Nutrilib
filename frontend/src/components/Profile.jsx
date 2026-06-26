import React, { useState, useEffect } from 'react';
import { User, Shield, Flame, ChevronRight, Check } from 'lucide-react';

const AVATARS = [
  { emoji: '🍏', label: 'Pomme' },
  { emoji: '🥑', label: 'Avocat' },
  { emoji: '🍓', label: 'Fraise' },
  { emoji: '🍋', label: 'Citron' },
  { emoji: '💪', label: 'Force' },
  { emoji: '🏃‍♂️', label: 'Course' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', name: 'Sédentaire', desc: 'Travail de bureau, peu ou pas d\'exercice', mult: 1.2 },
  { id: 'light', name: 'Faiblement actif', desc: 'Exercice léger 1 à 3 fois par semaine', mult: 1.375 },
  { id: 'moderate', name: 'Modérément actif', desc: 'Entraînement régulier 3 à 5 fois par semaine', mult: 1.55 },
  { id: 'active', name: 'Très actif', desc: 'Exercice quotidien ou sport intense', mult: 1.725 },
  { id: 'very_active', name: 'Extrêmement actif', desc: 'Métier physique ou double entraînement', mult: 1.9 }
];

export default function Profile({ token, onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('sedentary');

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
    } catch (error) { console.error('Erreur chargement profil:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [token]);

  useEffect(() => {
    const a = parseInt(age);
    const h = parseInt(height);
    const w = parseFloat(weight);
    if (a && h && w && (gender === 'male' || gender === 'female')) {
      let bmr = gender === 'male'
        ? (10 * w) + (6.25 * h) - (5 * a) + 5
        : (10 * w) + (6.25 * h) - (5 * a) - 161;
      const activeObj = ACTIVITY_LEVELS.find(lvl => lvl.id === activityLevel);
      const mult = activeObj ? activeObj.mult : 1.2;
      const tdee = Math.round(bmr * mult);
      setCalcResults({
        bmr: Math.round(bmr), tdee,
        protein: Math.round((tdee * 0.25) / 4),
        fat: Math.round((tdee * 0.25) / 9),
        carbs: Math.round((tdee * 0.50) / 4)
      });
    } else { setCalcResults(null); }
  }, [gender, age, height, weight, activityLevel]);

  const handleUpdateBasic = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ display_name: displayName, avatar_url: avatarUrl, is_private: isPrivate })
      });
      if (response.ok) {
        setMessage({ text: 'Profil enregistré.', type: 'success' });
        setProfile(prev => ({ ...prev, display_name: displayName, avatar_url: avatarUrl, is_private: isPrivate ? 1 : 0 }));
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const err = await response.json();
        setMessage({ text: err.message || 'Erreur.', type: 'error' });
      }
    } catch (error) { setMessage({ text: 'Erreur réseau.', type: 'error' }); }
    finally { setUpdating(false); }
  };

  const handleSaveCalculator = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('http://localhost:5000/api/profile/calculator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ gender, age, height, current_weight: weight, activity_level: activityLevel })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage({ text: 'Objectifs enregistrés.', type: 'success' });
        setProfile(prev => ({ ...prev, gender, age: parseInt(age), height: parseInt(height), current_weight: parseFloat(weight), activity_level: activityLevel, calorie_goal: data.goals.calorie_goal, protein_goal: data.goals.protein_goal, carb_goal: data.goals.carb_goal, fat_goal: data.goals.fat_goal }));
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const err = await response.json();
        setMessage({ text: err.message || 'Erreur.', type: 'error' });
      }
    } catch (error) { setMessage({ text: 'Erreur réseau.', type: 'error' }); }
    finally { setUpdating(false); }
  };

  const selectPresetAvatar = (preset) => {
    setAvatarUrl(`preset:${preset.emoji}:none`);
  };

  const renderCurrentAvatar = () => {
    if (avatarUrl && avatarUrl.startsWith('preset:')) {
      const [, emoji] = avatarUrl.split(':');
      return (
        <div className="w-16 h-16 border border-[var(--accent-neon)] bg-[var(--surface-raised)] rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(57,255,20,0.15)]">
          {emoji}
        </div>
      );
    } else if (avatarUrl) {
      return (
        <img src={avatarUrl} alt="Avatar"
          className="w-16 h-16 object-cover border border-[var(--border)] rounded-full"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'; }}
        />
      );
    }
    return (
      <div className="w-16 h-16 border border-[var(--border-muted)] bg-[var(--surface-raised)] rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-[var(--text-dim)]" />
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="brutal-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">

      {/* SECTION 1: Basic Profile */}
      <div className="brutal-card space-y-6">
        <h2 className="text-base font-extrabold uppercase tracking-wider border-b border-[var(--border-muted)] pb-3 flex items-center gap-2 text-[var(--text)]">
          <User className="w-5 h-5 text-[var(--accent-cyan)]" /> Mon Compte
        </h2>

        <form onSubmit={handleUpdateBasic} className="space-y-5">
          <div className="flex items-center gap-4">
            {renderCurrentAvatar()}
            <div>
              <span className="brutal-label mb-0">Photo de profil</span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">Choisissez un avatar ou insérez une URL.</p>
            </div>
          </div>

          {/* Avatar presets */}
          <div>
            <label className="brutal-label">Avatars</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((preset, index) => {
                const presetUrl = `preset:${preset.emoji}:none`;
                const isSelected = avatarUrl === presetUrl;
                return (
                  <button key={index} type="button" onClick={() => selectPresetAvatar(preset)}
                    className={`aspect-square border flex items-center justify-center text-xl cursor-pointer rounded-2xl relative transition-all duration-200 ${
                      isSelected
                        ? 'border-[var(--accent-neon)] bg-[var(--surface-raised)]'
                        : 'border-[var(--border-muted)] bg-[var(--surface)] hover:border-[var(--text-dim)]'
                    }`}
                  >
                    {preset.emoji}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-neon)] flex items-center justify-center rounded-full border border-[#040d0a]">
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL */}
          <div>
            <label className="brutal-label">URL personnalisée</label>
            <input type="text" value={avatarUrl.startsWith('preset:') ? '' : avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="brutal-input" />
          </div>

          {/* Display name */}
          <div>
            <label className="brutal-label">Nom affiché</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.username}
              className="brutal-input" />
          </div>

          {/* Privacy toggle */}
          <div className="flex items-center justify-between p-4 border border-[var(--border-muted)] bg-[var(--surface-raised)] rounded-[20px]">
            <div>
              <span className="text-sm font-bold flex items-center gap-2 text-[var(--text)]">
                <Shield className="w-4 h-4 text-[var(--accent-cyan)]" /> Profil Privé
              </span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">Masque vos informations aux autres.</p>
            </div>
            <button type="button" onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-7 rounded-full cursor-pointer flex items-center px-1 border transition-colors duration-200 ${
                isPrivate ? 'border-[var(--accent-neon)] bg-[var(--accent-neon)]' : 'border-[var(--border-muted)] bg-[var(--surface-inset)]'
              }`}>
              <span className={`w-5 h-5 rounded-full block transition-transform duration-200 ${isPrivate ? 'translate-x-5 bg-[#040d0a]' : 'translate-x-0 bg-[var(--text-muted)]'}`}></span>
            </button>
          </div>

          {/* Feedback messages */}
          {message.text && message.type === 'success' && (
            <div className="p-3.5 border border-[var(--accent-neon)]/20 bg-[var(--accent-neon)]/10 text-[var(--accent-neon)] text-xs font-semibold rounded-2xl">{message.text}</div>
          )}
          {message.text && message.type === 'error' && (
            <div className="p-3.5 border border-[var(--accent-magenta)]/20 bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] text-xs font-semibold rounded-2xl">{message.text}</div>
          )}

          <button type="submit" disabled={updating} className="brutal-btn-accent w-full cursor-pointer">
            {updating ? 'Enregistrement...' : 'Enregistrer mon profil'}
          </button>
        </form>
      </div>

      {/* SECTION 2: Calculator */}
      <div className="brutal-card space-y-6">
        <h2 className="text-base font-extrabold uppercase tracking-wider border-b border-[var(--border-muted)] pb-3 flex items-center gap-2 text-[var(--text)]">
          <Flame className="w-5 h-5 text-[var(--accent-amber)]" /> Calculateur TDEE
        </h2>

        <form onSubmit={handleSaveCalculator} className="space-y-5">
          {/* Gender */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGender('male')}
              className={`py-3 border font-bold text-sm uppercase rounded-2xl transition-all duration-200 cursor-pointer ${
                gender === 'male'
                  ? 'border-[var(--protein)] text-[var(--protein)] bg-[var(--protein)]/5'
                  : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
              }`}
            >
              Homme
            </button>
            <button type="button" onClick={() => setGender('female')}
              className={`py-3 border font-bold text-sm uppercase rounded-2xl transition-all duration-200 cursor-pointer ${
                gender === 'female'
                  ? 'border-[var(--accent-magenta)] text-[var(--accent-magenta)] bg-[var(--accent-magenta)]/5'
                  : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)]'
              }`}
            >
              Femme
            </button>
          </div>

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="brutal-label">Âge</label>
              <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" className="brutal-input" />
            </div>
            <div>
              <label className="brutal-label">Taille (cm)</label>
              <input type="number" min="50" max="250" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="brutal-input" />
            </div>
            <div>
              <label className="brutal-label">Poids (kg)</label>
              <input type="number" step="0.1" min="20" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="brutal-input" />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="brutal-label">Niveau d'activité</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((lvl) => (
                <button key={lvl.id} type="button" onClick={() => setActivityLevel(lvl.id)}
                  className={`w-full text-left p-3.5 border flex items-center justify-between rounded-2xl transition-all duration-200 cursor-pointer bg-[var(--surface)] ${
                    activityLevel === lvl.id
                      ? 'border-[var(--accent-amber)] bg-[var(--surface-raised)] shadow-[var(--shadow-subtle)]'
                      : 'border-[var(--border-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold block ${activityLevel === lvl.id ? 'text-[var(--accent-amber)]' : 'text-[var(--text)]'}`}>
                      {lvl.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-medium">{lvl.desc}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${activityLevel === lvl.id ? 'text-[var(--accent-amber)] translate-x-1' : 'text-[var(--text-dim)]'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Live results */}
          {calcResults && (
            <div className="border border-[var(--border)] p-4 space-y-4 bg-[var(--surface-inset)] rounded-2xl shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-3">
                <div>
                  <span className="brutal-label mb-0">TDEE Quotidien</span>
                  <span className="text-xl font-extrabold text-[var(--accent-amber)] block mt-0.5">{calcResults.tdee} kcal/jour</span>
                </div>
                <div className="text-right">
                  <span className="brutal-label mb-0">BMR</span>
                  <span className="text-sm font-bold text-[var(--text-muted)] block mt-0.5">{calcResults.bmr} kcal</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 border border-[var(--protein)]/20 rounded-xl bg-[var(--protein)]/5">
                  <span className="text-[9px] font-bold text-[var(--protein)] block uppercase">Protéines</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.protein}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">25% · 4kcal/g</span>
                </div>
                <div className="p-2 border border-[var(--carbs)]/20 rounded-xl bg-[var(--carbs)]/5">
                  <span className="text-[9px] font-bold text-[var(--carbs)] block uppercase">Glucides</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.carbs}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">50% · 4kcal/g</span>
                </div>
                <div className="p-2 border border-[var(--fat)]/20 rounded-xl bg-[var(--fat)]/5">
                  <span className="text-[9px] font-bold text-[var(--fat)] block uppercase">Lipides</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.fat}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">25% · 9kcal/g</span>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={updating || !calcResults}
            className="brutal-btn w-full disabled:opacity-30 cursor-pointer"
            style={{ background: 'var(--accent-amber)', borderColor: 'var(--accent-amber)', color: '#040d0a' }}>
            {updating ? 'Enregistrement...' : 'Valider les objectifs'}
          </button>
        </form>
      </div>
    </div>
  );
}
