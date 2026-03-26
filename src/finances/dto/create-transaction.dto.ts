import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '../schemas/category.schema';

export class CreateTransactionDto {
    @IsNotEmpty({ message: 'Số tiền không được để trống' })
    @IsNumber({}, { message: 'Số tiền phải là số' })
    @Min(1, { message: 'Số tiền phải lớn hơn 0' })
    amount: number;

    @IsNotEmpty()
    @IsEnum(TransactionType, { message: 'Loại giao dịch phải là INCOME hoặc EXPENSE' })
    type: TransactionType;

    @IsNotEmpty({ message: 'Danh mục không được để trống' })
    @IsMongoId({ message: 'ID Danh mục không hợp lệ' })
    categoryId: string;

    @IsNotEmpty({ message: 'Ngày giao dịch không được để trống' })
    date: Date;

    @IsOptional()
    @IsString()
    note?: string;
}