import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, TransactionType } from './schemas/category.schema';
import { Transaction } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinancesService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) { }

  async onModuleInit() {
    await this.seedDefaultCategories();
  }

  private async seedDefaultCategories() {
    const count = await this.categoryModel.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: 'Ăn uống', type: TransactionType.EXPENSE, icon: '🍔', color: '#f59e0b' },
        { name: 'Di chuyển', type: TransactionType.EXPENSE, icon: '🛵', color: '#3b82f6' },
        { name: 'Tiền trọ', type: TransactionType.EXPENSE, icon: '🏠', color: '#8b5cf6' },
        { name: 'Học tập', type: TransactionType.EXPENSE, icon: '📚', color: '#10b981' },
        { name: 'Mua sắm', type: TransactionType.EXPENSE, icon: '🛍️', color: '#ec4899' },
        { name: 'Tiền gửi / Lương', type: TransactionType.INCOME, icon: '💰', color: '#14b8a6' },
      ];
      await this.categoryModel.insertMany(defaultCategories);
    }
  }

  async getCategories() {
    return this.categoryModel.find().exec();
  }

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const newTransaction = new this.transactionModel({
      ...dto,
      userId,
    });
    return newTransaction.save();
  }

  async getTransactionsByUser(userId: string) {
    return this.transactionModel
      .find({ userId: userId as any })
      .sort({ date: -1 })
      .populate('categoryId', 'name icon color')
      .exec();
  }

  async getMonthlySummary(userId: string) {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await this.transactionModel.find({
      userId: userId as any,
      date: { $gte: firstDay, $lte: lastDay },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === TransactionType.INCOME) totalIncome += t.amount;
      if (t.type === TransactionType.EXPENSE) totalExpense += t.amount;
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }
}
