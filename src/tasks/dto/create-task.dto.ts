import { IsString, IsNotEmpty } from 'class-validator'
import {ApiProperty} from "@nestjs/swagger";

export class CreateTaskDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string
}