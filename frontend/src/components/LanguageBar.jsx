import { getLanguageColor } from './RepoCard';
import styles from './LanguageBar.module.css';

export default function LanguageBar({ repos, loading }) {
  const langMap = {};
  (repos || []).forEach((repo) => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const total = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(langMap)
    .map(([lang, count]) => ({ lang, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const displayData = sorted.length > 0 ? sorted : PLACEHOLDER_LANGS;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Language Breakdown</h3>
        <span className={styles.repoCount}>{repos?.length || 0} repos</span>
      </div>
      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))
        ) : (
          displayData.map(({ lang, pct }) => (
            <div key={lang} className={styles.langRow}>
              <div className={styles.langMeta}>
                <span className={styles.langDot} style={{ background: getLanguageColor(lang) }} />
                <span className={styles.langName}>{lang}</span>
                <span className={styles.langPct}>{pct}%</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${pct}%`, background: getLanguageColor(lang) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const PLACEHOLDER_LANGS = [
  { lang: 'TypeScript', pct: 42 },
  { lang: 'JavaScript', pct: 28 },
  { lang: 'Python', pct: 14 },
  { lang: 'Go', pct: 9 },
  { lang: 'CSS', pct: 7 },
];
