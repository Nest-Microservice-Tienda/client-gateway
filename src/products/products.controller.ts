import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { PaginationDto } from 'src/common';

import { CreateProductDto, UpdateProductDto } from './dto';
import { NATS_SERVICE } from 'src/config';


@Controller('products')
export class ProductsController {
  private readonly logger = new Logger('ProductsController');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    try {
      return await firstValueFrom(
        this.client.send(
          { cmd: 'create_product' },
          createProductDto
        ).pipe(
          catchError((error) => {
            this.logger.error('Failed to create product', error);
            return throwError(() => new RpcException({
              message: error.message || 'Failed to create product',
              status: error.status || HttpStatus.INTERNAL_SERVER_ERROR
            }));
          })
        )
      );
    } catch (error) {
      this.logger.error('Error in createProduct endpoint', error);
      throw new RpcException({
        message: 'Failed to create product',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  @Get()
  async findAllProducts(@Query() paginationDto: PaginationDto) {
    try {
      return await firstValueFrom(
        this.client.send(
          { cmd: 'find_all_products' },
          { ...paginationDto }
        ).pipe(
          catchError((error) => {
            this.logger.error('Failed to retrieve products', error);
            return throwError(() => new RpcException({
              message: error.message || 'Failed to retrieve products',
              status: error.status || HttpStatus.INTERNAL_SERVER_ERROR
            }));
          })
        )
      );
    } catch (error) {
      this.logger.error('Error in findAllProducts endpoint', error);
      throw new RpcException({
        message: 'Failed to retrieve products',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  @Get(':id')
  async findProductById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(
        this.client.send(
          { cmd: 'find_one_product' },
          { id }
        ).pipe(
          catchError((error) => {
            this.logger.error(`Failed to find product with id ${id}`, error);
            return throwError(() => new RpcException({
              message: error.message || `Product with id ${id} not found`,
              status: error.status || HttpStatus.NOT_FOUND
            }));
          })
        )
      );
    } catch (error) {
      this.logger.error(`Error in findProductById endpoint for id ${id}`, error);
      throw new RpcException({
        message: `Failed to retrieve product with id ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  @Patch(':id')
  async updateProductById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      // Validación temprana
      if (!Object.keys(updateProductDto).length) {
        throw new RpcException({
          message: 'No data provided for update',
          status: HttpStatus.BAD_REQUEST
        });
      }

      return await firstValueFrom(
        this.client.send(
          { cmd: 'update_product' },
          { ...updateProductDto, id }
        ).pipe(
          catchError((error) => {
            this.logger.error(`Failed to update product with id ${id}`, error);
            return throwError(() => new RpcException({
              message: error.message || `Failed to update product with id ${id}`,
              status: error.status || HttpStatus.INTERNAL_SERVER_ERROR
            }));
          })
        )
      );
    } catch (error) {
      if (error instanceof RpcException) throw error;
      
      this.logger.error(`Error in updateProductById endpoint for id ${id}`, error);
      throw new RpcException({
        message: `Failed to update product with id ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }

  @Delete(':id')
  async deleteProductById(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await firstValueFrom(
        this.client.send(
          { cmd: 'soft_delete_product' },
          { id }
        ).pipe(
          catchError((error) => {
            this.logger.error(`Failed to delete product with id ${id}`, error);
            return throwError(() => new RpcException({
              message: error.message || `Failed to delete product with id ${id}`,
              status: error.status || HttpStatus.INTERNAL_SERVER_ERROR
            }));
          })
        )
      );
    } catch (error) {
      this.logger.error(`Error in deleteProductById endpoint for id ${id}`, error);
      throw new RpcException({
        message: `Failed to delete product with id ${id}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  }
}