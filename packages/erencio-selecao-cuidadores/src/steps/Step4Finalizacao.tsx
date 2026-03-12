import { type Step4Data } from '@selecao/types/candidatura';
import styles from './Step4Finalizacao.module.css';

export type Step4Errors = Partial<Record<keyof Step4Data, string>>;

type Step4Props = {
  data: Step4Data;
  onChange: (updates: Partial<Step4Data>) => void;
  errors: Step4Errors;
};

export const Step4Finalizacao = ({ data, onChange, errors }: Step4Props) => (
  <div className={styles.stepContent}>
    <div className={styles.reviewBanner}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
          fill="var(--backoffice-g-color-info-base-50)"
        />
      </svg>
      <p>
        Revise suas informações antes de enviar. Ao finalizar, sua candidatura será registrada e
        nossa equipe entrará em contato em breve.
      </p>
    </div>

    <fieldset className={styles.section}>
      <legend className={styles.sectionTitle}>Declarações</legend>

      <div className={styles.declarations}>
        <div className={styles.declarationItem}>
          <label className={`selecao-checkbox-label ${styles.declarationLabel}`}>
            <input
              type="checkbox"
              checked={data.declaraVerdade}
              onChange={(e) => onChange({ declaraVerdade: e.target.checked })}
            />
            <span>
              <strong>Declaro que todas as informações fornecidas neste formulário são verdadeiras</strong> e
              estou ciente de que a prestação de informações falsas poderá resultar na eliminação do processo seletivo.
            </span>
          </label>
          {errors.declaraVerdade && (
            <p className={styles.fieldError} role="alert">{errors.declaraVerdade}</p>
          )}
        </div>

        <div className={styles.declarationItem}>
          <label className={`selecao-checkbox-label ${styles.declarationLabel}`}>
            <input
              type="checkbox"
              checked={data.aceitaComunicacoes}
              onChange={(e) => onChange({ aceitaComunicacoes: e.target.checked })}
            />
            <span>
              Aceito receber divulgações e conteúdos promocionais da <strong>Amei Care</strong> por
              e-mail, SMS ou WhatsApp. Você pode cancelar a qualquer momento.
            </span>
          </label>
        </div>
      </div>
    </fieldset>
  </div>
);

export const validateStep4 = (data: Step4Data): Step4Errors => {
  const errors: Step4Errors = {};

  if (!data.declaraVerdade) {
    errors.declaraVerdade = 'Você deve declarar que as informações são verdadeiras para prosseguir';
  }

  return errors;
};
