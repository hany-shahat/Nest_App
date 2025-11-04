import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import {  compareHash, emailEvent, generateHash, generateNumberOtp, IUser, LoginCredentialsResponse, OtpEnum, ProviderEnum, SecurityService, TokenService } from "src/common";
import {  UserDocument } from "src/DB/model";
import { ConfirmEmailBodyDto, LoginDto, ResendConfirmEmailBodyDto, SignupBodyDto } from "./dto/auth.dto";
import { OtpRepository,  UserRepository } from "src/DB";
import { JwtService } from "@nestjs/jwt";
import { ResetForgotPasswordDto, SendForgotPasswordDto, VerifyForgotPasswordDto } from "./dto/forgot-password.dto";




@Injectable()
export class AuthenticationService{
    private users: IUser[] = [];
    constructor(
        private readonly userRepository: UserRepository,
        private readonly securityService: SecurityService,
        private readonly otpRepository: OtpRepository,
        private readonly jwtService:JwtService,
        private readonly tokenService:TokenService,
    ) { }
    private async createConfirmEmailOtp(userId:Types.ObjectId) {
          await this.otpRepository.create({
           data: [
               {
                   code: generateNumberOtp(),
                   expiredAt: new Date(Date.now() + 2 * 60 * 1000),
                   createdBy: userId,
                   type:OtpEnum.ConfirmEmail,
               },
           ]
       })
    }
   async signup(data: SignupBodyDto): Promise<string>{
        const { username, email, password } = data;
       const checkEmailExist = await this.userRepository.findOne({ filter:{email}, });
       if (checkEmailExist) {
        throw new ConflictException("Email already exist")
       }
       const [user] = await this.userRepository.create(
         {data:  [
             {
                 username,
                 email,
                 password:await this.securityService.generateHash(password),
             }
       ]}
       );
       if (!user) {
        throw new BadRequestException("Fail to signup this account please try again later")
       }
      await this.createConfirmEmailOtp(user._id)
    //    emailEvent.emit("confirmEmail",{to:email,otp:otp.code})
        return "Done";
    }
    
   async resendConfirmEmail(data: ResendConfirmEmailBodyDto): Promise<string>{
        const {  email } = data;
       const user = await this.userRepository.findOne({
           filter: { email, confirmedAt: {$exists:true}},
           options: {
               populate:[{path:"otp" , match:{type:OtpEnum.ConfirmEmail}}]
           }
       });
       if (!user) {
        throw new NotFoundException("Fail to matching account")
       }
       if (user.otp?.length) {
           throw new ConflictException(`sorry we cannot grand you new otp until the existing one become expired please try agin after::${user.otp[0].expiredAt}`,);

       }
        await this.createConfirmEmailOtp(user._id)
        return "Done";
    }
   async confirmEmail(data: ConfirmEmailBodyDto): Promise<string>{
        const {  email , code} = data;
       const user = await this.userRepository.findOne({
           filter: { email, confirmedAt:null },
           options: {
               populate:[{path:"otp" , match:{type:OtpEnum.ConfirmEmail}}]
           }
       });
       if (!user) {
        throw new NotFoundException("Fail to matching account")
       }
       if (!(user.otp?.length && (await this.securityService.compareHash(code, user.otp[0].code))))
       {
           throw new BadRequestException("invaild otp")
           
       }
       user.confirmedAt = new Date()
       await user.save();
       await this.userRepository.deleteOne({filter:{_id:user.otp[0]._id}})
        return "Done";
    }
 async login(data: LoginDto): Promise<LoginCredentialsResponse>{
        const { email, password } = data;
     const user = await this.userRepository.findOne({
         filter:
         {
             email, confirmedAt: { $exists:true }, provider: ProviderEnum.SYSTEM
         },
 
     });
     console.log("🧍 Found user:", user);
       if (!user) {
        throw new NotFoundException("Fail to find matching account")
       }
       if (!await this.securityService.compareHash(password,user.password)) {
        throw new NotFoundException("Fail to find matching account")
       }
     

        return await this.tokenService.createLoginCredentials(user as UserDocument);
    }

async sendForgotPassword(dto: SendForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM, confirmedAt: { $exists: true } },
    });

    if (!user) {
      throw new BadRequestException(
        'Invalid account (not registered, invalid provider, or not confirmed)',
      );
    }

    const otp = generateNumberOtp();

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: { resetPasswordOtp: await generateHash(String(otp)) },
    });

    if (!result.matchedCount) {
      throw new BadRequestException('Failed to send reset code');
    }

    emailEvent.emit(OtpEnum.ResetPassword, { to: email, otp });
    return { message: 'Reset code sent successfully' };
  }

  async verifyForgotPasswordCode(dto: VerifyForgotPasswordDto) {
    const { email, otp } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM, resetPasswordOtp: { $exists: true } },
    });

    if (!user) {
      throw new BadRequestException('Invalid account or OTP not found');
    }

    if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
      throw new ConflictException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetForgotPasswordCode(dto: ResetForgotPasswordDto) {
    const { email, otp, password } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM, resetPasswordOtp: { $exists: true } },
    });

    if (!user) {
      throw new BadRequestException('Invalid account or OTP not found');
    }

    if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
      throw new ConflictException('Invalid OTP');
    }

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: {
        password: await generateHash(password),
        changeCredentialsTime: new Date(),
        $unset: { resetPasswordOtp: 1 },
      },
    });

    if (!result.matchedCount) {
      throw new BadRequestException('Failed to reset password');
    }

    return { message: 'Password reset successfully' };
  }
}