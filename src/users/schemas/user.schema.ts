import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    ADMIN = 'Admin',
    STUDENT = 'Student',
}

export enum AccountTier {
    BASIC = 'Basic',
    PREMIUM = 'Premium',
}

export enum AccountStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    BANNED = 'Banned',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, unique: true })
    studentId: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ enum: AccountStatus, default: AccountStatus.INACTIVE })
    status: AccountStatus;

    @Prop({ enum: AccountTier, default: AccountTier.BASIC })
    tier: AccountTier;

    @Prop({ enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @Prop({ required: false })
    resetPasswordToken?: string;

    @Prop({ required: false })
    resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
