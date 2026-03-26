import { Controller, Body, Get, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân' })
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu (Yêu cầu mật khẩu cũ)' })
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }
}
