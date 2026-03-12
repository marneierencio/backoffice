import { FormField } from '@selecao/components/FormField';
import { type Step2Data } from '@selecao/types/candidatura';
import styles from './Step2Experiencia.module.css';

const DIAS_SEMANA = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const TURNOS = [
  { value: 'manha', label: 'Manhã (6h–12h)' },
  { value: 'tarde', label: 'Tarde (12h–18h)' },
  { value: 'noite', label: 'Noite (18h–24h)' },
  { value: 'madrugada', label: 'Madrugada (0h–6h)' },
];

const MESES = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const ANOS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

export type Step2Errors = Partial<Record<string, string>>;

type Step2Props = {
  data: Step2Data;
  onChange: (updates: Partial<Step2Data>) => void;
  errors: Step2Errors;
};

const toggleArrayItem = (arr: string[], value: string): string[] =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

export const Step2Experiencia = ({ data, onChange, errors }: Step2Props) => {
  const handleDiaChange = (value: string) => {
    onChange({ disponibilidadeDias: toggleArrayItem(data.disponibilidadeDias, value) });
  };

  const handleTurnoChange = (value: string) => {
    onChange({ disponibilidadeTurnos: toggleArrayItem(data.disponibilidadeTurnos, value) });
  };

  const handleCursoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onChange({
      possuiCurso: checked,
      ...(checked ? {} : { instituicaoCurso: '', cargaHoraria: '', conclusaoMes: '', conclusaoAno: '' }),
    });
  };

  return (
    <div className={styles.stepContent}>
      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Experiência Profissional</legend>

        <FormField
          label="Descreva sua experiência como cuidador(a)"
          htmlFor="experiencia"
          required
          error={errors.experiencia}
          textarea
          rows={4}
          value={data.experiencia}
          onChange={(e) => onChange({ experiencia: (e as React.ChangeEvent<HTMLTextAreaElement>).target.value })}
          placeholder="Descreva sua experiência, tempo de atuação, tipos de cuidados realizados..."
          maxLength={2000}
        />
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Disponibilidade de Horários *</legend>

        {errors.disponibilidade && (
          <p className={styles.groupError} role="alert">{errors.disponibilidade}</p>
        )}

        <div className={styles.availabilityGrid}>
          <div className={styles.availabilityGroup}>
            <span className={styles.groupLabel}>Dias da semana</span>
            <div className={styles.checkboxGroup}>
              {DIAS_SEMANA.map((dia) => (
                <label key={dia.value} className="selecao-checkbox-label">
                  <input
                    type="checkbox"
                    checked={data.disponibilidadeDias.includes(dia.value)}
                    onChange={() => handleDiaChange(dia.value)}
                  />
                  {dia.label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.availabilityGroup}>
            <span className={styles.groupLabel}>Turnos do dia</span>
            <div className={styles.checkboxGroup}>
              {TURNOS.map((turno) => (
                <label key={turno.value} className="selecao-checkbox-label">
                  <input
                    type="checkbox"
                    checked={data.disponibilidadeTurnos.includes(turno.value)}
                    onChange={() => handleTurnoChange(turno.value)}
                  />
                  {turno.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Referências</legend>

        <FormField
          label="Possui referências? Se sim, cite os contatos"
          htmlFor="referencias"
          error={errors.referencias}
          textarea
          rows={3}
          value={data.referencias}
          onChange={(e) => onChange({ referencias: (e as React.ChangeEvent<HTMLTextAreaElement>).target.value })}
          placeholder="Nome, telefone e/ou e-mail de ex-empregadores ou pacientes (com autorização)"
          maxLength={1000}
        />
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.sectionTitle}>Formação</legend>

        <label className={`selecao-checkbox-label ${styles.cursoCheck}`}>
          <input
            type="checkbox"
            checked={data.possuiCurso}
            onChange={handleCursoChange}
          />
          Possuo curso de cuidador com certificado
        </label>

        {data.possuiCurso && (
          <div className={styles.cursoFields}>
            <FormField
              label="Instituição do curso"
              htmlFor="instituicaoCurso"
              required
              error={errors.instituicaoCurso}
              value={data.instituicaoCurso}
              onChange={(e) => onChange({ instituicaoCurso: e.target.value })}
              placeholder="Nome da instituição de ensino"
              maxLength={200}
            />

            <div className={styles.row}>
              <FormField
                label="Carga horária (horas)"
                htmlFor="cargaHoraria"
                type="number"
                required
                error={errors.cargaHoraria}
                value={data.cargaHoraria}
                onChange={(e) => onChange({ cargaHoraria: e.target.value })}
                placeholder="Ex: 120"
                min="1"
                max="9999"
                step="1"
              />

              <div className={styles.conclusaoRow}>
                <FormField
                  label="Mês de conclusão"
                  htmlFor="conclusaoMes"
                  required
                  error={errors.conclusaoMes}
                >
                  <select
                    id="conclusaoMes"
                    className={`selecao-control selecao-control-select ${errors.conclusaoMes ? 'selecao-control--error' : ''}`}
                    value={data.conclusaoMes}
                    onChange={(e) => onChange({ conclusaoMes: e.target.value })}
                    required
                    aria-invalid={!!errors.conclusaoMes}
                    aria-describedby={errors.conclusaoMes ? 'conclusaoMes-error' : undefined}
                  >
                    <option value="">Mês...</option>
                    {MESES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Ano de conclusão"
                  htmlFor="conclusaoAno"
                  required
                  error={errors.conclusaoAno}
                >
                  <select
                    id="conclusaoAno"
                    className={`selecao-control selecao-control-select ${errors.conclusaoAno ? 'selecao-control--error' : ''}`}
                    value={data.conclusaoAno}
                    onChange={(e) => onChange({ conclusaoAno: e.target.value })}
                    required
                    aria-invalid={!!errors.conclusaoAno}
                    aria-describedby={errors.conclusaoAno ? 'conclusaoAno-error' : undefined}
                  >
                    <option value="">Ano...</option>
                    {ANOS.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export const validateStep2 = (data: Step2Data): Step2Errors => {
  const errors: Step2Errors = {};

  if (!data.experiencia.trim()) errors.experiencia = 'Descreva sua experiência';

  if (data.disponibilidadeDias.length === 0 || data.disponibilidadeTurnos.length === 0) {
    errors.disponibilidade = 'Selecione ao menos um dia e um turno de disponibilidade';
  }

  if (data.possuiCurso) {
    if (!data.instituicaoCurso.trim()) errors.instituicaoCurso = 'Informe a instituição do curso';

    const horas = Number(data.cargaHoraria);
    if (!data.cargaHoraria || isNaN(horas) || horas <= 0) {
      errors.cargaHoraria = 'Informe a carga horária';
    }

    if (!data.conclusaoMes) errors.conclusaoMes = 'Selecione o mês';
    if (!data.conclusaoAno) errors.conclusaoAno = 'Selecione o ano';
  }

  return errors;
};
