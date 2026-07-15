import { Link } from 'react-router-dom';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  detail?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaVisible?: boolean;
}

export function EmptyState({
  message,
  detail,
  ctaLabel,
  ctaHref = '/markets',
  ctaVisible = true,
}: EmptyStateProps) {
  return (
    <div className={styles.state} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="8" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 18h14M13 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className={styles.message}>{message}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
      {ctaVisible && ctaLabel && (
        <Link to={ctaHref} className={`btn-pill btn-pill-dark ${styles.cta}`}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
