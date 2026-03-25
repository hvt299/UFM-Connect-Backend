import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { fullName, studentId, email, password } = registerDto;

    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ email: email }, { studentId: studentId }],
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw new ConflictException('Email này đã được đăng ký!');
        }
        if (existingUser.studentId === studentId) {
          throw new ConflictException('Mã sinh viên này đã được sử dụng!');
        }
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new this.userModel({
        fullName,
        studentId,
        email,
        passwordHash: hashedPassword,
      });

      const savedUser = await newUser.save();

      return {
        message: 'Đăng ký tài khoản thành công',
        user: {
          id: savedUser._id,
          fullName: savedUser.fullName,
          studentId: savedUser.studentId,
          email: savedUser.email,
          role: savedUser.role,
        },
      };

    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi hệ thống khi đăng ký tài khoản');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      tier: user.tier
    };

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
}