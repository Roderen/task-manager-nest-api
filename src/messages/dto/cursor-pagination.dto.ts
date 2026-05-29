import { IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CursorPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number; // Receives the `createdAt` of the last item on the previous page

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number = 10;
}
