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
    return this.financesService.createTransaction(req.user.userId, createTransactionDto);
  }

  @Get('transactions')
  getTransactions(@Request() req) {
    return this.financesService.getTransactionsByUser(req.user.userId);
  }

  @Get('summary')
  getSummary(@Request() req) {
    return this.financesService.getMonthlySummary(req.user.userId);
  }
}
