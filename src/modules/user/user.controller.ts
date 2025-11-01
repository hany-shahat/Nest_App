import { Controller, Get, Headers, Post, Req, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import{ RoleEnum, TokenEnum, User, type IAuthRequest } from "src/common";
import { Auth } from "src/common/decorators/auth.decorators";
import type{ UserDocument } from "src/DB";
import { PreferredLanguageInterceptor } from "src/common/interceptors";




@Controller("user")
export class UserController{
    constructor(private readonly userService: UserService) { }
    @UseInterceptors(PreferredLanguageInterceptor)
    @Auth([RoleEnum.user,RoleEnum.admin],TokenEnum.access)
    @Get()
    profile(
        @Headers() header: any,
        @User() user: UserDocument): { message: string }
    {
        console.log({lang:header['accept-language'],user});
        
        return { message: "Done" };
    }
    
    // @Post()
    // profile123(): { message: string }{
    //     return {message:'Done'}
    // }
    // @Get('/list')
    // profile1234(): { message: string }{
    //     return {message:'Done'}
    // }
}