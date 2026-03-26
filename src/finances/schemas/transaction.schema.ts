import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category, TransactionType } from './category.schema';

@Schema({ timestamps: true })
export class Transaction extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: User;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, enum: TransactionType })
    type: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true })
    categoryId: Category;

    @Prop({ required: true, default: Date.now })
    date: Date;

    @Prop()
    note: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);