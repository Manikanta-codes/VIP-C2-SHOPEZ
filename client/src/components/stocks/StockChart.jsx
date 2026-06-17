import { useState, useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TIME_RANGES = ['1W', '1M', '3M', 'ALL'];

const filterByRange = (data, range) => {
  if (!data || data.length === 0) return [];
  const now = new Date();
  const cutoff = new Date();
  if (range === '1W') cutoff.setDate(now.getDate() - 7);
  else if (range === '1M') cutoff.setDate(now.getDate() - 30);
  else if (range === '3M') cutoff.setDate(now.getDate() - 90);
  else return data; // ALL
  return data.filter(d => new Date(d.date) >= cutoff);
};

export default function StockChart({ historicalData = [], symbol = '', isUp = true }) {
  const [range, setRange] = useState('1M');
  const chartRef = useRef(null);

  const lineColor   = isUp ? '#66bb6a' : '#ef5350';
  const gradientStr = isUp ? 'rgba(102,187,106,' : 'rgba(239,83,80,';

  const filtered = useMemo(() => filterByRange(historicalData, range), [historicalData, range]);

  const chartData = useMemo(() => {
    const labels = filtered.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const prices = filtered.map(d => Number(d.close || 0));

    return {
      labels,
      datasets: [{
        label: 'Price',
        data: prices,
        borderColor: lineColor,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: (ctx) => {
          const { chartArea, ctx: canvasCtx } = ctx.chart;
          if (!chartArea) return 'transparent';
          const g = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          g.addColorStop(0,   `${gradientStr}0.25)`);
          g.addColorStop(0.6, `${gradientStr}0.06)`);
          g.addColorStop(1,   `${gradientStr}0)`);
          return g;
        },
        tension: 0.4,
      }],
    };
  }, [filtered, lineColor, gradientStr]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22,27,34,0.96)',
        titleColor: '#e6edf3',
        bodyColor: '#8b949e',
        borderColor: '#30363d',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: items => items[0]?.label || '',
          label: item => {
            const pt = filtered[item.dataIndex];
            const lines = [`Close: $${Number(pt?.close || item.raw).toFixed(2)}`];
            if (pt?.open)   lines.push(`Open:  $${Number(pt.open).toFixed(2)}`);
            if (pt?.high)   lines.push(`High:  $${Number(pt.high).toFixed(2)}`);
            if (pt?.low)    lines.push(`Low:   $${Number(pt.low).toFixed(2)}`);
            if (pt?.volume) lines.push(`Vol:   ${(pt.volume / 1e6).toFixed(2)}M`);
            return lines;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(48,54,61,0.25)', drawBorder: false },
        ticks: { color: '#6e7681', font: { size: 11 }, maxTicksLimit: 8, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        position: 'right',
        grid: { color: 'rgba(48,54,61,0.25)', drawBorder: false },
        ticks: { color: '#6e7681', font: { size: 11 }, callback: v => `$${v.toFixed(0)}` },
        border: { display: false },
      },
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h6 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Price Chart · {symbol}
        </h6>
        <div className="chart-time-selector">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              className={`chart-time-btn ${range === r ? 'active' : ''}`}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 340, position: 'relative' }}>
        {filtered.length === 0 ? (
          <div className="skeleton" style={{ height: '100%' }} />
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
