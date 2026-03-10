import { FormField } from '@selecao/components/FormField';
import { type Step3Data } from '@selecao/types/candidatura';
import styles from './Step3Questionario.module.css';

type Question = {
  id: keyof Step3Data;
  number: number;
  text: string;
  options: { value: string; label: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    number: 1,
    text: 'Ao dar banho em idoso dependente, o mais importante é:',
    options: [
      { value: 'a', label: 'Manter a segurança do idoso durante todo o processo' },
      { value: 'b', label: 'Garantir que o banheiro esteja quente' },
      { value: 'c', label: 'Usar produtos de higiene adequados' },
      { value: 'd', label: 'Dar banho com pressa para evitar cansaço' },
    ],
  },
  {
    id: 'q2',
    number: 2,
    text: 'O cuidador pode administrar medicação sem orientação?',
    options: [
      { value: 'a', label: 'Sim, se for um medicamento de uso contínuo' },
      { value: 'b', label: 'Sim, se o idoso estiver com dor' },
      { value: 'c', label: 'Não, o cuidador deve seguir sempre as orientações médicas' },
    ],
  },
  {
    id: 'q3',
    number: 3,
    text: 'Para alimentar idoso com risco de engasgo, a posição correta é:',
    options: [
      { value: 'a', label: 'Sentado em uma cadeira com apoio para o pescoço' },
      { value: 'b', label: 'Deitado na cama' },
      { value: 'c', label: 'Em pé' },
      { value: 'd', label: 'Apoiado em um colchão' },
    ],
  },
  {
    id: 'q4',
    number: 4,
    text: 'Sobre sigilo profissional:',
    options: [
      { value: 'a', label: 'É obrigatório e protege informações sensíveis do idoso' },
      { value: 'b', label: 'Não é importante e pode ser ignorado' },
      { value: 'c', label: 'É opcional dependendo da situação' },
      { value: 'd', label: 'Somente informações financeiras devem ser mantidas em sigilo' },
    ],
  },
  {
    id: 'q5',
    number: 5,
    text: 'Em caso de queda do idoso, o primeiro passo é:',
    options: [
      { value: 'a', label: 'Verificar se o idoso está ferido e chamar ajuda médica imediatamente' },
      { value: 'b', label: 'Movimentar o idoso para uma posição confortável' },
      { value: 'c', label: 'Avaliar se há risco de lesão grave' },
      { value: 'd', label: 'Informar a família imediatamente' },
    ],
  },
  {
    id: 'q6',
    number: 6,
    text: 'Para prevenir quedas, é correto:',
    options: [
      { value: 'a', label: 'Manter os ambientes limpos e sem obstáculos' },
      { value: 'b', label: 'Usar calçados com solado antiderrapante' },
      { value: 'c', label: 'Evitar o uso de escadas' },
      { value: 'd', label: 'Instalar barras de apoio em banheiros e escadas' },
    ],
  },
  {
    id: 'q7',
    number: 7,
    text: 'O cuidador pode alterar dose de medicamento por conta própria?',
    options: [
      { value: 'a', label: 'Sim, se o idoso estiver com dor' },
      { value: 'b', label: 'Sim, se for um medicamento de uso contínuo' },
      { value: 'c', label: 'Não, o cuidador deve seguir sempre as orientações médicas' },
    ],
  },
  {
    id: 'q8',
    number: 8,
    text: 'Sobre pontualidade:',
    options: [
      { value: 'a', label: 'É importante para manter a confiança da família e respeito ao trabalho' },
      { value: 'b', label: 'Não é importante, basta cumprir o horário de trabalho' },
      { value: 'c', label: 'É opcional, depende da situação do idoso' },
      { value: 'd', label: 'Somente é importante quando há um idoso em risco de queda' },
    ],
  },
  {
    id: 'q9',
    number: 9,
    text: 'Se não puder ir ao plantão, você deve:',
    options: [
      { value: 'a', label: 'Informar o supervisor com antecedência e buscar substituição' },
      { value: 'b', label: 'Ir ao plantão mesmo assim, mesmo que não esteja bem' },
      { value: 'c', label: 'Não informar ninguém e tentar resolver sozinho' },
      { value: 'd', label: 'Informar a família do idoso e ir ao plantão mesmo assim' },
    ],
  },
  {
    id: 'q10',
    number: 10,
    text: 'O celular no plantão deve ser usado:',
    options: [
      { value: 'a', label: 'Somente para comunicação com a equipe médica e familiares autorizados' },
      { value: 'b', label: 'Para qualquer uso pessoal durante o plantão' },
      { value: 'c', label: 'Somente para emergências médicas' },
      { value: 'd', label: 'Para enviar mensagens de texto com amigos e familiares' },
    ],
  },
];

