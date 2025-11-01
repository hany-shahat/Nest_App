import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, TokenEnum } from '../enums';
import { Token } from './tokenType.decorator';
import { Roles } from './role.decorators';
import { AthenticationGuard } from '../guards/authentication/athentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';

export function Auth(roles:RoleEnum[],type:TokenEnum=TokenEnum.access) {
  return applyDecorators(
      Token(type),
      Roles(roles),
      UseGuards(AthenticationGuard,AuthorizationGuard)

  );
}
