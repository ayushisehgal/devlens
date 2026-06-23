import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import CommitChart from '../components/CommitChart.jsx';
import RepoCard from '../components/RepoCard.jsx';
import MetricCard from '../components/MetricCard.jsx';
import PRList from '../components/PRList.jsx';
import LanguageBar from '../components/LanguageBar.jsx';
import { syncRepos, getRepos, getCommits, getPRs } from '../api/index.js';
import styles from './Dashboard.module.css';

const TABS = ['Overview', 'This month', 'All time'];

function RepoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h18v4H3z"/><path d="M3 11h18v4H3z"/>
    </svg>
  );
}
function CommitIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/>
    </svg>
  );
}
function PRIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>
    </svg>
  );
}
function StarIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function SyncIcon({ spinning }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: spinning ? 'spin 0.8s linear infinite' : 'none' }}>
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function AlertTriangleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

// Maps sidebar URL paths to a simple "view" name
function pathToView(pathname) {
  if (pathname.includes('/repos')) return 'repos';
  if (pathname.includes('/pulls')) return 'pulls';
  if (pathname.includes('/commits')) return 'commits';
  if (pathname.includes('/alerts')) return 'alerts';
  if (pathname.includes('/monitoring')) return 'monitoring';
  if (pathname.includes('/settings')) return 'settings';
  return 'overview';
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [prs, setPRs] = useState([]);
  const [summary, setSummary] = useState({ total_repos: 0, total_stars: 0, commits_30d: 0, open_prs: 0 });
  const [syncing, setSyncing] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const view = pathToView(location.pathname);

  // Save JWT token from GitHub OAuth redirect
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('devlens_token', token);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const data = await getRepos();
      setRepos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Could not load repos. Make sure you are logged in.');
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/repos/stats/summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('devlens_token')}` }
      });
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      // keep zeros if it fails
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alerts/stale-prs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('devlens_token')}` }
      });
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      // keep empty
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncRepos();
      await loadRepos();
      await loadSummary();
      await loadAlerts();
    } catch (e) {
      setError('Failed to sync repositories. Check backend is running.');
    } finally {
      setSyncing(false);
    }
  };

  const handleRepoClick = async (repo) => {
    setSelectedRepo(repo);
    setLoadingCommits(true);
    setLoadingPRs(true);
    try {
      const [commitData, prData] = await Promise.all([
        getCommits(repo.id).catch(() => []),
        getPRs(repo.id).catch(() => []),
      ]);
      setCommits(Array.isArray(commitData) ? commitData : []);
      setPRs(Array.isArray(prData) ? prData : []);
    } finally {
      setLoadingCommits(false);
      setLoadingPRs(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devlens_token');
    window.location.href = '/';
  };

  useEffect(() => {
    loadRepos();
    loadSummary();
    loadAlerts();
  }, [loadRepos, loadSummary, loadAlerts]);

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        alertCount={alerts.length}
      />

      {sidebarCollapsed && (
        <button className={styles.mobileMenuBtn} onClick={() => setSidebarCollapsed(false)}>
          <MenuIcon />
        </button>
      )}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.tabSwitcher}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.topbarRight}>
            {syncing && <span className={styles.syncingText}>Syncing...</span>}
            <button className={styles.syncBtn} onClick={handleSync} disabled={syncing}>
              <SyncIcon spinning={syncing} />
              Sync repos
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div className={styles.content}>

          {/* OVERVIEW VIEW */}
          {view === 'overview' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>
                  {selectedRepo ? selectedRepo.name : 'Overview'}
                </h2>
                <p className={styles.pageSubtitle}>
                  {selectedRepo
                    ? `${selectedRepo.language || 'Unknown'} · ${(selectedRepo.stars || 0).toLocaleString()} stars`
                    : `${repos.length} repositories · Last updated just now`}
                </p>
              </div>

              <div className={styles.metricsGrid}>
                <MetricCard label="Total Repos" value={summary.total_repos} icon={<RepoIcon />} color="#185FA5" />
                <MetricCard label="Commits (30d)" value={summary.commits_30d} icon={<CommitIconSm />} color="#0F6E56" />
                <MetricCard label="Open PRs" value={summary.open_prs} icon={<PRIconSm />} color="#534AB7" />
                <MetricCard label="Total Stars" value={summary.total_stars} icon={<StarIconSm />} color="#854F0B" />
              </div>

              <div className={styles.mainGrid}>
                <div className={styles.leftCol}>
                  <CommitChart data={commits} loading={loadingCommits} />

                  <div className={styles.repoPanel}>
                    <div className={styles.repoPanelHeader}>
                      <h3 className={styles.panelTitle}>Repositories</h3>
                      <span className={styles.panelCount}>
                        {loadingRepos ? '—' : repos.length} repos
                      </span>
                    </div>
                    <div className={styles.repoList}>
                      {loadingRepos ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={styles.repoSkeleton} />
                        ))
                      ) : repos.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#888', padding: '12px 0' }}>
                          No repos yet — click "Sync repos" above.
                        </p>
                      ) : (
                        repos.map((repo) => (
                          <RepoCard
                            key={repo.id}
                            repo={repo}
                            selected={selectedRepo?.id === repo.id}
                            onClick={handleRepoClick}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.rightCol}>
                  <PRList prs={prs} loading={loadingPRs} />
                  <LanguageBar repos={repos} loading={loadingRepos} />
                </div>
              </div>
            </>
          )}

          {/* REPOSITORIES VIEW */}
          {view === 'repos' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Repositories</h2>
                <p className={styles.pageSubtitle}>{repos.length} repositories synced from GitHub</p>
              </div>
              <div className={styles.repoList}>
                {loadingRepos ? (
                  <p>Loading...</p>
                ) : repos.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#888' }}>No repos yet — click "Sync repos" above.</p>
                ) : (
                  repos.map((repo) => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      selected={selectedRepo?.id === repo.id}
                      onClick={handleRepoClick}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* PULL REQUESTS VIEW */}
          {view === 'pulls' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Pull Requests</h2>
                <p className={styles.pageSubtitle}>
                  {selectedRepo ? `Showing PRs for ${selectedRepo.name}` : 'Select a repo from Overview to see its PRs'}
                </p>
              </div>
              <PRList prs={prs} loading={loadingPRs} />
            </>
          )}

          {/* COMMITS VIEW */}
          {view === 'commits' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Commits</h2>
                <p className={styles.pageSubtitle}>
                  {selectedRepo ? `Showing commits for ${selectedRepo.name}` : 'Select a repo from Overview to see its commits'}
                </p>
              </div>
              <CommitChart data={commits} loading={loadingCommits} />
            </>
          )}

          {/* ALERTS VIEW */}
          {view === 'alerts' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Alerts</h2>
                <p className={styles.pageSubtitle}>Pull requests open for more than 48 hours</p>
              </div>
              {loadingAlerts ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Loading...</p>
              ) : alerts.length === 0 ? (
                <div className={styles.repoPanel} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px' }}>
                  <span style={{ color: '#0F6E56' }}><CheckCircleIcon /></span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    No stale PRs right now — nice work staying on top of reviews.
                  </span>
                </div>
              ) : (
                <div className={styles.repoPanel}>
                  {alerts.map((pr) => (
                    <div
                      key={pr.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '12px 14px',
                        borderBottom: '0.5px solid var(--color-border-tertiary)'
                      }}
                    >
                      <span style={{ color: '#854F0B', marginTop: 2 }}><AlertTriangleIcon /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {pr.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                          {pr.repo_name} · opened {new Date(pr.opened_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* MONITORING VIEW */}
          {view === 'monitoring' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Monitoring</h2>
                <p className={styles.pageSubtitle}>Live backend metrics via Prometheus + Grafana Cloud</p>
              </div>
              <iframe
                src="https://valiantlifeboat294.grafana.net/public-dashboards/3622f63f5a6046a1a59d2518ebb1a8db"
                width="100%"
                height="600"
                frameBorder="0"
                style={{ borderRadius: 12, border: '1px solid var(--color-border-tertiary)' }}
                title="DevLens live backend metrics"
              />
            </>
          )}
              
              

          {/* SETTINGS VIEW */}
          {view === 'settings' && (
            <>
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Settings</h2>
                <p className={styles.pageSubtitle}>Manage your account</p>
              </div>
              <div className={styles.repoPanel} style={{ maxWidth: 420, padding: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 0, marginBottom: 14 }}>
                  Signed in via GitHub OAuth. Logging out will clear your local session token.
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '0.5px solid var(--color-border-secondary)',
                    background: 'transparent',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  <LogoutIcon /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}