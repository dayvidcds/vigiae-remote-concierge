import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { UserType } from '../../users/schemas/user-portal.schema';

export class CreateOperatorDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEnum([UserType.OPERATOR, UserType.TECHNICIAN], {
    message: 'User type must be operator or technician',
  })
  @IsNotEmpty({ message: 'User type is required' })
  userType: UserType.OPERATOR | UserType.TECHNICIAN;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  document?: string;

  @IsObject()
  @IsOptional()
  permissions?: {
    canViewAllCondominiums?: boolean;
    canManageVisitors?: boolean;
    canManageVehicles?: boolean;
    canViewReports?: boolean;
    canManageAccess?: boolean;
  };

  @IsArray()
  @IsOptional()
  assignedCondominiums?: string[];
}
