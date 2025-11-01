import { Injectable } from "@nestjs/common";
import { IUser } from "src/common";

@Injectable()
export class UserService{
    constructor() { }
    profile(): IUser[]{
        return [{id:2,username:"Hany shahat",email:"Hanyshahat104@gmail.com",password:"123456",confirmPassword:"123456"}]
    }
    profile123(): IUser[]{
        return [{id:2,username:"Hany shahat",email:"Hanyshahat104@gmail.com",password:"123456",confirmPassword:"123456"}]
    }
    profile1234(): IUser[]{
        return [{id:2,username:"Hany shahat",email:"Hanyshahat104@gmail.com",password:"123456",confirmPassword:"123456"}]
    }
}