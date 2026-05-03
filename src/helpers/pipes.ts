import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common'
import { isLocale } from 'class-validator'

@Injectable()
export class ParseLocalePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (
      typeof value !== 'string' ||
      value.length < 2 ||
      value.length > 64 ||
      !isLocale(value)
    ) {
      throw new BadRequestException(`Invalid locale: ${value}`)
    }
    return value
  }
}
