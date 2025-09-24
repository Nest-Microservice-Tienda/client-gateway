import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  Logger,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { RpcException } from '@nestjs/microservices/exceptions/rpc-exception';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { OrderPaginationDto } from './dto/order-pagination.dto';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger('OrdersController');
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await firstValueFrom(
        this.client.send('createOrder', createOrderDto),
      );
    } catch (error) {
      this.logger.error('Error in createOrder endpoint', error);
      throw new RpcException({
        message: 'Failed to create order',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get()
  async findAll(@Query() pagination: OrderPaginationDto) {
    try {
      return await firstValueFrom(this.client.send('findAllOrders', pagination));
    } catch (error) {
      this.logger.error('Error in findAllOrders endpoint', error);
      throw new RpcException({
        message: 'Failed to retrieve orders',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(this.client.send('findOneOrder', { id }));
    } catch (error) {
      this.logger.error('Error in findOneOrder endpoint', error);
      throw new RpcException({
        message: `Failed to retrieve order with ID ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    try {
      return await firstValueFrom(this.client.send('changeOrderStatus', { id, status }));
    } catch (error) {
      this.logger.error('Error in changeOrderStatus endpoint', error);
      throw new RpcException({
        message: `Failed to change status of order with ID ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}