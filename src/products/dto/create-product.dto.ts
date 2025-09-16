import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateProductDto {

    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
    
    @IsNumber({
        maxDecimalPlaces: 4
    })
    @Min(0)
    @Type(() => Number)
    price: number;

}
