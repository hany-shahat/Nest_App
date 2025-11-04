import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import type{ Response } from 'express';
import { promisify } from "node:util";
import { pipeline } from "node:stream";
const createS3WriteStreamPipe = promisify(pipeline)
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service:S3Service
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('hi')
  sayHi(): string {
    return this.appService.getHello();
  }
    
  @Get("/upload/pre-signed/*path") 
  async getPresignedAssetUrl(
    @Query() query: { filename?: string, download?: "true" | "false" },
    @Param() params:{ path: string[] }
  ) {
    
    const { filename, download } = query; 
    const { path } = params;
        const Key = path.join("/")
        const url = await this.s3Service.createGetPreSignedLink({ Key,download,filename})
       return {message:"Done" , data:{url}}
  }
     

  
  @Get("/upload/*path") 
  async getAsset(
    @Query() query: { filename?: string, download?: "true" | "false" },
    @Param() params: { path: string[] },
    @Res({passthrough:true}) res:Response
  ) {
    
    const { filename, download } = query; 
    const { path } = params;
        const Key = path.join("/")
        const s3Response = await this.s3Service.getFile({ Key })
        console.log(s3Response.Body);
        if (!s3Response?.Body) {
            throw new BadRequestException("Fail to fetch this asset")
        }

        res.set("Cross-Origin-Resource-Police", "cross-origin")
        res.setHeader("Content-type", `${s3Response.ContentType || "application/octet-stream"}`)
        if (download==="true") {
            res.setHeader("Content-Disposition", `attachment; filename="${filename||Key.split("/").pop()}"`); // only apply it for  download
        }
        
       return await createS3WriteStreamPipe(s3Response.Body as NodeJS.ReadableStream , res)
    
  }
     




}
