import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type SettingsDataModelFieldTextFormValues } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextForm';
import { useLingui } from '@lingui/react/macro';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { Toggle } from 'twenty-ui/input';

// Field types whose values can meaningfully contribute to a label formula
const FORMULA_ELIGIBLE_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
]);

type SettingsDataModelFieldTextFormulaFormProps = {
  disabled?: boolean;
  objectNameSingular: string;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldTextFormulaForm = ({
  disabled = false,
  objectNameSingular,
  existingFieldMetadataId,
}: SettingsDataModelFieldTextFormulaFormProps) => {
  const { t } = useLingui();

  const { watch, setValue } =
    useFormContext<SettingsDataModelFieldTextFormValues>();

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const currentSettings = watch('settings') ?? {};
  const formulaFieldNames: string[] = currentSettings.formulaFieldNames ?? [];

  const eligibleFields = objectMetadataItem.fields
    .filter(
      (field) =>
        FORMULA_ELIGIBLE_TYPES.has(field.type as FieldMetadataType) &&
        field.id !== existingFieldMetadataId &&
        !field.isSystem,
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  const toggleField = (fieldName: string) => {
    const newFormula = formulaFieldNames.includes(fieldName)
      ? formulaFieldNames.filter((name) => name !== fieldName)
      : [...formulaFieldNames, fieldName];

    setValue(
      'settings',
      { ...currentSettings, formulaFieldNames: newFormula },
      { shouldDirty: true },
    );
  };

  if (eligibleFields.length === 0) {
    return null;
  }

  return (
    <>
      {eligibleFields.map((field) => (
        <SettingsOptionCardContentSelect
          key={field.id}
          title={field.label}
          description={t`Include in the record name`}
        >
          <Toggle
            toggleSize="small"
            value={formulaFieldNames.includes(field.name)}
            onChange={() => toggleField(field.name)}
            disabled={disabled}
          />
        </SettingsOptionCardContentSelect>
      ))}
    </>
  );
};
