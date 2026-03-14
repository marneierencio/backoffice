import {
    atualizarStatusCandidatura,
    criarAnexo,
    getCandidaturaCuidador,
    uploadArquivo,
} from '@selecao/utils/api';
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './DocumentosPage.module.css';

type PageState = 'loading' | 'invalid' | 'form' | 'submitting' | 'success';

type FileEntry = {
  file: File;
  preview: string | null;
};

type FormState = {
  fotoPerfil: FileEntry | null;
  comprovanteCurso: FileEntry | null;
  contrato: FileEntry[];
};

const buildFileLabel = (baseName: string, index?: number): string =>
  index !== undefined && index > 0 ? `${baseName} ${index + 1}` : baseName;

const isImageType = (file: File): boolean => file.type.startsWith('image/');

const FileInput = ({
  id,
  label,
  accept,
  required,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  accept: string;
  required?: boolean;
  file: FileEntry | null;
  error?: string;
  onChange: (entry: FileEntry | null) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) {
      onChange(null);
      return;
    }
    const preview = isImageType(picked) ? URL.createObjectURL(picked) : null;
    onChange({ file: picked, preview });
  };

  const handleRemove = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={styles.fileField}>
      <label className={styles.fileLabel} htmlFor={id}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {file ? (
        <div className={styles.filePreview}>
          {file.preview ? (
            <img src={file.preview} alt={file.file.name} className={styles.previewImage} />
          ) : (
            <div className={styles.previewDoc}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                  stroke="var(--backoffice-g-color-brand-base-50)"
                  strokeWidth="2"
                  fill="none"
                />
                <polyline points="14 2 14 8 20 8" stroke="var(--backoffice-g-color-brand-base-50)" strokeWidth="2" fill="none" />
              </svg>
              <span className={styles.previewDocName}>{file.file.name}</span>
            </div>
          )}
          <button type="button" className={styles.removeBtn} onClick={handleRemove} aria-label="Remover arquivo">
            ✕ Remover
          </button>
        </div>
      ) : (
        <label className={styles.dropZone} htmlFor={id}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>Clique para selecionar</span>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            className={styles.hiddenInput}
            onChange={handleChange}
          />
        </label>
      )}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
};

