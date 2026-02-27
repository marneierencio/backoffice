import { ArgsType, Field } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty } from 'class-validator';
import { FrontendPreference } from 'twenty-shared/workspace';

@ArgsType()
export class UpdateUserFrontendPreferenceInput {
  @Field(() => FrontendPreference)
  @IsNotEmpty()
  @IsEnum(FrontendPreference)
  frontendPreference: FrontendPreference;
}
