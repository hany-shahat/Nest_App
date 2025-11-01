import { Module } from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { AuthenticationController } from "./auth.controller";
import { OtpModel, OtpRepository } from "src/DB";
import { SecurityService} from "src/common";





/* @Module({
    imports: [OtpModel,UserModel,TokenModel],
     controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        OtpRepository,
        SecurityService,
        UserRepository,
        JwtService,
        TokenRepository,
       TokenService,
    ],
    exports: [
        AuthenticationService,
        UserRepository,
        JwtService,
        TokenRepository,
        TokenService,
        UserModel,
        TokenModel,
    ],
 
}) */
@Module({
  imports: [ OtpModel],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, OtpRepository, SecurityService],
  exports: [], 
})
export class AuthenticationModule{

}