const MultiFileInput = ({
  id,
  label,
  accept,
  required,
  files,
  maxFiles,
  error,
  onChange,
}: {
  id: string;
  label: string;
  accept: string;
  required?: boolean;
  files: FileEntry[];
  maxFiles?: number;
  error?: string;
  onChange: (entries: FileEntry[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const newEntries: FileEntry[] = picked.map((f) => ({
      file: f,
      preview: isImageType(f) ? URL.createObjectURL(f) : null,
    }));
    onChange([...files, ...newEntries]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    const entry = files[index];
    if (entry?.preview) URL.revokeObjectURL(entry.preview);
    onChange(files.filter((_, i) => i !== index));
  };

  const canAddMore = !maxFiles || files.length < maxFiles;

  return (
    <div className={styles.fileField}>
      <label className={styles.fileLabel}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {files.length > 0 && (
        <ul className={styles.multiFileList}>
          {files.map((entry, i) => (
            <li key={i} className={styles.multiFileItem}>
              {entry.preview ? (
                <img src={entry.preview} alt={entry.file.name} className={styles.previewImageSmall} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="var(--backoffice-g-color-brand-base-50)" strokeWidth="2" fill="none" />
                  <polyline points="14 2 14 8 20 8" stroke="var(--backoffice-g-color-brand-base-50)" strokeWidth="2" fill="none" />
                </svg>
              )}
              <span className={styles.multiFileName}>{entry.file.name}</span>
              <button type="button" className={styles.removeBtn} onClick={() => handleRemove(i)} aria-label="Remover">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {canAddMore && (
        <label className={styles.dropZone} htmlFor={id}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>
            {files.length === 0 ? 'Clique para selecionar' : 'Adicionar mais arquivo'}
          </span>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className={styles.hiddenInput}
            onChange={handleChange}
          />
        </label>
      )}
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
};

export const DocumentosPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    fotoPerfil: null,
    comprovanteCurso: null,
    contrato: [],
  });

  const [errors, setErrors] = useState<{
    fotoPerfil?: string;
    comprovanteCurso?: string;
    contrato?: string;
  }>({});

  useEffect(() => {
    if (!id) {
      setLoadError('ID da candidatura não encontrado na URL.');
      setPageState('invalid');
      return;
    }
    getCandidaturaCuidador(id).then((result) => {
      if (result.error) {
        setLoadError(result.error);
        setPageState('invalid');
        return;
      }
      if (result.data?.status !== 'AGUARDANDO_DOCUMENTOS') {
        setLoadError(
          result.data?.status === 'AGUARDANDO_ANALISE' || result.data?.status === 'AGUARDANDO_CONTRATO'
            ? 'Seus documentos já foram enviados. Aguarde o contato da nossa equipe.'
            : 'Este link não está disponível para envio de documentos no momento.',
        );
        setPageState('invalid');
        return;
      }
      setPageState('form');
    });
  }, [id]);

  const validate = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    if (!form.fotoPerfil) newErrors.fotoPerfil = 'Foto de perfil é obrigatória';
    if (!form.comprovanteCurso) newErrors.comprovanteCurso = 'Comprovante do curso é obrigatório';
    if (form.contrato.length === 0) newErrors.contrato = 'Ao menos um arquivo de contrato é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!validate()) return;

    setPageState('submitting');
    setSubmitError(null);

    type UploadJob = { file: File; name: string; fileType: 'Image' | 'File' };
    const jobs: UploadJob[] = [
      { file: form.fotoPerfil!.file, name: 'Foto de Perfil', fileType: 'Image' },
      {
        file: form.comprovanteCurso!.file,
        name: 'Comprovante do Curso de Cuidador',
        fileType: isImageType(form.comprovanteCurso!.file) ? 'Image' : 'File',
      },
      ...form.contrato.map((entry, i) => ({
        file: entry.file,
        name: buildFileLabel('Contrato Assinado', i),
        fileType: (isImageType(entry.file) ? 'Image' : 'File') as 'Image' | 'File',
      })),
    ];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      setProgress(`Enviando ${job.name} (${i + 1}/${jobs.length})…`);

      const uploadResult = await uploadArquivo(job.file);
      if (uploadResult.error) {
        setSubmitError(`Erro ao enviar ${job.name}: ${uploadResult.error}`);
        setPageState('form');
        setProgress(null);
        return;
      }

      const attachResult = await criarAnexo({
        candidaturaId: id,
        filePath: uploadResult.data!.path,
        name: job.name,
        fileType: job.fileType,
      });
      if (attachResult.error) {
        setSubmitError(`Erro ao registrar ${job.name}: ${attachResult.error}`);
        setPageState('form');
        setProgress(null);
        return;
      }
    }

    setProgress('Finalizando…');
    const statusResult = await atualizarStatusCandidatura(id, 'AGUARDANDO_ANALISE');
    if (statusResult.error) {
      setSubmitError(`Documentos enviados, mas ocorreu um erro ao atualizar o status: ${statusResult.error}`);
      setPageState('form');
      setProgress(null);
      return;
    }

    setProgress(null);
    setPageState('success');
  };

  if (pageState === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <p className={styles.loadingText}>Verificando candidatura…</p>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Envio de Documentos</h1>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.invalidMessage}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="var(--backoffice-g-color-error-base-50)" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="var(--backoffice-g-color-error-base-50)" strokeWidth="2" />
                <circle cx="12" cy="16" r="1" fill="var(--backoffice-g-color-error-base-50)" />
              </svg>
              <p>{loadError ?? 'Link inválido ou expirado.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.heading}>Documentos enviados!</h1>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.successMessage}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="var(--backoffice-g-color-success-base-50)" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" stroke="var(--backoffice-g-color-success-base-50)" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>
                Seus documentos foram recebidos com sucesso! Nossa equipe irá analisá-los e
                entrará em contato em breve.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.heading}>Envio de Documentos</h1>
          <p className={styles.subtitle}>
            Por favor, envie os documentos solicitados para dar continuidade ao seu processo
            de seleção.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.cardBody}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Foto de Perfil</h2>
              <p className={styles.sectionDesc}>
                Envie uma foto recente e clara do seu rosto (formato JPG, PNG ou similar).
              </p>
              <FileInput
                id="fotoPerfil"
                label="Foto de perfil"
                accept="image/*"
                required
                file={form.fotoPerfil}
                error={errors.fotoPerfil}
                onChange={(entry) => {
                  setForm((prev) => ({ ...prev, fotoPerfil: entry }));
                  if (errors.fotoPerfil) setErrors((prev) => ({ ...prev, fotoPerfil: undefined }));
                }}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Comprovante do Curso de Cuidador</h2>
              <p className={styles.sectionDesc}>
                Envie o certificado ou comprovante de conclusão do curso de cuidador
                (imagem ou PDF).
              </p>
              <FileInput
                id="comprovanteCurso"
                label="Comprovante do curso"
                accept="image/*,application/pdf"
                required
                file={form.comprovanteCurso}
                error={errors.comprovanteCurso}
                onChange={(entry) => {
                  setForm((prev) => ({ ...prev, comprovanteCurso: entry }));
                  if (errors.comprovanteCurso)
                    setErrors((prev) => ({ ...prev, comprovanteCurso: undefined }));
                }}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>3. Contrato Assinado</h2>
              <p className={styles.sectionDesc}>
                Envie o(s) arquivo(s) do contrato devidamente assinado (PDF ou imagem).
                Você pode adicionar mais de um arquivo.
              </p>
              <MultiFileInput
                id="contrato"
                label="Contrato assinado"
                accept="image/*,application/pdf"
                required
                files={form.contrato}
                error={errors.contrato}
                onChange={(entries) => {
                  setForm((prev) => ({ ...prev, contrato: entries }));
                  if (errors.contrato) setErrors((prev) => ({ ...prev, contrato: undefined }));
                }}
              />
            </div>

            {submitError && <div className={styles.submitError}>{submitError}</div>}
          </div>

          <div className={styles.cardFooter}>
            {progress && <p className={styles.progressText}>{progress}</p>}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={pageState === 'submitting'}
              >
                {pageState === 'submitting' ? 'Enviando…' : 'Enviar Documentos'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
