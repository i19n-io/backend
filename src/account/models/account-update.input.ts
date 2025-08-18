import { InputType, PartialType } from '@nestjs/graphql'

import { AccountCreate } from '~/account/models/account-create.input'

/**
 * This scheme is not used in documentation, so there is no description or
 * validation here (@Field, @IsEmail, @IsURL, etc.)
 */
@InputType()
export class AccountUpdate extends PartialType(AccountCreate, {
  omitDefaultValues: true,
  skipNullProperties: false,
}) {}
