import { NextFunction, Request, Response } from "express";

export const setDefualtLanguage = (req: Request, res: Response, next: NextFunction) => {
    
console.log('Language maddleware.......');


req.headers['accept-language']=req.headers['accept-language']??"EN"
    next()
}
export const authenticationMiddleware = () => {
     (req: Request, res: Response, next: NextFunction) => {
    
console.log('authentication Middleware .......');


req.headers['accept-language']=req.headers['accept-language']??"EN"
    next()
}
}
export const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
console.log('authorization Middleware .......');


req.headers['accept-language']=req.headers['accept-language']??"EN"
    next()
}