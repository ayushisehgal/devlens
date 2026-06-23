import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import styles from './CommitChart.module.css';

const TEAL = '#0F6E56';
const TEAL_LIGHT = '#1a9a78';
const BAR_DEFAULT = '#1a9a78';
const BAR_SELECTED = '#0F6E56';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>
        <span className={styles.tooltipDot} />
        {payload[0].value} commits
      </div>
    </div>
  );
}

export default function CommitChart({ data, loading }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = data && data.length > 0 ? data : generatePlaceholder();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.cardTitle}>Commit Activity</h3>
          <p className={styles.cardSubtitle}>Last 30 days</p>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendDot} />
          <span>Commits</span>
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingBars}>
            {[45, 70, 30, 80, 55, 65, 40, 75, 50, 60].map((h, i) => (
              <div key={i} className={styles.loadingBar} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="35%" onClick={(e) => {
            if (e?.activeTooltipIndex !== undefined) {
              setActiveIndex(e.activeTooltipIndex === activeIndex ? null : e.activeTooltipIndex);
            }
          }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#8a8a8a' }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#8a8a8a' }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,110,86,0.06)' }} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={index === activeIndex ? BAR_SELECTED : BAR_DEFAULT}
                  opacity={activeIndex !== null && index !== activeIndex ? 0.45 : 1}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s, fill 0.15s' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function generatePlaceholder() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      count: Math.floor(Math.random() * 18) + 1,
    });
  }
  return days;
}
