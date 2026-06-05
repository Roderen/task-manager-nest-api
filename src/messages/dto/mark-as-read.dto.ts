import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class MarkAsReadDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  conversationId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  messageId: number;
}
