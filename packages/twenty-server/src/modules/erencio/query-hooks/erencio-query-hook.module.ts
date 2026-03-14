import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ErencioNameFormulaCreateOnePreQueryHook } from 'src/modules/erencio/query-hooks/erencio-name-formula-create-one.pre-query-hook';
import { ErencioNameFormulaUpdateOnePreQueryHook } from 'src/modules/erencio/query-hooks/erencio-name-formula-update-one.pre-query-hook';
import { ErencioNameFormulaService } from 'src/modules/erencio/services/erencio-name-formula.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObjectMetadataEntity, FieldMetadataEntity]),
  ],
  providers: [
    ErencioNameFormulaService,
    ErencioNameFormulaCreateOnePreQueryHook,
    ErencioNameFormulaUpdateOnePreQueryHook,
  ],
})
export class ErencioQueryHookModule {}
