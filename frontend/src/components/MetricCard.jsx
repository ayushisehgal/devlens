import styles from './MetricCard.module.css';

export default function MetricCard({ label, value, delta, deltaLabel, icon, color }) {
  const hasDelta = typeof delta === 'number' && !isNaN(delta);
  const isPositive = delta >= 0;

  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <span className={styles.metricLabel}>{label}</span>
        <div className={styles.metricIconWrap} style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <div className={styles.metricValue}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {hasDelta && (
        <div className={styles.metricDelta}>
          <span className={`${styles.deltaChip} ${isPositive ? styles.deltaPos : styles.deltaNeg}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
          <span className={styles.deltaLabel}>{deltaLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
