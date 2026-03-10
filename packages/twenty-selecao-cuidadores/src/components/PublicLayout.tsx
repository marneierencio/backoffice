import { Outlet } from 'react-router-dom';
import styles from './PublicLayout.module.css';

export const PublicLayout = () => (
  <div className={styles.layout}>
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <span className={styles.logo}>Amei Care</span>
        <span className={styles.separator}>|</span>
        <span className={styles.title}>Seleção de Cuidadores</span>
      </div>
    </header>
    <main className={styles.main}>
      <Outlet />
    </main>
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Erencio.com - Todos os direitos reservados.</p>
    </footer>
  </div>
);
