import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({name:"check_fields_exists" , async: false })
export class checkIfAnyFieldsAreApplied implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
      
        return Object.keys(args.object).length > 0 && Object.values(args.object).filter((args) => {
            return args != undefined;
        }).length>0;
    }
     defaultMessage(ValidationArguments?: ValidationArguments):string {
    return `All update fields are empty`;
  }
}
export function containFields(
    validationOptions?: ValidationOptions
) {
  return function (constructor:Function) {
    registerDecorator({
      target:constructor,
      propertyName: undefined!,
      options: validationOptions,
      constraints:[],
      validator: checkIfAnyFieldsAreApplied,
    });
  };
}