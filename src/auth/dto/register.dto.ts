import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'Nguyễn Văn A',
        description: 'Họ và tên đầy đủ của sinh viên'
    })
    @IsString()
    @IsNotEmpty({ message: 'Họ tên không được để trống' })
    fullName: string;

    @ApiProperty({
        example: '212100xxxx',
        description: 'Mã số sinh viên (MSV)'
    })
    @IsString()
    @IsNotEmpty({ message: 'Mã sinh viên không được để trống' })
    studentId: string;

    @ApiProperty({
        example: 'nguyenvana@ufm.edu.vn',
        description: 'Email sinh viên (Khuyên dùng email trường)'
    })
    @IsEmail({}, { message: 'Email không đúng định dạng' })
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu (ít nhất 6 ký tự)'
    })
    @IsString()
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    password: string;
}