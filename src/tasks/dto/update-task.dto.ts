import {IsString, IsNotEmpty, IsBoolean, IsOptional} from 'class-validator'
import {ApiProperty} from "@nestjs/swagger";

export class UpdateTaskDto {
    @ApiProperty({ required: false, example: 'New title' })
    @IsOptional()
    @IsString()
    title?: string

    @ApiProperty({ required: false, example: true })
    @IsOptional()
    @IsBoolean()
    completed?: boolean
}