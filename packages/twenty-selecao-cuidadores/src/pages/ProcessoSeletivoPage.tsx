import { StepIndicator } from '@selecao/components/StepIndicator';
import { type Step1Errors, Step1Identificacao, validateStep1 } from '@selecao/steps/Step1Identificacao';
import { type Step2Errors, Step2Experiencia, validateStep2 } from '@selecao/steps/Step2Experiencia';
import { type Step3Errors, Step3Questionario, validateStep3 } from '@selecao/steps/Step3Questionario';
import { type Step4Errors, Step4Finalizacao, validateStep4 } from '@selecao/steps/Step4Finalizacao';
import {
    INITIAL_FORM,
    type Step1Data,
    type Step2Data,
    type Step3Data,
    type Step4Data,
} from '@selecao/types/candidatura';
import { createCandidatura } from '@selecao/utils/api';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProcessoSeletivoPage.module.css';

const STEP_LABELS = ['Identificação', 'Experiência', 'Questionário', 'Finalização'];
const TOTAL_STEPS = 4;

type AllErrors = {
  step1: Step1Errors;
  step2: Step2Errors;
  step3: Step3Errors;
  step4: Step4Errors;
};

const EMPTY_ERRORS: AllErrors = {
  step1: {},
  step2: {},
  step3: {},
  step4: {},
};

const scrollToFirstError = () => {
  setTimeout(() => {
    const firstError = document.querySelector('[role="alert"]');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
};

export const ProcessoSeletivoPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<AllErrors>(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStep1Change = useCallback((updates: Partial<Step1Data>) => {
    setFormData((prev) => ({ ...prev, step1: { ...prev.step1, ...updates } }));
  }, []);

  const handleStep2Change = useCallback((updates: Partial<Step2Data>) => {
    setFormData((prev) => ({ ...prev, step2: { ...prev.step2, ...updates } }));
  }, []);

  const handleStep3Change = useCallback((updates: Partial<Step3Data>) => {
    setFormData((prev) => ({ ...prev, step3: { ...prev.step3, ...updates } }));
  }, []);

  const handleStep4Change = useCallback((updates: Partial<Step4Data>) => {
    setFormData((prev) => ({ ...prev, step4: { ...prev.step4, ...updates } }));
  }, []);

  const handleNext = useCallback(() => {
    if (step === 1) {
      const errs = validateStep1(formData.step1);
      if (Object.keys(errs).length > 0) {
        setErrors((prev) => ({ ...prev, step1: errs }));
        scrollToFirstError();
        return;
      }
      setErrors((prev) => ({ ...prev, step1: {} }));
    } else if (step === 2) {
      const errs = validateStep2(formData.step2);
      if (Object.keys(errs).length > 0) {
        setErrors((prev) => ({ ...prev, step2: errs }));
        scrollToFirstError();
        return;
      }
      setErrors((prev) => ({ ...prev, step2: {} }));
    } else if (step === 3) {
      const errs = validateStep3(formData.step3);
      if (Object.keys(errs).length > 0) {
        setErrors((prev) => ({ ...prev, step3: errs }));
        scrollToFirstError();
        return;
      }
      setErrors((prev) => ({ ...prev, step3: {} }));
    }

    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, formData]);

  const handleBack = useCallback(() => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async () => {
    const step4Errors = validateStep4(formData.step4);
    if (Object.keys(step4Errors).length > 0) {
      setErrors((prev) => ({ ...prev, step4: step4Errors }));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await createCandidatura(formData);

    setSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    navigate('/confirmacao');
  }, [formData, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.heading}>Processo Seletivo de Cuidadores — Amei Care</h1>
          <p className={styles.subtitle}>
            Preencha o formulário abaixo para se candidatar à vaga de cuidador da Amei Care.
          </p>
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />
        </div>

        <div className={styles.cardBody}>
          {step === 1 && (
            <Step1Identificacao
              data={formData.step1}
              onChange={handleStep1Change}
              errors={errors.step1}
            />
          )}
          {step === 2 && (
            <Step2Experiencia
              data={formData.step2}
              onChange={handleStep2Change}
              errors={errors.step2}
            />
          )}
          {step === 3 && (
            <Step3Questionario
              data={formData.step3}
              onChange={handleStep3Change}
              errors={errors.step3}
            />
          )}
          {step === 4 && (
            <Step4Finalizacao
              data={formData.step4}
              onChange={handleStep4Change}
              errors={errors.step4}
            />
          )}
        </div>

        <div className={styles.cardFooter}>
          {submitError && (
            <p className={styles.submitError} role="alert">{submitError}</p>
          )}

          <div className={styles.actions}>
            {step > 1 && (
              <button
                type="button"
                className="selecao-btn selecao-btn-secondary"
                onClick={handleBack}
                disabled={submitting}
              >
                ← Voltar
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="selecao-btn selecao-btn-primary"
                onClick={handleNext}
              >
                Próximo →
              </button>
            ) : (
              <button
                type="button"
                className={`selecao-btn selecao-btn-primary ${styles.submitBtn}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Enviando…' : 'Finalizar Candidatura'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
