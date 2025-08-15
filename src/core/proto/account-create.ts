/**
 * This scheme is not used in documentation and in API requests, so there is no
 * description or validation here (@ApiProperty, @IsEmail, etc.)
 */
export class AccountCreate {
  readonly name!: string
  readonly email?: string
  readonly avatar?: string
  readonly githubId?: string
  readonly githubUsername?: string
}
