import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class ErencioNameFormulaService {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {}

  // Returns the list of field internal names configured as formula for the `name`
  // field of the given object, or null if no formula is configured.
  async getFormulaFieldNames(
    workspaceId: string,
    objectName: string,
  ): Promise<string[] | null> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      select: ['id'],
      where: { nameSingular: objectName, workspaceId },
    });

    if (!objectMetadata) {
      return null;
    }

    const nameField = await this.fieldMetadataRepository.findOne({
      select: ['settings'],
      where: { name: 'name', objectMetadataId: objectMetadata.id },
    });

    const settings = nameField?.settings as
      | { formulaFieldNames?: string[] }
      | null
      | undefined;

    const formulaFieldNames = settings?.formulaFieldNames;

    if (!formulaFieldNames || formulaFieldNames.length === 0) {
      return null;
    }

    return formulaFieldNames;
  }

  buildNameFromValues(
    formulaFieldNames: string[],
    record: Record<string, unknown>,
  ): string {
    return formulaFieldNames
      .map((fieldName) => {
        const value = record[fieldName];

        if (value === null || value === undefined || value === '') {
          return null;
        }

        // Handle composite fields like FULL_NAME
        if (typeof value === 'object' && value !== null) {
          const parts = Object.values(value).filter(
            (v) => typeof v === 'string' && v.trim() !== '',
          );

          return parts.length > 0 ? parts.join(' ') : null;
        }

        return String(value);
      })
      .filter((part) => part !== null)
      .join(' ');
  }
}
