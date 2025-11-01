import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import { RoleEnum, SignatureLevelEnum, TokenEnum } from "../enums";
import { TokenDocument, TokenModel, TokenRepository, UserDocument, UserRepository } from "src/DB";
import {randomUUID} from "crypto"
import { parseObjectId } from "../utils";
import { LoginCredentialsResponse } from "../entities";
@Injectable()
export class TokenService{
    
    constructor(
        private readonly JwtService: JwtService,
        private readonly userRepository:UserRepository,
        private readonly tokenRepository:TokenRepository,
    ) { }
    
 generateToken =async ({
    payload,
     options = {
         secret:process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
         expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN)
     },
}: {
         payload: object;
         options?: JwtSignOptions;
}):Promise<string> => {
     return await this.JwtService.signAsync(payload, options);
}
 verifyToken =async ({
    token,
     options = {
        secret:process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    }
}: {
         token: string;
         options?: JwtVerifyOptions;
}):Promise<JwtPayload> => {
     return await this.JwtService.verifyAsync(token, options)as unknown as JwtPayload;
}


detectSignatureLevel = async (
        // role: RoleEnum = RoleEnum.user
        role: RoleEnum,
    ): Promise<SignatureLevelEnum> => {
    let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer
    switch (role) {
        case RoleEnum.admin:
        case RoleEnum.superAdmin:
            signatureLevel = SignatureLevelEnum.System;
            break;
        default:
            signatureLevel = SignatureLevelEnum.Bearer;
            break;
    }
    return signatureLevel
}
 getSignature = async(signatureLevel:SignatureLevelEnum=SignatureLevelEnum.Bearer):Promise<{access_signaturel:string ,refresh_signaturel:string}>=>{
    let signatures: {access_signaturel:string ,refresh_signaturel:string}={access_signaturel:"",refresh_signaturel:""}
    switch (signatureLevel) {
        case SignatureLevelEnum.System:
            signatures.access_signaturel = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE as string
            signatures.refresh_signaturel=process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE as string
            break;
        default:
            signatures.access_signaturel = process.env.ACCESS_USER_TOKEN_SIGNATURE as string
            signatures.refresh_signaturel=process.env.REFRESH_USER_TOKEN_SIGNATURE as string
            break;
    }
    return signatures
}


 createLoginCredentials = async (user: UserDocument):Promise<LoginCredentialsResponse> => {
    const signatureLevel =await this.detectSignatureLevel(user.role);
    const signatures = await this.getSignature(signatureLevel)
    const jwtid = randomUUID();
    const access_token = await this.generateToken({
        //  payload: { _id: user._id },
        payload: { sub: user._id.toString() },
        options: {
            secret: signatures.access_signaturel,
            expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN), jwtid
        }
    })
    const refresh_token = await this.generateToken({
        // payload: { _id: user._id },
      payload: { sub: user._id.toString() },
        options: {
            // secret: process.env.REFRESH_USER_TOKEN_SIGNATURE as string,
                secret: signatures.refresh_signaturel, 
            expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN), jwtid
        }
    })
    return {access_token , refresh_token}
}
 decodedToken = async ({
    authorization,
    tokenType =TokenEnum.access,
}: {
         authorization: string;
         tokenType?: TokenEnum;
     }): Promise<{ user: UserDocument; decoded:JwtPayload}> => {
    
   try {
     const [bearerKey, token] = authorization.split(" ")
    if (!bearerKey || !token) {
        throw new UnauthorizedException("missing token parts")
    }
    const signatures = await this.getSignature(bearerKey as SignatureLevelEnum)
    const decoded = await this.verifyToken({
        token,
        options: {
            secret: tokenType === TokenEnum.refresh
            ? signatures.refresh_signaturel
            : signatures.access_signaturel
       }
    });
    if (!decoded?.sub|| !decoded?.iat) {
        throw new BadRequestException("In-vaild token payload")
    }
    if (decoded.jti&&await this.tokenRepository.findOne({filter:{jti:decoded.jti}})) {
        throw new UnauthorizedException("invaild or old login credentials")
       }
     const user = await this.userRepository.findOne({ filter: { _id:decoded.sub}, }) as UserDocument;
    if (!user) {
        throw new NotFoundException("Not register account")
    }
    if ((user.changeCredentialsTime?.getTime()|| 0) > decoded.iat * 1000) {
        throw new NotFoundException("invaild or old login credentials")
    }
    return {user , decoded}
   } catch (error) {
    throw new InternalServerErrorException(error.message||"something went wrong!!!!")
   }
}

 createRevokeToken = async (decoded: JwtPayload): Promise<TokenDocument> => {
    const [result] = (await this.tokenRepository.create({
            data: [{
                jti: decoded?.jti as string,
                expiredAt:new Date((decoded?.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRES_IN)),
                createdBy:parseObjectId(decoded.sub as string)
            }]
    })) || []
    if (!result) {
        throw new BadRequestException("Fail to revoke this token")
    }
    return result;
}

}