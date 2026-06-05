import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class HelpTasksDto {
  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ required: true, example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number;
}
