// import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class LoginUserDto {
//   @ApiProperty({ format: 'email', example: 'abcde@email.com' })
    @IsOptional()
    email: string;

    @IsOptional()
    phone: string;

//   @ApiProperty({ minLength: 8, example: 'password', format: 'password' })
    password: string;
}