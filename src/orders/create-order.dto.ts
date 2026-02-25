import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsNumber()
  @Min(0)
  total: number;
}
