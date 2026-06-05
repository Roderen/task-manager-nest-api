import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class GetTasksDto {
  @ApiProperty({ example: false })
  @Transform(({ value }) => value === 'true' || value === true || value === 1)
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
