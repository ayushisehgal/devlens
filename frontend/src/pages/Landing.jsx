import { loginWithGitHub } from '../api/index.js';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#0F6E56"/>
              <path d="M2 17l10 5 10-5" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 12l10 5 10-5" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>DevLens</span>
        </div>
        <h1 className={styles.headline}>
          Real-time GitHub analytics<br />for your repos
        </h1>
        <p className={styles.subtext}>
          Gain deep insights into your commit history, pull requests, and<br />
          repository health — all in one beautiful dashboard.
        </p>
        <button className={styles.loginBtn} onClick={loginWithGitHub}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Login with GitHub
        </button>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon} style={{ background: '#e1f5ee' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span>Commit Trends</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon} style={{ background: '#ede9fe' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M6 9v12"/>
              </svg>
            </div>
            <span>PR Analytics</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon} style={{ background: '#dbeafe' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <span>Repo Overview</span>
          </div>
        </div>
      </div>
    </div>
  );
}
