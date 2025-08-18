import { InputType } from '@nestjs/graphql'

/**
 * This scheme is not used in documentation, so there is no description or
 * validation here (@Field, @IsEmail, @IsURL, etc.)
 */
@InputType()
export class AccountCreate {
  readonly name!: string
  readonly email?: string
  readonly avatar?: string
  readonly githubId?: string
  readonly githubUsername?: string
}
