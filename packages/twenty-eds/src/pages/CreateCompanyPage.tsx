import type { FormFieldDefinition, FormSection } from '@eds/components/RecordForm';
import { RecordForm } from '@eds/components/RecordForm';
import { useRecordCreate } from '@eds/hooks/useRecordCreate';
import { useToast } from '@eds/hooks/useToast';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS: FormSection[] = [
  {
    title: 'Company Information',
    columns: 2,
    fields: [
      {
        key: 'name',
        label: 'Name',
        type: 'text' as FormFieldDefinition['type'],
        required: true,
        placeholder: 'Enter company name',
      },
      {
        key: 'domainName.primaryLinkUrl',
        label: 'Domain Name',
        type: 'url' as FormFieldDefinition['type'],
        placeholder: 'https://example.com',
      },
      {
        key: 'employees',
        label: 'Employees',
        type: 'number' as FormFieldDefinition['type'],
        placeholder: 'Number of employees',
      },
      {
        key: 'idealCustomerProfile',
        label: 'Ideal Customer Profile',
        type: 'boolean' as FormFieldDefinition['type'],
      },
      {
        key: 'address.addressStreet1',
        label: 'Address',
        type: 'text' as FormFieldDefinition['type'],
        placeholder: 'Street address',
        colSpan: 2,
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

export const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createRecord, loading: saving } = useRecordCreate({
    objectNameSingular: 'company',
    objectNamePlural: 'companies',
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
      newErrors['name'] = 'Company name is required';
    }

    // URL format validation (if provided)
    const url = values['domainName.primaryLinkUrl'];
    if (url && typeof url === 'string' && url.trim()) {
      try {
        new URL(url);
      } catch {
        newErrors['domainName.primaryLinkUrl'] = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const input = buildNestedInput(values);
    const result = await createRecord(input);

    if (result.success && result.recordId) {
      showSuccess('Company created', 'The new company has been saved.');
      navigate(`/companies/${result.recordId}`);
    } else {
      showError('Failed to create company', result.error ?? 'An unknown error occurred.');
    }
  }, [values, validate, createRecord, showSuccess, showError, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/companies');
  }, [navigate]);

  return (
    <RecordForm
      title="New Company"
      sections={SECTIONS}
      values={values}
      errors={errors}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Create Company"
    />
  );
};
