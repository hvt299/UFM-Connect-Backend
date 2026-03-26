import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'nguyenvana@ufm.edu.vn', description: 'Email sinh viên' })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123456', description: 'Mật khẩu (ít nhất 6 ký tự)' })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;
}
