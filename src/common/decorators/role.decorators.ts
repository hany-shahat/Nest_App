import { SetMetadata } from "@nestjs/common"
import { RoleEnum, TokenEnum } from "../enums"

export const RoleName ='roles'
export const Roles = (accessRoles: RoleEnum[] ) => {
      return SetMetadata(RoleName , accessRoles)
}
 