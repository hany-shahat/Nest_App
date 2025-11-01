import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName } from 'src/common/decorators/role.decorators';
import { RoleEnum, TokenEnum } from 'src/common/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
   constructor(
      private readonly reflector: Reflector,
    
    ) { }
  canActivate(
    context: ExecutionContext): boolean {
        const accessRoles: RoleEnum[] = this.reflector.getAllAndOverride<RoleEnum[]>(
          RoleName,
          [context.getHandler()]
        ) ?? [];
    let role: RoleEnum = RoleEnum.user;
        switch (context.getType()) {
          case 'http':
            role = context.switchToHttp().getRequest().credentials.user.role;
            break;
          // case 'rpc':
          //   const RPCCtx = context.switchToRpc();
          //   break;
          // case 'ws':
          //   const WSCtx = context.switchToWs();
          //   break;
        
          default:
            break;
        }
        
      
    return accessRoles.includes(role);
  }
}
