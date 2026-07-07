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

export default function Profile({ token, onProfileUpdate, onRecipeSearch }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goalType, setGoalType] = useState('maintain');
  const [targetWeight, setTargetWeight] = useState('');
  const [goalSpeed, setGoalSpeed] = useState('normal');

  const [recMinCal, setRecMinCal] = useState('');
  const [recMaxCal, setRecMaxCal] = useState('');
  const [recDiet, setRecDiet] = useState('omnivore');
  const [recMacroPref, setRecMacroPref] = useState('none');

  const [calcResults, setCalcResults] = useState(null);

  // States for custom macro ratio allocator
  const [macroRatioPreset, setMacroRatioPreset] = useState('balanced');
  const [proteinPercent, setProteinPercent] = useState(20);
  const [carbPercent, setCarbPercent] = useState(50);
  const [fatPercent, setFatPercent] = useState(30);

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
        setGender(data.gender || 'male');
        setAge(data.age ? data.age.toString() : '25');
        setHeight(data.height ? data.height.toString() : '175');
        setWeight(data.current_weight ? data.current_weight.toString() : '70');
        setActivityLevel(data.activity_level || 'sedentary');
        setGoalType(data.goal_type || 'maintain');
        setTargetWeight(data.target_weight ? data.target_weight.toString() : '');
        setGoalSpeed(data.goal_speed || 'normal');

        if (data.calorie_goal && data.protein_goal && data.carb_goal && data.fat_goal) {
          const pG = data.protein_goal * 4;
          const fG = data.fat_goal * 9;
          const cG = data.carb_goal * 4;
          const totalCalories = pG + fG + cG;
          if (totalCalories > 0) {
            const pP = Math.round((pG / totalCalories) * 100);
            const fP = Math.round((fG / totalCalories) * 100);
            const cP = 100 - pP - fP;
            setProteinPercent(pP);
            setFatPercent(fP);
            setCarbPercent(cP);

            // Match preset
            if (pP === 20 && cP === 50 && fP === 30) setMacroRatioPreset('balanced');
            else if (pP === 30 && cP === 40 && fP === 30) setMacroRatioPreset('hyper');
            else if (pP === 35 && cP === 25 && fP === 40) setMacroRatioPreset('lowcarb');
            else if (pP === 25 && cP === 5 && fP === 70) setMacroRatioPreset('keto');
            else setMacroRatioPreset('custom');
          }
        }
      }
    } catch (error) { console.error('Erreur chargement profil:', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [token]);

  const handlePresetChange = (preset) => {
    setMacroRatioPreset(preset);
    if (preset === 'balanced') {
      setCarbPercent(50);
      setProteinPercent(20);
      setFatPercent(30);
    } else if (preset === 'hyper') {
      setCarbPercent(40);
      setProteinPercent(30);
      setFatPercent(30);
    } else if (preset === 'lowcarb') {
      setCarbPercent(25);
      setProteinPercent(35);
      setFatPercent(40);
    } else if (preset === 'keto') {
      setCarbPercent(5);
      setProteinPercent(25);
      setFatPercent(70);
    }
  };

  const handlePercentChange = (macro, val) => {
    setMacroRatioPreset('custom');
    const parsed = Math.max(0, Math.min(100, parseInt(val) || 0));
    if (macro === 'protein') {
      setProteinPercent(parsed);
    } else if (macro === 'carb') {
      setCarbPercent(parsed);
    } else if (macro === 'fat') {
      setFatPercent(parsed);
    }
  };

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
      
      // Ajustement des calories et rythme selon l'objectif de poids et la vitesse
      let calorieGoal = tdee;
      let weeklyRate = 0.5;
      let calorieAdjustment = 0;

      if (goalType === 'lose') {
        let deficit = 500;
        switch (goalSpeed) {
          case 'very_slow': deficit = 150; weeklyRate = 0.15; break;
          case 'slow': deficit = 250; weeklyRate = 0.25; break;
          case 'normal': deficit = 500; weeklyRate = 0.50; break;
          case 'fast': deficit = 750; weeklyRate = 0.75; break;
          case 'very_fast': deficit = 1000; weeklyRate = 1.00; break;
        }
        const floor = gender === 'male' ? 1500 : 1200;
        calorieGoal = Math.max(floor, tdee - deficit);
        calorieAdjustment = -deficit;
      } else if (goalType === 'gain') {
        let surplus = 250;
        switch (goalSpeed) {
          case 'very_slow': surplus = 100; weeklyRate = 0.10; break;
          case 'slow': surplus = 150; weeklyRate = 0.15; break;
          case 'normal': surplus = 250; weeklyRate = 0.25; break;
          case 'fast': surplus = 350; weeklyRate = 0.35; break;
          case 'very_fast': surplus = 500; weeklyRate = 0.50; break;
        }
        calorieGoal = tdee + surplus;
        calorieAdjustment = surplus;
      }

      // Calculs de poids cible, IMC et poids de forme
      const heightM = h / 100;
      const currentBmi = w / (heightM * heightM);
      const healthyMinWeight = 18.5 * (heightM * heightM);
      const healthyMaxWeight = 24.9 * (heightM * heightM);
      
      let idealWeightDevine = gender === 'male'
        ? 50 + 2.3 * ((h - 152.4) / 2.54)
        : 45.5 + 2.3 * ((h - 152.4) / 2.54);
      if (idealWeightDevine < 40) idealWeightDevine = gender === 'male' ? 50 : 45.5;

      // Calcul de la durée estimée pour atteindre l'objectif
      let weeksToTarget = 0;
      const targetWNum = parseFloat(targetWeight);
      if (targetWNum && !isNaN(targetWNum)) {
        const diff = targetWNum - w;
        if (goalType === 'lose' && diff < 0) {
          weeksToTarget = Math.round(Math.abs(diff) / weeklyRate);
        } else if (goalType === 'gain' && diff > 0) {
          weeksToTarget = Math.round(diff / weeklyRate);
        }
      }

      setCalcResults({
        bmr: Math.round(bmr),
        tdee: calorieGoal,
        tdee_raw: tdee,
        calorieAdjustment,
        protein: Math.round((calorieGoal * (proteinPercent / 100)) / 4),
        fat: Math.round((calorieGoal * (fatPercent / 100)) / 9),
        carbs: Math.round((calorieGoal * (carbPercent / 100)) / 4),
        currentBmi,
        healthyMinWeight,
        healthyMaxWeight,
        idealWeightDevine,
        weeksToTarget
      });
    } else { setCalcResults(null); }
  }, [gender, age, height, weight, activityLevel, goalType, targetWeight, goalSpeed, proteinPercent, carbPercent, fatPercent]);

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

    if (goalType !== 'maintain' && targetWeight) {
      const h = parseInt(height);
      const tw = parseFloat(targetWeight);
      if (h && tw) {
        const heightM = h / 100;
        const targetBmi = tw / (heightM * heightM);
        if (targetBmi < 18.45) {
          const minHealthyWeight = Math.round(18.5 * (heightM * heightM));
          setMessage({
            text: `Le poids cible ne peut pas être inférieur à la limite de santé de ${minHealthyWeight} kg (IMC 18.5).`,
            type: 'error'
          });
          return;
        }
      }
    }

    setUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch('http://localhost:5000/api/profile/calculator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          gender,
          age,
          height,
          current_weight: weight,
          activity_level: activityLevel,
          goal_type: goalType,
          target_weight: targetWeight,
          goal_speed: goalSpeed,
          protein_percent: proteinPercent,
          carb_percent: carbPercent,
          fat_percent: fatPercent
        })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage({ text: 'Objectifs enregistrés.', type: 'success' });
        setProfile(prev => ({
          ...prev,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          current_weight: parseFloat(weight),
          activity_level: activityLevel,
          goal_type: data.goals.goal_type,
          target_weight: data.goals.target_weight,
          goal_speed: data.goals.goal_speed,
          calorie_goal: data.goals.calorie_goal,
          protein_goal: data.goals.protein_goal,
          carb_goal: data.goals.carb_goal,
          fat_goal: data.goals.fat_goal
        }));
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
        <div className="w-16 h-16 border border-[var(--accent-pistachio)] bg-[var(--surface-raised)] rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(210,240,192,0.15)]">
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
          <User className="w-5 h-5 text-[var(--accent-powder)]" /> Mon Compte
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
                        ? 'border-[var(--accent-pistachio)] bg-[var(--surface-raised)]'
                        : 'border-[var(--border-muted)] bg-[var(--surface)] hover:border-[var(--text-dim)]'
                    }`}
                  >
                    {preset.emoji}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-pistachio)] flex items-center justify-center rounded-full border border-[var(--bg-dark-slate)]">
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
                <Shield className="w-4 h-4 text-[var(--accent-powder)]" /> Profil Privé
              </span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">Masque vos informations aux autres.</p>
            </div>
            <button type="button" onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-7 rounded-full cursor-pointer flex items-center px-1 border transition-colors duration-200 ${
                isPrivate ? 'border-[var(--accent-pistachio)] bg-[var(--accent-pistachio)]' : 'border-[var(--border-muted)] bg-[var(--surface-inset)]'
              }`}>
              <span className={`w-5 h-5 rounded-full block transition-transform duration-200 ${isPrivate ? 'translate-x-5 bg-[var(--bg-dark-slate)]' : 'translate-x-0 bg-[var(--text-muted)]'}`}></span>
            </button>
          </div>

          {/* Feedback messages */}
          {message.text && message.type === 'success' && (
            <div className="p-3.5 border border-[var(--accent-pistachio)]/20 bg-[var(--accent-pistachio)]/10 text-[var(--accent-pistachio)] text-xs font-semibold rounded-2xl">{message.text}</div>
          )}
          {message.text && message.type === 'error' && (
            <div className="p-3.5 border border-[var(--accent-magenta)]/20 bg-[var(--accent-magenta)]/10 text-[var(--accent-magenta)] text-xs font-semibold rounded-2xl">{message.text}</div>
          )}

          <button type="submit" disabled={updating} className="brutal-btn-accent w-full cursor-pointer" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
            {updating ? 'Enregistrement...' : 'Enregistrer mon profil'}
          </button>
        </form>
      </div>

      {/* SECTION 2: Calculator */}
      <div className="brutal-card space-y-6">
        <h2 className="text-base font-extrabold uppercase tracking-wider border-b border-[var(--border-muted)] pb-3 flex items-center gap-2 text-[var(--text)]">
          <Flame className="w-5 h-5 text-[var(--accent-sand)]" /> Calculateur TDEE
        </h2>

        <form onSubmit={handleSaveCalculator} className="space-y-5">
          {/* Gender */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setGender('male')}
              className={`py-3 border font-bold text-sm uppercase rounded-2xl transition-all duration-200 cursor-pointer ${
                gender === 'male'
                  ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--accent-powder)]/5'
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
                      ? 'border-[var(--accent-sand)] bg-[var(--surface-raised)] shadow-[var(--shadow-subtle)]'
                      : 'border-[var(--border-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-bold block ${activityLevel === lvl.id ? 'text-[var(--accent-sand)]' : 'text-[var(--text)]'}`}>
                      {lvl.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-medium">{lvl.desc}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${activityLevel === lvl.id ? 'text-[var(--accent-sand)] translate-x-1' : 'text-[var(--text-dim)]'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Objectif de poids */}
          <div>
            <label className="brutal-label">Objectif de poids</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setGoalType('lose')}
                className={`py-2.5 px-1 border font-bold text-xs uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                  goalType === 'lose'
                    ? 'border-[var(--accent-magenta)] text-[var(--accent-magenta)] bg-[var(--accent-magenta)]/5 font-extrabold shadow-[var(--shadow-subtle)]'
                    : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                }`}
              >
                Perte de poids
              </button>
              <button type="button" onClick={() => { setGoalType('maintain'); setTargetWeight(''); }}
                className={`py-2.5 px-1 border font-bold text-xs uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                  goalType === 'maintain'
                    ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)] bg-[var(--accent-pistachio)]/5 font-extrabold shadow-[var(--shadow-subtle)]'
                    : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                }`}
              >
                Maintien
              </button>
              <button type="button" onClick={() => setGoalType('gain')}
                className={`py-2.5 px-1 border font-bold text-xs uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                  goalType === 'gain'
                    ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--accent-powder)]/5 font-extrabold shadow-[var(--shadow-subtle)]'
                    : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                }`}
              >
                Prise de masse
              </button>
            </div>
          </div>

          {/* Poids Cible */}
          {goalType !== 'maintain' && (
            <div className="space-y-2">
              <label className="brutal-label">Poids cible (kg)</label>
              <div className="flex gap-2">
                <input type="number" step="0.1" min="20" max="300" 
                  value={targetWeight} 
                  onChange={(e) => setTargetWeight(e.target.value)} 
                  placeholder={calcResults ? Math.round(calcResults.idealWeightDevine).toString() : '70'} 
                  className="brutal-input flex-1" />
                <button type="button" 
                  onClick={() => calcResults && setTargetWeight(Math.round(calcResults.idealWeightDevine).toString())}
                  className="px-3 border border-[var(--border-muted)] text-[10px] font-bold rounded-xl bg-[var(--surface-raised)] hover:border-[var(--text-dim)] text-[var(--text)] transition-colors cursor-pointer"
                >
                  Poids idéal
                </button>
              </div>
              {(() => {
                if (!targetWeight) return null;
                const h = parseInt(height);
                const tw = parseFloat(targetWeight);
                if (h && tw) {
                  const heightM = h / 100;
                  const targetBmi = tw / (heightM * heightM);
                  if (targetBmi < 18.45) {
                    return (
                      <p className="text-[10px] text-[var(--accent-magenta)] font-bold mt-1">
                        ⚠️ Attention : Ce poids est inférieur au poids de forme recommandé (IMC &lt; 18.5).
                      </p>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          {/* Analyse Santé & IMC */}
          {calcResults && (
            <div className="border border-[var(--border-muted)] p-3.5 space-y-2 bg-[var(--surface-raised)] rounded-2xl shadow-[var(--shadow-subtle)]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-dim)] block mb-1">Analyse de Santé</span>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text-muted)]">IMC Actuel :</span>
                <span className="flex items-center gap-1.5 font-bold text-[var(--text)]">
                  {calcResults.currentBmi.toFixed(1)}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${
                    calcResults.currentBmi < 18.5 ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--accent-powder)]/5' :
                    calcResults.currentBmi < 25 ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)] bg-[var(--accent-pistachio)]/5' :
                    calcResults.currentBmi < 30 ? 'border-[var(--accent-sand)] text-[var(--accent-sand)] bg-[var(--accent-sand)]/5' :
                    'border-[var(--accent-magenta)] text-[var(--accent-magenta)] bg-[var(--accent-magenta)]/5'
                  }`}>
                    {calcResults.currentBmi < 18.5 ? 'Maigreur' :
                     calcResults.currentBmi < 25 ? 'Normal' :
                     calcResults.currentBmi < 30 ? 'Surpoids' : 'Obésité'}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold border-t border-[var(--border-muted)]/40 pt-2">
                <span className="text-[var(--text-muted)]">Poids de forme (IMC 18.5 - 25) :</span>
                <span className="text-[var(--text)] font-bold">{Math.round(calcResults.healthyMinWeight)} - {Math.round(calcResults.healthyMaxWeight)} kg</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold border-t border-[var(--border-muted)]/40 pt-2">
                <span className="text-[var(--text-muted)]">Poids idéal (formule de Devine) :</span>
                <span className="text-[var(--text)] font-bold">{Math.round(calcResults.idealWeightDevine)} kg</span>
              </div>

              {goalType !== 'maintain' && parseFloat(targetWeight) > 0 && calcResults.weeksToTarget > 0 && (
                <div className="flex items-center justify-between text-xs font-semibold border-t border-[var(--border-muted)]/40 pt-2">
                  <span className="text-[var(--text-muted)]">Durée estimée ({Math.abs(parseFloat(targetWeight) - parseFloat(weight)).toFixed(1)} kg) :</span>
                  <span className="text-[var(--accent-powder)] font-extrabold">{calcResults.weeksToTarget} semaines</span>
                </div>
              )}
            </div>
          )}

          {/* Rythme de progression */}
          {goalType !== 'maintain' && (
            <div>
              <label className="brutal-label">Rythme de progression</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'very_slow', label: 'Tr. lent' },
                  { id: 'slow', label: 'Lent' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'fast', label: 'Rapide' },
                  { id: 'very_fast', label: 'Tr. rapide' }
                ].map(speed => (
                  <button key={speed.id} type="button" onClick={() => setGoalSpeed(speed.id)}
                    className={`py-2 px-0.5 border text-[9px] font-black uppercase rounded-xl transition-all duration-200 cursor-pointer text-center ${
                      goalSpeed === speed.id
                        ? 'border-[var(--accent-sand)] text-[var(--accent-sand)] bg-[var(--accent-sand)]/5 font-black shadow-[var(--shadow-subtle)]'
                        : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-semibold">
                {goalType === 'lose'
                  ? `Perte cible : ${
                      goalSpeed === 'very_slow' ? '0.15 kg/semaine (-150 kcal/jour)' :
                      goalSpeed === 'slow' ? '0.25 kg/semaine (-250 kcal/jour)' :
                      goalSpeed === 'normal' ? '0.50 kg/semaine (-500 kcal/jour)' :
                      goalSpeed === 'fast' ? '0.75 kg/semaine (-750 kcal/jour)' :
                      '1.00 kg/semaine (-1000 kcal/jour, min 1200 kcal)'
                    }`
                  : `Gain cible : ${
                      goalSpeed === 'very_slow' ? '0.10 kg/semaine (+100 kcal/jour)' :
                      goalSpeed === 'slow' ? '0.15 kg/semaine (+150 kcal/jour)' :
                      goalSpeed === 'normal' ? '0.25 kg/semaine (+250 kcal/jour)' :
                      goalSpeed === 'fast' ? '0.35 kg/semaine (+350 kcal/jour)' :
                      '0.50 kg/semaine (+500 kcal/jour)'
                    }`
                }
              </p>
            </div>
          )}

          {/* Répartition des Macronutriments */}
          {calcResults && (
            <div className="space-y-3 pt-3 border-t border-[var(--border-muted)]/40">
              <label className="brutal-label block mb-2">Répartition des Macronutriments</label>
              
              {/* Presets Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'balanced', label: 'Équilibré', desc: '50% G · 20% P · 30% L' },
                  { id: 'hyper', label: 'Hyper Protéiné', desc: '40% G · 30% P · 30% L' },
                  { id: 'lowcarb', label: 'Low Carb', desc: '25% G · 35% P · 40% L' },
                  { id: 'keto', label: 'Keto', desc: '5% G · 25% P · 70% L' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetChange(preset.id)}
                    className={`py-2 px-1 border text-[9px] font-black uppercase rounded-xl transition-all duration-200 cursor-pointer text-center flex flex-col justify-center gap-0.5 ${
                      macroRatioPreset === preset.id
                        ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--accent-powder)]/5 font-black shadow-[var(--shadow-subtle)]'
                        : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                    }`}
                    title={preset.desc}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[7px] text-[var(--text-muted)] font-medium normal-case block">
                      {preset.id === 'balanced' ? '50/20/30' : preset.id === 'hyper' ? '40/30/30' : preset.id === 'lowcarb' ? '25/35/40' : '5/25/70'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom percentages inputs */}
              <div className="grid grid-cols-3 gap-2.5 pt-1.5">
                {/* Protéines % */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase text-center">Protéines (%)</span>
                  <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
                    <button type="button" onClick={() => handlePercentChange('protein', proteinPercent - 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-r border-[var(--border)] cursor-pointer text-[var(--text)]">-</button>
                    <span className="flex-1 text-center text-xs font-bold text-[var(--text)]">{proteinPercent}%</span>
                    <button type="button" onClick={() => handlePercentChange('protein', proteinPercent + 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-l border-[var(--border)] cursor-pointer text-[var(--text)]">+</button>
                  </div>
                </div>

                {/* Glucides % */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase text-center">Glucides (%)</span>
                  <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
                    <button type="button" onClick={() => handlePercentChange('carb', carbPercent - 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-r border-[var(--border)] cursor-pointer text-[var(--text)]">-</button>
                    <span className="flex-1 text-center text-xs font-bold text-[var(--text)]">{carbPercent}%</span>
                    <button type="button" onClick={() => handlePercentChange('carb', carbPercent + 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-l border-[var(--border)] cursor-pointer text-[var(--text)]">+</button>
                  </div>
                </div>

                {/* Lipides % */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[var(--accent-sand)] block uppercase text-center">Lipides (%)</span>
                  <div className="flex items-center border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
                    <button type="button" onClick={() => handlePercentChange('fat', fatPercent - 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-r border-[var(--border)] cursor-pointer text-[var(--text)]">-</button>
                    <span className="flex-1 text-center text-xs font-bold text-[var(--text)]">{fatPercent}%</span>
                    <button type="button" onClick={() => handlePercentChange('fat', fatPercent + 5)} className="px-2.5 py-1.5 text-xs font-extrabold hover:bg-[var(--surface-raised)] border-l border-[var(--border)] cursor-pointer text-[var(--text)]">+</button>
                  </div>
                </div>
              </div>

              {/* Validation of sum */}
              {(() => {
                const totalPct = proteinPercent + carbPercent + fatPercent;
                if (totalPct !== 100) {
                  return (
                    <p className="text-[10px] text-[var(--accent-magenta)] font-bold mt-1 text-center animate-pulse">
                      ⚠️ La somme des macros doit être égale à 100% (Actuel : {totalPct}%)
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Live results */}
          {calcResults && (
            <div className="border border-[var(--border)] p-4 space-y-4 bg-[var(--surface-inset)] rounded-2xl shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-[var(--border-muted)] pb-3">
                <div>
                  <span className="brutal-label mb-0">
                    {goalType === 'lose' ? `Objectif (Déficit ${calcResults.calorieAdjustment} kcal)` :
                     goalType === 'gain' ? `Objectif (Surplus +${calcResults.calorieAdjustment} kcal)` :
                     'Objectif (Maintien)'}
                  </span>
                  <span className="text-xl font-extrabold text-[var(--accent-sand)] block mt-0.5">{calcResults.tdee} kcal/jour</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-dim)] font-medium block">BMR : {calcResults.bmr} kcal</span>
                  <span className="text-[10px] text-[var(--text-dim)] font-medium block mt-0.5">TDEE Maintien : {calcResults.tdee_raw} kcal</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                  <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">Protéines</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.protein}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">{proteinPercent}% · 4kcal/g</span>
                </div>
                <div className="p-2 border border-[var(--accent-powder)]/20 rounded-xl bg-[var(--accent-powder)]/5">
                  <span className="text-[9px] font-bold text-[var(--accent-powder)] block uppercase">Glucides</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.carbs}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">{carbPercent}% · 4kcal/g</span>
                </div>
                <div className="p-2 border border-[var(--accent-sand)]/20 rounded-xl bg-[var(--accent-sand)]/5">
                  <span className="text-[9px] font-bold text-[var(--accent-sand)] block uppercase">Lipides</span>
                  <span className="text-base font-extrabold text-[var(--text)]">{calcResults.fat}g</span>
                  <span className="text-[9px] text-[var(--text-dim)] block mt-0.5">{fatPercent}% · 9kcal/g</span>
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={updating || !calcResults || (proteinPercent + carbPercent + fatPercent !== 100)}
            className="brutal-btn w-full disabled:opacity-30 cursor-pointer"
            style={{ background: 'var(--accent-sand)', borderColor: 'var(--accent-sand)', color: 'var(--bg-dark-slate)' }}>
            {updating ? 'Enregistrement...' : 'Valider les objectifs'}
          </button>
        </form>

        {/* ===== CARD: SUGGESTION DE RECETTES ===== */}
        <div className="brutal-card p-6 mt-6 border-3 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5 mb-2 border-b border-[var(--border-muted)] pb-3">
            <span className="text-xl">🍳</span>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text)]">Recherche de recettes personnalisée</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-semibold uppercase mt-0.5">Trouvez des idées selon vos objectifs</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Calorie range */}
            <div className="space-y-2">
              <label className="brutal-label">Objectif Calorique par Repas</label>
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block mb-1">Min Calories</span>
                  <input 
                    type="number" 
                    placeholder="Ex: 300"
                    value={recMinCal}
                    onChange={(e) => setRecMinCal(e.target.value)}
                    className="brutal-input text-xs w-full py-2 px-3 bg-[var(--surface-inset)]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-dim)] block mb-1">Max Calories</span>
                  <input 
                    type="number" 
                    placeholder="Ex: 600"
                    value={recMaxCal}
                    onChange={(e) => setRecMaxCal(e.target.value)}
                    className="brutal-input text-xs w-full py-2 px-3 bg-[var(--surface-inset)]"
                  />
                </div>
              </div>

              {/* Quick Fill Suggestions */}
              {profile?.calorie_goal && (
                <div className="mt-2.5">
                  <span className="text-[9px] uppercase font-extrabold text-[var(--text-muted)] block mb-1.5">
                    Raccourcis (basés sur votre objectif de {profile.calorie_goal} kcal) :
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'breakfast', label: 'Matin', pMin: 0.15, pMax: 0.25 },
                      { id: 'lunch', label: 'Midi', pMin: 0.30, pMax: 0.40 },
                      { id: 'dinner', label: 'Soir', pMin: 0.30, pMax: 0.40 },
                      { id: 'snack', label: 'Snack', pMin: 0.05, pMax: 0.15 }
                    ].map(meal => {
                      const minVal = Math.round(profile.calorie_goal * meal.pMin);
                      const maxVal = Math.round(profile.calorie_goal * meal.pMax);
                      return (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => { setRecMinCal(minVal); setRecMaxCal(maxVal); }}
                          className="py-1.5 px-2 border border-[var(--border-muted)] hover:border-[var(--text-muted)] rounded-lg text-[9px] font-bold uppercase transition-all duration-200 cursor-pointer bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)] text-center"
                        >
                          {meal.label} <span className="block font-black text-[var(--text-dim)]">{minVal}-{maxVal}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Diet select */}
            <div className="space-y-2">
              <label className="brutal-label">Régime Alimentaire</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'omnivore', label: 'Omnivore' },
                  { id: 'végétarien', label: 'Végétarien' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'sans gluten', label: 'Sans Gluten' },
                  { id: 'keto', label: 'Cétogène' }
                ].map(diet => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() => setRecDiet(diet.id)}
                    className={`py-2 px-1 border text-[9px] font-black uppercase rounded-xl transition-all duration-200 cursor-pointer text-center ${
                      recDiet === diet.id
                        ? 'border-[var(--accent-pistachio)] text-[var(--accent-pistachio)] bg-[var(--accent-pistachio)]/5 shadow-[var(--shadow-subtle)]'
                        : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition preference */}
            <div className="space-y-2">
              <label className="brutal-label">Préférence Nutritionnelle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'none', label: 'Aucune' },
                  { id: 'high_protein', label: 'Protéines ⚡', desc: `> ${Math.round((profile?.protein_goal || 130) / 3)}g` },
                  { id: 'low_carb', label: 'Glucides 📉', desc: `< ${Math.round((profile?.carb_goal || 220) / 8)}g` },
                  { id: 'low_fat', label: 'Lipides 🥗', desc: `< ${Math.round((profile?.fat_goal || 65) / 4)}g` }
                ].map(macro => (
                  <button
                    key={macro.id}
                    type="button"
                    onClick={() => setRecMacroPref(macro.id)}
                    className={`py-2 px-1 border text-[9px] font-black uppercase rounded-xl transition-all duration-200 cursor-pointer text-center ${
                      recMacroPref === macro.id
                        ? 'border-[var(--accent-powder)] text-[var(--accent-powder)] bg-[var(--accent-powder)]/5 shadow-[var(--shadow-subtle)]'
                        : 'border-[var(--border-muted)] text-[var(--text-dim)] hover:border-[var(--text-muted)] bg-[var(--surface)]'
                    }`}
                  >
                    {macro.label}
                    {macro.desc && <span className="block text-[8px] font-normal text-[var(--text-dim)] mt-0.5">{macro.desc}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch search button */}
            <button
              type="button"
              onClick={() => {
                const filters = {
                  query: recDiet === 'omnivore' ? '' : recDiet,
                  caloriesMin: recMinCal,
                  caloriesMax: recMaxCal,
                  proteinMin: recMacroPref === 'high_protein' ? Math.round((profile?.protein_goal || 130) / 3) : '',
                  carbsMax: recMacroPref === 'low_carb' ? Math.round((profile?.carb_goal || 220) / 8) : '',
                  fatMax: recMacroPref === 'low_fat' ? Math.round((profile?.fat_goal || 65) / 4) : '',
                  filterKeto: recMacroPref === 'low_carb' || recDiet === 'keto',
                  filterHighProtein: recMacroPref === 'high_protein',
                  filterLight: parseFloat(recMaxCal) <= 400 || recDiet === 'light',
                  showAdvancedFilters: true
                };
                if (onRecipeSearch) {
                  onRecipeSearch(filters);
                }
              }}
              className="brutal-btn-accent w-full py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer mt-2 text-center"
              style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}
            >
              Rechercher des recettes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