export type Step3Errors = Partial<Record<keyof Step3Data, string>>;

type Step3Props = {
  data: Step3Data;
  onChange: (updates: Partial<Step3Data>) => void;
  errors: Step3Errors;
};

type MultipleChoiceQuestionProps = {
  question: Question;
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
};

const MultipleChoiceQuestion = ({ question, value, error, onChange }: MultipleChoiceQuestionProps) => (
  <fieldset className={`${styles.questionBlock} ${error ? styles.questionBlockError : ''}`}>
    <legend className={styles.questionText}>
      <span className={styles.questionNumber}>{question.number}.</span> {question.text}
    </legend>
    {error && (
      <p className={styles.questionError} role="alert">{error}</p>
    )}
    <div className={styles.optionsList}>
      {question.options.map((opt) => (
        <label key={opt.value} className="selecao-radio-label">
          <input
            type="radio"
            name={question.id}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  </fieldset>
);

export const Step3Questionario = ({ data, onChange, errors }: Step3Props) => (
  <div className={styles.stepContent}>
    <p className={styles.intro}>
      Responda as questões abaixo. Elas fazem parte da avaliação para o processo seletivo.
    </p>

    <div className={styles.questionsSection}>
      <h3 className={styles.sectionTitle}>Perguntas de múltipla escolha</h3>
      {QUESTIONS.map((q) => (
        <MultipleChoiceQuestion
          key={q.id}
          question={q}
          value={data[q.id]}
          error={errors[q.id]}
          onChange={(value) => onChange({ [q.id]: value })}
        />
      ))}
    </div>

    <div className={styles.questionsSection}>
      <h3 className={styles.sectionTitle}>Questões dissertativas</h3>

      <FormField
        label="11. O que você faria se a família pedisse algo que você considera errado?"
        htmlFor="q11"
        required
        error={errors.q11}
        textarea
        rows={4}
        value={data.q11}
        onChange={(e) => onChange({ q11: (e as React.ChangeEvent<HTMLTextAreaElement>).target.value })}
        maxLength={1000}
      />

      <FormField
        label="12. O que significa sigilo profissional para você?"
        htmlFor="q12"
        required
        error={errors.q12}
        textarea
        rows={4}
        value={data.q12}
        onChange={(e) => onChange({ q12: (e as React.ChangeEvent<HTMLTextAreaElement>).target.value })}
        maxLength={1000}
      />

      <FormField
        label="13. Descreva uma situação difícil que já viveu como cuidador(a) e como resolveu:"
        htmlFor="q13"
        required
        error={errors.q13}
        textarea
        rows={4}
        value={data.q13}
        onChange={(e) => onChange({ q13: (e as React.ChangeEvent<HTMLTextAreaElement>).target.value })}
        maxLength={1000}
      />
    </div>
  </div>
);

export const validateStep3 = (data: Step3Data): Step3Errors => {
  const errors: Step3Errors = {};

  (['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'] as const).forEach((key) => {
    if (!data[key]) errors[key] = 'Selecione uma alternativa';
  });

  if (!data.q11.trim()) errors.q11 = 'Esta questão é obrigatória';
  if (!data.q12.trim()) errors.q12 = 'Esta questão é obrigatória';
  if (!data.q13.trim()) errors.q13 = 'Esta questão é obrigatória';

  return errors;
};
