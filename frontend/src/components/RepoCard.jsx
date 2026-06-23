import styles from './MetricCard.module.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
};

export function getLanguageColor(lang) {
  return LANG_COLORS[lang] || '#8a8a8a';
}

export default function RepoCard({ repo, selected, onClick }) {
  const color = getLanguageColor(repo.language);
  return (
    <button
      className={`${styles.repoCard} ${selected ? styles.selected : ''}`}
      onClick={() => onClick(repo)}
    >
      <div className={styles.repoTop}>
        <span className={styles.langDot} style={{ background: color }} />
        <span className={styles.repoName}>{repo.name}</span>
      </div>
      <div className={styles.repoMeta}>
        <span className={styles.repoLang}>{repo.language || 'Unknown'}</span>
        <span className={styles.repoStars}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          {(repo.stars || repo.stargazers_count || 0).toLocaleString()}
        </span>
      </div>
    </button>
  );
}
