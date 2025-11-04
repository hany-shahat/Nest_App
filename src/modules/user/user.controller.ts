import { Controller, Get, Headers, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Req, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import{cloudFileUpload, fileValidation, type IMulterFile, IResponse, IUser, localFileUpload, RoleEnum, StorageEnum, successResponse, TokenEnum, User } from "src/common";
import { Auth } from "src/common/decorators/auth.decorators";
import type{ UserDocument } from "src/DB";
import { PreferredLanguageInterceptor } from "src/common/interceptors";
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ProfileResponse } from "./entities/user.entity";




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


// profile image
    @UseInterceptors(FileInterceptor('profileImage',
        cloudFileUpload({
            storageApproach: StorageEnum.disk,
            validation: fileValidation.image,
            fileSize: 2,
        })))
    @Auth([RoleEnum.user])
    @Patch('profile-image')
    async ProfileImage(
        @User() user: UserDocument,
        @UploadedFile(
            new ParseFilePipe({
                validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
                fileIsRequired: true,
            })
        )
        file: Express.Multer.File
    ): Promise<IResponse<ProfileResponse>> {
      const profile=  await this.userService.profileImage(file,user)
        return successResponse<ProfileResponse>({ data: { profile } });
    }

// cover image
    @UseInterceptors(FilesInterceptor('coverImages',2,
        localFileUpload({
            folder: 'User',
            validation: fileValidation.image,
            fileSize:2,
        })))
    @Auth([RoleEnum.user])
    @Patch('cover-image')
    CoverImage(
        @UploadedFiles(
            new ParseFilePipe({
                validators:[new MaxFileSizeValidator({maxSize:2*1024*1024})],
                fileIsRequired:true,
            })
        ) files:Array<IMulterFile>
    ) {
    return {message:"Done",files}
    }

// image && cover image
    @UseInterceptors(FileFieldsInterceptor([{name:'profileImage' , maxCount:1},{name:'coverImage' , maxCount:2}],
        localFileUpload({
            folder: 'User',
            validation: fileValidation.image,
            fileSize:2,
        })))
    @Auth([RoleEnum.user])
    @Patch('image')
    Image(
        @UploadedFiles(
            new ParseFilePipe({
                // validators:[new MaxFileSizeValidator({maxSize:2*1024*1024})],
                fileIsRequired:true,
            })
        ) files: {
                profileImage: Array<IMulterFile>;
                coverImage: Array<IMulterFile>;
        }
    ) {
    return {message:"Done",files}
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