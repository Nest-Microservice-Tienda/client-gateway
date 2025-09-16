import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { Transport, ClientsModule } from '@nestjs/microservices';
import { env, PRODUCT_SERVICE } from 'src/config';

@Module({
  controllers: [ProductsController],
  imports: [
    ClientsModule.register([
      { 
        name: PRODUCT_SERVICE, 
        transport: Transport.TCP, 
        options: { 
          host: env.productMicroserviceHost,
          port: env.productMicroservicePort
        }
      },
    ]),
  ],
})
export class ProductsModule {}
