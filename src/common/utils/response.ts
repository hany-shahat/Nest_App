import { IResponse } from "../interfaces";

export const successResponse = <T>(
    {
        message = 'Done',
        status = 200,
        data,
    }:IResponse<T>={} as IResponse<T>):IResponse<T>=>{
    return {message,status,data}
}