import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Matches } from "class-validator";

export class SendForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class VerifyForgotPasswordDto extends SendForgotPasswordDto {
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: "OTP must be 6 digits" })
  otp: string;
}

export class ResetForgotPasswordDto extends VerifyForgotPasswordDto {
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
