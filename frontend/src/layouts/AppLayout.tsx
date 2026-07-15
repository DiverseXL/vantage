import { Outlet } from 'react-router-dom';
import { AppNav } from '../components/app/AppNav';
import { AppFooter } from '../components/app/AppFooter';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <AppNav />
      <main className={styles.main} id="main-content">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
