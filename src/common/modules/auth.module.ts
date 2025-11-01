import { Global, Module } from "@nestjs/common";
import {  TokenModel, TokenRepository, UserModel, UserRepository } from "src/DB";
import {  TokenService } from "src/common";
import { JwtService } from "@nestjs/jwt";



@Global()
@Module({
    imports: [UserModel, TokenModel],
     controllers: [],
    providers: [
       
        UserRepository,
        JwtService,
        TokenRepository,
        TokenService,
    ],
    exports: [
        
        UserRepository,
        JwtService,
        TokenRepository,
        TokenService,
        TokenModel,
        UserModel,
    ],
 
})
export class SheredAuthenticationModule{

}