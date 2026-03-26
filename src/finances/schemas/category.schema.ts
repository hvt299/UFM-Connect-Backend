import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

@Schema({ timestamps: true })
export class Category extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: TransactionType })
    type: string;

    @Prop({ default: '📝' })
    icon: string;

    @Prop({ default: '#1a73e8' })
    color: string;

    @Prop({ default: true })
    isDefault: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);