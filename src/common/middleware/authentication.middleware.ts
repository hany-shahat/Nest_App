
import { BadRequestException } from '@nestjs/common';
import {  Response, NextFunction } from 'express';
import { IAuthRequest } from '../interfaces';


 export const PreAuth =async (req: IAuthRequest, res: Response, next: NextFunction)=> {
     if (!(req.headers.authorization?.split(' ')?.length==2)) {
        throw new BadRequestException("Missing authorization key")
     }
    next();
};
 
// @Injectable()
// export class AuthenticationMiddleware implements NestMiddleware {
//     constructor(private readonly tokenService:TokenService){}
//   async use(req: IAuthRequest, res: Response, next: NextFunction) {
//       console.log('Request...');
//       console.log(req.headers.authorization);
//       console.log('req.tokenType =>', req.tokenType);
//       const { user ,decoded } = await this.tokenService.decodedToken({
//           authorization: req.headers.authorization?? '',
//           tokenType:req.tokenType as TokenEnum,
//       })
//       req.credentials = { user, decoded }
      
//     next();
//   }
// }
