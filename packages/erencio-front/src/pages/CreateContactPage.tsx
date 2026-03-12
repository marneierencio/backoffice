import type { FormFieldDefinition, FormSection } from '@backoffice/components/RecordForm';
import { RecordForm } from '@backoffice/components/RecordForm';
import { useRecordCreate } from '@backoffice/hooks/useRecordCreate';
import { useToast } from '@backoffice/hooks/useToast';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS: FormSection[] = [
  {
    title: 'Personal Information',
    columns: 2,
    fields: [
      {
        key: 'name.firstName',
        label: 'First Name',
        type: 'text' as FormFieldDefinition['type'],
        required: true,
        placeholder: 'Enter first name',
      },
      {
        key: 'name.lastName',
        label: 'Last Name',
        type: 'text' as FormFieldDefinition['type'],
        required: true,
        placeholder: 'Enter last name',
      },
      {
        key: 'emails.primaryEmail',
        label: 'Email',
        type: 'email' as FormFieldDefinition['type'],
        placeholder: 'email@example.com',
      },
      {
        key: 'phones.primaryPhoneNumber',
        label: 'Phone',
        type: 'phone' as FormFieldDefinition['type'],
        placeholder: '+1 (555) 000-0000',
      },
      {
        key: 'jobTitle',
        label: 'Job Title',
        type: 'text' as FormFieldDefinition['type'],
        placeholder: 'e.g. Sales Manager',
      },
      {
        key: 'city',
        label: 'City',
        type: 'text' as FormFieldDefinition['type'],
        placeholder: 'e.g. New York',
      },
    ],
  },
  {
    title: 'Organization',
    columns: 2,
    fields: [
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
    ],
  },
];

// Build the nested input structure for Twenty's GraphQL API
// e.g. { 'name.firstName': 'John', 'name.lastName': 'Doe' }
//   → { name: { firstName: 'John', lastName: 'Doe' } }
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

export const CreateContactPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { createRecord, loading: saving } = useRecordCreate({
    objectNameSingular: 'person',
    objectNamePlural: 'people',
  });

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user edits
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

    if (!values['name.firstName'] || String(values['name.firstName']).trim() === '') {
      newErrors['name.firstName'] = 'First name is required';
    }
    if (!values['name.lastName'] || String(values['name.lastName']).trim() === '') {
      newErrors['name.lastName'] = 'Last name is required';
    }

    // Email format validation (if provided)
    const email = values['emails.primaryEmail'];
    if (email && typeof email === 'string' && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors['emails.primaryEmail'] = 'Invalid email format';
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
      showSuccess('Contact created', 'The new contact has been saved.');
      navigate(`/contacts/${result.recordId}`);
    } else {
      showError('Failed to create contact', result.error ?? 'An unknown error occurred.');
    }
  }, [values, validate, createRecord, showSuccess, showError, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/contacts');
  }, [navigate]);

  return (
    <RecordForm
      title="New Contact"
      sections={SECTIONS}
      values={values}
      errors={errors}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitLabel="Create Contact"
    />
  );
};
