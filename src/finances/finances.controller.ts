import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) { }

  @Get('categories')
  getCategories() {
    return this.financesService.getCategories();
  }

  @Post('transactions')
  createTransaction(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.sub || req.user._id || req.user.id;
    return this.financesService.createTransaction(userId, createTransactionDto);
  }

  @Get('transactions')
  getTransactions(@Request() req) {
    const userId = req.user.sub || req.user._id || req.user.id;
    return this.financesService.getTransactionsByUser(userId);
  }

  @Get('summary')
  getSummary(@Request() req) {
    const userId = req.user.sub || req.user._id || req.user.id;
    return this.financesService.getMonthlySummary(userId);
  }
}
