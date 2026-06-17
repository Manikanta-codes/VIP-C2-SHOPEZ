import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#1a237e','#00bfa5','#ffc107','#ef5350','#66bb6a','#3949ab','#1de9b6','#ff867c','#80cbc4','#ce93d8'];

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export default function ProfitLossChart({ holdings }) {
  if (!holdings || holdings.length === 0) return null;

  const totalValue = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);

  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [{
      data: holdings.map(h => h.currentValue || 0),
      backgroundColor: COLORS.slice(0, holdings.length),
      borderColor: '#0d1117',
      borderWidth: 3,
      hoverBorderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8b949e',
          padding: 16,
          font: { size: 12 },
          generateLabels: (chart) => {
            const { data } = chart;
            return data.labels.map((label, i) => ({
              text: `${label}  ${((data.datasets[0].data[i] / totalValue) * 100).toFixed(1)}%`,
              fillStyle: COLORS[i % COLORS.length],
              strokeStyle: COLORS[i % COLORS.length],
              lineWidth: 0,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / totalValue) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  // Center text plugin
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw(chart) {
      const { width, height, ctx } = chart;
      ctx.restore();
      ctx.font = '600 14px Inter';
      ctx.fillStyle = '#8b949e';
      ctx.textAlign = 'center';
      ctx.fillText('Total Value', width / 2, height / 2 - 10);
      ctx.font = '700 20px Inter';
      ctx.fillStyle = '#e6edf3';
      ctx.fillText(fmt(totalValue), width / 2, height / 2 + 16);
      ctx.save();
    },
  };

  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}
