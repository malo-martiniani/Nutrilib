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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function WeightTracker({ token, onWeightChange }) {
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const fetchWeightHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/weight', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setWeightHistory(await response.json()); }
    } catch (err) { console.error('Erreur historique poids:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWeightHistory(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || !date) return;
    setError('');
    setSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ weight, entry_date: date })
      });
      if (response.ok) {
        setWeight('');
        fetchWeightHistory();
        if (onWeightChange) onWeightChange();
      } else {
        const err = await response.json();
        setError(err.message || 'Erreur.');
      }
    } catch (err) { setError('Erreur réseau.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette mesure ?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/weight/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setWeightHistory(weightHistory.filter(w => w.id !== id));
        if (onWeightChange) onWeightChange();
      }
    } catch (err) { console.error(err); }
  };

  const getWeightChangeStats = () => {
    if (weightHistory.length < 2) return null;
    const first = parseFloat(weightHistory[0].weight);
    const last = parseFloat(weightHistory[weightHistory.length - 1].weight);
    const diff = last - first;
    return { diff: diff.toFixed(1), isDown: diff < 0, percent: ((diff / first) * 100).toFixed(1) };
  };

  const changeStats = getWeightChangeStats();

  const chartData = {
    labels: weightHistory.map(w => {
      const d = new Date(w.entry_date);
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }),
    datasets: [{
      label: 'Poids (kg)',
      data: weightHistory.map(w => parseFloat(w.weight)),
      borderColor: '#d2f0c0', // Pistachio
      backgroundColor: 'rgba(210, 240, 192, 0.06)',
      borderWidth: 3,
      tension: 0.35,
      fill: true,
      pointBackgroundColor: '#d2f0c0',
      pointBorderColor: '#182030', // surface color
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#182030', // surface color
        titleColor: '#cbd5e1', // text-muted
        bodyColor: '#faf8f5', // text
        borderColor: 'rgba(148, 163, 184, 0.12)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 16,
        displayColors: false,
        titleFont: { family: 'Space Grotesk', weight: 700, size: 10 },
        bodyFont: { family: 'Space Grotesk', weight: 800, size: 13 },
        callbacks: { label: (context) => ` ${context.parsed.y} kg` }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.04)', lineWidth: 1 },
        ticks: { color: '#64748b', font: { family: 'Space Grotesk', size: 10, weight: 500 } },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Space Grotesk', size: 10, weight: 500 } },
        border: { display: false }
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="brutal-spinner"></div></div>;
  }

  return (
    <div className="space-y-6">

      {/* Input form */}
      <div className="brutal-card space-y-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 text-[var(--text)]">
          <Scale className="w-4 h-4 text-[var(--accent-powder)]" /> Saisie du poids
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="brutal-label">Poids (kg)</label>
              <input type="number" step="0.1" min="20" max="300" required value={weight}
                onChange={(e) => setWeight(e.target.value)} placeholder="78.5" className="brutal-input" />
            </div>
            <div>
              <label className="brutal-label">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="brutal-input" />
            </div>
          </div>
          {error && <p className="text-xs text-[var(--accent-magenta)] font-bold">{error}</p>}
          <button type="submit" disabled={saving} className="brutal-btn-accent w-full cursor-pointer" style={{ backgroundColor: 'var(--accent-pistachio)', color: 'var(--bg-dark-slate)' }}>
            <Plus className="w-4 h-4" /> Enregistrer
          </button>
        </form>
      </div>

      {/* Chart */}
      <div className="brutal-card space-y-4">
        <div className="flex items-start justify-between border-b border-[var(--border-muted)] pb-3">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Courbe d'évolution</h3>
            <p className="text-[10px] text-[var(--text-dim)]">Variations de poids au fil du temps</p>
          </div>
          {changeStats && (
            <span className={`brutal-tag text-[10px] ${
              changeStats.isDown
                ? 'text-[var(--accent-pistachio)]'
                : 'text-[var(--accent-magenta)]'
            }`} style={{ borderColor: changeStats.isDown ? 'var(--accent-pistachio)' : 'var(--accent-magenta)' }}>
              {changeStats.isDown ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {changeStats.diff > 0 ? `+${changeStats.diff}` : changeStats.diff} kg ({changeStats.percent}%)
            </span>
          )}
        </div>
        <div className="min-h-[280px] relative">
          {weightHistory.length < 2 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-dim)] space-y-3">
              <Scale className="w-10 h-10" />
              <p className="text-sm font-bold uppercase tracking-wider">Min. 2 mesures requises</p>
            </div>
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* History list */}
      <div className="brutal-card space-y-3">
        <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-muted)] pb-3">
          <Calendar className="w-4 h-4 text-[var(--accent-powder)]" /> Historique
        </h3>
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {weightHistory.length === 0 ? (
            <p className="text-xs text-[var(--text-dim)] text-center py-8 font-medium">Aucun historique.</p>
          ) : (
            [...weightHistory].reverse().map((w) => {
              const displayDate = new Date(w.entry_date).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              });
              return (
                <div key={w.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-muted)] transition-colors duration-200">
                  <div>
                    <span className="font-extrabold text-sm text-[var(--text)]">{w.weight} kg</span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{displayDate}</span>
                  </div>
                  <button onClick={() => handleDelete(w.id)} className="brutal-btn-danger">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
