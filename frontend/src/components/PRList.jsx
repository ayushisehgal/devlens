import styles from './PRList.module.css';

const STATUS_CONFIG = {
  open: { label: 'Open', className: 'statusOpen' },
  merged: { label: 'Merged', className: 'statusMerged' },
  stale: { label: 'Stale', className: 'statusStale' },
  closed: { label: 'Closed', className: 'statusClosed' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function PRList({ prs, loading }) {
  const items = prs && prs.length > 0 ? prs : PLACEHOLDER_PRS;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Recent Pull Requests</h3>
        <span className={styles.count}>{items.length} PRs</span>
      </div>
      <div className={styles.list}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))
        ) : items.length === 0 ? (
          <div className={styles.empty}>No pull requests found</div>
        ) : (
          items.map((pr, i) => {
            const status = STATUS_CONFIG[pr.state] || STATUS_CONFIG.closed;
            return (
              <div key={pr.id || i} className={styles.prRow}>
                <div className={styles.prTop}>
                  <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                    {status.label}
                  </span>
                  <span className={styles.prTime}>{timeAgo(pr.updated_at || pr.created_at)}</span>
                </div>
                <div className={styles.prTitle}>{pr.title}</div>
                {pr.repo && <div className={styles.prRepo}>{pr.repo}</div>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const PLACEHOLDER_PRS = [
  { id: 1, title: 'feat: add OAuth2 integration for GitHub login', state: 'open', updated_at: new Date(Date.now() - 3600000).toISOString(), repo: 'devlens/backend' },
  { id: 2, title: 'fix: resolve memory leak in commit fetcher', state: 'merged', updated_at: new Date(Date.now() - 86400000).toISOString(), repo: 'devlens/backend' },
  { id: 3, title: 'chore: update dependency versions across packages', state: 'stale', updated_at: new Date(Date.now() - 86400000 * 8).toISOString(), repo: 'devlens/frontend' },
  { id: 4, title: 'refactor: extract chart components to shared lib', state: 'closed', updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), repo: 'devlens/frontend' },
  { id: 5, title: 'feat: language breakdown panel with live data', state: 'open', updated_at: new Date(Date.now() - 7200000).toISOString(), repo: 'devlens/frontend' },
];
