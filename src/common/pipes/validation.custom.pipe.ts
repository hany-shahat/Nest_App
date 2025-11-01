
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
    
    transform(value: any, metadata: ArgumentMetadata) {
      if (value.password!==value.confirmPassword) {
        throw new BadRequestException("password mismatch confirmPassword")
        }
        value.firstName = (value.username.split(' ') || [])[0];
        value.lastName = (value.username.split(' ') || [])[1];

    return value;
  }
}
