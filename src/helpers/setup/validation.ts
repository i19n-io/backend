import { ValidationPipe, type INestApplication } from '@nestjs/common'

export const setupValidation = (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
    }),
  )
}
