import { IsOptional } from 'class-validator';

export class CreateUserDto {
  pseudo: string;
  email: string;
  phone: string;
  password: string;

  @IsOptional()
  role: string;
}
