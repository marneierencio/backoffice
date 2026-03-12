import type { FormFieldDefinition, FormSection } from '@backoffice/components/RecordForm';
import { RecordForm } from '@backoffice/components/RecordForm';
import { useRecordCreate } from '@backoffice/hooks/useRecordCreate';
import { useToast } from '@backoffice/hooks/useToast';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Pipeline stage options (matches Twenty's default opportunity stages)
const STAGE_OPTIONS = [
  { value: 'QUALIFICATION', label: 'Qualification' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
];

const SECTIONS: FormSection[] = [
  {
    title: 'Deal Information',
    columns: 2,
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text' as FormFieldDefinition['type'],
        required: true,
        placeholder: 'Enter deal name',
      },
      {
        key: 'stage',
        label: 'Stage',
        type: 'select' as FormFieldDefinition['type'],
        options: STAGE_OPTIONS,
        placeholder: 'Select a stage',
      },
      {
        key: 'closeDate',
        label: 'Close Date',
        type: 'date' as FormFieldDefinition['type'],
      },
      {
        key: 'amount.amountMicros',
        label: 'Amount',
        type: 'currency' as FormFieldDefinition['type'],
        placeholder: '0.00',
      },
      {
        key: 'companyId',
        label: 'Company',
        type: 'relation' as FormFieldDefinition['type'],
        relationObjectNameSingular: 'company',
        relationObjectNamePlural: 'companies',
        relationSearchFields: ['name'],
        relationDisplayField: 'name',
        placeholder: 'Search for a company...',
      },
      {
        key: 'pointOfContactId',
        label: 'Contact',
        type: 'relation' as FormFieldDefinition['type'],
        relationObjectNameSingular: 'person',
        relationObjectNamePlural: 'people',
        relationSearchFields: ['name.firstName', 'name.lastName'],
        relationDisplayField: 'name.firstName',
        placeholder: 'Search for a contact...',
      },
    ],
  },
];

// Build the nested input structure for Twenty's GraphQL API
const buildNestedInput = (
  values: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue;

    const parts = key.split('.');
    if (parts.length === 1) {
      result[key] = value;
    } else {
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
    }
  }

  return result;
};

export const CreateDealPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createRecord, loading: saving } = useRecordCreate({
    objectNameSingular: 'opportunity',
    objectNamePlural: 'opportunities',
  });

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values['name'] || String(values['name']).trim() === '') {
      newErrors['name'] = 'Deal name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const input = buildNestedInput(values);
    const result = await createRecord(input);

    if (result.success && result.recordId) {
      showSuccess('Deal created', 'The new deal has been saved.');
      navigate(`/deals/${result.recordId}`);
    } else {
      showError('Failed to create deal', result.error ?? 'An unknown error occurred.');
    }
  }, [values, validate, createRecord, showSuccess, showError, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/deals');
  }, [navigate]);

  return (
    <RecordForm
      title="New Deal"
      sections={SECTIONS}
      values={values}
      errors={errors}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Create Deal"
    />
  );
};
