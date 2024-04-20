import { IsOptional } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  email: string;

  @IsOptional()
  phone: string;
  password: string;
}
