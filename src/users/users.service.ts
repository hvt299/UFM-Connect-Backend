import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -resetPasswordToken -resetPasswordExpires').exec();
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { fullName: updateProfileDto.fullName },
      { new: true }
    ).select('-passwordHash -resetPasswordToken -resetPasswordExpires').exec();

    if (!updatedUser) throw new BadRequestException('Không tìm thấy người dùng');

    return {
      message: 'Cập nhật thông tin thành công!',
      user: updatedUser
    };
  }

  async changePassword(userId: string, changePasswordDto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('Không tìm thấy người dùng');

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isPasswordValid) throw new BadRequestException('Mật khẩu cũ không chính xác!');

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    return { message: 'Đổi mật khẩu thành công!' };
  }
}
