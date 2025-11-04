import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB";

export interface IUser{
    _id?: Types.ObjectId;

        firstName: string;
        lastName: string;
        username?: string;
    
        email: string;
        confirmEmail: Date;
    
        password?: string;
    
        provider: ProviderEnum;
        role: RoleEnum;
    
        gender: GenderEnum;
        preferredLanguage: LanguageEnum;
    
        changeCredentialsTime?: Date;
        otp?: OtpDocument[];
    
        confirmedAt?: Date;
      
    profileImage?: string;
    profilePicture?: string;
    resetPasswordOtp?: string;


    createdAt?: Date;
    updatedAt?: Date;
}