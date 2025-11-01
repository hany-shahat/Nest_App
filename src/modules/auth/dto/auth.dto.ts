import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length,  Matches,  ValidateIf  } from "class-validator";
import { IsMatch } from "src/common";

export class ResendConfirmEmailBodyDto{
    @IsEmail()
    email: string;

}
export class ConfirmEmailBodyDto extends ResendConfirmEmailBodyDto{
    @Matches(/^\d{6}$/)
    code: string;
}
export class LoginDto extends ResendConfirmEmailBodyDto{

    @IsStrongPassword()
    password: string;
}
export class SignupBodyDto extends LoginDto{

    @Length(2, 52, { message: "username min length is 2 char and max length is 52 char " })
    @IsNotEmpty()
    @IsString()
    username: string;

    // @Validate(MatchBetweenFields)
    @ValidateIf((data: SignupBodyDto) => {
        return Boolean(data.password)
    })
    @IsMatch<string>(["password"])
    confirmPassword: string;
}

