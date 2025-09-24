import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from "class-validator";


export class OrderItemDto {

    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    price: number;
}