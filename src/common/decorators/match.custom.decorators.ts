import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { Types } from "mongoose";



@ValidatorConstraint({name:"match_between_fields" , async: false })
export class MongoDBIds implements ValidatorConstraintInterface {
    validate(ids:Types.ObjectId[], args: ValidationArguments) {
      for (const id of ids){
        if (!Types.ObjectId.isValid(id)) {
          return false;
        }
      }
      return true;
    }
     defaultMessage(ValidationArguments?: ValidationArguments):string {
    return `Invild mongoDBId format`;
  }
}


@ValidatorConstraint({name:"match_between_fields" , async: false })
export class MatchBetweenFields<T=any> implements ValidatorConstraintInterface {
    validate(value: T, args: ValidationArguments) {
      
        return value === args.object[args.constraints[0]]
    }
     defaultMessage(ValidationArguments?: ValidationArguments):string {
    return `fail to match src field :: ${ValidationArguments?.property} with target :: ${ValidationArguments?.constraints[0]}`;
  }
}
export function IsMatch<T=any>(constraints:string[],validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: MatchBetweenFields<T>,
    });
  };
}