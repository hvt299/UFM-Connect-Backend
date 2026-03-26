import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token khôi phục nhận được từ link gửi trong email'
    })
    @IsNotEmpty({ message: 'Token không được để trống' })
    @IsString()
    token: string;

    @ApiProperty({
        example: '123456',
        description: 'Mật khẩu mới (ít nhất 6 ký tự)'
    })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}
