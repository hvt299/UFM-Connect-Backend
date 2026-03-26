import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument, AccountStatus } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { fullName, studentId, email, password } = registerDto;

    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ email: email }, { studentId: studentId }],
      });

      if (existingUser) {
        if (existingUser.email === email) throw new ConflictException('Email này đã được đăng ký!');
        if (existingUser.studentId === studentId) throw new ConflictException('Mã sinh viên này đã được sử dụng!');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new this.userModel({
        fullName,
        studentId,
        email,
        passwordHash: hashedPassword,
        status: AccountStatus.INACTIVE,
      });

      const savedUser = await newUser.save();

      const verifyToken = this.jwtService.sign(
        { sub: savedUser._id },
        { expiresIn: '1d' }
      );

      await this.emailService.sendVerificationEmail(
        savedUser.email,
        savedUser.fullName,
        verifyToken
      );

      return {
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.',
      };

    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Lỗi hệ thống khi đăng ký tài khoản');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const updatedUser = await this.userModel.findByIdAndUpdate(
        payload.sub,
        { status: AccountStatus.ACTIVE },
        { new: true }
      );

      if (!updatedUser) throw new BadRequestException('Tài khoản không tồn tại');

      return { message: 'Xác thực thành công! Tài khoản của bạn đã được kích hoạt.' };
    } catch (error) {
      throw new BadRequestException('Link xác thực không hợp lệ hoặc đã hết hạn.');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatching) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    if (user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedException('Vui lòng kiểm tra email để kích hoạt tài khoản trước khi đăng nhập!');
    }
    if (user.status === AccountStatus.BANNED) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa!');
    }

    const payload = { sub: user._id, email: user.email, role: user.role, tier: user.tier };

    return {
      message: 'Đăng nhập thành công',
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        tier: user.tier
      }
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return { message: 'Nếu email tồn tại trên hệ thống, link khôi phục đã được gửi.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await this.emailService.sendResetPasswordEmail(user.email, user.fullName, resetToken);

    return { message: 'Nếu email tồn tại trên hệ thống, link khôi phục đã được gửi.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Link khôi phục không hợp lệ hoặc đã hết hạn!');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập.' };
  }
}