import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { ConfirmEmailBodyDto, LoginDto, ResendConfirmEmailBodyDto, SignupBodyDto } from "./dto/auth.dto";
import { LoginResponse } from "./entities/auth.entity";
import { ResetForgotPasswordDto, SendForgotPasswordDto, VerifyForgotPasswordDto } from "./dto/forgot-password.dto";
import { successResponse } from "src/common";
import {IResponse} from "../../common/interfaces/response.interface"
   @UsePipes(new ValidationPipe({stopAtFirstError:true  }))
@Controller()
export class AuthenticationController{
    constructor(private readonly authenticationService: AuthenticationService) { }
    @Post('/auth/signup')
   async signup(
        @Body() body: SignupBodyDto
    ):Promise<IResponse<{message:string}>>{
        console.log({body});
        
    await this.authenticationService.signup(body);
        return successResponse();
    }
    @Post('/auth/resend-confirm-email')
   async resendConfirmEmail(
        @Body() body: ResendConfirmEmailBodyDto
    ):Promise<{ message: string }>{
        console.log({body});
        
    await this.authenticationService.resendConfirmEmail(body);

        return {message:"Done" }
       }
         @Post('/auth/confirm-email')
   async confirmEmail(
        @Body() body: ConfirmEmailBodyDto
    ):Promise<IResponse<{message:string}>>{
        console.log({body});
        
    await this.authenticationService.confirmEmail(body);

             return successResponse();
    }
    // status code
    // @HttpCode(200)
    @HttpCode(HttpStatus.OK)
    @Post('/auth/login')
    async login(
        @Body() body: LoginDto): Promise<IResponse<LoginResponse>>
    {
        const credentials =await this.authenticationService.login(body)
        return successResponse<LoginResponse>( {message:"Done" , data:{credentials}})
       }
      
  @Patch('auth/forgot-password')
  async sendForgotPassword(@Body() dto: SendForgotPasswordDto) {
    return await this.authenticationService.sendForgotPassword(dto);
  }

  
  @Post('auth/verify-forgot-password')
  async verifyForgotPassword(@Body() dto: VerifyForgotPasswordDto) {
    return await this.authenticationService.verifyForgotPasswordCode(dto);
  }

  
  @Patch('auth/reset-password')
  async resetForgotPassword(@Body() dto: ResetForgotPasswordDto) {
    return await this.authenticationService.resetForgotPasswordCode(dto);
  }
}