import {IsNotEmpty, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty()
    @MinLength(8)
    @IsNotEmpty()
    newPassword: string;
}