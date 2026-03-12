import styles from './StepIndicator.module.css';

type StepIndicatorProps = {
  currentStep: number; // 1-based
  totalSteps: number;
  labels: string[];
};

export const StepIndicator = ({ currentStep, totalSteps, labels }: StepIndicatorProps) => (
  <nav className={styles.stepper} aria-label="Etapas do formulário">
    {Array.from({ length: totalSteps }, (_, i) => {
      const stepNumber = i + 1;
      const isCompleted = stepNumber < currentStep;
      const isCurrent = stepNumber === currentStep;

      return (
        <div
          key={stepNumber}
          className={`${styles.step} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
          aria-current={isCurrent ? 'step' : undefined}
        >
          <div className={styles.circle}>
            {isCompleted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
              </svg>
            ) : (
              <span>{stepNumber}</span>
            )}
          </div>
          <span className={styles.label}>{labels[i]}</span>
          {stepNumber < totalSteps && <div className={styles.connector} aria-hidden="true" />}
        </div>
      );
    })}
  </nav>
);
