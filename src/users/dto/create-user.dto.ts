// import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from "class-validator";

export class CreateUserDto {
//   @ApiProperty({ minLength: 3, example: 'John Doe' })
  pseudo: string;

//   @ApiProperty({ format: 'email', example: 'abcde@email.com' })
  email: string;

  phone: string;

//   @ApiProperty({
//     minLength: 8,
//     example: 'Passw0rd',
//     format: 'password',
//   })
  password: string;

  @IsOptional()
  role: string;
}
