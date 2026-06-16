import React, { useState, useEffect } from 'react';
import { Scale, Calendar, Trash2, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function WeightTracker({ token, onWeightChange }) {
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulaire de saisie
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/weight', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWeightHistory(data);
      }
    } catch (err) {
      console.error('Erreur historique poids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightHistory();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !date) return;
    setError('');
    setSaving(true);

    try {
      const response = await fetch('http://localhost:5000/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weight, entry_date: date })
      });

      if (response.ok) {
        setWeight('');
        fetchWeightHistory();
        if (onWeightChange) onWeightChange();
      } else {
        const err = await response.json();
        setError(err.message || 'Erreur lors de l\'enregistrement.');
      }
    } catch (err) {
      setError('Erreur réseau.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette mesure de poids ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/weight/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setWeightHistory(weightHistory.filter(w => w.id !== id));
        if (onWeightChange) onWeightChange();
      }
    } catch (err) {
      console.error('Erreur suppression poids:', err);
    }
  };

  // Calculer l'évolution globale
  const getWeightChangeStats = () => {
    if (weightHistory.length < 2) return null;
    const first = parseFloat(weightHistory[0].weight);
    const last = parseFloat(weightHistory[weightHistory.length - 1].weight);
    const diff = last - first;
    return {
      diff: diff.toFixed(1),
      isDown: diff < 0,
      percent: ((diff / first) * 100).toFixed(1)
    };
  };

  const changeStats = getWeightChangeStats();

  // Configurer le graphique Chart.js
  const chartData = {
    labels: weightHistory.map(w => {
      const d = new Date(w.entry_date);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }),
    datasets: [
      {
        label: 'Poids (kg)',
        data: weightHistory.map(w => parseFloat(w.weight)),
        borderColor: '#10b981', // Emerald-500
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          return gradient;
        },
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a', // Slate-900
        titleColor: '#94a3b8',
        bodyColor: '#ffffff',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => ` ${context.parsed.y} kg`
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.3)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
      
      {/* Saisie & Historique */}
      <div className="space-y-6 lg:col-span-1">
        {/* Formulaire Saisie */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Scale className="w-4 h-4 text-emerald-400" /> Saisie du jour
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold block">Poids (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="78.5"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-700 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-semibold block">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Enregistrer le poids
            </button>
          </form>
        </div>

        {/* Historique Liste */}
        <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl space-y-4 max-h-[350px] flex flex-col overflow-hidden">
          <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-emerald-400" /> Historique
          </h3>

          <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
            {weightHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-8">Aucun historique de poids enregistré.</p>
            ) : (
              [...weightHistory].reverse().map((w) => {
                const displayDate = new Date(w.entry_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                return (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900/50 hover:bg-slate-900/20 transition-all">
                    <div>
                      <span className="font-bold text-slate-250 text-sm">{w.weight} kg</span>
                      <span className="text-[10px] text-slate-500 block">{displayDate}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1.5 rounded-lg text-slate-650 hover:text-rose-450 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Graphique d'Évolution */}
      <div className="lg:col-span-2 bg-slate-900/30 p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col justify-between min-h-[400px]">
        <div className="flex items-start justify-between border-b border-slate-900 pb-4">
          <div>
            <h3 className="font-bold text-slate-200 text-base">Courbe d'évolution du poids</h3>
            <p className="text-xs text-slate-500">Visualisation des variations de poids au fil du temps</p>
          </div>
          
          {changeStats && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              changeStats.isDown 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {changeStats.isDown ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span>{changeStats.diff > 0 ? `+${changeStats.diff}` : changeStats.diff} kg ({changeStats.percent}%)</span>
            </div>
          )}
        </div>

        {/* Le Graphique */}
        <div className="flex-1 min-h-[280px] mt-6 relative">
          {weightHistory.length < 2 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Scale className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-sm">Entrez au moins 2 mesures de poids pour tracer le graphique.</p>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

    </div>
  );
}
