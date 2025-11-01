import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { ConfirmEmailBodyDto, LoginDto, ResendConfirmEmailBodyDto, SignupBodyDto } from "./dto/auth.dto";
import { LoginResponse } from "./entities/auth.entity";
import { ResetForgotPasswordDto, SendForgotPasswordDto, VerifyForgotPasswordDto } from "./dto/forgot-password.dto";
   @UsePipes(new ValidationPipe({stopAtFirstError:true  }))
@Controller()
export class AuthenticationController{
    constructor(private readonly authenticationService: AuthenticationService) { }
    @Post('/auth/signup')
   async signup(
        // @Body("age", new ParseIntPipe({
        //     errorHttpStatusCode: HttpStatus.BAD_GATEWAY,
        //     exceptionFactory(error) {
        //         throw new HttpException(`age must be integer :: ${error} ` , 400)
        //     },
        // }),
        // )
        // age: number,
        @Body() body: SignupBodyDto
    ):Promise<{ message: string }>{
        console.log({body});
        
    await this.authenticationService.signup(body);

        return {message:"Done" }
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
    ):Promise<{ message: string }>{
        console.log({body});
        
    await this.authenticationService.confirmEmail(body);

        return {message:"Done" }
    }
    // status code
    // @HttpCode(200)
    @HttpCode(HttpStatus.OK)
    @Post('/auth/login')
    async login(
        @Body() body: LoginDto): Promise<LoginResponse>
    {
        const credentials =await this.authenticationService.login(body)
        return {message:"Done" , data:{credentials}}
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