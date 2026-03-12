import styles from './ConfirmacaoPage.module.css';

export const ConfirmacaoPage = () => (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.iconCircle}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="var(--backoffice-g-color-success-base-50)"
          />
        </svg>
      </div>
      <h1 className={styles.heading}>Candidatura enviada!</h1>
      <p className={styles.message}>
        Seus dados foram recebidos com sucesso. Entraremos em contato em breve
        com informações sobre o processo de seleção.
      </p>
      <a href="#/" className={styles.link}>
        Enviar outra candidatura
      </a>
    </div>
  </div>
);
