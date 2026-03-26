import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { Category, CategorySchema } from './schemas/category.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [FinancesController],
  providers: [FinancesService],
})
export class FinancesModule { }
